import dbConnect from "../../../utils/db";
import User from "../../../models/User";
import { getSession } from "next-auth/react";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    await dbConnect();
    const { name, currentPassword, newPassword } = req.body;

    // Find user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If changing password, verify current password
    if (newPassword) {
      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        return res.status(400).json({ message: 'Password saat ini tidak valid' });
      }
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
    }

    // Update name if provided
    if (name) {
      user.name = name;
    }

    await user.save();
    
    return res.status(200).json({ 
      message: 'Profile updated successfully',
      user: {
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
