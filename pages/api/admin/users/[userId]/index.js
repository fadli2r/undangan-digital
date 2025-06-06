import dbConnect from '../../../../../lib/dbConnect';
import adminAuth from '../../../../../middleware/adminAuth';
import User from '../../../../../models/User';
import ActivityLog from '../../../../../models/ActivityLog';
import Invitation from '../../../../../models/Invitation';

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

  const { userId } = req.query;

  switch (req.method) {
    case 'GET':
      return await getUser(req, res, userId);
    case 'PUT':
      return await updateUser(req, res, userId);
    case 'DELETE':
      return await deleteUser(req, res, userId);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getUser(req, res, userId) {
  try {
    // Get user details
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's invitations
    const invitations = await Invitation.find({ user: userId })
      .select('slug mempelai status createdAt')
      .sort({ createdAt: -1 });

    // Get activity logs for this user
    const activityLogs = await ActivityLog.find({
      $or: [
        { actor: userId, actorModel: 'User' },
        { target: userId, targetModel: 'User' }
      ]
    })
    .sort({ createdAt: -1 })
    .limit(20);

    // Log admin's view activity
    await ActivityLog.logActivity({
      actor: req.admin._id,
      actorModel: 'Admin',
      action: 'user.view',
      target: userId,
      targetModel: 'User',
      details: { userEmail: user.email },
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      userAgent: req.headers['user-agent']
    });

    return res.status(200).json({
      user,
      invitations,
      activityLogs
    });

  } catch (error) {
    console.error('Get User Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function updateUser(req, res, userId) {
  try {
    // Check permissions
    if (!req.admin.permissions.includes('users.edit')) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const { name, email, status, quota } = req.body;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if email is being changed and if it's already in use
    if (email && email.toLowerCase() !== user.email) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already in use' });
      }
      user.email = email.toLowerCase();
    }

    // Update fields
    if (name) user.name = name;
    if (status) user.status = status;
    if (quota !== undefined) user.quota = quota;

    await user.save();

    // Log activity
    await ActivityLog.logActivity({
      actor: req.admin._id,
      actorModel: 'Admin',
      action: 'user.update',
      target: userId,
      targetModel: 'User',
      details: {
        updates: {
          name: name !== user.name ? name : undefined,
          email: email !== user.email ? email : undefined,
          status: status !== user.status ? status : undefined,
          quota: quota !== user.quota ? quota : undefined
        }
      },
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      userAgent: req.headers['user-agent']
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user.toObject();
    return res.status(200).json({ user: userWithoutPassword });

  } catch (error) {
    console.error('Update User Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function deleteUser(req, res, userId) {
  try {
    // Check permissions
    if (!req.admin.permissions.includes('users.delete')) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user has active invitations
    const activeInvitations = await Invitation.countDocuments({
      user: userId,
      status: 'active'
    });

    if (activeInvitations > 0) {
      return res.status(400).json({
        error: 'Cannot delete user with active invitations. Deactivate or delete invitations first.'
      });
    }

    // Delete user's invitations
    await Invitation.deleteMany({ user: userId });

    // Delete user
    await User.findByIdAndDelete(userId);

    // Log activity
    await ActivityLog.logActivity({
      actor: req.admin._id,
      actorModel: 'Admin',
      action: 'user.delete',
      details: {
        userEmail: user.email,
        userName: user.name
      },
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      userAgent: req.headers['user-agent']
    });

    return res.status(200).json({ message: 'User deleted successfully' });

  } catch (error) {
    console.error('Delete User Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
