// components/onboarding/OnboardingStepper.js
import { useRouter } from 'next/router';

const STEPS = [
  { key: 'package',  title: 'Pilih Paket',   href: '/onboarding' },
  { key: 'data',     title: 'Data Mempelai', href: '/onboarding/data' },
  { key: 'summary',  title: 'Ringkasan',     href: '/onboarding/summary' },
  { key: 'finish',   title: 'Selesai',       href: '/onboarding/finish' },
];

export default function OnboardingStepper({ current }) {
  const router = useRouter();
  const currentIndex = STEPS.findIndex(s => s.key === current);

  const go = (idx) => {
    // hanya boleh klik step yang sudah lewat / current
    if (idx <= currentIndex) router.push(STEPS[idx].href);
  };

  return (
    <div className="card mb-8">
      <div className="card-body py-5">
        <div className="stepper stepper-pills d-flex flex-row" data-kt-stepper="true">
          <div className="d-flex flex-row flex-wrap gap-6 w-100 justify-content-between">
            {STEPS.map((s, idx) => {
              const state =
                idx < currentIndex ? 'completed'
                : idx === currentIndex ? 'current'
                : '';
              return (
                <div
                  key={s.key}
                  className={`stepper-item ${state} cursor-pointer`}
                  onClick={() => go(idx)}
                  style={{ minWidth: 180 }}
                >
                  <div className="stepper-wrapper d-flex align-items-center">
                    <div className="stepper-icon w-40px h-40px">
                      <i className="ki-duotone ki-check fs-2 stepper-check">
                        <span className="path1"></span><span className="path2"></span>
                      </i>
                      <span className="stepper-number">{idx + 1}</span>
                    </div>
                    <div className="stepper-label ms-3">
                      <h3 className="stepper-title fw-bold mb-0">{s.title}</h3>
                      {idx < STEPS.length - 1 && <div className="stepper-line h-4px"></div>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
