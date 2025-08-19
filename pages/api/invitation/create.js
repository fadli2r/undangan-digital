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

    const { template, user_email } = req.body;

    if (!template || !user_email) {
      return res.status(400).json({ message: 'Template dan user email diperlukan' });
    }

    // Generate unique slug
    const generateSlug = () => {
      const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    let slug = generateSlug();
    
    // Ensure slug is unique
    let existingInvitation = await Invitation.findOne({ slug });
    while (existingInvitation) {
      slug = generateSlug();
      existingInvitation = await Invitation.findOne({ slug });
    }

    // Create new invitation with default data structure
    const newInvitation = new Invitation({
      slug,
      template,
      user_email,
      mempelai: {
        pria: '',
        wanita: '',
        orangtua_pria: '',
        orangtua_wanita: ''
      },
      acara_utama: {
        nama: '',
        tanggal: null,
        waktu: '',
        lokasi: ''
      },
      acara: [],
      galeri: [],
      tamu: [],
      rsvp: [],
      ucapan: [],
      gift: {
        enabled: false,
        bank_accounts: [],
        e_wallets: [],
        qris: {
          enabled: false,
          image: ''
        }
      },
      privacy: {
        isPasswordProtected: false,
        password: ''
      },
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const savedInvitation = await newInvitation.save();

    return res.status(201).json({
      message: 'Undangan berhasil dibuat',
      slug: savedInvitation.slug,
      _id: savedInvitation._id
    });

  } catch (error) {
    console.error('Error creating invitation:', error);
    return res.status(500).json({ 
      message: 'Terjadi kesalahan server',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
}
