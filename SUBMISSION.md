# Devpost submission — paste-ready text

**Hackathon:** #BuildHybridAI 2026 (firebasehybridaihackathon.devpost.com)
**Platform to select:** Web
**Deadline:** Mon Nov 30, 2026, 2:00 PM PT

---

## Project name

ClearReceipt

## Tagline / short description

Receipts, sorted privately on-device and explained in plain English — hybrid inference with Firebase AI Logic.

## Elevator pitch (short description field)

Paste any receipt or invoice. ClearReceipt extracts and categorizes every line item on-device with Gemini Nano (via Firebase AI Logic hybrid inference), so your raw receipt never has to leave your machine — then a cloud Gemini model explains the totals, tax, and anything unusual in plain English. Every answer is badged with where it actually ran.

## Full description

### Inspiration

Receipts and invoices are among the most sensitive documents ordinary people handle — they reveal where you ate, where you slept, and exactly how a small business spends its money. Yet every "smart receipt" tool ships that text straight to a cloud model. With Firebase AI Logic's hybrid inference, that trade-off disappears: the private part can stay on the device, and the cloud can do what it's best at. ClearReceipt was built to prove that split on a task millions of freelancers, bookkeepers, and small-business owners do every week.

### What it does

1. **Sort** — Paste receipt text (or load one of three samples) and ClearReceipt returns structured data: merchant, date, every line item with an expense category, subtotal, tax, tip, and total.
2. **Explain** — One more click turns that structured summary into a 3–5 sentence plain-English explanation: what was bought and why it likely matters, whether the tax and tip look reasonable, a flag for anything unusual, and one practical bookkeeping tip.
3. **Show its work** — Every result is badged "On-device · Gemini Nano" or "Cloud · Gemini", read live from the response's `inferenceSource`. Hybrid routing is visible, not marketing copy.

### How we built it

- **Firebase AI Logic (Web SDK v12.19.0)** is the only AI path — no other model APIs are called.
- The Sort pass uses `getGenerativeModel` with `InferenceMode.PREFER_ON_DEVICE`. A single JSON `Schema` is supplied to both execution paths — as `responseSchema` in `inCloudParams` and as `responseConstraint` in `onDeviceParams` — so structured output is identical whether Gemini Nano answers on-device or the cloud fallback (Gemini Flash-Lite) answers instead.
- The Explain pass uses `InferenceMode.PREFER_IN_CLOUD` with Gemini Flash-Lite, because writing quality and nuance matter more than latency there — and its input is the extracted summary, never the raw receipt.
- **Firebase App Check** is initialized before the AI service (reCAPTCHA Enterprise provider; debug tokens supported for local development, as the hackathon allows).
- The front end is deliberately dependency-light: one HTML page, hand-written CSS, and ES modules loaded via an import map. No build step, nothing stored — no accounts, no database, no analytics.

### The architectural rationale

- **Sensitive + simple → on-device.** Extraction and categorization are well within an on-device model's ability, and the input is private financial text. On-device means private, instant, offline-capable, and free.
- **Judgment + writing → cloud.** Explaining whether a tip looks reasonable or a total doesn't add up benefits from the bigger cloud model — and it can run on the sanitized summary, so the raw receipt still never leaves the device in the primary path.
- **Fallback is a feature.** On any browser without Gemini Nano, AI Logic routes the same calls to the cloud automatically. The app works everywhere Chrome runs; it's simply *more private* where Nano is available — and the badge tells you which happened.

### Challenges

- Making structured output behave identically across two very different runtimes (the Prompt API's constraint format vs. the cloud's response schema) took care: one shared `Schema` object drives both.
- Hybrid models must be created after a user interaction, so model construction is lazy — created inside the click handlers, not at page load.
- App Check has to be initialized before the first AI call, and debug-token flow documented so judges can run the app locally without friction.

### Accomplishments

- A complete, working hybrid pipeline: the same click can be answered by an on-device model or a cloud model, with the routing proven on screen for every single result.
- Zero data retention by design — there is nothing to leak because nothing is kept.

### What we learned

Hybrid inference is less about raw capability than about *placement*: deciding which data deserves to stay local is a product decision, and Firebase AI Logic makes that decision a one-line mode setting with a graceful fallback.

### What's next

- Photo receipts: snap a picture and OCR it locally before the same Sort pass.
- Optional sign-in + Firestore export for people who *want* a searchable expense history (opt-in only, off by default).
- A Chrome extension version so receipts can be sorted from any web page.

## Built with

Firebase AI Logic · Gemini Nano (Chrome Prompt API) · Gemini Flash-Lite · Firebase App Check · JavaScript (ES modules) · HTML/CSS

## Links to fill in at submission time

- **GitHub repo:** https://github.com/maxvick17/clearreceipt (public, MIT license)
- **Live app:** <paste the Firebase Hosting or GitHub Pages URL>
- **Demo video (YouTube, ≤3 min):** <paste URL>

## Submission checklist

- [ ] Registered for the hackathon on Devpost ("Join hackathon")
- [ ] Project created; platform = Web selected
- [ ] Description pasted from above; screenshots uploaded
- [ ] GitHub repo public with LICENSE visible
- [ ] Live app URL works in Chrome (test Sort + Explain end to end)
- [ ] Demo video uploaded to YouTube, set Public, ≤3:00, linked
- [ ] Final Submit clicked before Nov 30, 2026, 2:00 PM PT; submission page shows Submitted
