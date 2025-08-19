import dbConnect from "../../../lib/dbConnect";
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

    const templates = [
      {
        id: 'classic',
        nama: 'Classic',
        deskripsi: 'Template undangan pernikahan dengan desain klasik dan elegan',
        kategori: 'Modern',
        harga: 'Free',
        preview: '/templates/classic.jpg',
        fitur: [
          'Musik Background',
          'Galeri Foto',
          'RSVP Form',
          'Ucapan & Doa',
          'Peta Lokasi',
          'Amplop Digital'
        ]
      },
      {
        id: 'modern',
        nama: 'Modern',
        deskripsi: 'Template dengan desain modern dan minimalis',
        kategori: 'Minimalis',
        harga: 'Premium',
        preview: '/templates/modern.jpg',
        fitur: [
          'Musik Background',
          'Galeri Foto',
          'RSVP Form',
          'Ucapan & Doa',
          'Peta Lokasi',
          'Amplop Digital',
          'Live Streaming',
          'QR Code'
        ]
      },
      {
        id: 'elegant',
        nama: 'Elegant',
        deskripsi: 'Template undangan dengan desain elegan dan mewah',
        kategori: 'Modern',
        harga: 'Premium',
        preview: '/templates/elegant.jpg',
        fitur: [
          'Musik Background',
          'Galeri Foto',
          'RSVP Form',
          'Ucapan & Doa',
          'Peta Lokasi',
          'Amplop Digital',
          'Live Streaming'
        ]
      }
    ];

    const categories = ['Semua', 'Modern', 'Minimalis', 'Tradisional', 'Natural'];

    const { category } = req.query;
    
    const filteredTemplates = category && category !== 'Semua' 
      ? templates.filter(t => t.kategori === category)
      : templates;

    return res.status(200).json({
      templates: filteredTemplates,
      categories
    });

  } catch (error) {
    console.error('Error fetching templates:', error);
    return res.status(500).json({ 
      message: 'Terjadi kesalahan server',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
}
