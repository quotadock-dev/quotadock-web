# QuotaDock public website

A standalone, zero-build static landing page and explicitly labelled demo board.
No backend, runtime package dependencies, analytics, AI login or checkout.
Demo values are sanitized constants, not a live integration. The operational
paired dashboard remains in the separate `quotadock/web` project.

## Run

```sh
python3 -m http.server 8080 --bind 127.0.0.1
```

Open http://127.0.0.1:8080. Deploy the directory to any static host.

```sh
docker build -t quotadock-web .
docker run --rm --read-only --tmpfs /tmp -p 127.0.0.1:8080:8080 quotadock-web
```

The container only serves static files. Terminate TLS at your hosting platform
or reverse proxy. No secrets or bridge endpoints belong in this repository.

## Content contract

- Every board state is DEMO, including unknown and stale examples.
- Unknown never receives a progress bar. Percentages are remaining, per window.
- Plans are targets only; paid functionality and distribution are not promised.
- App source: https://github.com/quotadock-dev/quotadock ; website source:
  https://github.com/quotadock-dev/quotadock-web . Server implementation is private.
- The public site makes no usage API requests and has no polling timer.

## Design references

Account hierarchy: KakaoBank and Monarch launched-app references presented
before implementation. Typographic restraint: TakeControl (gettakecontrol.app).
Only a subtle progress dot texture borrows the ordered-dot idea from
https://www.tripwire.sh/dither-kit. No screenshots, competitor assets or chart
dependencies are included. Refero gated screens were not used.

## Assets and license

Provider SVGs are MIT Lobe Icons; full upstream license is in `icons/LICENSE`.
See THIRD_PARTY_NOTICES.md. Original site code is MIT licensed in LICENSE.
Provider trademarks identify services; no affiliation is implied.
