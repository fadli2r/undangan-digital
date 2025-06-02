import dbConnect from "../../../utils/db";
import Invitation from "../../../models/Invitation";

export default async function handler(req, res) {
  await dbConnect();
  const { slug } = req.query;

  if (!slug) return res.status(400).json({ message: "Slug diperlukan" });

  const undangan = await Invitation.findOne({ slug });
  if (!undangan) return res.status(404).json({ message: "Undangan tidak ditemukan" });

  // Ambil data dari gift.konfirmasi
  const list = Array.isArray(undangan.gift?.konfirmasi)
    ? [...undangan.gift.konfirmasi].reverse() // terbaru di atas
    : [];
  res.json({ list });
}
