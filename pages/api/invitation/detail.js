// /pages/api/invitation/detail.js
import dbConnect from "../../../utils/db";
import Invitation from "../../../models/Invitation";

export default async function handler(req, res) {
  const { slug } = req.query;
  await dbConnect();
  const undangan = await Invitation.findOne({ slug }).lean();
  if (!undangan) return res.status(404).json({ message: "Undangan tidak ditemukan" });
  undangan._id = undangan._id.toString();
  return res.status(200).json({ undangan });
}
