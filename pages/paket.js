import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import MetronicUserLayout from "../components/layouts/MetronicUserLayout";

const paketList = [
  {
    id: "basic",
    nama: "Basic",
    harga: 25000,
    originalPrice: 35000,
    popular: false,
    fitur: [
      "1 Template Undangan",
      "RSVP Digital",
      "Galeri Foto",
      "Amplop Digital",
      "Support 24/7"
    ],
    color: "primary"
  },
  {
    id: "premium",
    nama: "Premium",
    harga: 50000,
    originalPrice: 75000,
    popular: true,
    fitur: [
      "Semua Fitur Basic",
      "15 Galeri Foto",
      "Pilih Template Premium",
      "Countdown, Musik, Maps",
      "Live Streaming",
      "Custom Domain"
    ],
    color: "success"
  }
];

export default function Paket() {
  const { data: session } = useSession();
  const router = useRouter();

  const handlePilihPaket = (paket) => {
    // Redirect to summary page with selected paketId
    router.push(`/paket/summary?paketId=${paket.id}`);
  };

  return (
    <MetronicUserLayout>
      {/* Page Header */}
      <div className="row g-5 g-xl-10 mb-5 mb-xl-10">
        <div className="col-12">
          <div className="card">
            <div className="card-body text-center py-10">
              <h1 className="fs-2hx fw-bold text-gray-900 mb-4">Pilih Paket Undangan</h1>
              <div className="fs-6 text-gray-700">
                Pilih paket yang sesuai dengan kebutuhan undangan digital Anda
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="row g-5 g-xl-10 mb-5 mb-xl-10">
        {paketList.map((paket) => (
          <div key={paket.id} className="col-md-6">
            <div className={`card ${paket.popular ? 'border-success' : ''}`}>
              {paket.popular && (
                <div className="card-header border-0 pt-5">
                  <div className="text-center">
                    <span className="badge badge-success fs-7 fw-bold">PALING POPULER</span>
                  </div>
                </div>
              )}
              
              <div className="card-body text-center pt-7 pb-5">
                {/* Package Name */}
                <div className="d-flex flex-center">
                  <span className={`badge badge-light-${paket.color} px-3 py-2 fs-7 fw-bold text-uppercase mb-3`}>
                    {paket.nama}
                  </span>
                </div>

                {/* Price */}
                <div className="text-center">
                  <span className="mb-2 text-primary">Rp</span>
                  <span className="fs-3x fw-bold text-primary">
                    {paket.harga.toLocaleString()}
                  </span>
                  {paket.originalPrice && (
                    <span className="fs-7 text-muted text-decoration-line-through ms-2">
                      Rp {paket.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Discount Badge */}
                {paket.originalPrice && (
                  <div className="text-center mb-5">
                    <span className="badge badge-light-danger">
                      Hemat {Math.round(((paket.originalPrice - paket.harga) / paket.originalPrice) * 100)}%
                    </span>
                  </div>
                )}

                {/* Features List */}
                <div className="pt-1">
                  {paket.fitur.map((fitur, i) => (
                    <div key={i} className="d-flex align-items-center mb-5">
                      <span className="fw-semibold fs-6 text-gray-800 flex-grow-1 pe-3">
                        {fitur}
                      </span>
                      <i className={`ki-duotone ki-check-circle fs-1 text-${paket.color}`}>
                        <span className="path1"></span>
                        <span className="path2"></span>
                      </i>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="card-footer d-flex flex-center flex-column">
                <button
                  onClick={() => handlePilihPaket(paket)}
                  className={`btn btn-${paket.color} btn-lg w-100 mb-5`}
                >
                  Pilih Paket {paket.nama}
                </button>
                <div className="text-sm text-gray-500">
                  Pembayaran aman & terpercaya
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Features Comparison */}
      <div className="row g-5 g-xl-10 mb-5 mb-xl-10">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <h3>Perbandingan Fitur</h3>
              </div>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-row-bordered table-row-gray-100 align-middle gs-0 gy-3">
                  <thead>
                    <tr className="fw-bold text-muted">
                      <th className="min-w-140px fs-7 text-uppercase">Fitur</th>
                      <th className="min-w-120px fs-7 text-uppercase text-center">Basic</th>
                      <th className="min-w-120px fs-7 text-uppercase text-center">Premium</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="text-gray-900 fw-bold text-hover-primary fs-6">
                        Template Undangan
                      </td>
                      <td className="text-center">
                        <span className="badge badge-light-primary">1 Template</span>
                      </td>
                      <td className="text-center">
                        <span className="badge badge-light-success">Premium Templates</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="text-gray-900 fw-bold text-hover-primary fs-6">
                        Galeri Foto
                      </td>
                      <td className="text-center">
                        <i className="ki-duotone ki-check-circle fs-1 text-success">
                          <span className="path1"></span>
                          <span className="path2"></span>
                        </i>
                      </td>
                      <td className="text-center">
                        <span className="badge badge-light-success">15 Foto</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="text-gray-900 fw-bold text-hover-primary fs-6">
                        RSVP Digital
                      </td>
                      <td className="text-center">
                        <i className="ki-duotone ki-check-circle fs-1 text-success">
                          <span className="path1"></span>
                          <span className="path2"></span>
                        </i>
                      </td>
                      <td className="text-center">
                        <i className="ki-duotone ki-check-circle fs-1 text-success">
                          <span className="path1"></span>
                          <span className="path2"></span>
                        </i>
                      </td>
                    </tr>
                    <tr>
                      <td className="text-gray-900 fw-bold text-hover-primary fs-6">
                        Live Streaming
                      </td>
                      <td className="text-center">
                        <i className="ki-duotone ki-cross-circle fs-1 text-danger">
                          <span className="path1"></span>
                          <span className="path2"></span>
                        </i>
                      </td>
                      <td className="text-center">
                        <i className="ki-duotone ki-check-circle fs-1 text-success">
                          <span className="path1"></span>
                          <span className="path2"></span>
                        </i>
                      </td>
                    </tr>
                    <tr>
                      <td className="text-gray-900 fw-bold text-hover-primary fs-6">
                        Custom Domain
                      </td>
                      <td className="text-center">
                        <i className="ki-duotone ki-cross-circle fs-1 text-danger">
                          <span className="path1"></span>
                          <span className="path2"></span>
                        </i>
                      </td>
                      <td className="text-center">
                        <i className="ki-duotone ki-check-circle fs-1 text-success">
                          <span className="path1"></span>
                          <span className="path2"></span>
                        </i>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="row g-5 g-xl-10 mb-5 mb-xl-10">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <h3>Pertanyaan Umum</h3>
              </div>
            </div>
            <div className="card-body">
              <div className="accordion" id="kt_accordion_1">
                <div className="accordion-item">
                  <h2 className="accordion-header" id="kt_accordion_1_header_1">
                    <button className="accordion-button fs-4 fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#kt_accordion_1_body_1" aria-expanded="true" aria-controls="kt_accordion_1_body_1">
                      Bagaimana cara pembayaran?
                    </button>
                  </h2>
                  <div id="kt_accordion_1_body_1" className="accordion-collapse collapse show" aria-labelledby="kt_accordion_1_header_1" data-bs-parent="#kt_accordion_1">
                    <div className="accordion-body">
                      Kami menerima pembayaran melalui transfer bank, e-wallet (OVO, GoPay, DANA), dan kartu kredit. Pembayaran aman dan terpercaya.
                    </div>
                  </div>
                </div>
                <div className="accordion-item">
                  <h2 className="accordion-header" id="kt_accordion_1_header_2">
                    <button className="accordion-button fs-4 fw-semibold collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#kt_accordion_1_body_2" aria-expanded="false" aria-controls="kt_accordion_1_body_2">
                      Berapa lama proses pembuatan undangan?
                    </button>
                  </h2>
                  <div id="kt_accordion_1_body_2" className="accordion-collapse collapse" aria-labelledby="kt_accordion_1_header_2" data-bs-parent="#kt_accordion_1">
                    <div className="accordion-body">
                      Setelah pembayaran dikonfirmasi, undangan digital Anda akan siap dalam 1-2 jam kerja. Untuk revisi, maksimal 24 jam.
                    </div>
                  </div>
                </div>
                <div className="accordion-item">
                  <h2 className="accordion-header" id="kt_accordion_1_header_3">
                    <button className="accordion-button fs-4 fw-semibold collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#kt_accordion_1_body_3" aria-expanded="false" aria-controls="kt_accordion_1_body_3">
                      Apakah bisa revisi setelah jadi?
                    </button>
                  </h2>
                  <div id="kt_accordion_1_body_3" className="accordion-collapse collapse" aria-labelledby="kt_accordion_1_header_3" data-bs-parent="#kt_accordion_1">
                    <div className="accordion-body">
                      Ya, Anda bisa melakukan revisi minor seperti perubahan teks, tanggal, atau foto. Revisi major design dikenakan biaya tambahan.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Support Section */}
      <div className="row g-5 g-xl-10">
        <div className="col-12">
          <div className="card bg-light-primary">
            <div className="card-body text-center py-10">
              <i className="ki-duotone ki-message-text-2 fs-3x text-primary mb-5">
                <span className="path1"></span>
                <span className="path2"></span>
                <span className="path3"></span>
              </i>
              <h3 className="text-gray-900 fw-bold mb-3">Butuh Bantuan?</h3>
              <div className="text-gray-700 fw-semibold fs-6 mb-5">
                Tim customer service kami siap membantu Anda 24/7
              </div>
              <a 
                href="https://wa.me/your-number" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                <i className="ki-duotone ki-message-text fs-2">
                  <span className="path1"></span>
                  <span className="path2"></span>
                  <span className="path3"></span>
                </i>
                Hubungi WhatsApp Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </MetronicUserLayout>
  );
}
