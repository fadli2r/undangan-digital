// /components/KPICard.js
'use client'

import React, { useMemo } from 'react';

function getContrastColor(bg) {
  if (!bg) return '#1B1B29';
  // normalize hex like #F1416C or rgb(...)
  let r, g, b;
  if (bg.startsWith('#')) {
    const hex = bg.replace('#','');
    const full = hex.length === 3
      ? hex.split('').map(c=>c+c).join('')
      : hex.padEnd(6,'0');
    r = parseInt(full.slice(0,2),16);
    g = parseInt(full.slice(2,4),16);
    b = parseInt(full.slice(4,6),16);
  } else if (bg.startsWith('rgb')) {
    const nums = bg.match(/\d+(\.\d+)?/g)?.map(Number) || [27,27,41];
    [r,g,b] = nums;
  } else {
    // fallback ke dark text
    return '#1B1B29';
  }
  // relative luminance
  const [R,G,B] = [r,g,b].map(v=>{
    v/=255;
    return v<=0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4);
  });
  const L = 0.2126*R + 0.7152*G + 0.0722*B;
  return L > 0.51 ? '#1B1B29' : '#FFFFFF';
}

function DuotoneIcon({ name, className, color }) {
  return (
    <i className={`ki-duotone ${name} ${className}`} style={{ color }}>
      <span className="path1"></span>
      <span className="path2"></span>
      <span className="path3"></span>
      <span className="path4"></span>
      <span className="path5"></span>
      <span className="path6"></span>
      <span className="path7"></span>
      <span className="path8"></span>
      <span className="path9"></span>
      <span className="path10"></span>
    </i>
  );
}

/**
 * Metronic Mixed Widget 13-like KPI card
 */
export default function KPICard({
  title,
  value,
  icon = 'ki-chart-simple',
  backgroundColor = '#F7D9E3',
  textColor,                 // optional override
  linkHref = '#',
  chartId,                   // optional chart placeholder id
  currencySymbol,            // e.g. "$"
  subtitle,                  // { label, value }
  trend,                     // { value: number, label: string }
  badge,                     // ReactNode
}) {
  const resolvedText = useMemo(
    () => textColor || getContrastColor(backgroundColor),
    [textColor, backgroundColor]
  );

  const valueText = typeof value === 'number'
    ? value.toLocaleString('id-ID')
    : (value ?? '-');

  const isTrendUp = trend && Number(trend.value) >= 0;

  return (
    <div
      className="card card-xl-stretch mb-xl-8 theme-dark-bg-body"
      style={{ backgroundColor }}
    >
      <div className="card-body d-flex flex-column">
        {/* Header: Title + Icon */}
        <div className="d-flex flex-column flex-grow-1 position-relative">
          <a
            href={linkHref}
            className="fw-bold fs-3 text-hover-primary"
            style={{ color: resolvedText }}
          >
            {title}
          </a>

          {/* Top-right icon */}
          <div className="position-absolute top-0 end-0 me-1 mt-1">
            <DuotoneIcon
              name={icon.replace('ki-duotone ', '').trim()}
              className="fs-2x"
              color={resolvedText + 'CC'} // 80% opacity
            />
          </div>

          {/* Chart slot (optional) */}
          <div
            className="mixed-widget-13-chart mt-4"
            id={chartId}
            style={{ height: 100 }}
          />
        </div>

        {/* Stats */}
        <div className="pt-5">
          {currencySymbol && (
            <span className="fw-bold fs-2x lh-0 me-1" style={{ color: resolvedText }}>
              {currencySymbol}
            </span>
          )}
          <span className="fw-bold fs-3x me-2 lh-0" style={{ color: resolvedText }}>
            {valueText}
          </span>
          {trend && (
            <span className="fw-bold fs-6 lh-0" style={{ color: resolvedText }}>
              {`${isTrendUp ? '+ ' : '- '}${Math.abs(Number(trend.value))}% ${trend.label}`}
            </span>
          )}
        </div>

        {/* Optional subtitle row */}
        {subtitle && (
          <div className="d-flex justify-content-between align-items-center mt-4">
            <span className="fw-semibold fs-7" style={{ color: resolvedText, opacity: 0.8 }}>
              {subtitle.label}
            </span>
            <span className="fw-bold fs-7" style={{ color: resolvedText }}>
              {subtitle.value}
            </span>
          </div>
        )}

        {/* Optional custom badge/content block */}
        {badge && <div className="mt-3">{badge}</div>}
      </div>
    </div>
  );
}
