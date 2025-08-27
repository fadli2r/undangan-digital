import dynamic from "next/dynamic";
import { useMemo } from "react";
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function AreaChartCard({ title = "Statistik Pengunjung", series = [], categories = [] }) {
  const options = useMemo(() => ({
    chart: { type: "area", toolbar: { show: false }, zoom: { enabled: false }, fontFamily: 'inherit' },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 3 },
    fill: { type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.05, stops: [0, 90, 100] } },
    xaxis: { categories, axisBorder: { show: false }, axisTicks: { show: false }, labels: { style: { colors: "#A1A5B7" } } },
    yaxis: { labels: { style: { colors: "#A1A5B7" } } },
    grid: { borderColor: "#F1F1F2", strokeDashArray: 4, yaxis: { lines: { show: true } } },
    legend: { show: false },
    colors: ["#0d6efd"],
    tooltip: { theme: "light" },
  }), [categories]);

  return (
    <div className="card card-flush h-100">
      <div className="card-header">
        <h3 className="card-title">{title}</h3>
      </div>
      <div className="card-body pt-5">
        <ReactApexChart options={options} series={series} type="area" height={280} />
      </div>
    </div>
  );
}
