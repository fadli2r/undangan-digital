import dbConnect from '../../../../../lib/dbConnect';
import adminAuth from '../../../../../middleware/adminAuth';
import User from '../../../../../models/User';
import ActivityLog from '../../../../../models/ActivityLog';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  await dbConnect();

  // Apply admin authentication middleware
  await new Promise((resolve, reject) => {
    adminAuth(['users.edit'])(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });

  const { userId, action } = req.query;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    switch (action) {
      case 'block':
        return await blockUser(req, res, user);
      case 'unblock':
        return await unblockUser(req, res, user);
      case 'activate':
        return await activateUser(req, res, user);
      case 'deactivate':
        return await deactivateUser(req, res, user);
      case 'reset-password':
        return await resetPassword(req, res, user);
      case 'reset-quota':
        return await resetQuota(req, res, user);
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error(`User ${action} Error:`, error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function blockUser(req, res, user) {
  user.status = 'blocked';
  await user.save();

  await ActivityLog.logActivity({
    actor: req.admin._id,
    actorModel: 'Admin',
    action: 'user.block',
    target: user._id,
    targetModel: 'User',
    details: { userEmail: user.email },
    ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
    userAgent: req.headers['user-agent']
  });

  return res.status(200).json({ message: 'User blocked successfully' });
}

async function unblockUser(req, res, user) {
  user.status = 'active';
  await user.save();

  await ActivityLog.logActivity({
    actor: req.admin._id,
    actorModel: 'Admin',
    action: 'user.unblock',
    target: user._id,
    targetModel: 'User',
    details: { userEmail: user.email },
    ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
    userAgent: req.headers['user-agent']
  });

  return res.status(200).json({ message: 'User unblocked successfully' });
}

async function activateUser(req, res, user) {
  user.status = 'active';
  await user.save();

  await ActivityLog.logActivity({
    actor: req.admin._id,
    actorModel: 'Admin',
    action: 'user.activate',
    target: user._id,
    targetModel: 'User',
    details: { userEmail: user.email },
    ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
    userAgent: req.headers['user-agent']
  });

  return res.status(200).json({ message: 'User activated successfully' });
}

async function deactivateUser(req, res, user) {
  user.status = 'inactive';
  await user.save();

  await ActivityLog.logActivity({
    actor: req.admin._id,
    actorModel: 'Admin',
    action: 'user.deactivate',
    target: user._id,
    targetModel: 'User',
    details: { userEmail: user.email },
    ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
    userAgent: req.headers['user-agent']
  });

  return res.status(200).json({ message: 'User deactivated successfully' });
}

async function resetPassword(req, res, user) {
  // Generate random password
  const newPassword = crypto.randomBytes(8).toString('hex');
  
  // Hash new password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);
  
  // Update user password
  user.password = hashedPassword;
  await user.save();

  await ActivityLog.logActivity({
    actor: req.admin._id,
    actorModel: 'Admin',
    action: 'user.reset_password',
    target: user._id,
    targetModel: 'User',
    details: { userEmail: user.email },
    ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
    userAgent: req.headers['user-agent']
  });

  return res.status(200).json({
    message: 'Password reset successfully',
    newPassword // Return new password to admin
  });
}

async function resetQuota(req, res, user) {
  const { quota } = req.body;

  if (typeof quota !== 'number' || quota < 0) {
    return res.status(400).json({ error: 'Invalid quota value' });
  }

  const oldQuota = user.quota;
  user.quota = quota;
  await user.save();

  await ActivityLog.logActivity({
    actor: req.admin._id,
    actorModel: 'Admin',
    action: 'user.reset_quota',
    target: user._id,
    targetModel: 'User',
    details: {
      userEmail: user.email,
      oldQuota,
      newQuota: quota
    },
    ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
    userAgent: req.headers['user-agent']
  });

  return res.status(200).json({
    message: 'Quota reset successfully',
    quota: user.quota
  });
}
