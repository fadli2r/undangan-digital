// API login lama - sudah diganti dengan NextAuth
// File ini bisa dihapus atau digunakan untuk keperluan lain

export default async function handler(req, res) {
  return res.status(410).json({ 
    message: "API login lama sudah tidak digunakan. Gunakan NextAuth untuk login." 
  });
}
