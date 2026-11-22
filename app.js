// ClearReceipt — hybrid inference receipt explainer
//
// Every AI call in this app goes through Firebase AI Logic. Two passes:
//
//   Pass 1 — "Sort" (PREFER_ON_DEVICE): structured extraction + categorization
//            of each line item. Receipts are sensitive financial documents, so
//            the raw text is processed on-device (Chrome's Gemini Nano via the
//            Prompt API) whenever it's available — private, instant, offline,
//            and free. If no on-device model exists, AI Logic falls back to
//            the cloud automatically.
//
//   Pass 2 — "Explain" (PREFER_IN_CLOUD): a plain-English explanation of the
//            totals, tax, and anything unusual, written by the cloud model
//            (Gemini Flash-Lite). Nuance and writing quality matter more than
//            latency here, and the input is the already-extracted summary —
//            not the raw receipt.
//
// The UI shows an "On-device" / "Cloud" badge on every result, read from the
// response's `inferenceSource` property, so the hybrid routing is visible.

import { initializeApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";
import {
  getAI,
  getGenerativeModel,
  GoogleAIBackend,
  InferenceMode,
  Schema,
} from "firebase/ai";
import {
  firebaseConfig,
  RECAPTCHA_ENTERPRISE_SITE_KEY,
  CLOUD_MODEL,
} from "./firebase-config.js";

// ── App Check ────────────────────────────────────────────────────────────────
// Firebase AI Logic requires App Check. For local development / judging,
// load the page with ?appcheck-debug=1: a debug token is generated, printed
// to the browser console, and can be registered in the Firebase console
// (App Check → Apps → Manage debug tokens). Debug tokens are accepted for
// hackathon submissions. Never commit a debug token value to this repo —
// it is generated at runtime and lives only in the browser + console.
const params = new URLSearchParams(location.search);
if (params.get("appcheck-debug") === "1") {
  self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
}

const app = initializeApp(firebaseConfig);

if (!RECAPTCHA_ENTERPRISE_SITE_KEY.startsWith("PASTE_")) {
  initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider(RECAPTCHA_ENTERPRISE_SITE_KEY),
    isTokenAutoRefreshEnabled: true,
  });
} else if (params.get("appcheck-debug") === "1") {
  // Debug-token-only App Check (no reCAPTCHA provider configured yet).
  initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider("unused-in-debug-mode"),
    isTokenAutoRefreshEnabled: true,
  });
}

const ai = getAI(app, { backend: new GoogleAIBackend() });

// ── Schemas ──────────────────────────────────────────────────────────────────
const receiptSchema = Schema.object({
  properties: {
    merchant: Schema.string(),
    date: Schema.string(),
    currency: Schema.string(),
    items: Schema.array({
      items: Schema.object({
        properties: {
          name: Schema.string(),
          amount: Schema.number(),
          category: Schema.enumString({
            enum: [
              "Meals",
              "Travel",
              "Lodging",
              "Office Supplies",
              "Software",
              "Equipment",
              "Groceries",
              "Transport",
              "Fees",
              "Other",
            ],
          }),
        },
      }),
    }),
    subtotal: Schema.number(),
    tax: Schema.number(),
    tip: Schema.number(),
    total: Schema.number(),
    summary: Schema.string(),
  },
});

// ── Models (created lazily, on user interaction, as hybrid mode requires) ──
function sortModel() {
  return getGenerativeModel(ai, {
    mode: InferenceMode.PREFER_ON_DEVICE,
    inCloudParams: {
      model: CLOUD_MODEL,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: receiptSchema,
      },
    },
    onDeviceParams: {
      promptOptions: { responseConstraint: receiptSchema },
    },
  });
}

function explainModel() {
  return getGenerativeModel(ai, {
    mode: InferenceMode.PREFER_IN_CLOUD,
    inCloudParams: { model: CLOUD_MODEL },
  });
}

// ── UI wiring ────────────────────────────────────────────────────────────────
const $ = (id) => document.getElementById(id);
const els = {
  input: $("receipt-input"),
  sortBtn: $("sort-btn"),
  explainBtn: $("explain-btn"),
  status: $("status"),
  result: $("result"),
  explainCard: $("explain-card"),
  explainBody: $("explain-body"),
};

let lastReceipt = null;

function setStatus(msg, isError = false) {
  els.status.textContent = msg;
  els.status.classList.toggle("error", isError);
}

function sourceBadge(source) {
  if (source === "ON_DEVICE") return "On-device · Gemini Nano";
  if (source === "IN_CLOUD") return "Cloud · Gemini";
  return "Firebase AI Logic";
}

function money(n, currency) {
  const v = typeof n === "number" ? n : 0;
  return `${currency || "$"}${v.toFixed(2)}`;
}

function renderReceipt(data, source) {
  const rows = (data.items || [])
    .map(
      (it) =>
        `<tr><td>${escapeHtml(it.name)}</td><td><span class="chip">${escapeHtml(
          it.category
        )}</span></td><td class="num">${money(it.amount, data.currency)}</td></tr>`
    )
    .join("");
  els.result.innerHTML = `
    <div class="card">
      <div class="card-head">
        <h2>${escapeHtml(data.merchant || "Receipt")}</h2>
        <span class="badge">${sourceBadge(source)}</span>
      </div>
      ${data.date ? `<p class="muted">${escapeHtml(data.date)}</p>` : ""}
      <table>
        <thead><tr><th>Item</th><th>Category</th><th class="num">Amount</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <dl class="totals">
        <div><dt>Subtotal</dt><dd>${money(data.subtotal, data.currency)}</dd></div>
        <div><dt>Tax</dt><dd>${money(data.tax, data.currency)}</dd></div>
        <div><dt>Tip</dt><dd>${money(data.tip, data.currency)}</dd></div>
        <div class="grand"><dt>Total</dt><dd>${money(data.total, data.currency)}</dd></div>
      </dl>
      ${data.summary ? `<p class="summary">${escapeHtml(data.summary)}</p>` : ""}
    </div>`;
  els.result.hidden = false;
}

function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

els.sortBtn.addEventListener("click", async () => {
  const text = els.input.value.trim();
  if (!text) {
    setStatus("Paste a receipt or invoice first — or load a sample below.", true);
    return;
  }
  els.sortBtn.disabled = true;
  els.explainBtn.disabled = true;
  els.explainCard.hidden = true;
  setStatus("Sorting line items… (on-device first, cloud fallback)");
  try {
    const prompt = [
      "Extract this receipt or invoice into the required JSON structure.",
      "Categorize every line item. Use the receipt's own totals for subtotal,",
      "tax, tip, and total; if a value is missing, use 0. The summary is one",
      "short sentence describing the purchase overall.",
      "",
      "RECEIPT TEXT:",
      text,
    ].join("\n");
    const result = await sortModel().generateContent(prompt);
    const data = JSON.parse(result.response.text());
    lastReceipt = data;
    renderReceipt(data, result.response.inferenceSource);
    setStatus(
      `Sorted. Answered by: ${sourceBadge(result.response.inferenceSource)}.`
    );
    els.explainBtn.disabled = false;
  } catch (err) {
    console.error(err);
    setStatus(
      "Sorting failed. If you're running locally, open this page with " +
        "?appcheck-debug=1 and register the debug token printed in the " +
        "console. Details: " +
        err.message,
      true
    );
  } finally {
    els.sortBtn.disabled = false;
  }
});

els.explainBtn.addEventListener("click", async () => {
  if (!lastReceipt) return;
  els.explainBtn.disabled = true;
  setStatus("Writing the plain-English explanation in the cloud…");
  try {
    const prompt = [
      "You are a friendly bookkeeper explaining an expense to a small-business",
      "owner in plain English. In 3–5 short sentences: say what was bought and",
      "why it likely matters for the business, confirm whether the tax and tip",
      "look reasonable for the total, and flag anything unusual (a total that",
      "doesn't add up, a surprisingly large item, a possible duplicate). End",
      "with one practical tip about keeping or categorizing this expense.",
      "Do not give formal tax advice; keep it general and helpful.",
      "",
      "EXTRACTED RECEIPT (JSON):",
      JSON.stringify(lastReceipt),
    ].join("\n");
    const result = await explainModel().generateContent(prompt);
    els.explainBody.textContent = result.response.text();
    els.explainCard.hidden = false;
    setStatus(
      `Explanation answered by: ${sourceBadge(result.response.inferenceSource)}.`
    );
  } catch (err) {
    console.error(err);
    setStatus("Explanation failed: " + err.message, true);
  } finally {
    els.explainBtn.disabled = false;
  }
});

// ── Samples ──────────────────────────────────────────────────────────────────
const SAMPLES = {
  cafe: [
    "BLUE BOTTLE COFFEE",
    "300 Webster St, Oakland CA",
    "11/18/2026  9:42 AM",
    "--------------------------------",
    "Latte 12oz              5.75",
    "Almond Croissant        4.50",
    "Cold Brew 16oz          5.25",
    "--------------------------------",
    "Subtotal               15.50",
    "Tax (8.63%)             1.34",
    "Tip                     3.00",
    "TOTAL                  19.84",
    "Thank you!",
  ].join("\n"),
  office: [
    "STAPLES STORE #0412",
    "INVOICE 8842-7719        11/15/2026",
    "--------------------------------",
    "Copy Paper Case (10 ream)   54.99",
    "Wireless Mouse              29.99",
    "USB-C Hub                   49.99",
    "Notebook 3-pack              8.49",
    "--------------------------------",
    "Subtotal                   143.46",
    "Sales Tax                   12.38",
    "TOTAL                      155.84",
  ].join("\n"),
  hotel: [
    "HARBOUR LIGHT INN",
    "Folio #2291 — Guest: A. Rivera",
    "Check-in 11/10/2026  Check-out 11/12/2026",
    "--------------------------------",
    "Room 2 nights @ 189.00    378.00",
    "Occupancy Tax 12%          45.36",
    "Parking 2 days @ 25.00     50.00",
    "Room Service — Dinner      42.75",
    "--------------------------------",
    "TOTAL DUE                 516.11",
  ].join("\n"),
};

document.querySelectorAll("[data-sample]").forEach((btn) => {
  btn.addEventListener("click", () => {
    els.input.value = SAMPLES[btn.dataset.sample] || "";
    setStatus("Sample loaded — hit “Sort this receipt”.");
  });
});
