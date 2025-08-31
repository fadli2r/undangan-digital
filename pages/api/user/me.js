// pages/api/user/me.js
import { getServerSession } from "next-auth/next";
import dbConnect from "../../../utils/db";
import User from "../../../models/User";
import Order from "../../../models/Order";
import { authOptions } from "../auth/[...nextauth]"; // sesuaikan path kalau beda

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  const email = session?.user?.email;
  if (!email) return res.status(200).json({ loggedIn: false });

  await dbConnect();
  const user = await User.findOne({ email }).lean();

  // fallback: kalau user belum punya flag onboardingCompleted, anggap true jika ada order 'paid'
  let onboardingCompleted = !!user?.onboardingCompleted;
  if (!onboardingCompleted) {
    const paid = await Order.exists({ email, status: "paid" });
    onboardingCompleted = !!paid;
  }

  const quota = Number(user?.quota || 0);

  return res.status(200).json({
    loggedIn: true,
    email,
    name: user?.name || session.user.name || "",
    onboardingCompleted,
    quota,
    canCreateInvitation: quota > 0
  });
}
