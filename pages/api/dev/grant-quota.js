// pages/api/dev/grant-quota.js (DEV ONLY)
import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/User';
import Order from '../../../models/Order';

export default async function handler(req, res) {
  if (process.env.NODE_ENV !== 'development') return res.status(403).json({ error: 'Only in development' });
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: 'email required' });

  await dbConnect();
  const paid = await Order.exists({ email, status: 'paid' });
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: 'User not found' });

  let changed = false;
  if (!user.onboardingCompleted && paid) { user.onboardingCompleted = true; changed = true; }
  if ((user.quota ?? 0) < 1 && paid) { user.quota = 1; changed = true; }
  if (changed) await user.save();

  return res.status(200).json({ ok: true, quota: user.quota, onboardingCompleted: user.onboardingCompleted });
}
