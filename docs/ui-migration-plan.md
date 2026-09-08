# UI Migration Plan — Tailwind Migration

Summary
-------
This plan outlines migrating the frontend to Tailwind CSS with phased deliverables, estimates, and acceptance criteria.

Phases
------
1) Scaffold & Build (done)
   - Tailwind/PostCSS configured, build verified.
   - Acceptance: `npm run build` succeeds.

2) Core Components (1 week)
   - Convert: `Hero`, `TourCard`, `Navbar`, `Footer`, and Buttons to Tailwind components.
   - Acceptance: Visual parity, responsive at common breakpoints.

3) Pages Migration (2 weeks)
   - Migrate `Home`, `TourDetails`, `Booking`, `Admin` pages to use Tailwind components.
   - Acceptance: All routes load and functionality preserved.

4) Polish & Accessibility (1 week)
   - Add focus states, ARIA attributes, and WCAG checks. Run Lighthouse and fix performance issues.

5) Cleanup & Remove Legacy CSS (0.5 week)
   - Remove unused CSS, keep design tokens. Add prettier/linting rules.

Total estimate: ~4.5 weeks (1 engineer) — can be reduced by parallel work.

Deliverables
------------
- Tailwind components in `src/components/` (examples provided).  
- Migration checklist and rollback plan.  
- Documentation for contributors (how to add new components using Tailwind).
