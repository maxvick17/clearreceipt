# ClearReceipt

**Paste any receipt. ClearReceipt sorts every line item privately on your device, then explains the totals in plain English.**

Receipts are some of the most sensitive text people handle — where you ate, where you slept, what you bought for your business. ClearReceipt is built so that text doesn't have to leave your machine. It uses **Firebase AI Logic hybrid inference** to split the work the way the data deserves:

| Pass | What it does | Where it runs | Why there |
| --- | --- | --- | --- |
| **Sort** | Extracts merchant, date, line items, categories, tax, tip, total into structured JSON | **On-device first** (`PREFER_ON_DEVICE` — Gemini Nano via Chrome's Prompt API), cloud fallback | Privacy (raw receipt never leaves the device when Nano is available), zero latency, works offline, costs nothing |
| **Explain** | Writes a 3–5 sentence plain-English explanation: what was bought, whether tax/tip look right, anything unusual | **Cloud** (`PREFER_IN_CLOUD` — Gemini Flash-Lite) | Nuance and writing quality; the input is only the extracted summary, never the raw receipt |

Every result carries a badge — **"On-device · Gemini Nano"** or **"Cloud · Gemini"** — read from the response's `inferenceSource`, so the hybrid routing is never a black box. All AI inference goes through Firebase AI Logic; the app calls no other model APIs.

Built for the **#BuildHybridAI 2026** hackathon (Google × Firebase) — Web (Chrome) platform.

## Try it

The fastest path for judges: open the live app in Chrome on desktop, load a sample receipt (Coffee run / Office supplies / Hotel folio), and hit **Sort this receipt**, then **Explain it in plain English**.

On a Chrome with Gemini Nano available, the Sort badge reads *On-device*; anywhere else, AI Logic falls back to the cloud and the badge says so. Both paths produce the same structured result.

## Run it locally

No build step. Serve the folder with any static server:

```bash
npx serve .
# or
python3 -m http.server 8080
```

Then open the printed URL in Chrome. For local App Check, append `?appcheck-debug=1` — a debug token is printed to the browser console; register it in the Firebase console under **App Check → Apps → ⋮ → Manage debug tokens**. (Debug tokens are accepted for this hackathon; never commit one to the repo.)

## One-time Firebase setup (free Spark plan — no billing, no card)

1. **Create the project** at <https://console.firebase.google.com> (any name, e.g. `clearreceipt`; Analytics optional).
2. **Register a web app** (Add app → `</>`). Copy the `firebaseConfig` values into [`firebase-config.js`](firebase-config.js).
3. **Enable AI Logic**: console → Build → **AI Logic** → Get started → **Gemini Developer API** (free tier).
4. **Enable App Check**: console → Build → **App Check** → register the web app with the **reCAPTCHA Enterprise** provider; paste the site key into `firebase-config.js` as `RECAPTCHA_ENTERPRISE_SITE_KEY`. For judging/demo deployments, a registered debug token also works (see above).
5. **Deploy** (pick one):
   - Firebase Hosting: `npm i -g firebase-tools && firebase login && firebase deploy --only hosting` (a `firebase.json` is included), or
   - GitHub Pages: push this repo and enable Pages on the branch — the app is fully static.

## How it's built

- `index.html` — the single page; loads the Firebase JS SDK (v12.19.0) as ES modules via an import map.
- `app.js` — all logic. `sortModel()` creates a hybrid model with `InferenceMode.PREFER_ON_DEVICE` and a JSON `Schema` applied to both paths (`responseSchema` in `inCloudParams`, `responseConstraint` in `onDeviceParams`), so structured output works identically on-device and in the cloud. `explainModel()` uses `PREFER_IN_CLOUD`.
- `firebase-config.js` — project config + the one file you edit during setup. Web config values are project identifiers, not secrets; access is enforced by App Check.
- `styles.css` — hand-written CSS, no framework.

## Privacy note

In the on-device path, receipt text is processed by Chrome's built-in model and never transmitted. In the fallback and explanation paths, data is processed by Google's Gemini API under the Firebase AI Logic terms. ClearReceipt itself stores nothing — no accounts, no database, no analytics.

## License

MIT — see [LICENSE](LICENSE). Copyright © 2026 Max Vickery.
