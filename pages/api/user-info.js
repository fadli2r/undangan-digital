// /pages/api/user-info.js
import dbConnect from "../../lib/dbConnect";
import User from "../../models/User";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();
  
  try {
    await dbConnect();
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ message: "Email tidak ditemukan" });
    }
    
    console.log("Dashboard fetch user-info untuk email:", email);
    
    let user = await User.findOne({ email });
    
    // If user doesn't exist, create a new free user
    if (!user) {
      console.log("User tidak ditemukan, membuat user baru:", email);
      user = await User.create({
        email,
        paket: "free",
        quota: 1,
        status_pembayaran: "free"
      });
      console.log("User baru dibuat:", user);
    } else {
      console.log("User ditemukan:", user);
    }
    
    res.status(200).json({ user });
  } catch (error) {
    console.error("Error in user-info API:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

