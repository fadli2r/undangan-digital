import dbConnect from "../../../utils/db";
import Invitation from "../../../models/Invitation";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await dbConnect();

    const { id } = req.query;
    const invitation = await Invitation.findById(id);

    if (!invitation) {
      return res.status(404).json({ message: "Invitation not found" });
    }

    // Calculate statistics
    const stats = {
      total: invitation.tamu?.length || 0,
      opened: invitation.tamu?.filter(t => t.opened)?.length || 0,
      rsvp: {
        hadir: invitation.rsvp?.filter(r => r.status === 'hadir')?.length || 0,
        tidak_hadir: invitation.rsvp?.filter(r => r.status === 'tidak_hadir')?.length || 0,
        ragu: invitation.rsvp?.filter(r => r.status === 'ragu')?.length || 0,
        total_tamu: invitation.rsvp?.reduce((sum, r) => sum + (r.jumlah || 1), 0) || 0
      }
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error('Stats Error:', error);
    res.status(500).json({ message: "Error fetching statistics" });
  }
}
