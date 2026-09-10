# 🎨 UI Development Guide — Lunaris

> This guide is specifically for teammates who want to modify or improve the UI design.

---

## How the UI is built

The UI uses **Tailwind CSS v4** utility classes. You don't need any external component library — everything is custom.

### Design system tokens (in `app/globals.css`)

```css
@theme {
  /* Main ISRO blue palette — used as bg-isro-*, text-isro-*, border-isro-* */
  --color-isro-50:  #eff6ff;
  --color-isro-100: #dbeafe;
  --color-isro-500: #3b82f6;
  --color-isro-600: #2563eb;
  --color-isro-700: #1d4ed8;  ← primary action color
  --color-isro-900: #1e3a8a;
}
```

**To change the entire color scheme:** update `--color-isro-700` and the gradient stops in `TemporalPredictor.tsx`.

---

## Component Map

### 🏠 Dashboard Shell — `components/dashboard/Dashboard.tsx`
Controls top bar, sidebar, and which page is shown.
- To add a new page: add a new `ViewState` in `types/index.ts` and a new `if` branch in the JSX.

### 📋 Sidebar — `components/layout/Sidebar.tsx`
Left navigation. To add a nav item:
```tsx
{ id: 'mypage', label: 'My Page', icon: <SomeIcon size={18} />, section: 'main', view: 'MY_VIEW' }
```

### 📤 Upload Page — `components/upload/UploadView.tsx`
The main image upload zone with PRADAN fetch.

### 📊 Result Page — `components/result/ResultView.tsx`
Shows tie-points, RANSAC metrics, chemical composition.

### 🕐 Page 6 — `components/temporal/TemporalPredictor.tsx`
Time-based appearance prediction with compare slider and heatmap.

---

## Adding a new page

1. Add to `types/index.ts`:
```ts
export type ViewState = 'UPLOAD' | 'RESULT' | 'TEMPORAL' | 'MY_NEW_PAGE';
```

2. Create `components/mypage/MyPage.tsx`

3. Add to `Sidebar.tsx` nav items:
```tsx
{ id: 'mypage', label: 'My Page', icon: <Icon size={18} />, section: 'main', view: 'MY_NEW_PAGE' }
```

4. Add to `Dashboard.tsx` routing:
```tsx
} : viewState === 'MY_NEW_PAGE' ? (
  <MyPage />
) : (
```

---

## Fonts

The project uses **Inter** loaded from Google Fonts CDN (in `app/layout.tsx`).
To change the font, replace the `<link>` in `app/layout.tsx`.

---

## Icons

Uses `lucide-react`. Browse all icons at https://lucide.dev/icons/
Import like:
```tsx
import { RocketIcon, MoonIcon } from 'lucide-react';
```

---

## Animations

Defined in `app/globals.css`. The main one used is `animate-fade-in`.
Add new animations in the `@keyframes` block and register them in `@theme`.

---

## Dark Mode

Dark mode is **not implemented yet** — this is a good task for teammates!
Tailwind v4 supports dark mode via `dark:` prefix. To enable:
1. Add `darkMode: 'class'` to `next.config.ts`
2. Add a theme toggle button in `Dashboard.tsx`
3. Add `dark:` variants to components

---

## File Size Guide

| File | Lines | Complexity |
|------|-------|-----------|
| TemporalPredictor.tsx | ~700 | High — main Page 6 |
| ResultView.tsx | ~500 | High — charts + tie-points |
| UploadView.tsx | ~600 | High — drag-drop + PRADAN |
| Dashboard.tsx | ~150 | Low — shell only |
| Sidebar.tsx | ~160 | Low — nav only |
| api.ts | ~450 | Medium — mock + backend |
