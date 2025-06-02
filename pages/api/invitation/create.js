import dbConnect from "../../../utils/db";
import Invitation from "../../../models/Invitation";
import User from "../../../models/User";
import Order from "../../../models/Order";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { user_email, template, mempelai, acara_utama } = req.body;
  
  // Validasi data yang diperlukan
  if (!user_email || !template || !mempelai?.pria || !mempelai?.wanita || !acara_utama?.tanggal) {
    return res.status(400).json({ message: "Data tidak lengkap" });
  }

  await dbConnect();

  // 1. Cek quota user
  const user = await User.findOne({ email: user_email });
  if (!user || user.quota < 1) {
    return res.status(400).json({ message: "Quota undangan habis. Silakan order paket lagi." });
  }

  // 2. Cari order yang belum used
  const order = await Order.findOne({ email: user_email, status: "paid", used: false });
  if (!order) {
    return res.status(400).json({ message: "Quota order habis. Silakan order paket lagi." });
  }

  // 3. Generate slug unik
  let slug = (mempelai.pria + "-" + mempelai.wanita)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  // Pastikan slug ini belum dipakai user tsb
  const exist = await Invitation.findOne({ slug, user_email });
  if (exist) {
    return res.status(400).json({ message: "Kamu sudah pernah buat undangan dengan nama ini. Ganti nama mempelai agar link unik." });
  }

  try {
    // 4. Buat undangan dengan struktur data yang benar
    const undangan = await Invitation.create({
      user_email,
      template,
      slug,
      mempelai,
      acara_utama: {
        ...acara_utama,
        tanggal: new Date(acara_utama.tanggal)
      },
      // Inisialisasi array acara dengan acara utama
      acara: [{
        ...acara_utama,
        tanggal: new Date(acara_utama.tanggal)
      }]
    });

    // 5. Set order as used dan simpan slug undangan
    await Order.updateOne(
      { _id: order._id },
      { $set: { used: true, invitation_slug: undangan.slug } }
    );

    // 6. Kurangi quota user
    await User.updateOne(
      { email: user_email },
      { $inc: { quota: -1 } }
    );

    res.status(200).json({ slug: undangan.slug });
  } catch (error) {
    console.error("Error creating invitation:", error);
    res.status(500).json({ message: error.message });
  }
}
