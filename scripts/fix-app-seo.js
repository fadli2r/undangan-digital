#!/usr/bin/env node

/**
 * Script untuk memperbaiki SEO metadata di app/ layouts
 * Menambahkan robots, keywords, dan memastikan struktur lengkap
 */

const fs = require('fs');
const path = require('path');

const layoutsToFix = [
  {
    path: 'app/katalog/layout.tsx',
    keywords: 'katalog undangan, template undangan digital, desain undangan, undangan pernikahan',
    robots: { index: true, follow: true }
  },
  {
    path: 'app/kontak/layout.tsx',
    keywords: 'kontak dreamslink, hubungi kami, customer service undangan digital',
    robots: { index: true, follow: true }
  },
  {
    path: 'app/produk/layout.tsx',
    keywords: 'paket undangan digital, harga undangan, produk undangan',
    robots: { index: true, follow: true }
  },
  {
    path: 'app/portofolio/layout.tsx',
    keywords: 'portofolio undangan, contoh undangan digital, galeri undangan',
    robots: { index: true, follow: true }
  },
  {
    path: 'app/tentang/layout.tsx',
    keywords: 'tentang dreamslink, profil perusahaan, tentang kami',
    robots: { index: true, follow: true }
  },
  {
    path: 'app/buku-tamu/[slug]/layout.tsx',
    keywords: 'buku tamu digital, guest book online',
    robots: { index: false, follow: false }
  },
  {
    path: 'app/scanner/[slug]/layout.tsx',
    keywords: 'qr scanner, scan undangan',
    robots: { index: false, follow: false }
  },
  {
    path: 'app/preview/[slug]/layout.tsx',
    keywords: 'preview undangan, lihat undangan',
    robots: { index: false, follow: false }
  },
  {
    path: 'app/undangan/[slug]/layout.tsx',
    keywords: 'undangan digital, undangan online, e-invitation',
    robots: { index: true, follow: true }
  }
];

function fixLayoutSEO(config) {
  const filePath = path.join(process.cwd(), config.path);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File tidak ditemukan: ${config.path}`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Cek apakah sudah ada keywords
  if (!content.includes('keywords:')) {
    // Tambahkan keywords setelah description
    content = content.replace(
      /description:\s*"([^"]+)",/,
      `description: "$1",\n  keywords: "${config.keywords}",`
    );
  }

  // Cek apakah sudah ada robots
  if (!content.includes('robots:')) {
    const robotsStr = config.robots.index 
      ? `  robots: {\n    index: true,\n    follow: true,\n  },`
      : `  robots: {\n    index: false,\n    follow: false,\n  },`;
    
    // Tambahkan robots sebelum alternates
    content = content.replace(
      /alternates:/,
      `${robotsStr}\n  alternates:`
    );
  }

  // Tulis kembali
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Fixed: ${config.path}`);
  return true;
}

console.log('🔧 Memperbaiki SEO metadata di app/ layouts...\n');

let successCount = 0;
let failCount = 0;

layoutsToFix.forEach((config) => {
  const result = fixLayoutSEO(config);
  if (result) {
    successCount++;
  } else {
    failCount++;
  }
});

console.log('\n📊 Ringkasan:');
console.log(`✅ Berhasil: ${successCount} file`);
console.log(`❌ Gagal: ${failCount} file`);
console.log('\n✨ Selesai!');
