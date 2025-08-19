import dbConnect from "../../../lib/dbConnect";
import Invitation from "../../../models/Invitation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await dbConnect();

    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ message: 'ID undangan diperlukan' });
    }

    // Find invitation and verify ownership
    const invitation = await Invitation.findById(id);
    
    if (!invitation) {
      return res.status(404).json({ message: 'Undangan tidak ditemukan' });
    }

    if (invitation.user_email !== session.user.email) {
      return res.status(403).json({ message: 'Tidak memiliki akses' });
    }

    // Delete invitation
    await Invitation.findByIdAndDelete(id);

    return res.status(200).json({
      message: 'Undangan berhasil dihapus'
    });

  } catch (error) {
    console.error('Error deleting invitation:', error);
    return res.status(500).json({ 
      message: 'Terjadi kesalahan server',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
}
