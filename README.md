# QuotaDock public website

A React 19 / strict TypeScript / Vite landing page and explicitly labelled demo board.
No backend calls, analytics, AI login or checkout.
Demo values are sanitized constants, not a live integration. The operational
paired React dashboard remains in the separate `quotadock/web` project. HTML
is only the browser bootstrap; React owns the page and interactive states.

## Language and first visit · 언어와 첫 방문

Use the header **Language** selector: **System default**, **English**, or **한국어**. System default follows the browser language (Korean for `ko`, otherwise English); the preference is saved locally when browser storage is available. Switching language never changes provider quota or performs a new provider login. Explore the labelled demo states and **Replay sample** without credentials or usage requests. This website has no native setup wizard, connection form or cloud-consent collection.

상단 **언어**에서 **시스템 기본값**, **English**, **한국어**를 선택하세요. 기본값은 브라우저 언어가 한국어이면 한국어, 그 외에는 영어이며 저장소 사용이 가능하면 선택을 로컬에 저장합니다. 언어 변경은 제공자 할당량을 바꾸거나 새 제공자 로그인을 수행하지 않습니다. 로그인 없이 데모 상태와 **예시 다시 보기**를 살펴보세요. 이 사이트에는 네이티브 초기 설정·연결 폼·클라우드 동의 수집이 없습니다.

For the native app's resumable **Welcome → Connection → Preferences** setup, explicit demo/private bridge/optional cloud/later selection, default refresh-on-open versus manual refresh, Settings revisit/cancel and separate cloud consents, see the [English/Korean native guide](https://github.com/quotadock-dev/quotadock/blob/feat/quota-dock/apple/README.md#first-run-setup--첫-실행-설정). 네이티브의 이어하기 가능한 3단계 설정, 연결 직접 선택, 자동·수동 새로고침, 설정 다시 보기·취소 및 별도 클라우드 동의는 위 이중 언어 안내를 확인하세요. Native demo is in-memory; installed widget language updates are OS-scheduled and Watch delivery is asynchronous.

These instructions describe `feat/react-typescript` (website) and `feat/quota-dock` (app) feature-branch sources, not `main` or deployed behavior. 기능 브랜치 소스 안내이며 배포 완료를 의미하지 않습니다.

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

Browser contracts cover normal/unknown/stale states, language selection,
keyboard focus, remaining values, overflow and absence of usage API calls.
Use Vite preview and packaged nginx for their respective serving/CSP checks;
these are demo UI contracts, not provider or device tests or a claim that the latest CI passed.

## Content contract

- Every board state is DEMO, including unknown and stale examples.
- Unknown never receives a progress bar. Percentages are remaining, per window.
- Plans are targets only; paid functionality and distribution are not promised.
- App source (unmerged work): https://github.com/quotadock-dev/quotadock/tree/feat/quota-dock ; website source:
  https://github.com/quotadock-dev/quotadock-web/tree/feat/react-typescript . Server implementation is private.
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
