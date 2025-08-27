import React from "react";

export default function NotificationPanel({ notifications = [], loading = false }) {
  if (loading) {
    return (
      <div className="card card-flush h-xl-50 mb-5">
        <div className="card-header pt-7">
          <h3 className="card-title align-items-start flex-column">
            <span className="card-label fw-bold fs-3 mb-1">Notifikasi</span>
            <span className="text-muted mt-1 fw-semibold fs-7">Aktivitas terbaru</span>
          </h3>
        </div>
        <div className="card-body pt-6 d-flex justify-content-center align-items-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return 'ki-duotone ki-check-circle fs-2 text-success';
      case 'info':
        return 'ki-duotone ki-information-5 fs-2 text-info';
      case 'warning':
        return 'ki-duotone ki-warning fs-2 text-warning';
      case 'danger':
        return 'ki-duotone ki-cross-circle fs-2 text-danger';
      default:
        return 'ki-duotone ki-notification-bing fs-2 text-primary';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'success': return 'text-success';
      case 'info': return 'text-info';
      case 'warning': return 'text-warning';
      case 'danger': return 'text-danger';
      default: return 'text-primary';
    }
  };

  return (
    <div className="card card-flush h-xl-50 mb-5">
      <div className="card-header pt-7">
        <h3 className="card-title align-items-start flex-column">
          <span className="card-label fw-bold fs-3 mb-1">Notifikasi</span>
          <span className="text-muted mt-1 fw-semibold fs-7">Aktivitas terbaru</span>
        </h3>
        {notifications.length > 0 && (
          <div className="card-toolbar">
            <button className="btn btn-sm btn-light-primary">
              <i className="ki-duotone ki-check fs-2"></i>
              Tandai Semua Dibaca
            </button>
          </div>
        )}
      </div>
      <div className="card-body pt-6">
        {notifications.length ? (
          <div className="timeline-label">
            {notifications.map((notification, index) => (
              <div key={notification.id || index} className="timeline-item">
                <div className="timeline-label fw-bold text-gray-800 fs-6">
                  {notification.waktu}
                </div>
                <div className="timeline-badge">
                  <i className={getNotificationIcon(notification.type)}></i>
                </div>
                <div className="timeline-content ps-3">
                  <div className="fw-normal text-muted">
                    {notification.pesan}
                  </div>
                  {notification.action && (
                    <div className="mt-2">
                      <button 
                        className={`btn btn-sm btn-light-${notification.type || 'primary'}`}
                        onClick={notification.action.onClick}
                      >
                        {notification.action.label}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <i className="ki-duotone ki-notification-bing fs-3x text-gray-300 mb-3">
              <span className="path1"></span>
              <span className="path2"></span>
              <span className="path3"></span>
            </i>
            <div className="text-muted fs-6 fw-semibold">Belum ada notifikasi</div>
            <div className="text-muted fs-7 mt-1">
              Notifikasi akan muncul ketika ada aktivitas baru
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
