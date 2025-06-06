import dbConnect from '../../../../../lib/dbConnect';
import adminAuth from '../../../../../middleware/adminAuth';
import Package from '../../../../../models/Package';
import ActivityLog from '../../../../../models/ActivityLog';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  await dbConnect();

  // Apply admin authentication middleware
  await new Promise((resolve, reject) => {
    adminAuth(['packages.edit'])(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });

  const { packageId } = req.query;
  const { isActive } = req.body;

  try {
    const pkg = await Package.findById(packageId);
    if (!pkg) {
      return res.status(404).json({ error: 'Package not found' });
    }

    const oldStatus = pkg.isActive;
    pkg.isActive = isActive;
    await pkg.save();

    // Log activity
    await ActivityLog.logActivity({
      actor: req.admin._id,
      actorModel: 'Admin',
      action: isActive ? 'package.activate' : 'package.deactivate',
      target: pkg._id,
      targetModel: 'Package',
      details: {
        packageName: pkg.name,
        oldStatus,
        newStatus: isActive
      },
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      userAgent: req.headers['user-agent']
    });

    return res.status(200).json({
      message: `Package ${isActive ? 'activated' : 'deactivated'} successfully`,
      package: pkg
    });

  } catch (error) {
    console.error('Toggle Package Status Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
