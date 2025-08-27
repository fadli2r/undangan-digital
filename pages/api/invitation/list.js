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

    // Get status filter from query params
    const { status } = req.query;

    // Build query
    const query = { user_email: session.user.email };
    if (status && status !== 'Semua') {
      query.status = status;
    }

    // Get invitations
    const invitations = await Invitation.find(query)
      .sort({ createdAt: -1 })
      .lean();

    // Transform data
    const transformedInvitations = invitations.map(inv => {
      const groomBride = `${inv.mempelai?.pria || ''} & ${inv.mempelai?.wanita || ''}`.trim();
      const status = inv.isExpired ? 'Selesai' : (inv.mempelai?.pria ? 'Aktif' : 'Draft');
      
      return {
        id: inv._id.toString(),
        slug: inv.slug,
        nama: groomBride || 'Untitled',
        template: inv.template,
        tanggalDibuat: inv.createdAt,
        tanggalAcara: inv.acara_utama?.tanggal,
        status,
        pengunjung: inv.views || 0,
        rsvp: (inv.rsvp || []).length,
        ucapan: (inv.ucapan || []).length,
  background_photo: inv.background_photo || null,
  galeri: inv.galeri || [],
thumbnail: inv.background_photo 
    || (inv.galeri && inv.galeri.length > 0 ? inv.galeri[0] : `/templates/${inv.template.toLowerCase()}.jpg`)      };
    });

    return res.status(200).json({
      invitations: transformedInvitations,
      total: transformedInvitations.length
    });

  } catch (error) {
    console.error('Error fetching invitations:', error);
    return res.status(500).json({ 
      message: 'Terjadi kesalahan server',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
}
