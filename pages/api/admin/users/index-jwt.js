import dbConnect from '../../../../lib/dbConnect';
import User from '../../../../models/User';
import adminAuthJWT from '../../../../middleware/adminAuthJWT';

export default async function handler(req, res) {
  // Check admin authentication
  const authResult = await adminAuthJWT(req);
  if (!authResult.success) {
    return res.status(401).json({ error: authResult.error });
  }

  // Add admin info to request
  req.admin = authResult.admin;

  await dbConnect();

  if (req.method === 'GET') {
    try {
      const users = await User.find()
        .select('-password')
        .populate('currentPackage.packageId')
        .populate('invitations')
        .sort({ createdAt: -1 });

      return res.status(200).json({ users });
    } catch (error) {
      console.error('Failed to fetch users:', error);
      return res.status(500).json({ error: 'Failed to fetch users' });
    }
  } else if (req.method === 'POST') {
    try {
      const { name, email, password, phone, source, packageId } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required' });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      const user = await User.create({
        name,
        email,
        password, // TODO: hash password in production
        phone,
        source: source || 'admin',
        currentPackage: packageId
          ? {
              packageId,
              startDate: new Date(),
              endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              isActive: true,
            }
          : null,
      });

      const userResponse = user.toObject();
      delete userResponse.password;

      return res.status(201).json({ user: userResponse });
    } catch (error) {
      console.error('Failed to create user:', error);
      return res.status(500).json({ error: 'Failed to create user' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
