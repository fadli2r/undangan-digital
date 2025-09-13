export default function PromoCardPlurk() {
  return (
    <div className="card card-xl-stretch mb-xl-8">
      <div className="card-body d-flex flex-column pb-10 pb-lg-15">
        <div className="flex-grow-1">
          <div className="d-flex align-items-center pe-2 mb-5">
            <span className="text-muted fw-bold fs-5 flex-grow-1">7 hours ago</span>
            <div className="symbol symbol-50px">
              <span className="symbol-label bg-light">
                <img src="/metronic/assets/media/svg/brand-logos/plurk.svg" className="h-50 align-self-center" alt="" />
              </span>
            </div>
          </div>
          <a href="#" className="text-gray-900 fw-bold text-hover-primary fs-4">PitStop - Multiple Email Generator</a>
          <p className="py-3">Pitstop creates quick email campaigns.<br />We help to strengthen your brand<br />for your every purpose.</p>
        </div>
        <div className="d-flex align-items-center">
          <a href="#" className="symbol symbol-35px me-2" data-bs-toggle="tooltip" title="Ana Stone">
            <img src="/metronic/assets/media/avatars/300-6.jpg" alt="" />
          </a>
          <a href="#" className="symbol symbol-35px me-2" data-bs-toggle="tooltip" title="Mark Larson">
            <img src="/metronic/assets/media/avatars/300-5.jpg" alt="" />
          </a>
          <a href="#" className="symbol symbol-35px me-2" data-bs-toggle="tooltip" title="Sam Harris">
            <img src="/metronic/assets/media/avatars/300-9.jpg" alt="" />
          </a>
        </div>
      </div>
    </div>
  );
}
