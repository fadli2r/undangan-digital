// pages/api/invitation/scanned-guest.js
import dbConnect from "../../../utils/db";
import Invitation from "../../../models/Invitation";

export default async function handler(req, res) {
  const { method } = req;

  if (!["GET", "POST"].includes(method)) {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await dbConnect();

    if (method === "GET") {
      const { slug } = req.query;
      if (!slug) {
        return res.status(400).json({ message: "Slug is required" });
      }

      const invitation = await Invitation.findOne({ slug });
      if (!invitation) {
        return res.status(404).json({ message: "Invitation not found" });
      }

      return res.status(200).json({
        guests: invitation.attendance || [],
      });
    }

    if (method === "POST") {
      const { slug, nama, jumlah } = req.body;
      if (!slug || !nama) {
        return res
          .status(400)
          .json({ message: "Slug dan nama tamu wajib diisi" });
      }

      const invitation = await Invitation.findOne({ slug });
      if (!invitation) {
        return res.status(404).json({ message: "Invitation not found" });
      }

      // cari RSVP tamu
      const idx = invitation.rsvp.findIndex(
        (r) => r.nama.toLowerCase() === nama.toLowerCase()
      );
      if (idx === -1) {
        return res
          .status(404)
          .json({ message: "RSVP untuk tamu ini belum ada" });
      }

      // update RSVP → hadir + jumlah real
      invitation.rsvp[idx].status = "hadir";
      invitation.rsvp[idx].checkinAt = new Date();
      invitation.rsvp[idx].jumlah_checkin =
        (invitation.rsvp[idx].jumlah_checkin || 0) + (jumlah || 1);

      // tambah log attendance
      invitation.attendance.push({
        name: nama,
        timestamp: new Date(),
      });

      await invitation.save();

      return res.status(200).json({
        success: true,
        message: `Check-in berhasil untuk ${nama} (${jumlah || 1} orang)`,
        rsvp: invitation.rsvp[idx],
      });
    }
  } catch (error) {
    console.error("scanned-guest API error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
