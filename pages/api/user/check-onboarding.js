import dbConnect from '../../../lib/dbConnect';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import User from '../../../models/User';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    await dbConnect();
    
    const user = await User.findOne({ email: session.user.email }).lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Tambahkan log untuk debug
    console.log('User onboardingCompleted:', user.onboardingCompleted);

    return res.status(200).json({
      onboardingCompleted: user.onboardingCompleted === true
    });
  } catch (error) {
    console.error('Error in check-onboarding:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}
