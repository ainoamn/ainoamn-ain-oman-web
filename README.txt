# Ain Oman — Pages Bundle

This ZIP contains fixed Next.js **Pages Router** screens + a corrected `src/lib/i18n.tsx`:

- partners, reviews, badges, tasks
- accounts, manage-properties, hoa, invest
- policies: terms, privacy, faq
- auctions: index (Google Maps dynamic import fix)

## Usage
1. Unzip into your project root, merging into the existing `src/` directory.
2. Ensure you have Header/Footer components available at `@/components/layout/{Header,Footer}`.
3. Replace your `src/lib/i18n.tsx` with the provided one (includes `getT()` and `getDir()`).
4. If you use Google Maps on Auctions page, set `.env.local`:
```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_KEY
```
5. Install deps if needed:
```
npm i @react-google-maps/api
```
6. Run dev:
```
npm run dev
```

All pages use RTL/LTR via `useI18n().dir`. Each page has a single `default export` named `Page` and renders a named `<Content />` inside.