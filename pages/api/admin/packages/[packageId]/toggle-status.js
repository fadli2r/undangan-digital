import dbConnect from '../../../../../lib/dbConnect';
import Package from '../../../../../models/Package';
import adminAuth from '../../../../../middleware/adminAuth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  await dbConnect();

  // Verify admin authentication
  const authMiddleware = adminAuth();
  
  // Create a promise to handle middleware
  const authResult = await new Promise((resolve, reject) => {
    authMiddleware(req, res, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve(true);
      }
    });
  }).catch(() => {
    return res.status(401).json({ error: 'Unauthorized' });
  });

  if (!authResult) return;

  const { packageId } = req.query;
  const { isActive } = req.body;

  try {
    const pkg = await Package.findById(packageId);
    if (!pkg) {
      return res.status(404).json({ error: 'Package not found' });
    }

    pkg.isActive = isActive;
    await pkg.save();

    return res.status(200).json({
      message: `Paket berhasil ${isActive ? 'diaktifkan' : 'dinonaktifkan'}`,
      package: pkg
    });

  } catch (error) {
    console.error('Toggle Package Status Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
