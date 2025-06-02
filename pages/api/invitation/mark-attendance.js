import dbConnect from "../../../utils/db";
import Invitation from "../../../models/Invitation";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { slug, guest, timestamp } = req.body;

  if (!slug || !guest) {
    return res.status(400).json({ message: 'Missing slug or guest' });
  }

  try {
    await dbConnect();

    const invitation = await Invitation.findOne({ slug });

    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    // Find guest in invitation.tamu list
    const guestIndex = invitation.tamu.findIndex(t => t.nama.toLowerCase() === guest.toLowerCase());

    if (guestIndex === -1) {
      return res.status(404).json({ message: 'Guest not found in invitation' });
    }

    // Check if guest is already marked as present
    if (invitation.attendance?.some(a => a.name.toLowerCase() === guest.toLowerCase())) {
      return res.status(400).json({ message: 'Guest already marked as present' });
    }

    // Mark guest as hadir in tamu list
    invitation.tamu[guestIndex].status = 'Hadir';
    invitation.tamu[guestIndex].waktu_hadir = timestamp || new Date();

    // Add to attendance list
    if (!invitation.attendance) {
      invitation.attendance = [];
    }
    invitation.attendance.push({
      name: guest,
      timestamp: timestamp || new Date()
    });

    await invitation.save();

    res.status(200).json({ message: 'Attendance marked successfully' });
  } catch (error) {
    console.error('Mark Attendance Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
