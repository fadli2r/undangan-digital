import dbConnect from "../../../utils/db";
import Invitation from "../../../models/Invitation";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();
  const { email } = req.query;
  if (!email) return res.status(400).json({ message: "Email diperlukan" });

  await dbConnect();
  const invitations = await Invitation.find({ user_email: email }).sort({ createdAt: -1 });
  res.status(200).json({ invitations });
}
