// pages/api/admin/features/[id].js
import dbConnect from '@/lib/dbConnect';
import Feature from '@/models/Feature';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import mongoose from 'mongoose';

function isAdminSession(session) {
  return !!(session?.user?.isAdmin);
}
function sanitizeKey(raw = "") {
  return String(raw)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  const session = await getServerSession(req, res, authOptions);
  if (!isAdminSession(session)) return res.status(401).json({ message: 'Unauthorized' });

  await dbConnect();

  const { id } = req.query;
  if (!id || !mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'Invalid id' });

  if (req.method === 'GET') {
    const f = await Feature.findById(id).lean();
    if (!f) return res.status(404).json({ message: 'Feature not found' });
    return res.status(200).json({ feature: f });
  }

  if (req.method === 'PUT') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const update = {
        name: body.name,
        description: body.description || '',
        price: Number(body.price || 0),
        sort: Number(body.sort || 0),
        active: body.active !== false,
        billing: {
          type: body?.billing?.type || 'one_time',
          interval: body?.billing?.interval || null
        },
        meta: {
          icon: body?.meta?.icon || '✨',
          badge: body?.meta?.badge || ''
        }
      };

      if (body.key) {
        update.key = sanitizeKey(body.key);
        const exist = await Feature.findOne({ key: update.key, _id: { $ne: id } });
        if (exist) return res.status(409).json({ message: 'Key sudah digunakan' });
      }

      const saved = await Feature.findByIdAndUpdate(id, update, { new: true, runValidators: true });
      if (!saved) return res.status(404).json({ message: 'Feature not found' });

      return res.status(200).json({ feature: saved });
    } catch (e) {
      console.error('Update feature error:', e);
      return res.status(500).json({ message: 'Gagal mengupdate feature' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const deleted = await Feature.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ message: 'Feature not found' });
      return res.status(200).json({ success: true });
    } catch (e) {
      console.error('Delete feature error:', e);
      return res.status(500).json({ message: 'Gagal menghapus feature' });
    }
  }

  res.setHeader('Allow', 'GET, PUT, DELETE');
  return res.status(405).json({ message: 'Method not allowed' });
}
