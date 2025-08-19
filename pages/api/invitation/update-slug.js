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

    const { currentSlug, newSlug } = req.body;

    if (!currentSlug || !newSlug) {
      return res.status(400).json({ message: 'Data tidak lengkap' });
    }

    // Validate new slug format
    if (!/^[a-zA-Z0-9-]+$/.test(newSlug)) {
      return res.status(400).json({ 
        message: 'Format link tidak valid. Gunakan huruf, angka, dan tanda strip (-)'
      });
    }

    // Check if new slug already exists
    const existingInvitation = await Invitation.findOne({ 
      slug: newSlug,
      _id: { $ne: currentSlug }
    });

    if (existingInvitation) {
      return res.status(400).json({ message: 'Link sudah digunakan' });
    }

    // Find and update invitation
    const invitation = await Invitation.findOneAndUpdate(
      { 
        slug: currentSlug,
        user_email: session.user.email 
      },
      { 
        custom_slug: newSlug,
        slug: newSlug
      },
      { new: true }
    );

    if (!invitation) {
      return res.status(404).json({ message: 'Undangan tidak ditemukan' });
    }

    return res.status(200).json({
      message: 'Link berhasil diupdate',
      slug: invitation.slug
    });

  } catch (error) {
    console.error('Error updating slug:', error);
    return res.status(500).json({ 
      message: 'Terjadi kesalahan server',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
}
