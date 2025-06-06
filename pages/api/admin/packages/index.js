import dbConnect from '../../../../lib/dbConnect';
import adminAuth from '../../../../middleware/adminAuth';
import Package from '../../../../models/Package';
import ActivityLog from '../../../../models/ActivityLog';

export default async function handler(req, res) {
  await dbConnect();

  // Apply admin authentication middleware
  await new Promise((resolve, reject) => {
    adminAuth(['packages.view'])(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });

  switch (req.method) {
    case 'GET':
      return await getPackages(req, res);
    case 'POST':
      return await createPackage(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getPackages(req, res) {
  try {
    const packages = await Package.find()
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean();

    // Log activity
    await ActivityLog.logActivity({
      actor: req.admin._id,
      actorModel: 'Admin',
      action: 'packages.view',
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      userAgent: req.headers['user-agent']
    });

    return res.status(200).json({ packages });

  } catch (error) {
    console.error('Get Packages Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function createPackage(req, res) {
  try {
    // Check permissions
    if (!req.admin.permissions.includes('packages.edit')) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const {
      name,
      description,
      price,
      originalPrice,
      duration,
      features,
      limits,
      metadata,
      isActive,
      isPopular,
      isFeatured,
      sortOrder
    } = req.body;

    // Validate required fields
    if (!name || !description || !price || !duration) {
      return res.status(400).json({
        error: 'Name, description, price, and duration are required'
      });
    }

    // Create package
    const pkg = new Package({
      name,
      description,
      price,
      originalPrice,
      duration,
      features: features || [],
      limits: limits || {},
      metadata: metadata || {},
      isActive: isActive !== undefined ? isActive : true,
      isPopular,
      isFeatured,
      sortOrder: sortOrder || 0
    });

    await pkg.save();

    // Log activity
    await ActivityLog.logActivity({
      actor: req.admin._id,
      actorModel: 'Admin',
      action: 'package.create',
      target: pkg._id,
      targetModel: 'Package',
      details: {
        packageName: pkg.name,
        price: pkg.price,
        duration: pkg.duration
      },
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      userAgent: req.headers['user-agent']
    });

    return res.status(201).json({ package: pkg });

  } catch (error) {
    console.error('Create Package Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
