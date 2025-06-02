// pages/api/invitation/ucapan.js
import dbConnect from "../../../utils/db";
import Invitation from "../../../models/Invitation";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { slug, nama, pesan } = req.body;
  if (!slug || !nama || !pesan) return res.status(400).json({ message: "Data tidak lengkap" });
  await dbConnect();

  await Invitation.updateOne(
    { slug },
    {
      $push: {
        ucapan: {
          nama,
          pesan,
          waktu: new Date(),
        }
      }
    }
  );
  res.status(200).json({ success: true });
}
