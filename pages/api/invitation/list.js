import dbConnect from "../../../lib/dbConnect";
import Invitation from "../../../models/Invitation";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();
  
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: "Email diperlukan" });
    }

    await dbConnect();
    
    // Get all invitations for the user, sorted by creation date
    const invitations = await Invitation.find({ 
      user_email: email 
    }).sort({ 
      createdAt: -1 
    }).select({
      slug: 1,
      template: 1,
      mempelai: 1,
      acara_utama: 1,
      createdAt: 1,
      views: 1
    });

    console.log(`Found ${invitations.length} invitations for ${email}`);
    
    res.status(200).json({ invitations });
  } catch (error) {
    console.error("Error fetching invitations:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
