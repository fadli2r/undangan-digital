import dbConnect from "../../../utils/db";
import Invitation from "../../../models/Invitation";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { slug, nama, nominal, bank, pesan } = req.body;

    // Validate required fields
    if (!slug || !nama || !nominal || !bank) {
      return res.status(400).json({ 
        message: 'Data tidak lengkap. Mohon isi nama, nominal, dan bank/e-wallet.' 
      });
    }

    // Find invitation
    const invitation = await Invitation.findOne({ slug });
    if (!invitation) {
      return res.status(404).json({ message: 'Undangan tidak ditemukan' });
    }

    // Initialize gift object if it doesn't exist
    if (!invitation.gift) {
      invitation.gift = {
        enabled: true,
        bank_accounts: [],
        e_wallets: [],
        qris: { enabled: false },
        konfirmasi: []
      };
    }

    // Add confirmation
    invitation.gift.konfirmasi.push({
      nama,
      nominal: Number(nominal),
      bank,
      pesan: pesan || '',
      waktu: new Date()
    });

    // Save changes
    await invitation.save();

    res.status(200).json({ message: 'Konfirmasi hadiah berhasil disimpan' });
  } catch (error) {
    console.error('Gift confirmation error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat menyimpan konfirmasi' });
  }
}
