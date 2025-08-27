import dbConnect from '../../lib/dbConnect';
import Package from '../../models/Package';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await dbConnect();

  try {
    // Create a simple test package
    const testPackage = new Package({
      name: 'Basic',
      slug: 'basic',
      description: 'Paket dasar untuk undangan digital sederhana',
      price: 50000,
      originalPrice: 75000,
      duration: {
        value: 3,
        unit: 'months'
      },
      features: [
        {
          name: 'Template Klasik',
          description: 'Akses ke template klasik',
          included: true,
          limit: null
        },
        {
          name: 'Maksimal Tamu',
          description: 'Jumlah maksimal tamu yang dapat diundang',
          included: true,
          limit: 100
        },
        {
          name: 'Galeri Foto',
          description: 'Upload foto untuk galeri',
          included: true,
          limit: 10
        }
      ],
      limits: {
        invitations: 1,
        guests: 100,
        photos: 10,
        templates: ['classic'],
        customDomain: false,
        removeWatermark: false,
        analytics: false,
        priority_support: false
      },
      metadata: {
        color: '#10B981',
        icon: '🌟',
        badge: 'Populer'
      },
      isActive: true,
      isPopular: true,
      isFeatured: false,
      sortOrder: 1
    });

    const savedPackage = await testPackage.save();

    res.status(200).json({
      message: 'Test package created successfully',
      package: savedPackage
    });

  } catch (error) {
    console.error('Error creating test package:', error);
    res.status(500).json({ 
      message: 'Error creating test package',
      error: error.message 
    });
  }
}
