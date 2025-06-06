import dbConnect from '../../../../lib/dbConnect';
import adminAuth from '../../../../middleware/adminAuth';
import Settings from '../../../../models/Settings';
import ActivityLog from '../../../../models/ActivityLog';

export default async function handler(req, res) {
  await dbConnect();

  // Apply admin authentication middleware
  await new Promise((resolve, reject) => {
    adminAuth(['settings.view'])(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });

  switch (req.method) {
    case 'GET':
      return await getSettings(req, res);
    case 'PUT':
      return await updateSettings(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getSettings(req, res) {
  try {
    const settings = await Settings.getSettings();

    // Log activity
    await ActivityLog.logActivity({
      actor: req.admin._id,
      actorModel: 'Admin',
      action: 'settings.view',
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      userAgent: req.headers['user-agent']
    });

    return res.status(200).json({ settings });

  } catch (error) {
    console.error('Get Settings Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function updateSettings(req, res) {
  try {
    // Check permissions
    if (!req.admin.permissions.includes('settings.edit')) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const { settings: newSettings } = req.body;

    if (!newSettings) {
      return res.status(400).json({ error: 'Settings data is required' });
    }

    // Get current settings for comparison
    const currentSettings = await Settings.getSettings();

    // Update settings
    const updatedSettings = await Settings.updateSettings(newSettings);

    // Log activity with details of what changed
    const changes = {};
    Object.keys(newSettings).forEach(section => {
      if (typeof newSettings[section] === 'object') {
        Object.keys(newSettings[section]).forEach(key => {
          const oldValue = currentSettings[section]?.[key];
          const newValue = newSettings[section][key];
          if (oldValue !== newValue) {
            if (!changes[section]) changes[section] = {};
            changes[section][key] = { from: oldValue, to: newValue };
          }
        });
      }
    });

    await ActivityLog.logActivity({
      actor: req.admin._id,
      actorModel: 'Admin',
      action: 'settings.update',
      details: { changes },
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      userAgent: req.headers['user-agent']
    });

    return res.status(200).json({ 
      settings: updatedSettings,
      message: 'Settings updated successfully'
    });

  } catch (error) {
    console.error('Update Settings Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
