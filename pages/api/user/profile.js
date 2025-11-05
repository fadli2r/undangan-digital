// pages/api/user/profile.js

import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import dbConnect from "../../../lib/dbConnect";
import User from "../../../models/User";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Please log in.' });
  }

  await dbConnect();

  // =================================================================
  // ## Menangani GET Request (Mengambil Data Profil)
  // =================================================================
  if (req.method === 'GET') {
    try {
      const user = await User.findOne({ email: session.user.email }).select('-password');
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }

      const profileData = {
        name: user.name,
        email: user.email,
        phone: user.phone,
        createdAt: user.createdAt,
        avatarUrl: user.avatarUrl || '/assets/media/avatars/blank.png',
        role: user.role || 'Pengguna',
        location: user.location || 'Indonesia',
        country: user.country || 'Indonesia',
        stats: { invitations: user.invitations.length, totalGuests: 0 },
        profileCompleteness: (() => {
          let score = 50;
          if (user.phone) score += 25;
          if (user.avatarUrl) score += 25;
          return Math.min(score, 100);
        })(),
      };
      
      return res.status(200).json({ success: true, user: profileData });

    } catch (error) {
      console.error('API Profile GET Error:', error);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }

  // =================================================================
  // ## Menangani PUT Request (Memperbarui Data Profil)
  // =================================================================
  else if (req.method === 'PUT') {
    const { name, phone } = req.body;

    // Validasi input sederhana
    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Nama dan Telepon tidak boleh kosong.' });
    }

    try {
      // Cari dan update user berdasarkan email dari sesi
      const updatedUser = await User.findOneAndUpdate(
        { email: session.user.email }, // Filter: cari user dengan email ini
        { name: name, phone: phone }, // Data yang mau diupdate
        { new: true, runValidators: true } // Opsi: kembalikan dokumen yang sudah baru & jalankan validator schema
      ).select('-password'); // Jangan kembalikan password

      if (!updatedUser) {
        return res.status(404).json({ success: false, message: 'User not found for update.' });
      }
      
      return res.status(200).json({ success: true, message: 'Profil berhasil diperbarui!', user: updatedUser });

    } catch (error) {
      console.error('API Profile PUT Error:', error);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }

  // =================================================================
  // ## Jika Metode Request Tidak Diizinkan
  // =================================================================
  else {
    res.setHeader('Allow', ['GET', 'PUT']);
    return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
  }
}