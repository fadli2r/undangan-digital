import dbConnect from "../../../lib/dbConnect";
import Invitation from "../../../models/Invitation";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  
  const { currentSlug, newSlug, user_email } = req.body;
  
  if (!currentSlug || !newSlug || !user_email) {
    return res.status(400).json({ message: "Data tidak lengkap" });
  }

  await dbConnect();

  try {
    // Validasi format slug baru
    const cleanSlug = newSlug
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    
    // Validasi panjang slug
    if (cleanSlug.length < 3) {
      return res.status(400).json({ message: "Link custom minimal 3 karakter" });
    }
    
    if (cleanSlug.length > 50) {
      return res.status(400).json({ message: "Link custom maksimal 50 karakter" });
    }

    // Cek apakah undangan dengan slug lama ada dan milik user ini
    const currentInvitation = await Invitation.findOne({ 
      slug: currentSlug, 
      user_email 
    });
    
    if (!currentInvitation) {
      return res.status(404).json({ message: "Undangan tidak ditemukan" });
    }

    // Jika slug tidak berubah, tidak perlu update
    if (currentSlug === cleanSlug) {
      return res.status(200).json({ 
        success: true, 
        slug: cleanSlug,
        message: "Slug tidak berubah" 
      });
    }

    // Cek apakah slug baru sudah digunakan
    const existingInvitation = await Invitation.findOne({ slug: cleanSlug });
    if (existingInvitation) {
      return res.status(400).json({ message: "Link custom sudah digunakan. Pilih yang lain." });
    }

    // Update slug
    const updated = await Invitation.findOneAndUpdate(
      { slug: currentSlug, user_email },
      { 
        $set: { 
          slug: cleanSlug,
          custom_slug: newSlug // Simpan slug asli yang diinput user
        },
        $currentDate: { updatedAt: true }
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Gagal mengupdate slug" });
    }

    res.status(200).json({ 
      success: true, 
      slug: cleanSlug,
      message: "Link berhasil diupdate" 
    });

  } catch (error) {
    console.error('Update slug error:', error);
    res.status(500).json({ message: error.message || "Gagal update link" });
  }
}
