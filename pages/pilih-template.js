import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import MetronicUserLayout from "../components/layouts/MetronicUserLayout";
import { templateList } from "../data/templates";

export default function PilihTemplate() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const categories = [
    { id: "all", name: "Semua Template", count: templateList.length },
    { id: "minimalis", name: "Minimalis", count: templateList.filter(t => t.category === "minimalis").length },
    { id: "floral", name: "Floral", count: templateList.filter(t => t.category === "floral").length },
    { id: "modern", name: "Modern", count: templateList.filter(t => t.category === "modern").length },
    { id: "vintage", name: "Vintage", count: templateList.filter(t => t.category === "vintage").length }
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (status === "loading") return;

    // Check Google/NextAuth login
    if (session?.user?.email) {
      setUser(session.user);
      return;
    }

    // Check manual login
    try {
      const userLS = window.localStorage.getItem("user");
      if (userLS) {
        const userData = JSON.parse(userLS);
        setUser(userData);
      } else {
        router.replace("/login");
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
      router.replace("/login");
    }
  }, [mounted, status, session, router]);

  // Filter templates based on category and search
  const filteredTemplates = templateList.filter(template => {
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (!mounted) return null;
  
  if (!user) return (
    <MetronicUserLayout>
      <div className="d-flex justify-content-center align-items-center min-h-300px">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    </MetronicUserLayout>
  );

  return (
    <MetronicUserLayout>
      {/* Page Header */}
      <div className="row g-5 g-xl-10 mb-5 mb-xl-10">
        <div className="col-12">
          <div className="card">
            <div className="card-body text-center py-10">
              <h1 className="fs-2hx fw-bold text-gray-900 mb-4">Pilih Template Undangan</h1>
              <div className="fs-6 text-gray-700 mb-5">
                Pilih dari koleksi template premium kami yang elegan dan modern
              </div>
              
              {/* Search Bar */}
              <div className="position-relative d-inline-block w-300px">
                <i className="ki-duotone ki-magnifier fs-3 text-gray-500 position-absolute top-50 translate-middle ms-6">
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
                <input
                  type="text"
                  className="form-control form-control-solid ps-10"
                  placeholder="Cari template..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="row g-5 g-xl-10 mb-5 mb-xl-10">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <div className="d-flex flex-wrap gap-3">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`btn ${
                      selectedCategory === category.id
                        ? 'btn-primary'
                        : 'btn-light-primary'
                    }`}
                  >
                    {category.name}
                    <span className="badge badge-light-primary ms-2">{category.count}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="row g-5 g-xl-10">
        {filteredTemplates.length === 0 ? (
          <div className="col-12">
            <div className="card">
              <div className="card-body text-center py-20">
                <i className="ki-duotone ki-file-deleted fs-3x text-gray-300 mb-5">
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
                <h3 className="text-gray-800 fw-bold mb-3">Tidak ada template ditemukan</h3>
                <div className="text-gray-600">
                  Coba ubah filter atau kata kunci pencarian Anda
                </div>
              </div>
            </div>
          </div>
        ) : (
          filteredTemplates.map((template) => (
            <div key={template.slug} className="col-md-6 col-lg-4">
              <div className="card h-100 shadow-sm">
                {/* Template Image */}
                <div className="card-header border-0 pt-5">
                  <div className="position-relative">
                    <img
                      src={template.thumbnail}
                      alt={template.name}
                      className="w-100 rounded"
                      style={{ height: '250px', objectFit: 'cover' }}
                    />
                    
                    {/* Category Badge */}
                    <div className="position-absolute top-0 start-0 m-3">
                      <span className="badge badge-light-primary">
                        {template.category || 'Template'}
                      </span>
                    </div>

                    {/* Preview Overlay */}
                    <div className="position-absolute inset-0 bg-dark bg-opacity-50 d-flex align-items-center justify-content-center opacity-0 hover-opacity-100 transition-all rounded">
                      <button
                        className="btn btn-light btn-sm"
                        onClick={() => window.open(template.preview || '#', '_blank')}
                      >
                        <i className="ki-duotone ki-eye fs-4">
                          <span className="path1"></span>
                          <span className="path2"></span>
                          <span className="path3"></span>
                        </i>
                        Preview
                      </button>
                    </div>
                  </div>
                </div>

                {/* Template Info */}
                <div className="card-body d-flex flex-column">
                  <div className="mb-3">
                    <h3 className="fs-4 fw-bold text-gray-900 mb-2">{template.name}</h3>
                    <p className="text-gray-700 fs-6 mb-0">{template.description}</p>
                  </div>

                  {/* Features */}
                  <div className="mb-4">
                    <div className="d-flex flex-wrap gap-1">
                      {template.features?.slice(0, 3).map((feature, index) => (
                        <span key={index} className="badge badge-light-info fs-8">
                          {feature}
                        </span>
                      )) || (
                        <>
                          <span className="badge badge-light-info fs-8">Responsive</span>
                          <span className="badge badge-light-info fs-8">RSVP</span>
                          <span className="badge badge-light-info fs-8">Gallery</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="mt-auto">
                    <button
                      className="btn btn-primary w-100"
                      onClick={() => router.push(`/buat-undangan?template=${template.slug}`)}
                    >
                      <i className="ki-duotone ki-check fs-2">
                        <span className="path1"></span>
                        <span className="path2"></span>
                      </i>
                      Pilih Template Ini
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Load More Button (if needed) */}
      {filteredTemplates.length > 0 && (
        <div className="row g-5 g-xl-10 mt-5">
          <div className="col-12 text-center">
            <div className="card">
              <div className="card-body py-10">
                <h4 className="text-gray-800 fw-bold mb-3">Tidak menemukan yang cocok?</h4>
                <div className="text-gray-600 mb-5">
                  Hubungi tim kami untuk template custom sesuai keinginan Anda
                </div>
                <a
                  href="https://wa.me/your-number"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-light-primary"
                >
                  <i className="ki-duotone ki-message-text fs-2">
                    <span className="path1"></span>
                    <span className="path2"></span>
                    <span className="path3"></span>
                  </i>
                  Hubungi Customer Service
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </MetronicUserLayout>
  );
}
