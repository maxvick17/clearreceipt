# Demo video script — target 2:20, hard cap 3:00

**Setup before recording**
- Chrome on desktop, updated; open the live app URL.
- If Gemini Nano is available in this Chrome, the Sort badge will read "On-device · Gemini Nano" — that's the money shot. If it isn't, record anyway: the badge honestly reads "Cloud · Gemini", and the narration line below covers the fallback (marked with †).
- Record at 1080p, browser zoom 110%, cursor visible. Narrate live or voice-over after.

---

**[0:00–0:15] Hook — show the app home screen**
> "This is ClearReceipt. You paste in a receipt — and instead of sending your private spending data to the cloud, it sorts the receipt right here, on your device. Let me show you."

**[0:15–0:50] Sort the coffee sample**
- Click **Coffee run** sample, then **Sort this receipt**.
> "I'll load a coffee receipt and hit Sort. ClearReceipt just extracted every line item, categorized it, and pulled out the tax, tip, and total — structured data from messy text."

**[0:50–1:10] The badge**
- Zoom/point at the **On-device · Gemini Nano** badge.
> "See this badge? That answer came from Gemini Nano, running on-device through Firebase AI Logic's hybrid inference. The raw receipt never left this machine. And the app doesn't ask you to trust it — every result shows where it was actually answered."
>
> † Fallback line if the badge says Cloud: "On this machine there's no on-device model available, so AI Logic automatically fell back to the cloud — same call, same result, and the badge tells you the truth about which one answered."

**[1:10–1:45] Explain**
- Click **Explain it in plain English**.
> "Now the second pass. Explaining a receipt — is the tax right, is anything weird — takes more judgment, so this one prefers the cloud. But notice what it receives: only the short extracted summary, not the raw receipt. It explains what was bought, checks the tax and tip, and flags anything unusual."

**[1:45–2:05] Second sample, fast**
- Load **Hotel folio**, Sort again.
> "Same flow for a hotel folio — lodging, tax, parking, all categorized. Two different kinds of inference, one SDK, zero setup for the user."

**[2:05–2:20] Close**
> "ClearReceipt: receipts sorted privately on-device, explained in plain English. Built with Firebase AI Logic hybrid inference for BuildHybridAI 2026. The code's on GitHub — link below."

---

**Upload settings (YouTube)**
- Title: `ClearReceipt — Receipts Sorted On-Device, Explained in Plain English | #BuildHybridAI 2026`
- Visibility: Public. Audience: Not made for kids.
- Description: one paragraph from SUBMISSION.md's elevator pitch + repo URL + live app URL.
