import dbConnect from "../../../utils/db";
import Invitation from "../../../models/Invitation";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ message: "ID is required" });
    }

    await dbConnect();

    // Update the invitation to increment views count
    const result = await Invitation.findByIdAndUpdate(
      id,
      { 
        $inc: { views: 1 },
        $set: { lastViewed: new Date() }
      },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ message: "Invitation not found" });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Track View Error:', error);
    res.status(500).json({ message: "Error tracking view" });
  }
}
