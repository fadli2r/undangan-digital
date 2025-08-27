import dynamic from "next/dynamic";
import { useMemo } from "react";
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function ChartCard({ 
  title = "Chart", 
  subtitle,
  type = "area",
  series = [], 
  categories = [],
  height = 280,
  loading = false,
  colors = ["#0d6efd"],
  customOptions = {},
  showToolbar = false,
  showLegend = false
}) {
  const chartOptions = useMemo(() => {
    const baseOptions = {
      chart: { 
        type, 
        toolbar: { show: showToolbar }, 
        zoom: { enabled: false }, 
        fontFamily: 'inherit',
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800,
          animateGradually: {
            enabled: true,
            delay: 150
          },
          dynamicAnimation: {
            enabled: true,
            speed: 350
          }
        }
      },
      dataLabels: { enabled: false },
      colors,
      legend: { show: showLegend },
      tooltip: { 
        theme: "light",
        x: {
          format: 'dd MMM yyyy'
        }
      },
      grid: { 
        borderColor: "#F1F1F2", 
        strokeDashArray: 4, 
        yaxis: { lines: { show: true } },
        xaxis: { lines: { show: false } }
      }
    };

    // Type-specific options
    if (type === "area") {
      baseOptions.stroke = { curve: "smooth", width: 3 };
      baseOptions.fill = { 
        type: "gradient", 
        gradient: { 
          shadeIntensity: 1, 
          opacityFrom: 0.35, 
          opacityTo: 0.05, 
          stops: [0, 90, 100] 
        } 
      };
    } else if (type === "line") {
      baseOptions.stroke = { curve: "smooth", width: 2 };
    } else if (type === "bar") {
      baseOptions.plotOptions = {
        bar: {
          borderRadius: 4,
          horizontal: false,
          columnWidth: '60%',
        }
      };
    } else if (type === "donut" || type === "pie") {
      baseOptions.plotOptions = {
        pie: {
          donut: {
            size: type === "donut" ? '70%' : '0%'
          }
        }
      };
      baseOptions.legend = { 
        show: true,
        position: 'bottom'
      };
    }

    // Axis options for non-pie charts
    if (type !== "donut" && type !== "pie") {
      baseOptions.xaxis = { 
        categories, 
        axisBorder: { show: false }, 
        axisTicks: { show: false }, 
        labels: { 
          style: { colors: "#A1A5B7" },
          rotate: -45
        } 
      };
      baseOptions.yaxis = { 
        labels: { 
          style: { colors: "#A1A5B7" },
          formatter: function (value) {
            return Math.round(value).toLocaleString('id-ID');
          }
        } 
      };
    }

    // Merge with custom options
    return { ...baseOptions, ...customOptions };
  }, [type, categories, colors, showToolbar, showLegend, customOptions]);

  if (loading) {
    return (
      <div className="card card-flush h-100">
        <div className="card-header">
          <h3 className="card-title">{title}</h3>
          {subtitle && <span className="text-muted fs-7">{subtitle}</span>}
        </div>
        <div className="card-body pt-5 d-flex justify-content-center align-items-center" style={{ height }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  const hasData = series.length > 0 && (
    type === "donut" || type === "pie" 
      ? series.some(s => s > 0)
      : series.some(s => s.data && s.data.length > 0)
  );

  return (
    <div className="card card-flush h-100">
      <div className="card-header">
        <div className="card-title d-flex flex-column">
          <h3 className="fw-bold mb-1">{title}</h3>
          {subtitle && <span className="text-muted fs-7">{subtitle}</span>}
        </div>
        <div className="card-toolbar">
          {hasData && (
            <div className="d-flex align-items-center gap-2">
              <button className="btn btn-sm btn-icon btn-light-primary" title="Refresh">
                <i className="ki-duotone ki-arrows-circle fs-4">
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
              </button>
              <button className="btn btn-sm btn-icon btn-light-primary" title="Download">
                <i className="ki-duotone ki-down fs-4">
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="card-body pt-5">
        {hasData ? (
          <ReactApexChart 
            options={chartOptions} 
            series={series} 
            type={type} 
            height={height} 
          />
        ) : (
          <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ height }}>
            <i className="ki-duotone ki-chart-line-up fs-3x text-gray-300 mb-3">
              <span className="path1"></span>
              <span className="path2"></span>
              <span className="path3"></span>
            </i>
            <div className="text-muted fs-6 fw-semibold mb-2">Tidak ada data untuk ditampilkan</div>
            <div className="text-muted fs-7">Data akan muncul setelah ada aktivitas di undangan Anda</div>
          </div>
        )}
      </div>
      {hasData && (
        <div className="card-footer py-3">
          <div className="d-flex justify-content-between align-items-center">
            <span className="text-muted fs-7">
              {type === "donut" || type === "pie" 
                ? `Total: ${series.reduce((a, b) => a + b, 0).toLocaleString('id-ID')}`
                : `Periode: ${categories.length} hari terakhir`
              }
            </span>
            <a href="/analytics" className="btn btn-sm btn-light-primary">
              Lihat Detail
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
