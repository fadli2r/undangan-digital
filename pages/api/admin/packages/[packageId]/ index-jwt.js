// pages/api/admin/packages/[packageId]/index-jwt.js

import dbConnect from '@/lib/dbConnect';
import Package from '@/models/Package';
import adminAuth from '@/middleware/adminAuth';

export default async function handler(req, res) {
  const {
    query: { packageId },
    method,
  } = req;

  await dbConnect();

  const token = req.headers.authorization?.split(' ')[1];

  let admin;
  try {
    admin = adminAuth(token); // sesuaikan jika async
    if (!admin) throw new Error();
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  switch (method) {
    case 'GET':
      try {
        const pkg = await Package.findById(packageId);
        if (!pkg) {
          return res.status(404).json({ error: 'Package not found' });
        }
        return res.status(200).json({ package: pkg });
      } catch (error) {
        console.error('GET error:', error);
        return res.status(500).json({ error: 'Failed to fetch package' });
      }

    case 'PUT':
      try {
        const {
          name, description, price, duration
        } = req.body;

        if (!name || !price || !duration?.value || !duration?.unit) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        const updated = await Package.findByIdAndUpdate(packageId, req.body, {
          new: true,
          runValidators: true,
        });

        if (!updated) {
          return res.status(404).json({ error: 'Package not found' });
        }

        return res.status(200).json({ package: updated });
      } catch (error) {
        console.error('PUT error:', error);
        return res.status(500).json({ error: 'Failed to update package' });
      }

    default:
      res.setHeader('Allow', ['GET', 'PUT']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
