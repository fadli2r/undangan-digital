import { getSession } from 'next-auth/react';
import dbConnect from '../../../../../lib/dbConnect';
import User from '../../../../../models/User';
import adminAuth from '../../../../../middleware/adminAuth';

export default async function handler(req, res) {
  const session = await getSession({ req });
  const { userId } = req.query;

  // Check admin authentication
  const authResult = await adminAuth(req, res);
  if (!authResult.success) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  await dbConnect();

  if (req.method === 'GET') {
    try {
      const user = await User.findById(userId)
        .select('-password')
        .populate('currentPackage.packageId')
        .populate('invitations')
        .populate('purchases.packageId');

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.status(200).json({ user });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch user details' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { name, email, phone, isActive } = req.body;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Check email uniqueness if email is being changed
      if (email !== user.email) {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return res.status(400).json({ error: 'Email already registered' });
        }
      }

      // Update user
      user.name = name || user.name;
      user.email = email || user.email;
      user.phone = phone || user.phone;
      if (typeof isActive === 'boolean') {
        user.isActive = isActive;
      }

      await user.save();

      // Remove password from response
      const userResponse = user.toObject();
      delete userResponse.password;

      return res.status(200).json({ user: userResponse });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to update user' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Instead of deleting, we'll just deactivate the user
      user.isActive = false;
      await user.save();

      return res.status(200).json({ message: 'User deactivated successfully' });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to deactivate user' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
