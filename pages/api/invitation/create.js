import dbConnect from "../../../lib/dbConnect";
import Invitation from "../../../models/Invitation";
import User from "../../../models/User";
import Order from "../../../models/Order";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { user_email, template, mempelai, acara_utama, custom_slug } = req.body;
  
  // Validasi data yang diperlukan
  if (!user_email || !template || !mempelai?.pria || !mempelai?.wanita || !acara_utama?.tanggal) {
    return res.status(400).json({ message: "Data tidak lengkap" });
  }

  await dbConnect();

  // 1. Cek atau buat user jika belum ada
  let user = await User.findOne({ email: user_email });
  if (!user) {
    user = await User.create({
      email: user_email,
      paket: "free",
      quota: 1,
      status_pembayaran: "free"
    });
  }

  // 2. Cek quota user
  if (user.quota < 1) {
    return res.status(400).json({ message: "Quota undangan habis. Silakan order paket lagi." });
  }

  // 3. Cari order yang belum used atau buat order gratis untuk user baru
  let order = await Order.findOne({ email: user_email, status: "paid", used: false });
  if (!order) {
    // Buat order gratis untuk user free
    order = await Order.create({
      email: user_email,
      paket: "free",
      harga: 0,
      status: "paid",
      invoice_id: `FREE-${Date.now()}`,
      date: new Date(),
      used: false,
      invitation_slug: null
    });
  }

  // 4. Generate atau validasi slug
  let slug;
  
  if (custom_slug) {
    // Validasi custom slug
    slug = custom_slug
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    
    // Validasi panjang slug
    if (slug.length < 3) {
      return res.status(400).json({ message: "Link custom minimal 3 karakter" });
    }
    
    if (slug.length > 50) {
      return res.status(400).json({ message: "Link custom maksimal 50 karakter" });
    }
    
    // Cek apakah slug sudah digunakan oleh siapa pun
    const existGlobal = await Invitation.findOne({ slug });
    if (existGlobal) {
      return res.status(400).json({ message: "Link custom sudah digunakan. Pilih yang lain." });
    }
  } else {
    // Generate slug otomatis dari nama mempelai
    slug = (mempelai.pria + "-" + mempelai.wanita)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Pastikan slug ini belum dipakai user tsb
    const exist = await Invitation.findOne({ slug, user_email });
    if (exist) {
      return res.status(400).json({ message: "Kamu sudah pernah buat undangan dengan nama ini. Ganti nama mempelai agar link unik." });
    }
  }

  try {
    // 5. Buat undangan dengan struktur data yang benar
    const undangan = await Invitation.create({
      user_email,
      template,
      slug,
      custom_slug: custom_slug || "",
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

    // 6. Set order as used dan simpan slug undangan
    await Order.updateOne(
      { _id: order._id },
      { $set: { used: true, invitation_slug: undangan.slug } }
    );

    // 7. Kurangi quota user
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
