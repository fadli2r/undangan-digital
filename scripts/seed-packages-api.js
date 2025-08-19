const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3000';

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

async function seedPackagesViaAPI() {
  try {
    console.log('Starting to seed packages via API...');

    // First, let's try to get existing packages to see if API is working
    console.log('Testing API connection...');
    
    for (const packageData of samplePackages) {
      console.log(`Creating package: ${packageData.name}`);
      
      const response = await fetch(`${API_BASE_URL}/api/admin/packages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Note: In production, you would need proper authentication headers
        },
        body: JSON.stringify(packageData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✓ Created package: ${packageData.name}`);
      } else {
        const error = await response.text();
        console.error(`✗ Failed to create package ${packageData.name}:`, error);
      }
    }

    console.log('\nPackage seeding completed!');
    
  } catch (error) {
    console.error('Error seeding packages via API:', error.message);
    console.log('\nNote: Make sure your Next.js development server is running on http://localhost:3000');
    console.log('Run: npm run dev');
  }
}

// Run the seeding function
if (require.main === module) {
  seedPackagesViaAPI();
}

module.exports = seedPackagesViaAPI;
