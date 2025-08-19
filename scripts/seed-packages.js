const mongoose = require('mongoose');

// Import models
const Package = require('../models/Package');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/undangan-digital';

const samplePackages = [
  {
    name: 'Basic',
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
      },
      {
        name: 'Custom Domain',
        description: 'Gunakan domain sendiri',
        included: false,
        limit: null
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
  },
  {
    name: 'Premium',
    description: 'Paket premium dengan fitur lengkap',
    price: 150000,
    originalPrice: 200000,
    duration: {
      value: 6,
      unit: 'months'
    },
    features: [
      {
        name: 'Semua Template',
        description: 'Akses ke semua template tersedia',
        included: true,
        limit: null
      },
      {
        name: 'Maksimal Tamu',
        description: 'Jumlah maksimal tamu yang dapat diundang',
        included: true,
        limit: 500
      },
      {
        name: 'Galeri Foto',
        description: 'Upload foto untuk galeri',
        included: true,
        limit: 50
      },
      {
        name: 'Custom Domain',
        description: 'Gunakan domain sendiri',
        included: true,
        limit: null
      },
      {
        name: 'Hapus Watermark',
        description: 'Hilangkan watermark dari undangan',
        included: true,
        limit: null
      },
      {
        name: 'Analytics',
        description: 'Statistik pengunjung undangan',
        included: true,
        limit: null
      }
    ],
    limits: {
      invitations: 3,
      guests: 500,
      photos: 50,
      templates: ['classic', 'modern', 'elegant'],
      customDomain: true,
      removeWatermark: true,
      analytics: true,
      priority_support: true
    },
    metadata: {
      color: '#3B82F6',
      icon: '💎',
      badge: 'Terlaris'
    },
    isActive: true,
    isPopular: false,
    isFeatured: true,
    sortOrder: 2
  },
  {
    name: 'Enterprise',
    description: 'Paket enterprise untuk kebutuhan bisnis',
    price: 500000,
    originalPrice: null,
    duration: {
      value: 1,
      unit: 'years'
    },
    features: [
      {
        name: 'Unlimited Template',
        description: 'Akses ke semua template + custom template',
        included: true,
        limit: null
      },
      {
        name: 'Unlimited Tamu',
        description: 'Tanpa batas jumlah tamu',
        included: true,
        limit: null
      },
      {
        name: 'Unlimited Foto',
        description: 'Upload foto tanpa batas',
        included: true,
        limit: null
      },
      {
        name: 'Multiple Domain',
        description: 'Gunakan beberapa domain custom',
        included: true,
        limit: 5
      },
      {
        name: 'Priority Support',
        description: 'Dukungan prioritas 24/7',
        included: true,
        limit: null
      },
      {
        name: 'Advanced Analytics',
        description: 'Analitik mendalam dan laporan',
        included: true,
        limit: null
      }
    ],
    limits: {
      invitations: 10,
      guests: -1, // unlimited
      photos: -1, // unlimited
      templates: ['classic', 'modern', 'elegant', 'luxury', 'custom'],
      customDomain: true,
      removeWatermark: true,
      analytics: true,
      priority_support: true
    },
    metadata: {
      color: '#7C3AED',
      icon: '🚀',
      badge: 'Enterprise'
    },
    isActive: true,
    isPopular: false,
    isFeatured: true,
    sortOrder: 3
  }
];

async function seedPackages() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);

    console.log('Connected to MongoDB');

    // Clear existing packages
    await Package.deleteMany({});
    console.log('Cleared existing packages');

    // Insert sample packages
    const createdPackages = await Package.insertMany(samplePackages);
    console.log(`Created ${createdPackages.length} sample packages:`);
    
    createdPackages.forEach(pkg => {
      console.log(`- ${pkg.name}: Rp ${pkg.price.toLocaleString('id-ID')}`);
    });

    console.log('\nPackage seeding completed successfully!');
    
  } catch (error) {
    console.error('Error seeding packages:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the seeding function
if (require.main === module) {
  seedPackages();
}

module.exports = seedPackages;
