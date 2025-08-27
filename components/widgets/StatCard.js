import React from "react";

export default function StatCard({ title, value, subtitle, badge, right }) {
  return (
    <div className="card card-flush h-md-50">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start">
          <div className="card-title d-flex flex-column">
            <span className="fs-2hx fw-bold text-dark lh-1">{value}</span>
            <span className="text-gray-400 pt-1 fw-semibold fs-6">{title}</span>
          </div>
          {right}
        </div>
        {subtitle && <div className="text-muted fs-7 mt-3">{subtitle}</div>}
        {badge && <div className="mt-3">{badge}</div>}
      </div>
    </div>
  );
}
