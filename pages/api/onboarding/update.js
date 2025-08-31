import { getServerSession } from 'next-auth/next';
import dbConnect from '../../../lib/dbConnect';
import Order from '../../../models/Order';
import Package from '../../../models/Package';
import { authOptions } from '../auth/[...nextauth]'; // sesuaikan path bila berbeda

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const session = await getServerSession(req, res, authOptions);
  const email = session?.user?.email;
  if (!email) return res.status(401).json({ error: 'Unauthorized' });

  const { step, packageId, data } = req.body || {};
  if (!step) return res.status(400).json({ error: 'Missing step' });

  await dbConnect();

  // Validasi paket saat step punya packageId
  if (packageId) {
    const pkg = await Package.findById(packageId).lean();
    if (!pkg) return res.status(404).json({ error: 'Package not found' });
  }

  // Cari order pending terbaru
  let order = await Order.findOne({ email, status: { $in: ['pending'] } }).sort({ created_at: -1 });

  // Jika belum ada order draft/pending → buat pending baru (kita pakai 'pending' sebagai draft sebelum invoice)
  if (!order) {
    if (!packageId) return res.status(400).json({ error: 'packageId required to create order' });
    const pkg = await Package.findById(packageId).lean();
    order = await Order.create({
      email,
      packageId,
      harga: Number(pkg?.price || 0),
      status: 'pending',
      notes: JSON.stringify({ step, data: data || {}, packageId }),
      created_at: new Date()
    });
    return res.status(200).json({ ok: true, orderId: order._id });
  }

  // Update package jika diganti
  if (packageId) {
    order.packageId = packageId;
    // sync harga default dari paket, add-on dihitung saat create invoice
    const pkg = await Package.findById(packageId).lean();
    order.harga = Number(pkg?.price || 0);
  }

  // Merge notes JSON
  let notes = {};
  try { notes = order.notes ? JSON.parse(order.notes) : {}; } catch { notes = {}; }
  notes.step = Math.max(Number(notes.step || 1), Number(step));
  if (data && typeof data === 'object') notes.data = { ...(notes.data || {}), ...data };
  if (packageId) notes.packageId = packageId;

  order.notes = JSON.stringify(notes);
  await order.save();

  return res.status(200).json({ ok: true, orderId: order._id });
}
