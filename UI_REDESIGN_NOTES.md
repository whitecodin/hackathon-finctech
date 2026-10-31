# Classic UI/UX redesign

Implemented locally (31 October 2026):
- Persistent White / Black theme in ThemeContext and global CSS.
- Simplified landing page with a single secure Google sign-in action. Removed ineffective PIN/register/demo controls.
- Language picker in landing and dashboard.
- Plain labels: My Shop, Shop Rankings, My Transactions, Savings & Safety, Loan Readiness, Ask for Help, etc.
- Mobile menu with overlay, large buttons, reduced decoration, keyboard-focus visibility and reduced-motion support.
- Consistent neutral color palette, larger tap targets and simpler headline hierarchy.
- Theme preferences stored in browser localStorage.

Caveats:
- Dashboard legacy views use many hard-coded utility colors, so dark mode includes CSS compatibility overrides but needs comprehensive visual regression testing.
- No runtime build or browser validation was possible through the Windows MCP process runner (Node.js was not available).
- Core financial platform remains an incomplete prototype and must not be used with real customer data.
- Do not interpret UI redesign as validation of financial claims or security of existing modules.

When Node.js is installed, run:
  npm install
  npm run lint
  npm run build

Then test both themes at 360px, 768px and desktop widths; check keyboard focus, tab sequence, screen reader labels, and all routed views.
