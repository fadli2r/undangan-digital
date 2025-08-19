import dbConnect from "../../../lib/dbConnect";
import Invitation from "../../../models/Invitation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await dbConnect();

    const { slug } = req.query;

    if (!slug) {
      return res.status(400).json({ message: 'Slug diperlukan' });
    }

    // Find invitation and verify ownership
    const invitation = await Invitation.findOne({ 
      slug,
      user_email: session.user.email 
    }).lean();
    
    if (!invitation) {
      return res.status(404).json({ message: 'Undangan tidak ditemukan' });
    }

    // Get statistics
    const stats = {
      views: invitation.views || 0,
      rsvp: (invitation.rsvp || []).length,
      wishes: (invitation.ucapan || []).length,
      shares: invitation.shares || 0
    };

    // Transform data for response
    const data = {
      ...invitation,
      _id: invitation._id.toString(),
      stats
    };

    return res.status(200).json({
      undangan: data
    });

  } catch (error) {
    console.error('Error fetching invitation:', error);
    return res.status(500).json({ 
      message: 'Terjadi kesalahan server',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
}
