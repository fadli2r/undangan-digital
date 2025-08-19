import dbConnect from '../../../../../lib/dbConnect';
import Package from '../../../../../models/Package';
import adminAuth from '../../../../../middleware/adminAuth';

export default async function handler(req, res) {
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
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const pkg = await Package.findById(packageId);
        if (!pkg) {
          return res.status(404).json({ error: 'Paket tidak ditemukan' });
        }

        res.status(200).json({ package: pkg });
      } catch (error) {
        console.error('Error fetching package:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data paket' });
      }
      break;

    case 'PUT':
      try {
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
            error: 'Nama, deskripsi, harga, dan durasi wajib diisi'
          });
        }

        // Validate duration
        if (!duration.value || !duration.unit) {
          return res.status(400).json({
            error: 'Durasi harus memiliki nilai dan unit'
          });
        }

        // Validate price
        if (price <= 0) {
          return res.status(400).json({
            error: 'Harga harus lebih dari 0'
          });
        }

        const updatedPackage = await Package.findByIdAndUpdate(
          packageId,
          {
            name,
            description,
            price: parseFloat(price),
            originalPrice: originalPrice ? parseFloat(originalPrice) : null,
            duration,
            features: features || [],
            limits: limits || {},
            metadata: metadata || {},
            isActive: isActive !== false,
            isPopular: isPopular || false,
            isFeatured: isFeatured || false,
            sortOrder: sortOrder || 0
          },
          { new: true, runValidators: true }
        );

        if (!updatedPackage) {
          return res.status(404).json({ error: 'Paket tidak ditemukan' });
        }

        res.status(200).json({
          message: 'Paket berhasil diperbarui',
          package: updatedPackage
        });
      } catch (error) {
        console.error('Error updating package:', error);
        if (error.name === 'ValidationError') {
          const errors = Object.values(error.errors).map(err => err.message);
          return res.status(400).json({ error: errors.join(', ') });
        }
        res.status(500).json({ error: 'Terjadi kesalahan saat memperbarui paket' });
      }
      break;

    case 'DELETE':
      try {
        const pkg = await Package.findById(packageId);
        if (!pkg) {
          return res.status(404).json({ error: 'Paket tidak ditemukan' });
        }

        // TODO: Check if package is being used by any active subscriptions
        // For now, we'll allow deletion but in production you might want to prevent this

        await Package.findByIdAndDelete(packageId);

        res.status(200).json({
          message: 'Paket berhasil dihapus'
        });
      } catch (error) {
        console.error('Error deleting package:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat menghapus paket' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).json({ error: `Method ${method} tidak diizinkan` });
  }
}
