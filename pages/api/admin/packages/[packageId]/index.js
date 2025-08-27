import dbConnect from '@/lib/dbConnect';
import Package from '@/models/Package';
import adminAuthJWT from '@/middleware/adminAuthJWT'; // pastikan path-nya benar

export default async function handler(req, res) {
  await dbConnect();

  // ✅ AUTENTIKASI
  const auth = await adminAuthJWT(req, res);
  if (!auth.success) {
    return res.status(401).json({ error: auth.error || 'Unauthorized' });
  }

  const {
    query: { packageId },
    method,
  } = req;

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
        const updated = await Package.findByIdAndUpdate(packageId, req.body, {
          new: true,
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
