# Smidig — static prototype

Clickable, **non-functional** prototype of the tournament marketplace described in
`Smidig_Requirements_Overview_Dark.pdf` and the 18 task files in `smidig-dev-tasks`.

Nothing is wired: no database, no auth, no payment gateway, no realtime. Every
number on screen comes from `src/lib/data.ts`.

```bash
npm run dev     # http://localhost:3000
npm run build   # production build
npm test        # 89 Playwright tests (builds + starts on :3100)
```

## Signing in

There is no real auth. `/signin` accepts any valid-looking email, you pick a
role, and the session is kept in `localStorage`. Each role lands somewhere
different and the guards are enforced.

| Role | Lands on | Can open |
| --- | --- | --- |
| Tournament organizer | `/dashboard` | the organizer console |
| Platform admin | `/admin` | the admin panel |
| Team captain / Spectator / Sponsor / Food vendor | `/me/tickets`, `/live`, `/tournaments` | public pages only |

`/dashboard` and `/admin` redirect a signed-out visitor to
`/signin?next=…` and return them afterwards. Wrong role gets
`?denied=1` and an explanation. `/onboarding` switches role.

## Screens

### Public marketplace — task 06
| Route | What it shows | Task |
| --- | --- | --- |
| `/` | Hero + search, sport switcher, live match rail, featured, entries open, three ways in, host CTA | 06 |
| `/tournaments` | Search + filters (city, format, fee, status), animated result grid, empty state | 06 |
| `/live` | Live now, starting soon, latest results | 06 |
| `/t/[slug]` | Banner, four action buttons, 7 tabs: Overview, Fixtures, Points table, Teams, Sponsors, Food & stalls, Venue | 06, 09, 11, 12 |
| `/t/[slug]/m/[no]` | Broadcast scoreboard, stream player, scorecard, commentary, ticket box with fee breakdown, sponsor strip | 06, 10, 13, 14 |
| `/t/[slug]/register` | 4-step team registration: Team → Squad → Review → Pay | 08 |
| `/me/tickets` | QR ticket wallet with valid / scanned / refunded states | 10 |
| `/host` | Organizer pitch (the landing page built earlier) | 06 |
| `/styleguide` | Every shared component, both themes | 02 |

### Organizer dashboard — task 15
| Route | What it shows | Task |
| --- | --- | --- |
| `/dashboard` | Stat cards for all 5 flows, stacked revenue chart, "Needs you", today's matches, approvals | 15 |
| `/dashboard/tournaments` | All tournaments with entry progress | 05 |
| `/dashboard/tournaments/new` | 7-step creation wizard, sport picker first | 05 |
| `/dashboard/fixtures` | Schedule with scorer and stream status | 09 |
| `/dashboard/teams` | Approve / reject entries, confirmed teams | 08 |
| `/dashboard/tickets` | Ticket types with buyer-pays vs you-receive, sales per match | 10 |
| `/dashboard/sponsors` | Packages, slots sold, logos to review | 11 |
| `/dashboard/stalls` | Zone layout and bookings | 12 |
| `/dashboard/scoring` | Ball-by-ball console: keypad, extras, wicket, undo, live strip | 13 |
| `/dashboard/scan` | Gate scanner with viewfinder and scan feed | 10 |
| `/dashboard/orders` | All orders with per-order fee | 07 |
| `/dashboard/payouts` | Connect status, balance, payout history | 07 |

### Platform admin — task 16
| Route | What it shows |
| --- | --- |
| `/admin` | GMV, fee revenue, active tournaments, revenue by flow, latest orders |
| `/admin/organizers` | Approve / reject / suspend, payout status |
| `/admin/fees` | Per-flow fee rules + live preview ("buyer pays ₹1,055, organizer gets ₹1,000, Smidig earns ₹55") |
| `/admin/orders` | Platform-wide order search and refunds |

## Built to go multi-sport

Phase 1 is cricket, but nothing is cricket-shaped except the scoring module.

- `src/lib/sports.ts` is the registry. Each sport declares its scoring model
  (`innings` / `goals` / `sets` / `timed`), its formats, its match lengths and
  what one entrant is called (Team / Player / Driver / Athlete).
- Every tournament carries a `sport` key. Cards, filters, the browse page and
  the creation wizard read their labels from the registry.
- Hockey, innebandy, tennis, badminton, car racing and marathon are already
  listed as `planned` and render as disabled chips.

Turning one on means adding its scoring module — not redesigning routing,
cards, dashboards or admin.

## Money

`src/lib/money.ts` holds amounts as **integers in minor units** with a currency,
never floats, as the task files require. `splitFee()` is the single fee
calculation, used by the ticket box, the registration wizard and the admin
preview, so all three agree.

## Motion

Each surface has its own entrance (`src/components/fx/route-transition.tsx`):
marketplace settles, browse sweeps from the side, a tournament page unrolls
from the banner down, a match page cuts in like a broadcast, the dashboard
slides in behind its sidebar, admin opens like a shutter.

Entrance only — Next's App Router unmounts the old route before the new one
paints, so exit animations would not reliably play.

## Scroll choreography

Both surfaces reveal as you reach them, rather than playing every entrance on
mount where nobody sees it.

- Sections and grids rise into place on first sight; children stagger via a CSS
  variable, so the delay costs no JS per child.
- Table rows hold their cascade until the table is in view.
- Stat cards carry a sparkline that draws itself; the revenue chart animates
  when reached.
- Section rules draw out under their heading.
- The console header condenses past 60px and carries a scroll rail.

All of it is one IntersectionObserver per element plus transform/opacity, so
scrolling stays on the compositor. Measured on a production build: dashboard
and home both **median 8.3ms, p99 9.3ms, 0 frames over 20ms**.

Hidden-until-revealed states are scoped to `html.js`, set before first paint,
so without scripting the content is simply visible.

**Deliberately not taken** from the reference library: WebGL shaders, physics,
3D card scatter, kinetic type, image-collage sliders. They are portfolio
effects; in a screen built for reading data they cost frames and hurt scanning.

## Tests

`npm test` runs 89 Playwright tests across a desktop and a Pixel 7 project.

| File | Covers |
| --- | --- |
| `tests/public.spec.ts` | home, browse filters, every tournament tab, match page, registration wizard, theme toggle |
| `tests/auth.spec.ts` | sign-in validation, each role's landing page, `next=` return, both guards, wrong-role denial, account menu, sign-out, onboarding |
| `tests/interactions.spec.ts` | every control that has no backend still answers the click |
| `tests/console.spec.ts` | all 12 organizer routes and 4 admin routes render with no console errors; sidebar, scoring keypad, undo, 7-step wizard, scanner, fee preview |
| `tests/mobile.spec.ts` | bottom tab bar, hamburger menu, reachability at phone width |

`tests/console-motion.spec.ts` runs with **motion enabled**, unlike the rest of
the suite. That matters: reduced motion short-circuits every reveal to its end
state, so a completely broken IntersectionObserver would otherwise ship green —
which nearly happened.

`tests/helpers.ts` holds `expectAllClickablesHittable`, which walks every link
and button on a page, scrolls it into view, then measures its box and asks
`elementFromPoint` what is on top — in a single in-page pass so the element
cannot move in between. That is what catches "the click does nothing".

### Forms are real now

The first pass shipped **decorative inputs**: the wizard's `Field` had no
`value` or `onChange` at all, and `Choice` was called with hard-coded values,
so match type, format, ball type, approval and the ticket toggle rendered
correctly and did nothing. The suite missed every one of them, because it only
asserted *renders + clickable + no console errors* — which a dead control
passes.

Fixed across both wizards and the order screens:

- Every field is controlled; a repo-wide audit now reports **0 inputs without
  state**.
- Start/end and registration open/close are real date pickers, with validation
  that end cannot precede start and registration cannot close before it opens
  or after the first match.
- Six banner presets and six logo presets, either replaceable by upload.
- Ticket types and sponsor tiers can be added, edited and removed.
- Publishing validates every step, jumps back to the first problem, then saves
  to `localStorage` and navigates to the list, where the new tournament appears
  with a *Just created* badge and survives a refresh.
- Team registration validates name, three-letter code, city, email and a squad
  of at least eleven.
- Order searches and filters on both consoles actually narrow the table; the
  home search carries its terms to `/tournaments` as URL params.

`tests/wizard.spec.ts` asserts **state changes** rather than presence — that a
click flips `aria-pressed`, that a bad date blocks the step, that adding a row
changes the count.

### What the tests found

1. **Content could land under the fixed bars.** Anything the browser scrolled
   to could end up beneath the floating nav, the sticky console header or the
   phone tab bar, and became untappable. Fixed with `scroll-padding-top` and
   `scroll-padding-bottom` on `html`.
2. **Dead controls.** Approve, Reject, Refund, Export, Publish, Buy package,
   Book stall, Get tickets and the rest rendered but did nothing. Every one now
   answers with a toast that names what would happen, and marks exactly where
   the server action goes.
3. **Footer links pointed at `#`.** They now go to real routes.
4. **A desktop-only button was never hidden.** `Button` carries `inline-flex`
   in its base class, which beats a `hidden` passed through `className` — same
   specificity, and `inline-flex` wins Tailwind's ordering. Found by hand, not
   by the suite: the hittability check asks whether a control is reachable, not
   whether it should be on screen at that width. Fixed with wrapper spans and
   three regression tests.
5. **Guarded segments were dropped from rendering.** `RequireRole` returned
   early while checking access, so Next's partial-prefetch validator could not
   confirm `/dashboard/*` and `/admin/*` navigate instantly and stopped
   checking them. The guard now always renders `children` and hides them with
   `display: none` until the role is confirmed, which keeps the segment in the
   tree. It is presentational only — a client guard is not a security
   boundary.
6. **A hydration mismatch in the trail.** It returned `null` under reduced
   motion, but `useReducedMotion` only resolves on the client — so the server
   rendered the container and the client rendered nothing (React #418). The
   container now always renders; only the listener is skipped.

## Not built

Auth and roles (04), database (03), real payments (07), notifications (17),
streaming integration (14), tests (18). Phone number, email and payment fields
are inert inputs.
