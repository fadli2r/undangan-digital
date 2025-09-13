import React from "react";

export default function QuickActionsCard({ actions = [], customActions = [] }) {
  const defaultActions = [
    {
      id: 'create-invitation',
      label: 'Buat Undangan',
      icon: 'ki-duotone ki-plus',
      href: '/buat-undangan',
      color: 'primary',
      description: 'Buat undangan digital baru'
    },
    {
      id: 'choose-template',
      label: 'Undangan Saya',
      icon: 'ki-duotone ki-element-7',
      href: '/edit-undangan',
      color: 'info',
      description: 'Edit undangan kamu'
    },
    {
      id: 'view-packages',
      label: 'Lihat Paket',
      icon: 'ki-duotone ki-basket',
      href: '/paket',
      color: 'success',
      description: 'Upgrade ke paket premium'
    },
    {
      id: 'help-guide',
      label: 'Panduan',
      icon: 'ki-duotone ki-information-5',
      href: '/panduan',
      color: 'warning',
      description: 'Pelajari cara menggunakan platform'
    }
  ];

  const allActions = actions.length > 0 ? actions : [...defaultActions, ...customActions];

  const getIconPaths = (iconClass) => {
    const paths = [];
    if (iconClass.includes('plus')) {
      paths.push(<span key="path1" className="path1"></span>);
      paths.push(<span key="path2" className="path2"></span>);
    } else if (iconClass.includes('element-7')) {
      paths.push(<span key="path1" className="path1"></span>);
      paths.push(<span key="path2" className="path2"></span>);
      paths.push(<span key="path3" className="path3"></span>);
      paths.push(<span key="path4" className="path4"></span>);
    } else if (iconClass.includes('basket')) {
      paths.push(<span key="path1" className="path1"></span>);
      paths.push(<span key="path2" className="path2"></span>);
      paths.push(<span key="path3" className="path3"></span>);
      paths.push(<span key="path4" className="path4"></span>);
    } else if (iconClass.includes('information-5')) {
      paths.push(<span key="path1" className="path1"></span>);
      paths.push(<span key="path2" className="path2"></span>);
      paths.push(<span key="path3" className="path3"></span>);
    }
    return paths;
  };

  return (
    <div className="card card-flush">
      <div className="card-header">
        <h3 className="card-title fw-bold">Aksi Cepat</h3>
        <div className="card-toolbar">
          <span className="text-muted fs-7">Akses fitur utama dengan cepat</span>
        </div>
      </div>
      <div className="card-body">
        <div className="row g-3">
          {allActions.map((action, index) => (
            <div key={action.id || index} className="col-md-6 col-lg-3">
              <div className="card card-flush border border-gray-300 h-100">
                <div className="card-body text-center p-4">
                  <div className={`symbol symbol-50px symbol-circle bg-light-${action.color} mb-3 mx-auto`}>
                    <div className="symbol-label">
                      <i className={`${action.icon} fs-2x text-${action.color}`}>
                        {getIconPaths(action.icon)}
                      </i>
                    </div>
                  </div>
                  <div className="mb-2">
                    <h4 className="fw-bold text-gray-900 mb-1">{action.label}</h4>
                    {action.description && (
                      <p className="text-muted fs-7 mb-0">{action.description}</p>
                    )}
                  </div>
                  {action.href ? (
                    <a 
                      href={action.href} 
                      className={`btn btn-sm btn-light-${action.color} w-100`}
                      target={action.external ? '_blank' : '_self'}
                    >
                      {action.buttonText || 'Akses'}
                      {action.external && (
                        <i className="ki-duotone ki-arrow-top-right fs-4 ms-1">
                          <span className="path1"></span>
                          <span className="path2"></span>
                          <span className="path3"></span>
                        </i>
                      )}
                    </a>
                  ) : action.onClick ? (
                    <button 
                      onClick={action.onClick}
                      className={`btn btn-sm btn-light-${action.color} w-100`}
                    >
                      {action.buttonText || 'Akses'}
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Additional Quick Stats */}
        <div className="separator separator-dashed my-6"></div>
        <div className="row g-3">
          <div className="col-4 text-center">
            <div className="fs-2hx fw-bold text-primary">5</div>
            <div className="fs-7 text-muted">Template Gratis</div>
          </div>
          <div className="col-4 text-center">
            <div className="fs-2hx fw-bold text-success">∞</div>
            <div className="fs-7 text-muted">Undangan Unlimited</div>
          </div>
          <div className="col-4 text-center">
            <div className="fs-2hx fw-bold text-info">24/7</div>
            <div className="fs-7 text-muted">Support</div>
          </div>
        </div>
      </div>
    </div>
  );
}
