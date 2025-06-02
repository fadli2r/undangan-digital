// pages/api/invitation/rsvp.js
import dbConnect from "../../../utils/db";
import Invitation from "../../../models/Invitation";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { slug, nama, kehadiran, jumlah_tamu, pesan } = req.body;
    
    if (!slug || !nama || !kehadiran) {
      return res.status(400).json({ message: "Data tidak lengkap" });
    }

    await dbConnect();

    // Add RSVP to array
    const result = await Invitation.updateOne(
      { slug },
      {
        $push: {
          rsvp: {
            nama,
            status: kehadiran,
            jumlah: jumlah_tamu || 1,
            pesan,
            waktu: new Date(),
          }
        }
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "Undangan tidak ditemukan" });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('RSVP Error:', error);
    res.status(500).json({ message: "Terjadi kesalahan saat menyimpan RSVP" });
  }
}
