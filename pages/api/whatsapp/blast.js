// pages/api/whatsapp/blast.js

import dbConnect from "@/lib/dbConnect";
import Invitation from "@/models/Invitation";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      slug,
      instance_id,
      phone,
      template,
      type,
      image_url = "",
      fields,
    } = req.body;

    // Validasi dasar
    if (
      !slug ||
      !instance_id ||
      !Array.isArray(phone) ||
      !phone.length ||
      !template ||
      !type ||
      !Array.isArray(fields) ||
      !fields.length
    ) {
      return res
        .status(400)
        .json({ error: "Data tidak lengkap atau format salah" });
    }

    // ✅ Connect DB dan ambil data undangan
    await dbConnect();
    const invitation = await Invitation.findOne({ slug });

    if (!invitation) {
      return res.status(404).json({ error: "Undangan tidak ditemukan" });
    }

    const totalSend = phone.length;
    const quota = invitation.whatsappQuota || { limit: 0, used: 0 };
    const sisaQuota = quota.limit - quota.used;

    // ✅ Cek apakah kuota cukup
    if (sisaQuota < totalSend) {
      return res.status(403).json({
        error: `Kuota WhatsApp tidak mencukupi. Sisa kuota: ${sisaQuota}, yang akan dikirim: ${totalSend}`,
      });
    }

    // ✅ Siapkan image_url absolut
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const finalImageUrl = image_url.startsWith("http")
      ? image_url
      : `${baseUrl}${image_url.startsWith("/") ? "" : "/"}${image_url}`;

    const payload = {
      instance_id,
      phone,
      template,
      type,
      image_url: finalImageUrl,
      apikey: process.env.WA_API_KEY || "", // kosong sesuai instruksi
      fields,
    };

    const apiEndpoint =
      process.env.WA_BLAST_ENDPOINT ||
      "https://api.whatsnotif.com/v1/message/send-blast";

    console.log("📦 Sending WA Blast with payload:");
    console.log("✅ Endpoint:", apiEndpoint);
    console.log("✅ Phones:", phone.length);
    console.log("✅ Fields[0]:", fields[0]);

    // Kirim ke API WhatsNotif
    const waRes = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await waRes.json();

    if (!waRes.ok) {
      return res.status(waRes.status).json({
        error: data?.message || "Gagal mengirim pesan",
        detail: data,
      });
    }

    // ✅ Kurangi kuota setelah berhasil kirim
    invitation.whatsappQuota.used = (invitation.whatsappQuota.used || 0) + totalSend;
    await invitation.save();

    console.log(`✅ WA Blast berhasil. Quota dikurangi ${totalSend}. Sisa quota: ${quota.limit - invitation.whatsappQuota.used}`);

    return res.status(200).json({ success: true, result: data });
  } catch (err) {
    console.error("❌ WA Blast Error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
