# Migration Plan: pages/ to app/

## Root Level Files (14 files)
- [x] buat-undangan.js → app/buat-undangan/page.tsx
- [ ] dashboard.js → app/dashboard/page.tsx
- [ ] dashboard.js → app/dashboard/page.tsx
- [ ] index-metronic.js → app/index-metronic/page.tsx
- [ ] index.js → app/page.tsx (handle conflict with existing page.tsx)
- [ ] katalog.js → app/katalog/page.tsx
- [ ] kontak.js → app/kontak/page.tsx
- [ ] login.js → app/login/page.tsx
- [ ] paket.js → app/paket/page.tsx
- [ ] pilih-template.js → app/pilih-template/page.tsx
- [ ] profile.js → app/profile/page.tsx
- [ ] register.js → app/register/page.tsx
- [ ] support-center.js → app/support-center/page.tsx
- [ ] tentang.js → app/tentang/page.tsx

## Subdirectories (7 directories)
- [ ] admin/ → app/admin/ (handle conflict with existing admin/)
- [ ] edit-undangan/ → app/edit-undangan/
- [ ] onboarding/ → app/onboarding/
- [ ] paket/ → app/paket/ (handle conflict with existing paket.js)
- [ ] preview/ → app/preview/
- [ ] scanner/ → app/scanner/
- [ ] undangan/ → app/undangan/

## Special Cases
- [ ] Handle index.js vs existing page.tsx conflict
- [ ] Handle admin/ directory conflict (existing admin/ in app/)
- [ ] Handle paket/ directory vs paket.js conflict
- [ ] Update all import paths
- [ ] Convert .js to .tsx where needed
- [ ] Update API call paths if needed

## Testing
- [ ] Test all routes work correctly
- [ ] Verify component imports
- [ ] Check for broken links
