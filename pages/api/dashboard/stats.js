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

    const userEmail = session.user.email;

    // Get all invitations for the user
    const invitations = await Invitation.find({ user_email: userEmail }).lean();

    // Calculate statistics
    const stats = {
      undanganAktif: invitations.length,
      totalPengunjung: invitations.reduce((sum, inv) => sum + (inv.views || 0), 0),
      totalRSVP: invitations.reduce((sum, inv) => sum + (inv.rsvp?.length || 0), 0),
      totalUcapan: invitations.reduce((sum, inv) => sum + (inv.ucapan?.length || 0), 0),
      totalTamu: invitations.reduce((sum, inv) => sum + (inv.tamu?.length || 0), 0),
      totalGift: invitations.reduce((sum, inv) => sum + (inv.gift?.konfirmasi?.length || 0), 0)
    };

    // Get recent invitations (last 5)
    const recentInvitations = invitations
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(inv => ({
        _id: inv._id.toString(),
        slug: inv.slug,
        custom_slug: inv.custom_slug,
        nama: `${inv.mempelai?.pria || 'Mempelai Pria'} & ${inv.mempelai?.wanita || 'Mempelai Wanita'}`,
        template: inv.template,
        tanggalDibuat: inv.createdAt,
        tanggalAcara: inv.acara_utama?.tanggal,
        status: inv.views > 0 ? 'Aktif' : 'Draft',
        pengunjung: inv.views || 0,
        rsvp: inv.rsvp?.length || 0,
        ucapan: inv.ucapan?.length || 0,
        tamu: inv.tamu?.length || 0
      }));

    // Generate notifications based on recent activity
    const notifications = [];
    
    // Check for recent RSVPs
    invitations.forEach(inv => {
      const recentRSVPs = inv.rsvp?.filter(rsvp => {
        const rsvpDate = new Date(rsvp.waktu);
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return rsvpDate > oneDayAgo;
      }) || [];
      
      if (recentRSVPs.length > 0) {
        notifications.push({
          id: `rsvp-${inv._id}`,
          pesan: `${recentRSVPs.length} RSVP baru untuk undangan '${inv.mempelai?.pria || 'Mempelai Pria'} & ${inv.mempelai?.wanita || 'Mempelai Wanita'}'`,
          waktu: "Hari ini",
          type: "success"
        });
      }
    });

    // Check for recent views
    invitations.forEach(inv => {
      if (inv.lastViewed) {
        const lastViewDate = new Date(inv.lastViewed);
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        if (lastViewDate > oneDayAgo && inv.views > 0) {
          notifications.push({
            id: `view-${inv._id}`,
            pesan: `Undangan '${inv.mempelai?.pria || 'Mempelai Pria'} & ${inv.mempelai?.wanita || 'Mempelai Wanita'}' telah dilihat ${inv.views} kali`,
            waktu: "Hari ini",
            type: "info"
          });
        }
      }
    });

    // Check for recent wishes
    invitations.forEach(inv => {
      const recentWishes = inv.ucapan?.filter(ucapan => {
        const wishDate = new Date(ucapan.waktu);
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return wishDate > oneDayAgo;
      }) || [];
      
      if (recentWishes.length > 0) {
        notifications.push({
          id: `wish-${inv._id}`,
          pesan: `${recentWishes.length} ucapan baru untuk undangan '${inv.mempelai?.pria || 'Mempelai Pria'} & ${inv.mempelai?.wanita || 'Mempelai Wanita'}'`,
          waktu: "Hari ini",
          type: "success"
        });
      }
    });

    // Limit notifications to 5 most recent
    const limitedNotifications = notifications.slice(0, 5);

    return res.status(200).json({
      stats,
      recentInvitations,
      notifications: limitedNotifications
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return res.status(500).json({ 
      message: 'Terjadi kesalahan server',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
}
