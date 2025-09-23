# Migration Log

This document summarizes the migration of the React application to an Angular application.

## File Mappings

| React File | Angular File |
| --- | --- |
| `src/components/AboutSection.jsx` | `src/app/components/about-section/about-section.component.{ts,html}` |
| `src/components/AppBackground.jsx` | `src/app/components/app-background/app-background.component.{ts,html}` |
| `src/components/Navigation.jsx` | `src/app/components/navigation/navigation.component.{ts,html,css}` |
| `src/components/Footer.jsx` | `src/app/components/footer/footer.component.{ts,html}` |
| `src/components/ProjectsSection.jsx` | `src/app/components/projects-section/projects-section.component.{ts,html}` |
| `src/components/AwardsSection.jsx` | `src/app/components/awards-section/awards-section.component.{ts,html}` |
| `src/components/PageWrapper.jsx` | `src/app/components/page-wrapper/page-wrapper.component.{ts,html}` |
| `src/pages/HomePage.jsx` | `src/app/pages/home-page/home-page.component.{ts,html}` |
| `src/pages/AboutPage.jsx` | `src/app/pages/about-page/about-page.component.{ts,html}` |
| `src/pages/ProjectsPage.jsx` | `src/app/pages/projects-page/projects-page.component.{ts,html}` |
| `src/pages/AwardsPage.jsx` | `src/app/pages/awards-page/awards-page.component.{ts,html}` |
| `src/pages/ContactPage.jsx` | `src/app/pages/contact-page/contact-page.component.{ts,html}` |
| `src/App.jsx` | `src/app/app.component.{ts,html}` |
| `src/main.jsx` | `src/main.ts` |
| `src/index.css` | `src/styles.css` (Tailwind directives) |
| `public/` | `public/` (served as assets via angular.json) |
| `package.json` | `package.json` |

## Routing
- React Router routes in `App.jsx` → Angular routes in `src/app/app-routing.module.ts`:
  - `/` → `HomePageComponent`
  - `/about` → `AboutPageComponent`
  - `/projects` → `ProjectsPageComponent`
  - `/awards` → `AwardsPageComponent`
  - `/contact` → `ContactPageComponent`

## Styling
- TailwindCSS retained. Config at `project-angular/tailwind.config.js` and `postcss.config.js`.
- Global styles moved to `src/styles.css` with `@tailwind base; @tailwind components; @tailwind utilities;`.
- Ported custom classes from React `src/index.css` (glass effects, hero styles, section dividers) to Angular `src/styles.css` to maintain UI parity.

## Libraries mapped / replacements
- framer-motion (React) → Angular animations (recommended) or lightweight CSS/IntersectionObserver. Current migration keeps structure; animations to be added with `@angular/animations`.
- lucide-react → placeholder `<i class="lucide-icon">...</i>`. Suggested replacements:
  - `lucide-angular`, `@iconify/angular`, or SVG inline components.
- shadcn/ui (button, tabs, toaster) → not available in Angular. Suggested Angular equivalents:
  - Buttons: keep Tailwind-styled `<button>`/`<a>` or use Angular Material (`@angular/material/button`).
  - Tabs: Angular Material `MatTabGroup` or PrimeNG `TabView`.
  - Toasts: `ngx-toastr` or PrimeNG `Toast`.

## Environments & config
- `.env` (if any) → Angular `src/environments/environment.ts` and `environment.prod.ts` (pending if needed).

## State & services
- No Redux detected. Use lightweight RxJS services with `BehaviorSubject` if/when cross-component state is needed (pending services after reviewing data flows).

## Tests
- Unit tests: Jasmine/Karma scaffold present (Angular CLI). Converting critical tests is pending.
- E2E: Add Playwright or Cypress (pending).

## Checklist
- [x] Create Angular workspace and CLI config
- [x] TailwindCSS + PostCSS setup
- [x] Core shell (AppComponent, routing, basic pages)
- [x] Convert AboutSection, Navigation, Footer, AppBackground
- [x] Convert ProjectsSection and PageWrapper
- [x] Convert AwardsPage, ContactPage
- [ ] Replace Tabs with Angular equivalent
- [ ] Add Toast service (`ngx-toastr`) and wire used toasts
- [ ] Replace icons with `lucide-angular`/Iconify or inline SVGs
- [ ] Add Angular animations to match framer-motion effects
- [ ] Verify responsiveness and parity
- [ ] Add environments, services (HTTP) where needed
- [ ] Write README run/build/test instructions and notes
- [ ] Add basic e2e and key unit tests

## Pending UI library tasks
- Replace placeholder `.lucide-icon` elements with a real icon library (`@iconify/angular` or `lucide-angular`).
- Add ngx-toastr for toasts used on contact form submit.
- Consider Angular animations for hero/sections to match framer-motion.

## Notable Changes
- `src/components/HeroSection.jsx` → `src/app/components/hero-section/hero-section.component.{ts,html}`
- Home CTA implemented inline in HomePage template to replace `HomeContactCta` for now.
