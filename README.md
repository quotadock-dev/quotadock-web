# QuotaDock public website

A React 19 / strict TypeScript / Vite landing page and explicitly labelled demo board.
No backend calls, analytics, AI login or checkout.
Demo values are sanitized constants, not a live integration. The operational
paired React dashboard remains in the separate `quotadock/web` project. HTML
is only the browser bootstrap; React owns the page and interactive states.

## Run

```sh
npm ci --ignore-scripts   # Node 22+
npm run dev              # local development
npm run build            # strict typecheck + production assets in dist/
npm run preview -- --port 8080
```

Open http://127.0.0.1:8080. Deploy **dist/**, not the source directory, to a static host.

```sh
docker build -t quotadock-web .
docker run --rm --read-only --tmpfs /tmp -p 127.0.0.1:8080:8080 quotadock-web
```

The multi-stage container builds React, then serves only production assets as
non-root nginx. It works with a read-only filesystem. Terminate TLS at your hosting platform
or reverse proxy. No secrets or bridge endpoints belong in this repository.

```sh
npx playwright install --with-deps chromium
npm test                 # typecheck, build, browser contracts at 320/390/1440px
# Also exercise the built nginx container and its real CSP:
WEB_TEST_ORIGIN=http://127.0.0.1:8080 npx playwright test
```

All three browser cases passed in both Vite preview and packaged nginx after
checking normal/unknown/stale states, keyboard focus, remaining values, overflow
and absence of usage API calls. These are demo UI tests, not provider or device tests.

## Content contract

- Every board state is DEMO, including unknown and stale examples.
- Unknown never receives a progress bar. Percentages are remaining, per window.
- Plans are targets only; paid functionality and distribution are not promised.
- App source (unmerged work): https://github.com/quotadock-dev/quotadock/tree/feat/quota-dock ; website source:
  https://github.com/quotadock-dev/quotadock-web . Server implementation is private.
- The public site makes no usage API requests and has no polling timer.
- Linked `#privacy` and `#refresh-policy` explain the planned app before signup:
  local collector must be running and online; server storage includes quota plus
  pseudonymous identifiers, session, consent and billing metadata. This page
  collects no consent and makes no legal retention promises.
- Widgets display cached values only, with OS-scheduled updates. Due intervals
  are Free 2h, Plus 1h, Pro 20–120min (default 20min), not collection guarantees.
  Free allows 10 successful early-refresh batches per KST day, not per window.
- Signup, purchases and App Store/TestFlight distribution are not available.
- Keyboard users have a skip link, visible focus and native demo controls.
  Unknown has no bar; stale bars explicitly announce old, non-current examples.
  Replaying announces a numbered local action, never a network refresh.

## Focused review

Serve on a dedicated localhost port and check widths 320, 390 and 1440 in all
three demo states. Confirm no horizontal overflow, zero bars in unknown, six
labelled bars in normal/stale, keyboard select and replay focus retention,
skip-link navigation, and working privacy/refresh anchors. Network requests
must remain local static assets only. Respect reduced-motion preferences.
Review screenshots belong in `.amp/in/artifacts/` (locally excluded from Git).

## Design references

Account hierarchy: KakaoBank and Monarch launched-app references presented
before implementation. Typographic restraint: TakeControl (gettakecontrol.app).
Only a subtle progress dot texture borrows the ordered-dot idea from
https://www.tripwire.sh/dither-kit. No screenshots, competitor assets or chart
dependencies are included. Refero gated screens were not used.

## Assets and license

Provider SVGs are MIT Lobe Icons; full upstream license is in `public/icons/LICENSE`.
See [third-party notices](public/THIRD_PARTY_NOTICES.md). Original site code is MIT licensed in LICENSE.
Provider trademarks identify services; no affiliation is implied.
