import dbConnect from '../../utils/db'
import User from '../../models/User'

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  
  try {
    await dbConnect();
    const { email, password, name } = req.body;
    
    // Validasi input
    if (!email || !password || !name) {
      return res.status(400).json({ message: "Email, password, dan nama wajib diisi" });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ message: "Password minimal 6 karakter" });
    }
    
    // Cek user sudah ada
    const exist = await User.findOne({ email: email.toLowerCase() });
    if (exist) return res.status(400).json({ message: "Email sudah terdaftar" });

    // Buat user baru - password akan di-hash otomatis oleh middleware
    const user = await User.create({ 
      email: email.toLowerCase(), 
      password, 
      name,
      isOAuthUser: false
    });
    
    // Hapus password dari response
    const userResponse = user.toObject();
    delete userResponse.password;
    
    return res.status(201).json({ 
      message: "Berhasil daftar", 
      user: userResponse 
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: "Terjadi kesalahan server" });
  }
}
