import dbConnect from '../../../../lib/dbConnect';
import Package from '../../../../models/Package';
import adminAuthJWT from '../../../../middleware/adminAuthJWT';

export default async function handler(req, res) {
  await dbConnect();

  // Check admin authentication
  const authResult = await adminAuthJWT(req);
  if (!authResult.success) {
    return res.status(401).json({ error: authResult.error });
  }

  // Add admin info to request
  req.admin = authResult.admin;

  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const { search, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
        
        // Build query
        let query = {};
        
        if (search) {
          query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
          ];
        }
        
        if (status !== undefined) {
          query.isActive = status === 'true';
        }

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const packages = await Package.find(query)
          .sort(sort)
          .lean();

        res.status(200).json({ packages });
      } catch (error) {
        console.error('Error fetching packages:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data paket' });
      }
      break;

    case 'POST':
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

        const slug = name
  .toLowerCase()
  .replace(/[^\w\s-]/g, '') // hapus karakter aneh
  .trim()
  .replace(/\s+/g, '-');
        // Create package
        const newPackage = new Package({
            slug, // ✅ tambahkan slug yang dihasilkan
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
          sortOrder: sortOrder || 0,
          createdBy: req.admin._id
        });

        await newPackage.save();

        res.status(201).json({
          message: 'Paket berhasil dibuat',
          package: newPackage
        });
      } catch (error) {
        console.error('Error creating package:', error);
        if (error.name === 'ValidationError') {
          const errors = Object.values(error.errors).map(err => err.message);
          return res.status(400).json({ error: errors.join(', ') });
        }
        res.status(500).json({ error: 'Terjadi kesalahan saat membuat paket' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({ error: `Method ${method} tidak diizinkan` });
  }
}
