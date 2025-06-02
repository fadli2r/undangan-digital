// /pages/api/user-info.js
import dbConnect from "../../utils/db";
import User from "../../models/User";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();
  await dbConnect();
  const { email } = req.query;
  if (!email) return res.status(400).json({ message: "Email tidak ditemukan" });
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User tidak ditemukan" });
  res.status(200).json({ user });
  console.log("Cari user dengan email:", email);
  console.log("Dashboard fetch user-info untuk email:", email);


}

