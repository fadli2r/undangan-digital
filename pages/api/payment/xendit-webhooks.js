// pages/api/payment/xendit-webhooks.js
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import Package from "@/models/Package";
import Invitation from "@/models/Invitation";
import User from "@/models/User";

export const config = { api: { bodyParser: true } };

// ---------- helpers ----------
function safeParse(v) { if (typeof v !== "string") return v || {}; try { return JSON.parse(v); } catch { return {}; } }
const up = (s) => String(s || "").toUpperCase();

function normalize(req) {
  const body = typeof req.body === "string" ? safeParse(req.body) : (req.body || {});
  const src = body?.data && typeof body.data === "object" ? body.data : body;
  return {
    raw: body,
    status: up(src.status),
    id: src.id || src.invoice_id || null,
    external_id: src.external_id || null,
    paid_at: src.paid_at || null,
    payment_channel: src.payment_channel || src.payment_method || null,
  };
}

function addDuration(date, dur) {
  const d = new Date(date);
  const value = Number(dur?.value || 0);
  const unit = String(dur?.unit || "");
  if (unit === "lifetime") return null;
  if (unit === "days") d.setDate(d.getDate() + value);
  if (unit === "months") d.setMonth(d.getMonth() + value);
  if (unit === "years") d.setFullYear(d.getFullYear() + value);
  return d;
}

function readHeader(req, name) {
  const v = req.headers[name.toLowerCase()];
  if (Array.isArray(v)) return (v[0] ?? "").toString().trim();
  return (v ?? "").toString().trim();
}

function sanitizeSlug(raw) {
  if (!raw) return "";
  return String(raw)
    .toLowerCase().trim()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function generateSlug(len = 6) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < len; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
}

const firstNonEmpty = (...vals) => vals.find(v => !!String(v || "").trim()) || "";

const toKeys = (arr) =>
  Array.from(new Set((Array.isArray(arr) ? arr : [])
    .map((k) => String(k || "").toLowerCase().trim())
    .filter(Boolean)));

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const expected = (process.env.XENDIT_CALLBACK_TOKEN || "").trim();
  const gotToken = readHeader(req, "x-callback-token");
  if (!gotToken || gotToken !== expected) {
    return res.status(401).json({ error: "Invalid callback token" });
  }

  await dbConnect();
  const { raw, status, id: invoiceId, external_id, paid_at, payment_channel } = normalize(req);
  console.log("[xendit-webhook] incoming", { status, invoiceId, external_id });

  try {
    let order = null;

    // Cari order via beberapa kunci
    if (invoiceId) order = await Order.findOne({ invoice_id: invoiceId });
    if (!order && external_id) order = await Order.findOne({ external_id });
    if (!order && external_id?.startsWith("order_")) {
      const maybeId = external_id.slice("order_".length);
      if (mongoose.isValidObjectId(maybeId)) order = await Order.findById(maybeId);
    }
    if (!order && external_id) order = await Order.findOne({ "xendit.externalId": external_id });
    if (!order && invoiceId) order = await Order.findOne({ "xendit.invoiceId": invoiceId });

    if (!order) {
      console.warn("[xendit-webhook] Order not found", { invoiceId, external_id });
      return res.status(200).json({ ok: true, note: "order not found; ignored" });
    }

    // ----- Normalisasi wajib sebelum save() -----
    const rawBody = typeof req.body === "string" ? safeParse(req.body) : (req.body || {});
    const webhookPayerEmail =
      rawBody?.payer_email || rawBody?.data?.payer_email || rawBody?.payerEmail || rawBody?.data?.payerEmail || null;

    order.email = firstNonEmpty(order.email, order.user_email, webhookPayerEmail).toLowerCase();
    if (!order.user_email && order.email) order.user_email = order.email;

    // pastikan packageId ada (untuk base dan addon – addon diisi dari create-invoice)
    if (!order.packageId && order.meta?.packageId) order.packageId = order.meta.packageId;

    if (!order.email || !order.packageId) {
      console.error("[webhook] Order missing required fields before update:", {
        hasEmail: !!order.email, hasPackageId: !!order.packageId,
        orderId: String(order._id), ext: external_id, inv: invoiceId
      });
      return res.status(200).json({ ok: true, note: "ignored: missing required order fields" });
    }

    // Tambah log & info Xendit
    order.xendit = order.xendit || {};
    order.xendit.history = Array.isArray(order.xendit.history) ? order.xendit.history : [];
    order.xendit.history.push({ at: new Date(), status, payload: raw });
    order.xendit.paymentChannel = payment_channel || order.xendit.paymentChannel;
    if (invoiceId && !order.invoice_id) order.invoice_id = invoiceId;
    if (!order.xendit.invoiceId && invoiceId) order.xendit.invoiceId = invoiceId;
    if (!order.payment_method && (payment_channel || order.xendit.paymentChannel)) {
      order.payment_method = payment_channel || order.xendit.paymentChannel;
    }

    const upper = status;

    // ===== STATUS PAID / SETTLED =====
    let newInvitation = null;
    if (upper === "PAID" || upper === "SETTLED") {
      const alreadyPaid = order.status === "paid";
      order.status = "paid";
      order.paidAt = order.paidAt || (paid_at ? new Date(paid_at) : new Date());
      order.paid_at = order.paidAt;

      // intent/upgrade detection (mendukung dua pola)
      const intent = String(order?.meta?.intent || "base").toLowerCase();
      const fromUpgradeFlag = !!(order?.meta?.fromUpgrade === true);
      const isUpgrade = intent === "addon" || fromUpgradeFlag;

      // ========== INTENT: ADDON (upgrade fitur untuk undangan) ==========
      if (isUpgrade) {
        try {
          // Ambil undangan target (pakai beberapa kemungkinan field)
          const invId =
            order.meta?.invitationId ||
            order.meta?.upgradeForInvitation ||
            null;
          const invSlug =
            order.meta?.invitation_slug ||
            order.meta?.upgradeSlug ||
            null;

          let invitation = null;
          if (invId && mongoose.isValidObjectId(invId)) {
            invitation = await Invitation.findOne({ _id: invId, user_email: order.email });
          }
          if (!invitation && invSlug) {
            const key = String(invSlug).toLowerCase().trim();
            invitation = await Invitation.findOne({
              user_email: order.email,
              $or: [{ slug: key }, { domainSlug: key }, { custom_slug: key }],
            });
          }

          if (invitation) {
            // derive add-on keys: meta.selectedFeatures -> items(feature).key -> order.selectedFeatures
            let addKeys = toKeys(order?.meta?.selectedFeatures);
            if (!addKeys.length && Array.isArray(order.items)) {
              addKeys = toKeys(order.items.filter(it => it?.type === "feature").map(it => it.key));
            }
            if (!addKeys.length) {
              addKeys = toKeys(order.selectedFeatures);
            }

            if (addKeys.length) {
              const curr = toKeys(invitation.allowedFeatures);
              const merged = Array.from(new Set([...curr, ...addKeys]));
              invitation.allowedFeatures = merged;

              // auto enable gift jika ikut terbeli
              if (merged.includes("gift")) {
                invitation.gift = invitation.gift || { enabled: false };
                invitation.gift.enabled = true;
              }

              await invitation.save();

              // tandai konsumsi order upgrade
              order.used = true;
              order.invitation_slug = invitation.slug;

              console.log("[webhook][addon] ✅ merged features:", addKeys, "->", invitation.slug);
            }
          } else {
            console.warn("[webhook][addon] invitation target not found");
          }

          // Catat Purchase untuk add-on (sekali)
          let Purchase = null;
          try { Purchase = (await import("@/models/Purchase")).default; } catch (_) { Purchase = null; }
          if (Purchase) {
            const exists = await Purchase.countDocuments({ orderId: order._id });
            if (exists === 0) {
              const startsAt = new Date();
              const pkg = await Package.findById(order.packageId).lean();
              const expiresAt = pkg ? addDuration(startsAt, pkg.duration) : null;

              // pakai addKeys yang benar-benar terpakai
              let addKeys = toKeys(order?.meta?.selectedFeatures);
              if (!addKeys.length && Array.isArray(order.items)) {
                addKeys = toKeys(order.items.filter(it => it?.type === "feature").map(it => it.key));
              }
              if (!addKeys.length) {
                addKeys = toKeys(order.selectedFeatures);
              }

              await Purchase.create({
                userId: order.userId || null,
                user_email: order.email,
                orderId: order._id,
                packageId: order.packageId, // paket asal undangan
                status: "active",
                features: addKeys,
                selectedFeatures: addKeys,
                startsAt,
                expiresAt,
                notes: "addon-upgrade",
              });
            }
          }
        } catch (e) {
          console.error("[webhook][addon] error:", e?.message || e);
        }
      }

      // ========== INTENT: BASE (pembelian paket) ==========
      if (!alreadyPaid && !isUpgrade) {
        let Purchase = null;
        try { Purchase = (await import("@/models/Purchase")).default; } catch (_) { Purchase = null; }

        if (Purchase) {
          const exists = await Purchase.countDocuments({ orderId: order._id });

          if (exists === 0) {
            const pkg = order.packageId ? await Package.findById(order.packageId).lean() : null;
            if (pkg) {
              const qty = Math.max(order.quantity || 1, 1);
              const defaultKeys = toKeys(pkg.featureKeys || []);
              const selected = toKeys(order.selectedFeatures || []);
              const finalKeys =
                pkg.type === "custom"
                  ? Array.from(new Set([...defaultKeys, ...selected]))
                  : Array.from(new Set(defaultKeys));

              const startsAt = new Date();
              const expiresAt = addDuration(startsAt, pkg.duration);
              const emailEnt = order.email || null;

              const docs = [];
              for (let i = 0; i < qty; i++) {
                docs.push({
                  userId: order.userId || null,
                  user_email: emailEnt,
                  orderId: order._id,
                  packageId: pkg._id,
                  status: "active",
                  features: finalKeys,
                  selectedFeatures: selected,
                  startsAt,
                  expiresAt,
                });
              }
              try { await Purchase.insertMany(docs); } catch (e) {
                console.error("[webhook] insert purchases failed:", e?.message || e);
              }
              // ✅ Tambah quota user setelah pembelian paket utama
try {
  const user = await User.findOne({ email: order.email });
  if (user) {
    user.quota = (user.quota || 0) + 1; // karena 1 paket = 1 undangan
    user.hasSelectedPackage = true;

    await user.save();
    console.log("[webhook] ✅ Quota bertambah, sekarang:", user.quota);
  } else {
    console.warn("[webhook] ⚠️ User tidak ditemukan untuk update quota:", order.email);
  }
} catch (e) {
  console.error("[webhook] ❌ Gagal update quota user:", e);
}
            }
          }
        }

        // === AUTO-CREATE INVITATION (onboarding only)
        const fromOnboarding = !!(order.meta && order.meta.fromOnboarding === true);
        if (!order.used && fromOnboarding) {
          const meta = order.meta || {};
          const emailForInvitation = firstNonEmpty(order.email, order.user_email);
          const pria = meta.pria;
          const wanita = meta.wanita;
          const tanggal = meta.tanggal;

          if (!emailForInvitation || !pria || !wanita || !tanggal) {
            console.warn("[webhook] Data tidak lengkap untuk auto-create undangan", {
              hasEmail: !!emailForInvitation, pria, wanita, tanggal
            });
          } else {
            try {
              const baseSlug = sanitizeSlug(meta.slug || `${pria}-${wanita}` || "undangan");
              let finalSlug = baseSlug || generateSlug(6);
              let counter = 0;
              while (await Invitation.findOne({ slug: finalSlug })) {
                counter++;
                finalSlug = `${baseSlug}-${generateSlug(4)}`;
                if (counter > 5) break;
              }

              // set allowedFeatures dari Package
              const pkg = await Package.findById(order.packageId).lean();
              const allowed = Array.isArray(pkg?.featureKeys) ? pkg.featureKeys.map(String) : [];

              newInvitation = await Invitation.create({
                slug: finalSlug,
                template: "classic",
                user_email: emailForInvitation,
                packageId: order.packageId,
                allowedFeatures: allowed,

                mempelai: {
                  pria: pria || "",
                  wanita: wanita || "",
                  orangtua_pria: meta.orangtua_pria || "",
                  orangtua_wanita: meta.orangtua_wanita || "",
                },
                acara_utama: {
                  nama: "",
                  tanggal: new Date(tanggal),
                  waktu: meta.waktu || "",
                  lokasi: meta.lokasi || "",
                },
                acara: [],
                galeri: [],
                tamu: [],
                rsvp: [],
                ucapan: [],
                gift: { enabled: false, bank_accounts: [], e_wallets: [], qris: { enabled: false } },
                privacy: { isPasswordProtected: false, password: "" },
                views: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
              });

              order.used = true;
              order.invitation_slug = newInvitation.slug;
              console.log("[webhook] ✅ Undangan berhasil dibuat:", newInvitation.slug);
            } catch (e) {
              console.error("[webhook] ❌ Gagal buat undangan otomatis:", e);
            }
          }
        }

        // === Tandai onboarding selesai untuk user
        if (fromOnboarding) {
          try {
            const user = await User.findOne({ email: order.email });
            if (user) {
              console.log("Before Update:", {
    onboardingCompleted: user.onboardingCompleted,
    onboardingStep: user.onboardingStep,
  });
              user.onboardingCompleted = true;
              user.onboardingStep = Number.isInteger(user.onboardingStep)
                ? Math.max(user.onboardingStep, 4)
                : 4;
              user.hasSelectedPackage = true;
              if (newInvitation?._id) {
                const idStrs = (user.invitations || []).map((x) => String(x));
                if (!idStrs.includes(String(newInvitation._id))) {
                  user.invitations = [...(user.invitations || []), newInvitation._id];
                }
              }
              await user.save();
            }
          } catch (e) {
            console.error("[webhook] update user onboarding flags failed:", e?.message || e);
          }
        }
      }

    } else if (upper === "EXPIRED") {
      order.status = "expired";
    } else if (["FAILED", "CANCELED", "CANCELLED"].includes(upper)) {
      order.status = "canceled";
    }

    await order.save();
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("[xendit-webhook] Fatal error:", e);
    return res.status(200).json({ ok: false, note: "error", error: String(e?.message || e) });
  }
}
