import dbConnect from "../../../utils/db";
import Invitation from "../../../models/Invitation";

export default async function handler(req, res) {
  const { method } = req;
  await dbConnect();

  switch (method) {
    case 'GET':
      try {
        const { slug } = req.query;
        if (!slug) {
          return res.status(400).json({ message: "Slug diperlukan" });
        }

        const invitation = await Invitation.findOne({ slug }).lean();
        if (!invitation) {
          return res.status(404).json({ message: "Undangan tidak ditemukan" });
        }

        // Sort ucapan by waktu in descending order (newest first)
        const sortedUcapan = invitation.ucapan?.sort((a, b) => 
          new Date(b.waktu) - new Date(a.waktu)
        ) || [];

        return res.status(200).json({ ucapan: sortedUcapan });
      } catch (error) {
        console.error('GET ucapan error:', error);
        return res.status(500).json({ message: "Error mengambil ucapan" });
      }

    case 'POST':
      try {
        const { slug, nama, pesan } = req.body;
        if (!slug || !nama || !pesan) {
          return res.status(400).json({ message: "Data tidak lengkap" });
        }

        const invitation = await Invitation.findOne({ slug });
        if (!invitation) {
          return res.status(404).json({ message: "Undangan tidak ditemukan" });
        }

        // Add new ucapan
        const newUcapan = {
          nama,
          pesan,
          waktu: new Date()
        };

        invitation.ucapan = invitation.ucapan || [];
        invitation.ucapan.push(newUcapan);
        await invitation.save();

        return res.status(200).json({ message: "Ucapan berhasil ditambahkan" });
      } catch (error) {
        console.error('POST ucapan error:', error);
        return res.status(500).json({ message: "Error menambahkan ucapan" });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ message: `Method ${method} tidak diizinkan` });
  }
}
