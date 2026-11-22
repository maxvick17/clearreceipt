// ─────────────────────────────────────────────────────────────────────────────
// ClearReceipt — Firebase project configuration
//
// Project: clearreceipt (Project ID: clearreceipt-dca17), free Spark plan.
// Web app "ClearReceipt" registered Nov 21, 2026; AI Logic enabled with the
// Gemini Developer API (free tier); App Check registered (Enforced) with the
// reCAPTCHA Enterprise provider.
//
// These web config values are NOT secrets — they identify the Firebase
// project to Google's servers. Access is controlled by App Check and
// Firebase security rules, per Firebase's own guidance.
// ─────────────────────────────────────────────────────────────────────────────

export const firebaseConfig = {
  apiKey: "AIzaSyAJL3uhNKzCt_uKDX0SwtVi_JIK8OC6bDE",
  authDomain: "clearreceipt-dca17.firebaseapp.com",
  projectId: "clearreceipt-dca17",
  storageBucket: "clearreceipt-dca17.firebasestorage.app",
  messagingSenderId: "669902520376",
  appId: "1:669902520376:web:d6a885a7b53916bccda6cd",
};

// reCAPTCHA Enterprise site key for App Check (public site key, not a secret).
export const RECAPTCHA_ENTERPRISE_SITE_KEY = "6LdSOCwuAAAAAJ-lJPTYlRm39VfehHsLBuv1HWJi";

// Cloud model used for the deep "Explain" pass. The default hybrid fallback
// model also works; this pins a fast, free-tier-friendly cloud model.
export const CLOUD_MODEL = "gemini-2.5-flash-lite";
