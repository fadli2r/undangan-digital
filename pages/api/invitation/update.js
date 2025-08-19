import dbConnect from "../../../lib/dbConnect";
import Invitation from "../../../models/Invitation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await dbConnect();

    const { slug, field } = req.body;

    if (!slug || !field) {
      return res.status(400).json({ message: 'Data tidak lengkap' });
    }

    // Find and update invitation
    const invitation = await Invitation.findOneAndUpdate(
      { 
        slug,
        user_email: session.user.email 
      },
      { $set: field },
      { new: true }
    );

    if (!invitation) {
      return res.status(404).json({ message: 'Undangan tidak ditemukan' });
    }

    return res.status(200).json({
      message: 'Data berhasil diupdate',
      undangan: invitation
    });

  } catch (error) {
    console.error('Error updating invitation:', error);
    return res.status(500).json({ 
      message: 'Terjadi kesalahan server',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
}
