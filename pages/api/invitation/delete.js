import dbConnect from "../../../utils/db";
import Invitation from "../../../models/Invitation";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { slug, email } = req.body;
  if (!slug || !email) return res.status(400).json({ message: "Data tidak lengkap" });

  await dbConnect();
  await Invitation.deleteOne({ slug, user_email: email });
  res.status(200).json({ message: "Berhasil dihapus" });
}
