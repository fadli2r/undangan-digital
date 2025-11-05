// pages/api/invitation/e-invitation/[slug].js
import dbConnect from "@/utils/db";
import Invitation from "@/models/Invitation";

export default async function handler(req, res) {
  await dbConnect();
  const { slug } = req.query;

  if (req.method === "GET") {
    const inv = await Invitation.findOne({ slug });
    if (!inv) return res.status(404).json({ error: "Undangan tidak ditemukan" });
    return res.json(inv.eInvitation || {});
  }

  if (req.method === "POST") {
    const data = req.body;
    const inv = await Invitation.findOneAndUpdate(
      { slug },
      { $set: { eInvitation: data } },
      { new: true }
    );
    return res.json({ success: true, eInvitation: inv.eInvitation });
  }

  res.status(405).json({ error: "Method not allowed" });
}
