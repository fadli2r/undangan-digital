import React from "react";

export default function UpcomingEventsCard({ events = [], loading = false }) {
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "aktif": return "badge-light-success";
      case "draft": return "badge-light-warning";
      case "expired": return "badge-light-danger";
      default: return "badge-light-primary";
    }
  };

  const getDaysUntilEvent = (eventDate) => {
    const today = new Date();
    const event = new Date(eventDate);
    const diffTime = event - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getUrgencyColor = (daysUntil) => {
    if (daysUntil <= 3) return "text-danger";
    if (daysUntil <= 7) return "text-warning";
    return "text-muted";
  };

  if (loading) {
    return (
      <div className="card card-flush h-xl-50 mb-5">
        <div className="card-header">
          <h3 className="card-title fw-bold">Undangan Mendekati Acara</h3>
          <span className="text-muted fs-7">≤ 14 hari ke depan</span>
        </div>
        <div className="card-body d-flex justify-content-center align-items-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card card-flush h-xl-50 mb-5">
      <div className="card-header">
        <h3 className="card-title fw-bold">Undangan Mendekati Acara</h3>
        <div className="card-toolbar">
          <span className="badge badge-light-info">
            {events.length} acara
          </span>
        </div>
      </div>
      <div className="card-body">
        {events.length ? (
          <div className="scroll-y mh-300px">
            {events.map((event, index) => {
              const daysUntil = getDaysUntilEvent(event.tanggalAcara);
              return (
                <div key={event._id || index} className="d-flex align-items-center justify-content-between py-3 border-bottom border-gray-300">
                  <div className="d-flex flex-column flex-grow-1">
                    <a 
                      href={`/edit-undangan/${event.slug}`} 
                      className="fw-bold text-gray-900 text-hover-primary text-decoration-none"
                    >
                      {event.nama}
                    </a>
                    <div className="d-flex align-items-center mt-1">
                      <span className="text-muted fs-7 me-3">
                        {new Date(event.tanggalAcara).toLocaleDateString("id-ID", { 
                          weekday: "short", 
                          year: "numeric", 
                          month: "short", 
                          day: "numeric" 
                        })}
                      </span>
                      <span className={`fs-7 fw-bold ${getUrgencyColor(daysUntil)}`}>
                        {daysUntil === 0 ? "Hari ini!" : 
                         daysUntil === 1 ? "Besok" : 
                         daysUntil > 0 ? `${daysUntil} hari lagi` : 
                         `${Math.abs(daysUntil)} hari lalu`}
                      </span>
                    </div>
                    <div className="d-flex align-items-center mt-1">
                      <span className="text-muted fs-8 me-2">
                        {event.pengunjung || 0} views
                      </span>
                      <span className="text-muted fs-8 me-2">•</span>
                      <span className="text-muted fs-8 me-2">
                        {event.rsvp || 0} RSVP
                      </span>
                      <span className="text-muted fs-8 me-2">•</span>
                      <span className="text-muted fs-8">
                        {event.ucapan || 0} ucapan
                      </span>
                    </div>
                  </div>
                  <div className="d-flex flex-column align-items-end">
                    <span className={`badge ${getStatusBadge(event.status)} fw-bold mb-2`}>
                      {event.status || 'Draft'}
                    </span>
                    <div className="d-flex gap-1">
                      <a 
                        href={`/edit-undangan/${event.slug}`}
                        className="btn btn-icon btn-sm btn-light-primary"
                        title="Edit"
                      >
                        <i className="ki-duotone ki-pencil fs-4">
                          <span className="path1"></span>
                          <span className="path2"></span>
                        </i>
                      </a>
                      <a 
                        href={`/${event.custom_slug || event.slug}`}
                        target="_blank"
                        className="btn btn-icon btn-sm btn-light-info"
                        title="Lihat"
                      >
                        <i className="ki-duotone ki-eye fs-4">
                          <span className="path1"></span>
                          <span className="path2"></span>
                          <span className="path3"></span>
                        </i>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <i className="ki-duotone ki-calendar-8 fs-3x text-gray-300 mb-3">
              <span className="path1"></span>
              <span className="path2"></span>
              <span className="path3"></span>
              <span className="path4"></span>
              <span className="path5"></span>
              <span className="path6"></span>
            </i>
            <div className="text-muted fs-6 fw-semibold mb-2">
              Tidak ada acara dalam 14 hari ke depan
            </div>
            <div className="text-muted fs-7">
              Semua undangan Anda masih jauh dari tanggal acara
            </div>
          </div>
        )}
      </div>
      {events.length > 0 && (
        <div className="card-footer py-3">
          <div className="d-flex justify-content-between align-items-center">
            <span className="text-muted fs-7">
              Menampilkan {events.length} acara mendatang
            </span>
            <a href="/dashboard?tab=calendar" className="btn btn-sm btn-light-primary">
              Lihat Kalender
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
