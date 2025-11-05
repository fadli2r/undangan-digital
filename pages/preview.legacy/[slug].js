import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { getTemplateBySlug, catalogTemplates } from '../../data/catalog-templates';

export default function TemplatePreview() {
  const router = useRouter();
  const { slug } = router.query;
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Mock preview images (dalam implementasi nyata, ini akan dari database)
  const previewImages = [
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=1200&fit=crop',
    'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&h=1200&fit=crop',
    'https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=800&h=1200&fit=crop'
  ];

  useEffect(() => {
    if (slug) {
      const foundTemplate = getTemplateBySlug(slug);
      setTemplate(foundTemplate);
      setLoading(false);
    }
  }, [slug]);

  const handleSelectTemplate = () => {
    router.push(`/buat-undangan?template=${template.slug}`);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % previewImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + previewImages.length) % previewImages.length);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center min-vh-100">
        <h2 className="fs-2x fw-bold text-gray-900 mb-3">Template Tidak Ditemukan</h2>
        <p className="text-muted mb-5">Template yang Anda cari tidak tersedia.</p>
        <Link href="/katalog" className="btn btn-primary">
          Kembali ke Katalog
        </Link>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{template.name} - Preview Template Undangan Digital</title>
        <meta name="description" content={template.description} />
        <link href="https://fonts.googleapis.com/css?family=Inter:300,400,500,600,700" rel="stylesheet" />
      </Head>

      <div className="d-flex flex-column flex-root" id="kt_app_root">
        {/* Header Navigation */}
        <div id="kt_app_header" className="app-header">
          <div className="app-container container-fluid d-flex align-items-stretch justify-content-between">
            {/* Logo */}
            <div className="d-flex align-items-center flex-grow-1 flex-lg-grow-0">
              <Link href="/" className="d-lg-none">
                <img alt="Logo" src="/logo.png" className="h-30px" />
              </Link>
              <Link href="/" className="d-none d-lg-flex">
                <img alt="Logo" src="/logo.png" className="h-40px" />
              </Link>
            </div>

            {/* Navigation */}
            <div className="d-flex align-items-stretch justify-content-between flex-lg-grow-1">
              <div className="d-none d-lg-flex align-items-stretch">
                <div className="d-flex align-items-center">
                  <Link href="/katalog" className="btn btn-sm btn-light me-3">
                    <i className="ki-duotone ki-arrow-left fs-4 me-1">
                      <span className="path1"></span>
                      <span className="path2"></span>
                    </i>
                    Kembali ke Katalog
                  </Link>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="d-flex align-items-stretch flex-shrink-0">
                <div className="d-flex align-items-center ms-1 ms-lg-3">
                  <Link href="/login" className="btn btn-sm btn-light me-3 d-none d-lg-flex">
                    Masuk
                  </Link>
                  <button
                    onClick={handleSelectTemplate}
                    className="btn btn-sm btn-primary"
                  >
                    Pilih Template Ini
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="py-10">
          <div className="container">
            <div className="row g-10">
              {/* Left Column - Preview */}
              <div className="col-lg-8">
                {/* Template Info Header */}
                <div className="mb-8">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h1 className="fs-2hx fw-bold text-gray-900 mb-2">{template.name}</h1>
                      <p className="fs-5 text-muted">{template.description}</p>
                    </div>
                    <div className="d-flex gap-2">
                      {template.isPopular && (
                        <span className="badge bg-danger">🔥 Populer</span>
                      )}
                      {template.isPremium && (
                        <span className="badge bg-warning">👑 Premium</span>
                      )}
                      <span className="badge bg-primary">{template.category}</span>
                    </div>
                  </div>
                </div>

                {/* Image Preview Carousel */}
                <div className="card mb-8">
                  <div className="card-body p-0">
                    <div className="position-relative">
                      <img
                        src={previewImages[currentImageIndex]}
                        alt={`${template.name} Preview ${currentImageIndex + 1}`}
                        className="w-100 rounded"
                        style={{ height: '600px', objectFit: 'cover' }}
                      />
                      
                      {/* Navigation Arrows */}
                      <button
                        className="btn btn-icon btn-light position-absolute top-50 start-0 translate-middle-y ms-3"
                        onClick={prevImage}
                      >
                        <i className="ki-duotone ki-arrow-left fs-2">
                          <span className="path1"></span>
                          <span className="path2"></span>
                        </i>
                      </button>
                      <button
                        className="btn btn-icon btn-light position-absolute top-50 end-0 translate-middle-y me-3"
                        onClick={nextImage}
                      >
                        <i className="ki-duotone ki-arrow-right fs-2">
                          <span className="path1"></span>
                          <span className="path2"></span>
                        </i>
                      </button>

                      {/* Image Counter */}
                      <div className="position-absolute bottom-0 end-0 m-3">
                        <span className="badge bg-dark bg-opacity-75">
                          {currentImageIndex + 1} / {previewImages.length}
                        </span>
                      </div>
                    </div>

                    {/* Thumbnail Navigation */}
                    <div className="d-flex gap-2 p-3">
                      {previewImages.map((img, index) => (
                        <button
                          key={index}
                          className={`btn p-0 border ${currentImageIndex === index ? 'border-primary' : 'border-gray-300'}`}
                          onClick={() => setCurrentImageIndex(index)}
                          style={{ width: '60px', height: '60px' }}
                        >
                          <img
                            src={img}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-100 h-100 rounded"
                            style={{ objectFit: 'cover' }}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Features Section */}
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">Fitur Template</h3>
                  </div>
                  <div className="card-body">
                    <div className="row g-3">
                      {template.features.map((feature, index) => (
                        <div key={index} className="col-md-6">
                          <div className="d-flex align-items-center">
                            <i className="ki-duotone ki-check-circle fs-2 text-success me-3">
                              <span className="path1"></span>
                              <span className="path2"></span>
                            </i>
                            <span className="fw-semibold">{feature}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Details & Actions */}
              <div className="col-lg-4">
                {/* Pricing Card */}
                <div className="card mb-6">
                  <div className="card-body text-center">
                    <div className="mb-5">
                      <div className="fs-2x fw-bold text-primary mb-2">
                        Rp {template.price.toLocaleString('id-ID')}
                      </div>
                      {template.originalPrice > template.price && (
                        <>
                          <div className="fs-6 text-muted text-decoration-line-through mb-2">
                            Rp {template.originalPrice.toLocaleString('id-ID')}
                          </div>
                          <span className="badge bg-success">
                            Hemat {Math.round(((template.originalPrice - template.price) / template.originalPrice) * 100)}%
                          </span>
                        </>
                      )}
                    </div>

                    <button
                      onClick={handleSelectTemplate}
                      className="btn btn-primary btn-lg w-100 mb-3"
                    >
                      <i className="ki-duotone ki-plus fs-2 me-2">
                        <span className="path1"></span>
                        <span className="path2"></span>
                      </i>
                      Pilih Template Ini
                    </button>

                    <Link href="/katalog" className="btn btn-light w-100">
                      <i className="ki-duotone ki-arrow-left fs-4 me-2">
                        <span className="path1"></span>
                        <span className="path2"></span>
                      </i>
                      Lihat Template Lain
                    </Link>
                  </div>
                </div>

                {/* Template Details */}
                <div className="card mb-6">
                  <div className="card-header">
                    <h3 className="card-title">Detail Template</h3>
                  </div>
                  <div className="card-body">
                    <div className="mb-4">
                      <div className="fw-bold text-gray-900 mb-1">Kategori</div>
                      <div className="text-muted">{template.category}</div>
                    </div>
                    <div className="mb-4">
                      <div className="fw-bold text-gray-900 mb-1">Tipe</div>
                      <div className="text-muted">
                        {template.isPremium ? 'Premium Template' : 'Standard Template'}
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="fw-bold text-gray-900 mb-1">Popularitas</div>
                      <div className="text-muted">
                        {template.isPopular ? '🔥 Sangat Populer' : '⭐ Populer'}
                      </div>
                    </div>
                    <div>
                      <div className="fw-bold text-gray-900 mb-1">Fitur Utama</div>
                      <div className="text-muted">{template.features.length} fitur tersedia</div>
                    </div>
                  </div>
                </div>

                {/* What's Included */}
                <div className="card mb-6">
                  <div className="card-header">
                    <h3 className="card-title">Yang Anda Dapatkan</h3>
                  </div>
                  <div className="card-body">
                    <div className="d-flex align-items-center mb-3">
                      <i className="ki-duotone ki-check-circle fs-2 text-success me-3">
                        <span className="path1"></span>
                        <span className="path2"></span>
                      </i>
                      <span>Template siap pakai</span>
                    </div>
                    <div className="d-flex align-items-center mb-3">
                      <i className="ki-duotone ki-check-circle fs-2 text-success me-3">
                        <span className="path1"></span>
                        <span className="path2"></span>
                      </i>
                      <span>Customisasi unlimited</span>
                    </div>
                    <div className="d-flex align-items-center mb-3">
                      <i className="ki-duotone ki-check-circle fs-2 text-success me-3">
                        <span className="path1"></span>
                        <span className="path2"></span>
                      </i>
                      <span>Support 24/7</span>
                    </div>
                    <div className="d-flex align-items-center mb-3">
                      <i className="ki-duotone ki-check-circle fs-2 text-success me-3">
                        <span className="path1"></span>
                        <span className="path2"></span>
                      </i>
                      <span>Mobile responsive</span>
                    </div>
                    <div className="d-flex align-items-center">
                      <i className="ki-duotone ki-check-circle fs-2 text-success me-3">
                        <span className="path1"></span>
                        <span className="path2"></span>
                      </i>
                      <span>Revisi tanpa batas</span>
                    </div>
                  </div>
                </div>

                {/* Need Help */}
                <div className="card">
                  <div className="card-body text-center">
                    <i className="ki-duotone ki-questionnaire-tablet fs-3x text-primary mb-3">
                      <span className="path1"></span>
                      <span className="path2"></span>
                    </i>
                    <h4 className="fw-bold mb-3">Butuh Bantuan?</h4>
                    <p className="text-muted mb-4">
                      Tim kami siap membantu Anda memilih template yang tepat
                    </p>
                    <Link href="/kontak" className="btn btn-light-primary w-100">
                      <i className="ki-duotone ki-message-text-2 fs-4 me-2">
                        <span className="path1"></span>
                        <span className="path2"></span>
                        <span className="path3"></span>
                      </i>
                      Hubungi Kami
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Templates */}
        <div className="py-15 bg-light">
          <div className="container">
            <div className="text-center mb-10">
              <h2 className="fs-2hx fw-bold text-gray-900 mb-3">Template Serupa</h2>
              <div className="fs-5 text-muted">
                Template lain yang mungkin Anda sukai
              </div>
            </div>

            <div className="row g-6">
              {catalogTemplates
                .filter(t => t.category === template.category && t.id !== template.id)
                .slice(0, 3)
                .map((relatedTemplate) => (
                  <div key={relatedTemplate.id} className="col-md-4">
                    <div className="card h-100 shadow-sm">
                      <div className="position-relative">
                        <img
                          src={relatedTemplate.thumbnail}
                          alt={relatedTemplate.name}
                          className="card-img-top"
                          style={{ height: '200px', objectFit: 'cover' }}
                        />
                        <div className="position-absolute top-0 start-0 m-2">
                          {relatedTemplate.isPopular && (
                            <span className="badge bg-danger me-1">🔥</span>
                          )}
                          {relatedTemplate.isPremium && (
                            <span className="badge bg-warning">👑</span>
                          )}
                        </div>
                      </div>
                      <div className="card-body">
                        <h5 className="fw-bold mb-2">{relatedTemplate.name}</h5>
                        <p className="text-muted fs-7 mb-3">{relatedTemplate.description}</p>
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="fw-bold text-primary">
                            Rp {relatedTemplate.price.toLocaleString('id-ID')}
                          </span>
                          <Link
                            href={`/preview/${relatedTemplate.slug}`}
                            className="btn btn-sm btn-light-primary"
                          >
                            Lihat Detail
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-dark py-10">
          <div className="container">
            <div className="text-center">
              <div className="text-gray-600 fs-7">
                &copy; {new Date().getFullYear()} Undangan Digital. All rights reserved.
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
