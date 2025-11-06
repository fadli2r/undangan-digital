/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://dreamslink.id',
  generateRobotsTxt: false, // Kita sudah buat manual di public/robots.txt
  generateIndexSitemap: false, // Untuk site kecil, tidak perlu index sitemap
  
  // Exclude private pages
  exclude: [
    '/admin',
    '/admin/*',
    '/api/*',
    '/edit-undangan',
    '/edit-undangan/*',
    '/dashboard',
    '/profile',
    '/profile/*',
    '/buku-tamu/*',
    '/scanner/*',
    '/preview/*',
    '/login',
    '/register',
    '/onboarding/*',
    '/orders/*',
    '/upgrade/*',
    '/welcome',
    '/pilih-template',
    '/buat-undangan',
  ],

  // Priority dan changefreq untuk halaman penting
  transform: async (config, path) => {
    // Homepage
    if (path === '/') {
      return {
        loc: path,
        changefreq: 'daily',
        priority: 1.0,
        lastmod: new Date().toISOString(),
      };
    }

    // Halaman penting (katalog, produk, dll)
    if (['/katalog', '/produk', '/paket', '/portofolio'].includes(path)) {
      return {
        loc: path,
        changefreq: 'weekly',
        priority: 0.9,
        lastmod: new Date().toISOString(),
      };
    }

    // Halaman kontak dan tentang
    if (['/kontak', '/tentang'].includes(path)) {
      return {
        loc: path,
        changefreq: 'monthly',
        priority: 0.7,
        lastmod: new Date().toISOString(),
      };
    }

    // Halaman undangan dinamis
    if (path.startsWith('/undangan/')) {
      return {
        loc: path,
        changefreq: 'weekly',
        priority: 0.8,
        lastmod: new Date().toISOString(),
      };
    }

    // Default untuk halaman lain
    return {
      loc: path,
      changefreq: 'monthly',
      priority: 0.5,
      lastmod: new Date().toISOString(),
    };
  },

  // Additional paths (jika ada halaman yang tidak ter-detect otomatis)
  additionalPaths: async (config) => {
    const result = [];

    // Tambahkan halaman statis yang penting
    const staticPages = [
      { path: '/', priority: 1.0, changefreq: 'daily' },
      { path: '/katalog', priority: 0.9, changefreq: 'weekly' },
      { path: '/produk', priority: 0.9, changefreq: 'weekly' },
      { path: '/paket', priority: 0.9, changefreq: 'weekly' },
      { path: '/portofolio', priority: 0.9, changefreq: 'weekly' },
      { path: '/kontak', priority: 0.7, changefreq: 'monthly' },
      { path: '/tentang', priority: 0.7, changefreq: 'monthly' },
    ];

    staticPages.forEach((page) => {
      result.push({
        loc: page.path,
        changefreq: page.changefreq,
        priority: page.priority,
        lastmod: new Date().toISOString(),
      });
    });

    return result;
  },

  // Robots.txt options (tidak digunakan karena kita buat manual)
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/edit-undangan/',
          '/dashboard',
          '/profile/',
          '/buku-tamu/',
          '/scanner/',
          '/preview/',
        ],
      },
    ],
  },
};
