import dbConnect from "../../../utils/db";
import Invitation from "../../../models/Invitation";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { slug } = req.query;
  if (!slug) {
    return res.status(400).json({ message: 'Slug is required' });
  }

  try {
    await dbConnect();
    const invitation = await Invitation.findOne({ slug });
    
    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    // Return the list of scanned guests with their timestamps
    return res.status(200).json({
      guests: invitation.attendance || []
    });

  } catch (error) {
    console.error('Error fetching scanned guests:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
