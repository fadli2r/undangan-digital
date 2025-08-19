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

    // Untuk saat ini menggunakan data statis, nanti bisa diubah ke MongoDB
    const packages = [
      {
        id: 'free',
        nama: 'Free',
        harga: 0,
        deskripsi: 'Paket gratis untuk mencoba fitur dasar undangan digital',
        durasi: '3 Bulan',
        popular: false,
        fitur: [
          '1 Undangan Digital',
          'Template Basic (3 pilihan)',
          'Masa Aktif 3 Bulan',
          'Galeri Foto (5 foto)',
          'RSVP Form',
          'Ucapan & Doa',
          'Support Email'
        ],
        tidak_termasuk: [
          'Musik Background',
          'Countdown Timer',
          'Maps Integration',
          'Custom Domain',
          'Analytics'
        ]
      },
      {
        id: 'premium',
        nama: 'Premium',
        harga: 99000,
        deskripsi: 'Paket terbaik untuk undangan pernikahan yang sempurna',
        durasi: '1 Tahun',
        popular: true,
        fitur: [
          '1 Undangan Digital',
          'Semua Template Premium',
          'Masa Aktif 1 Tahun',
          'Galeri Foto Unlimited',
          'RSVP Form Advanced',
          'Ucapan & Doa',
          'Musik Background',
          'Countdown Timer',
          'Maps Integration',
          'Analytics Dashboard',
          'Support WhatsApp'
        ],
        tidak_termasuk: [
          'Custom Domain',
          'Video Background',
          'Multiple Events'
        ]
      },
      {
        id: 'business',
        nama: 'Business',
        harga: 499000,
        deskripsi: 'Paket untuk wedding organizer dan bisnis event',
        durasi: '1 Tahun',
        popular: false,
        fitur: [
          '10 Undangan Digital',
          'Semua Template Premium',
          'Masa Aktif 1 Tahun',
          'Galeri Foto Unlimited',
          'RSVP Form Advanced',
          'Ucapan & Doa',
          'Musik Background',
          'Countdown Timer',
          'Maps Integration',
          'Video Background',
          'Custom Domain',
          'Analytics Dashboard',
          'Dashboard WO',
          'Multiple Events',
          'Priority Support',
          'White Label Option'
        ],
        tidak_termasuk: []
      }
    ];

    // Get FAQ data
    const faq = [
      {
        question: 'Apakah ada biaya tersembunyi?',
        answer: 'Tidak ada biaya tersembunyi. Harga yang tertera sudah termasuk hosting, domain, dan semua fitur yang disebutkan.'
      },
      {
        question: 'Bisakah upgrade paket di tengah jalan?',
        answer: 'Ya, Anda bisa upgrade paket kapan saja. Selisih harga akan dihitung secara proporsional.'
      },
      {
        question: 'Bagaimana jika ingin refund?',
        answer: 'Kami memberikan garansi 7 hari uang kembali jika Anda tidak puas dengan layanan kami.'
      },
      {
        question: 'Apakah data aman?',
        answer: 'Ya, semua data Anda dienkripsi dan disimpan dengan aman. Kami tidak akan membagikan data Anda kepada pihak ketiga.'
      }
    ];

    return res.status(200).json({
      packages,
      faq
    });

  } catch (error) {
    console.error('Error fetching packages:', error);
    return res.status(500).json({ 
      message: 'Terjadi kesalahan server',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
}
