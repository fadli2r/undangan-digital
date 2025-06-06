import dbConnect from '../../../../lib/dbConnect';
import adminAuth from '../../../../middleware/adminAuth';
import User from '../../../../models/User';
import ActivityLog from '../../../../models/ActivityLog';

export default async function handler(req, res) {
  await dbConnect();

  // Apply admin authentication middleware
  await new Promise((resolve, reject) => {
    adminAuth(['users.view'])(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });

  switch (req.method) {
    case 'GET':
      return await getUsers(req, res);
    case 'POST':
      return await createUser(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getUsers(req, res) {
  try {
    const {
      search = '',
      status = 'all',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    // Build query
    const query = {};

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Status filter
    if (status !== 'all') {
      query.status = status;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get users with pagination
    const [users, totalUsers] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      User.countDocuments(query)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalUsers / limitNum);

    // Log activity
    await ActivityLog.logActivity({
      actor: req.admin._id,
      actorModel: 'Admin',
      action: 'users.view',
      details: {
        filters: { search, status, sortBy, sortOrder },
        pagination: { page: pageNum, limit: limitNum }
      },
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      userAgent: req.headers['user-agent']
    });

    return res.status(200).json({
      users,
      currentPage: pageNum,
      totalPages,
      totalUsers,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1
    });

  } catch (error) {
    console.error('Get Users Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function createUser(req, res) {
  try {
    // Check permissions
    if (!req.admin.permissions.includes('users.edit')) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const { name, email, password, status = 'active' } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Create new user
    const user = new User({
      name,
      email: email.toLowerCase(),
      password, // Will be hashed by the User model pre-save hook
      status,
      emailVerified: true // Admin created users are automatically verified
    });

    await user.save();

    // Log activity
    await ActivityLog.logActivity({
      actor: req.admin._id,
      actorModel: 'Admin',
      action: 'user.create',
      target: user._id,
      targetModel: 'User',
      details: {
        userEmail: user.email,
        userName: user.name
      },
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      userAgent: req.headers['user-agent']
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user.toObject();
    return res.status(201).json({ user: userWithoutPassword });

  } catch (error) {
    console.error('Create User Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
