# Metronic Integration Guide

## Step 1: Download & Extract Metronic
1. Download Metronic dari https://keenthemes.com/metronic
2. Extract file zip
3. Ambil folder berikut dari hasil extract:
   - `assets/` (CSS, JS, media files)
   - `src/` (HTML templates untuk referensi)

## Step 2: Setup Project Structure
```
public/
├── metronic/
│   ├── css/
│   │   ├── style.bundle.css
│   │   └── plugins.bundle.css
│   ├── js/
│   │   ├── scripts.bundle.js
│   │   └── plugins.bundle.js
│   ├── media/
│   │   ├── logos/
│   │   ├── icons/
│   │   └── illustrations/
│   └── plugins/
│       ├── global/
│       └── custom/
```

## Step 3: Manual Copy Process
1. Copy `metronic/assets/css/` → `public/metronic/css/`
2. Copy `metronic/assets/js/` → `public/metronic/js/`
3. Copy `metronic/assets/media/` → `public/metronic/media/`
4. Copy `metronic/assets/plugins/` → `public/metronic/plugins/`

## Step 4: Next.js Configuration
Update next.config.js untuk handle static assets

## Step 5: Create Layout Components
- MetronicAdminLayout.js
- MetronicUserLayout.js
- Shared components

## Alternative: CDN Method
Jika tidak ingin download manual, bisa gunakan CDN:
```html
<link href="https://cdn.jsdelivr.net/npm/metronic@8.1.8/dist/css/style.bundle.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/metronic@8.1.8/dist/js/scripts.bundle.js"></script>
