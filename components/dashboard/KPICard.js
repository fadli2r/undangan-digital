import React from "react";

export default function KPICard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  backgroundColor = "#F1416C", 
  textColor = "white",
  badge,
  trend
}) {
  return (
    <div className="card card-flush h-md-50" style={{ backgroundColor }}>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start">
          <div className="card-title d-flex flex-column">
            <span className={`fs-2hx fw-bold lh-1`} style={{ color: textColor }}>
              {typeof value === 'number' ? value.toLocaleString("id-ID") : value}
            </span>
            <span className={`pt-1 fw-semibold fs-6`} style={{ color: textColor, opacity: 0.75 }}>
              {title}
            </span>
          </div>
          {icon && (
            <i className={`${icon} fs-2x`} style={{ color: textColor, opacity: 0.75 }}>
              {icon.includes('ki-duotone') && (
                <>
                  <span className="path1"></span>
                  <span className="path2"></span>
                  {icon.includes('calendar') && <span className="path3"></span>}
                </>
              )}
            </i>
          )}
        </div>
        
        {trend && (
          <div className="d-flex align-items-center mt-3">
            <span className={`badge ${trend.value >= 0 ? "badge-light-success" : "badge-light-danger"} fw-bold me-2`}>
              {trend.value >= 0 ? "▲" : "▼"} {Math.abs(trend.value)}%
            </span>
            <span className="fs-7" style={{ color: textColor, opacity: 0.75 }}>
              {trend.label}
            </span>
          </div>
        )}

        {subtitle && (
          <div className="d-flex justify-content-between mt-4">
            <span className="fw-bolder fs-7" style={{ color: textColor, opacity: 0.75 }}>
              {subtitle.label}
            </span>
            <span className="fw-bold fs-7" style={{ color: textColor }}>
              {subtitle.value}
            </span>
          </div>
        )}

        {badge && (
          <div className="mt-3">
            {badge}
          </div>
        )}
      </div>
    </div>
  );
}
