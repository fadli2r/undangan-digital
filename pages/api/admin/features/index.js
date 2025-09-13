// pages/api/admin/features/index.js
import dbConnect from '@/lib/dbConnect';
import Feature from '@/models/Feature';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';

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

  if (req.method === 'GET') {
    const {
      search = '',
      active = 'all', // 'all' | 'true' | 'false'
      page = '1',
      limit = '10',
      sortBy = 'sort',
      sortOrder = 'asc', // 'asc' | 'desc'
    } = req.query;

    const q = {};
    if (search) {
      q.$or = [
        { key:         { $regex: search, $options: 'i' } },
        { name:        { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (active !== 'all') q.active = active === 'true';

    const pageNum  = Math.max(parseInt(page, 10)  || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);

    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1, createdAt: -1 };

    const [items, total] = await Promise.all([
      Feature.find(q).sort(sort).skip((pageNum - 1) * limitNum).limit(limitNum).lean(),
      Feature.countDocuments(q),
    ]);

    return res.status(200).json({
      features: items,
      currentPage: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      total,
    });
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const key = sanitizeKey(body.key || '');
      if (!key) return res.status(400).json({ message: 'Key wajib diisi' });
      if (!body.name) return res.status(400).json({ message: 'Name wajib diisi' });

      const exist = await Feature.findOne({ key });
      if (exist) return res.status(409).json({ message: 'Key sudah digunakan' });

      const created = await Feature.create({
        key,
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
      });

      return res.status(201).json({ feature: created });
    } catch (e) {
      console.error('Create feature error:', e);
      return res.status(500).json({ message: 'Gagal membuat feature' });
    }
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ message: 'Method not allowed' });
}
