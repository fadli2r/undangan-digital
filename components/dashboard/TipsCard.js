import React, { useState } from "react";

export default function TipsCard({ 
  stats = {}, 
  customTips = [],
  showDismiss = true 
}) {
  const [dismissedTips, setDismissedTips] = useState([]);

  const generateTips = () => {
    const tips = [];
    const { conversion = 0, avgUcapanPerUndangan = 0, pengunjungDelta = 0, totalPengunjung = 0, totalRSVP = 0 } = stats;

    // Conversion rate tips
    if (conversion < 20) {
      tips.push({
        id: 'low-conversion',
        type: 'warning',
        icon: 'ki-duotone ki-arrow-up',
        title: `Conversion Rate ${conversion}%`,
        description: 'Tingkatkan RSVP dengan mengirim reminder via WhatsApp atau grup keluarga.',
        action: {
          label: 'Pelajari Tips RSVP',
          href: '/panduan/rsvp-tips'
        }
      });
    } else if (conversion >= 20 && conversion < 40) {
      tips.push({
        id: 'good-conversion',
        type: 'success',
        icon: 'ki-duotone ki-check-circle',
        title: `Conversion Rate ${conversion}%`,
        description: 'Bagus! Tingkatkan lagi dengan menambahkan countdown timer di undangan.',
        action: {
          label: 'Upgrade Template',
          href: '/paket'
        }
      });
    }

    // Ucapan tips
    if (avgUcapanPerUndangan < 5) {
      tips.push({
        id: 'low-wishes',
        type: 'info',
        icon: 'ki-duotone ki-message-text-2',
        title: `Rata-rata ${avgUcapanPerUndangan} Ucapan`,
        description: 'Tambahkan CTA "Tulis Ucapan & Doa" yang lebih menarik di undangan.',
        action: {
          label: 'Edit Template',
          href: '/edit-undangan'
        }
      });
    }

    // Traffic tips
    if (pengunjungDelta < 0) {
      tips.push({
        id: 'declining-traffic',
        type: 'danger',
        icon: 'ki-duotone ki-arrow-down',
        title: `Pengunjung Turun ${Math.abs(pengunjungDelta)}%`,
        description: 'Bagikan ulang link undangan di media sosial atau grup WhatsApp.',
        action: {
          label: 'Copy Link',
          onClick: () => {
            // This would copy the invitation link
            navigator.clipboard.writeText(window.location.origin + '/undangan/your-slug');
            alert('Link berhasil disalin!');
          }
        }
      });
    } else if (pengunjungDelta > 20) {
      tips.push({
        id: 'growing-traffic',
        type: 'success',
        icon: 'ki-duotone ki-arrow-up',
        title: `Pengunjung Naik ${pengunjungDelta}%`,
        description: 'Momentum bagus! Pertahankan dengan posting story Instagram atau status WhatsApp.',
        action: {
          label: 'Download QR Code',
          href: '/qr-generator'
        }
      });
    }

    // General tips based on stats
    if (totalPengunjung > 0 && totalRSVP === 0) {
      tips.push({
        id: 'no-rsvp',
        type: 'warning',
        icon: 'ki-duotone ki-information-5',
        title: 'Belum Ada RSVP',
        description: 'Undangan sudah dilihat tapi belum ada yang RSVP. Coba hubungi langsung keluarga terdekat.',
        action: {
          label: 'Lihat Analytics',
          href: '/analytics'
        }
      });
    }

    return [...tips, ...customTips];
  };

  const allTips = generateTips().filter(tip => !dismissedTips.includes(tip.id));

  const dismissTip = (tipId) => {
    setDismissedTips(prev => [...prev, tipId]);
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'danger': return 'danger';
      case 'info': return 'info';
      default: return 'primary';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'success': return 'ki-duotone ki-check-circle';
      case 'warning': return 'ki-duotone ki-warning';
      case 'danger': return 'ki-duotone ki-cross-circle';
      case 'info': return 'ki-duotone ki-information-5';
      default: return 'ki-duotone ki-bulb';
    }
  };

  if (allTips.length === 0) {
    return (
      <div className="card card-flush">
        <div className="card-header">
          <h3 className="card-title fw-bold">Tips Optimasi</h3>
        </div>
        <div className="card-body text-center py-8">
          <i className="ki-duotone ki-medal-star fs-3x text-success mb-3">
            <span className="path1"></span>
            <span className="path2"></span>
            <span className="path3"></span>
            <span className="path4"></span>
          </i>
          <div className="text-gray-900 fw-bold fs-6 mb-2">Semua Tips Sudah Diterapkan!</div>
          <div className="text-muted fs-7">Undangan Anda sudah optimal. Terus pantau performa di analytics.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="card card-flush">
      <div className="card-header">
        <h3 className="card-title fw-bold">Tips Optimasi</h3>
        <div className="card-toolbar">
          <span className="badge badge-light-primary">{allTips.length} tips</span>
        </div>
      </div>
      <div className="card-body">
        <div className="scroll-y mh-300px">
          {allTips.map((tip, index) => (
            <div key={tip.id || index} className={`alert alert-${getTypeColor(tip.type)} d-flex align-items-center p-4 mb-3`}>
              <div className="d-flex flex-column flex-grow-1">
                <div className="d-flex align-items-center mb-2">
                  <i className={`${tip.icon || getTypeIcon(tip.type)} fs-2 text-${getTypeColor(tip.type)} me-3`}>
                    <span className="path1"></span>
                    <span className="path2"></span>
                    <span className="path3"></span>
                  </i>
                  <h5 className="mb-0 fw-bold">{tip.title}</h5>
                  {showDismiss && (
                    <button 
                      className="btn btn-sm btn-icon btn-light-danger ms-auto"
                      onClick={() => dismissTip(tip.id)}
                      title="Tutup tip ini"
                    >
                      <i className="ki-duotone ki-cross fs-3">
                        <span className="path1"></span>
                        <span className="path2"></span>
                      </i>
                    </button>
                  )}
                </div>
                <p className="text-gray-700 mb-2 fs-7">{tip.description}</p>
                {tip.action && (
                  <div>
                    {tip.action.href ? (
                      <a 
                        href={tip.action.href} 
                        className={`btn btn-sm btn-light-${getTypeColor(tip.type)}`}
                        target={tip.action.external ? '_blank' : '_self'}
                      >
                        {tip.action.label}
                        {tip.action.external && (
                          <i className="ki-duotone ki-arrow-top-right fs-4 ms-1">
                            <span className="path1"></span>
                            <span className="path2"></span>
                            <span className="path3"></span>
                          </i>
                        )}
                      </a>
                    ) : tip.action.onClick ? (
                      <button 
                        onClick={tip.action.onClick}
                        className={`btn btn-sm btn-light-${getTypeColor(tip.type)}`}
                      >
                        {tip.action.label}
                      </button>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {dismissedTips.length > 0 && (
          <div className="text-center mt-4">
            <button 
              className="btn btn-sm btn-light-primary"
              onClick={() => setDismissedTips([])}
            >
              <i className="ki-duotone ki-arrows-circle fs-4 me-1">
                <span className="path1"></span>
                <span className="path2"></span>
              </i>
              Tampilkan Semua Tips
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
