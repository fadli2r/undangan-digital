import dbConnect from '../../../../../lib/dbConnect';
import adminAuth from '../../../../../middleware/adminAuth';
import Package from '../../../../../models/Package';
import ActivityLog from '../../../../../models/ActivityLog';

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

  const { packageId } = req.query;

  switch (req.method) {
    case 'GET':
      return await getPackage(req, res, packageId);
    case 'PUT':
      return await updatePackage(req, res, packageId);
    case 'DELETE':
      return await deletePackage(req, res, packageId);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getPackage(req, res, packageId) {
  try {
    const pkg = await Package.findById(packageId);
    if (!pkg) {
      return res.status(404).json({ error: 'Package not found' });
    }

    // Log activity
    await ActivityLog.logActivity({
      actor: req.admin._id,
      actorModel: 'Admin',
      action: 'package.view',
      target: pkg._id,
      targetModel: 'Package',
      details: { packageName: pkg.name },
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      userAgent: req.headers['user-agent']
    });

    return res.status(200).json({ package: pkg });

  } catch (error) {
    console.error('Get Package Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function updatePackage(req, res, packageId) {
  try {
    // Check permissions
    if (!req.admin.permissions.includes('packages.edit')) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const pkg = await Package.findById(packageId);
    if (!pkg) {
      return res.status(404).json({ error: 'Package not found' });
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

    // Store old values for logging
    const oldValues = {
      name: pkg.name,
      price: pkg.price,
      isActive: pkg.isActive
    };

    // Update fields
    if (name !== undefined) pkg.name = name;
    if (description !== undefined) pkg.description = description;
    if (price !== undefined) pkg.price = price;
    if (originalPrice !== undefined) pkg.originalPrice = originalPrice;
    if (duration !== undefined) pkg.duration = duration;
    if (features !== undefined) pkg.features = features;
    if (limits !== undefined) pkg.limits = limits;
    if (metadata !== undefined) pkg.metadata = metadata;
    if (isActive !== undefined) pkg.isActive = isActive;
    if (isPopular !== undefined) pkg.isPopular = isPopular;
    if (isFeatured !== undefined) pkg.isFeatured = isFeatured;
    if (sortOrder !== undefined) pkg.sortOrder = sortOrder;

    await pkg.save();

    // Log activity
    await ActivityLog.logActivity({
      actor: req.admin._id,
      actorModel: 'Admin',
      action: 'package.update',
      target: pkg._id,
      targetModel: 'Package',
      details: {
        packageName: pkg.name,
        changes: {
          name: oldValues.name !== pkg.name ? { from: oldValues.name, to: pkg.name } : undefined,
          price: oldValues.price !== pkg.price ? { from: oldValues.price, to: pkg.price } : undefined,
          isActive: oldValues.isActive !== pkg.isActive ? { from: oldValues.isActive, to: pkg.isActive } : undefined
        }
      },
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      userAgent: req.headers['user-agent']
    });

    return res.status(200).json({ package: pkg });

  } catch (error) {
    console.error('Update Package Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function deletePackage(req, res, packageId) {
  try {
    // Check permissions
    if (!req.admin.permissions.includes('packages.delete')) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const pkg = await Package.findById(packageId);
    if (!pkg) {
      return res.status(404).json({ error: 'Package not found' });
    }

    // TODO: Check if package is being used by any active subscriptions
    // For now, we'll allow deletion but in production you might want to prevent this

    await Package.findByIdAndDelete(packageId);

    // Log activity
    await ActivityLog.logActivity({
      actor: req.admin._id,
      actorModel: 'Admin',
      action: 'package.delete',
      details: {
        packageName: pkg.name,
        packagePrice: pkg.price
      },
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      userAgent: req.headers['user-agent']
    });

    return res.status(200).json({ message: 'Package deleted successfully' });

  } catch (error) {
    console.error('Delete Package Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
