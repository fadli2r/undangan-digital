#!/usr/bin/env node

/**
 * Script untuk menambahkan SeoHead ke multiple files sekaligus
 * Usage: node scripts/add-seohead.js
 */

const fs = require('fs');
const path = require('path');

// Daftar file yang perlu ditambahkan SeoHead
const filesToUpdate = [
  // Edit undangan pages
  {
    path: 'pages/edit-undangan/[slug]/desain.js',
    title: 'Ubah Desain Template - Dreamslink',
    description: 'Ganti template dan desain undangan digital Anda.',
    canonical: '/edit-undangan/[slug]/desain'
  },
  {
    path: 'pages/edit-undangan/[slug]/download.js',
    title: 'Download & Export - Dreamslink',
    description: 'Download undangan dalam format PDF atau export data.',
    canonical: '/edit-undangan/[slug]/download'
  },
  {
    path: 'pages/edit-undangan/[slug]/einvitation.js',
    title: 'E-Invitation Settings - Dreamslink',
    description: 'Kelola pengaturan e-invitation undangan Anda.',
    canonical: '/edit-undangan/[slug]/einvitation'
  },
  {
    path: 'pages/edit-undangan/[slug]/galeri.js',
    title: 'Kelola Galeri Foto - Dreamslink',
    description: 'Upload dan kelola galeri foto undangan Anda.',
    canonical: '/edit-undangan/[slug]/galeri'
  },
  {
    path: 'pages/edit-undangan/[slug]/gift.js',
    title: 'Amplop Digital - Dreamslink',
    description: 'Kelola pengaturan amplop digital dan rekening.',
    canonical: '/edit-undangan/[slug]/gift'
  },
  {
    path: 'pages/edit-undangan/[slug]/mempelai.js',
    title: 'Informasi Mempelai - Dreamslink',
    description: 'Edit informasi mempelai pria dan wanita.',
    canonical: '/edit-undangan/[slug]/mempelai'
  },
  {
    path: 'pages/edit-undangan/[slug]/ourstory.js',
    title: 'Our Story - Dreamslink',
    description: 'Ceritakan kisah perjalanan cinta Anda.',
    canonical: '/edit-undangan/[slug]/ourstory'
  },
  {
    path: 'pages/edit-undangan/[slug]/privasi.js',
    title: 'Pengaturan Privasi - Dreamslink',
    description: 'Kelola privasi dan keamanan undangan Anda.',
    canonical: '/edit-undangan/[slug]/privasi'
  },
  {
    path: 'pages/edit-undangan/[slug]/quota.js',
    title: 'Kuota WhatsApp - Dreamslink',
    description: 'Kelola kuota WhatsApp blast undangan.',
    canonical: '/edit-undangan/[slug]/quota'
  },
  {
    path: 'pages/edit-undangan/[slug]/rsvp.js',
    title: 'Daftar RSVP - Dreamslink',
    description: 'Lihat dan kelola konfirmasi kehadiran tamu.',
    canonical: '/edit-undangan/[slug]/rsvp'
  },
  {
    path: 'pages/edit-undangan/[slug]/tambahan.js',
    title: 'Informasi Tambahan - Dreamslink',
    description: 'Kelola informasi tambahan undangan Anda.',
    canonical: '/edit-undangan/[slug]/tambahan'
  },
  {
    path: 'pages/edit-undangan/[slug]/tamu.js',
    title: 'Kelola Daftar Tamu - Dreamslink',
    description: 'Kelola daftar tamu undangan Anda.',
    canonical: '/edit-undangan/[slug]/tamu'
  },
  {
    path: 'pages/edit-undangan/[slug]/ucapan.js',
    title: 'Daftar Ucapan - Dreamslink',
    description: 'Lihat ucapan dan doa dari tamu.',
    canonical: '/edit-undangan/[slug]/ucapan'
  },
  {
    path: 'pages/edit-undangan/[slug]/upgrade.js',
    title: 'Upgrade Fitur - Dreamslink',
    description: 'Upgrade fitur undangan Anda.',
    canonical: '/edit-undangan/[slug]/upgrade'
  },
  // Other pages
  {
    path: 'pages/dashboard.js',
    title: 'Dashboard - Dreamslink',
    description: 'Dashboard pengelolaan undangan digital Anda.',
    canonical: '/dashboard'
  },
  {
    path: 'pages/paket.js',
    title: 'Pilih Paket - Dreamslink',
    description: 'Pilih paket undangan digital yang sesuai kebutuhan Anda.',
    canonical: '/paket'
  },
  {
    path: 'pages/pilih-template.js',
    title: 'Pilih Template - Dreamslink',
    description: 'Pilih template undangan digital dari koleksi premium kami.',
    canonical: '/pilih-template'
  }
];

function addSeoHeadToFile(fileConfig) {
  const filePath = path.join(process.cwd(), fileConfig.path);
  
  // Cek apakah file ada
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File tidak ditemukan: ${fileConfig.path}`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Cek apakah sudah ada SeoHead import
  if (content.includes("import SeoHead from")) {
    console.log(`⏭️  Skip (sudah ada SeoHead): ${fileConfig.path}`);
    return false;
  }

  // 1. Tambahkan import SeoHead
  const importRegex = /(import.*from.*['"].*['"];?\n)+/;
  const lastImportMatch = content.match(importRegex);
  
  if (lastImportMatch) {
    const lastImportEnd = lastImportMatch.index + lastImportMatch[0].length;
    const beforeImports = content.substring(0, lastImportEnd);
    const afterImports = content.substring(lastImportEnd);
    
    // Tambahkan import jika belum ada
    if (!beforeImports.includes("import SeoHead")) {
      content = beforeImports + "import SeoHead from '@/components/SeoHead';\n" + afterImports;
    }
  }

  // 2. Tambahkan SeoHead component setelah <UserLayout> atau return statement
  const seoHeadComponent = `      <SeoHead
        title="${fileConfig.title}"
        description="${fileConfig.description}"
        canonical="${fileConfig.canonical}"
      />`;

  // Cari pattern return ( <UserLayout> atau return <UserLayout>
  const patterns = [
    /return \(\s*<UserLayout>/,
    /return <UserLayout>/,
    /return\s*\(\s*\n\s*<UserLayout>/
  ];

  let replaced = false;
  for (const pattern of patterns) {
    if (pattern.test(content)) {
      content = content.replace(pattern, (match) => {
        return match + '\n' + seoHeadComponent;
      });
      replaced = true;
      break;
    }
  }

  if (!replaced) {
    console.log(`⚠️  Tidak bisa menemukan pattern untuk: ${fileConfig.path}`);
    return false;
  }

  // Tulis kembali file
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Berhasil update: ${fileConfig.path}`);
  return true;
}

// Main execution
console.log('🚀 Memulai proses penambahan SeoHead...\n');

let successCount = 0;
let skipCount = 0;
let failCount = 0;

filesToUpdate.forEach((fileConfig) => {
  const result = addSeoHeadToFile(fileConfig);
  if (result === true) {
    successCount++;
  } else if (result === false && fs.existsSync(path.join(process.cwd(), fileConfig.path))) {
    skipCount++;
  } else {
    failCount++;
  }
});

console.log('\n📊 Ringkasan:');
console.log(`✅ Berhasil: ${successCount} file`);
console.log(`⏭️  Di-skip: ${skipCount} file`);
console.log(`❌ Gagal: ${failCount} file`);
console.log('\n✨ Selesai!');
