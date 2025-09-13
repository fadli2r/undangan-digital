// pages/api/payment/create-invoice.js
import axios from "axios";
import mongoose from "mongoose";
import dbConnect from "../../../lib/dbConnect";
import User from "../../../models/User";
import Order from "../../../models/Order";
import Package from "../../../models/Package";
import Feature from "../../../models/Feature";
import Invitation from "../../../models/Invitation"; // <-- penting untuk intent: addon
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

function toKeys(arr) {
  if (!Array.isArray(arr)) return [];
  return Array.from(
    new Set(arr.map((k) => String(k || "").toLowerCase().trim()).filter(Boolean))
  );
}
const isId = (s) => typeof s === "string" && mongoose.isValidObjectId(s);

const sanitizeSlug = (raw) =>
  String(raw || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "");

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    const {
      // umum
      email,
      name,
      successUrl,
      failureUrl,

      // pembelian paket (base)
      packageId,
      paket, // bisa slug / id / name
      selectedFeatures = [], // untuk paket 'custom' saja

      // pembelian add-on (upgrade)
      intent = "base", // "base" | "addon"
      invitationId,
      invitationSlug, // alternatif kalau id tidak ada

      // onboarding (base)
      onboardingData = {},     // dari summary.js
      onboardingFormData = {}, // kompat lama (jika ada)
    } = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});

    const userEmail = (session?.user?.email || email || "").toLowerCase().trim();
    if (!userEmail) return res.status(400).json({ message: "Email tidak ditemukan" });

    await dbConnect();
    const user = await User.findOne({ email: userEmail }).lean();

    // ===================================================================
    // Persiapan variabel universal
    // ===================================================================
    const orderId = new mongoose.Types.ObjectId();
    const APP_URL =
      (process.env.APP_URL || "").trim() ||
      (req.headers.origin ? req.headers.origin.replace(/\/$/, "") : "http://localhost:3000");
    const defaultSuccessPath = `/orders/${orderId.toString()}/success`;
    const external_id = `order_${orderId.toString()}`;

    // Akan diisi tergantung intent
    let items = [];
    let amount = 0;
    let meta = {};
    let pkg = null;            // untuk base; untuk addon: diisi dari invitation.packageId
    let inv = null;            // invitation untuk addon
    let description = "Pembelian Paket Undangan";
    let successPath = defaultSuccessPath;

    // ===================================================================
    // INTENT: ADDON (Upgrade fitur per undangan)
    // ===================================================================
    if (String(intent).toLowerCase() === "addon") {
      // 1) Ambil undangan milik user via id/slug
      if (!invitationId && !invitationSlug) {
        return res.status(400).json({ message: "invitationId atau invitationSlug diperlukan untuk upgrade fitur" });
      }

      if (invitationId && !isId(invitationId)) {
        return res.status(400).json({ message: "invitationId tidak valid" });
      }

      const findQuery = invitationId
        ? { _id: invitationId }
        : {
            $or: [
              { slug: String(invitationSlug || "").toLowerCase() },
              { domainSlug: String(invitationSlug || "").toLowerCase() },
              { custom_slug: String(invitationSlug || "").toLowerCase() },
            ],
          };

      inv = await Invitation.findOne({ user_email: userEmail, ...findQuery })
        .populate("packageId", "name slug type featureKeys selectableFeatures price")
        .lean();

      if (!inv) {
        return res.status(404).json({ message: "Undangan tidak ditemukan atau bukan milik Anda" });
      }

      // 2) Hitung fitur yang benar² perlu di-upgrade (exclude yang sudah ada)
      const reqKeys = toKeys(selectedFeatures);
      if (reqKeys.length === 0) {
        return res.status(400).json({ message: "selectedFeatures tidak boleh kosong untuk upgrade" });
      }

      const includedNow = new Set(
        toKeys([
          ...(Array.isArray(inv?.packageId?.featureKeys) ? inv.packageId.featureKeys : []),
          ...(Array.isArray(inv?.allowedFeatures) ? inv.allowedFeatures : []),
        ])
      );

      const addOnKeys = reqKeys.filter((k) => !includedNow.has(k));
      if (addOnKeys.length === 0) {
        return res.status(400).json({ message: "Semua fitur yang dipilih sudah termasuk dalam paket saat ini" });
      }

      const feats = await Feature.find({ key: { $in: addOnKeys }, active: true }).lean();
      const foundKeys = new Set(feats.map((f) => String(f.key).toLowerCase()));
      const missing = addOnKeys.filter((k) => !foundKeys.has(k));
      if (missing.length) {
        return res.status(400).json({ message: `Fitur tidak ditemukan/aktif: ${missing.join(", ")}` });
      }

      // 3) Buat line items dari fitur
      items = feats.map((f) => ({
        type: "feature",
        refId: f._id,
        key: f.key,
        name: `Add-on: ${f.name}`,
        unitPrice: Number(f.price || 0),
        qty: 1,
        meta: { source: "upgrade", invitationId: inv._id },
      }));

      amount = items.reduce((sum, it) => sum + Number(it.unitPrice || 0) * Number(it.qty || 1), 0);
      if (!(amount > 0)) return res.status(400).json({ message: "Nominal pembayaran tidak valid" });

      // 4) Deskripsi & redirect
      const keysLabel = addOnKeys.join(", ");
      description = `Upgrade Fitur (${keysLabel}) untuk ${inv.slug}`;
      successPath =
        successUrl
          ? new URL(successUrl, APP_URL).pathname + (new URL(successUrl, APP_URL).search || "")
          : `${defaultSuccessPath}?type=addon&slug=${encodeURIComponent(inv.slug)}`;

      // 5) Meta order untuk webhook + success page
      pkg = inv.packageId || null; // agar order.packageId terisi & webhook aman
      meta = {
        intent: "addon",
        invitationId: inv._id,
        invitation_slug: inv.slug,
        selectedFeatures: addOnKeys,
        packageId: pkg?._id || inv.packageId || null, // fallback untuk webhook lama
      };

    // ===================================================================
    // INTENT: BASE (Beli paket – onboarding/paket.js)
    // ===================================================================
    } else {
      // --- Ambil package (by id/slug/name)
      const byId = async (id) => {
        if (typeof id !== "string") return null;
        if (!mongoose.isValidObjectId(id)) return null;
        return Package.findById(id).lean();
      };

      if (packageId) pkg = await byId(packageId);
      if (!pkg && paket) {
        pkg =
          (await byId(paket)) ||
          (await Package.findOne({ slug: paket }).lean()) ||
          (await Package.findOne({ name: paket }).lean());
      }
      if (!pkg) return res.status(404).json({ message: "Package not found" });
      if (pkg.isActive === false) return res.status(400).json({ message: "Package is inactive" });

      // --- Line items: base package
      items = [
        {
          type: "package",
          refId: pkg._id,
          key: "base-package",
          name: pkg.name,
          unitPrice: Number(pkg.price || 0),
          qty: 1,
          meta: { duration: pkg.duration, type: pkg.type },
        },
      ];

      // --- Add-on opsional dari onboarding (custom domain, donasi, dll)
      const addDomain = onboardingData?.useCustomDomain ? 300000 : 0;
      const addDonasi = onboardingData?.oneTree ? 10000 : 0;
      if (addDomain > 0) {
        items.push({
          type: "feature",
          refId: new mongoose.Types.ObjectId(),
          key: "custom-domain",
          name: "Custom Domain",
          unitPrice: addDomain,
          qty: 1,
          meta: { source: "onboarding" },
        });
      }
      if (addDonasi > 0) {
        items.push({
          type: "feature",
          refId: new mongoose.Types.ObjectId(),
          key: "one-tree-donation",
          name: "One Wedding One Tree",
          unitPrice: addDonasi,
          qty: 1,
          meta: { source: "onboarding" },
        });
      }

      // --- Jika paket bertipe custom, tambahkan selected add-ons yg belum termasuk
      const reqKeys = pkg.type === "custom" ? toKeys(selectedFeatures) : [];
      if (reqKeys.length) {
        const included = new Set(toKeys(pkg.featureKeys || []));
        const addOnKeys = reqKeys.filter((k) => !included.has(k));
        if (addOnKeys.length) {
          const feats = await Feature.find({ key: { $in: addOnKeys }, active: true }).lean();
          for (const f of feats) {
            items.push({
              type: "feature",
              refId: f._id,
              key: f.key,
              name: `Add-on: ${f.name}`,
              unitPrice: Number(f.price || 0),
              qty: 1,
              meta: {},
            });
          }
        }
      }

      amount = items.reduce((sum, it) => sum + Number(it.unitPrice || 0) * Number(it.qty || 1), 0);
      if (!(amount > 0)) return res.status(400).json({ message: "Nominal pembayaran tidak valid" });

      // --- Meta dari onboarding (utamakan onboardingData)
      const slugFromDomain = sanitizeSlug(onboardingData?.slug || onboardingData?.domain || "");
      meta = {
        ...onboardingFormData,
        ...onboardingData,
        slug: slugFromDomain || undefined,   // supaya webhook bisa pakai sebagai slug
        fromOnboarding: onboardingData?.fromOnboarding ?? true,
        packageId: pkg._id,                  // fallback utk webhook
        intent: "base",
      };

      description = `Pembelian Paket Undangan: ${pkg.name}`;

      successPath =
        successUrl
          ? new URL(successUrl, APP_URL).pathname + (new URL(successUrl, APP_URL).search || "")
          : defaultSuccessPath;
    }

    // ===================================================================
    // Simpan ORDER lokal (pakai _id yang sudah disiapkan)
    // ===================================================================
    const orderDoc = {
      _id: orderId,
      email: userEmail,
      user_email: userEmail,
      userId: user?._id || null,
      status: "pending",
      used: false,
      // Penting untuk webhook lama: selalu isi packageId bila ada
      packageId: pkg?._id || pkg || null,
      quantity: 1,
      items,
      selectedFeatures: toKeys(selectedFeatures),
      successPath,
      invitation_slug: null,
      external_id,
      amount,
      harga: amount,
      currency: "IDR",
      meta,
      xendit: {
        externalId: external_id,
        payerEmail: userEmail,
        history: [{ at: new Date(), status: "CREATED_LOCAL_ORDER" }],
      },
    };

    await Order.create(orderDoc);

    // UX kecil untuk onboarding
    if (meta?.fromOnboarding) {
      await User.updateOne(
        { email: userEmail },
        { $set: { hasSelectedPackage: true, onboardingStep: 3 } }
      );
    }

    // ===================================================================
    // Buat invoice Xendit
    // ===================================================================
    const apiKey = process.env.XENDIT_API_KEY || process.env.XENDIT_SECRET_KEY;
    if (!apiKey) return res.status(500).json({ message: "XENDIT_API_KEY belum di-set" });

    const resp = await axios.post(
      "https://api.xendit.co/v2/invoices",
      {
        external_id,
        amount,
        payer_email: userEmail,
        description,
        currency: "IDR",
        success_redirect_url: successUrl || `${APP_URL}${successPath}`,
        failure_redirect_url: failureUrl || `${APP_URL}/paket`,
        items: items.map((i) => ({
          name: i.name,
          quantity: i.qty || 1,
          price: i.unitPrice,
          category: i.type, // "package" | "feature"
        })),
        invoice_duration: 3600,
      },
      { auth: { username: apiKey, password: "" }, headers: { "Content-Type": "application/json" } }
    );

    const data = resp?.data || {};
    await Order.updateOne(
      { _id: orderId },
      {
        $set: {
          invoice_id: data?.id || null,
          invoice_url: data?.invoice_url || null,
          expiresAt: data?.expiry_date ? new Date(data.expiry_date) : null,
          "xendit.invoiceId": data?.id || null,
          "xendit.externalId": data?.external_id || external_id,
          "xendit.invoiceUrl": data?.invoice_url || null,
        },
        $push: { "xendit.history": { at: new Date(), status: data?.status || "INVOICE_CREATED", payload: data } },
      }
    );

    if (name && user?._id) {
      await User.updateOne({ _id: user._id }, { $set: { name } });
    }

    return res.status(200).json({
      ok: true,
      orderId: orderId.toString(),
      invoice_url: data?.invoice_url || null,
      invoice_id: data?.id || null,
      external_id,
    });
  } catch (error) {
    const errPayload = error?.response?.data || null;
    console.error("create-invoice error:", errPayload || error);
    return res.status(500).json({
      message: "Gagal membuat invoice",
      error: errPayload?.message || error?.message || "UNKNOWN",
      details: errPayload,
    });
  }
}
