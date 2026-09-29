import QRCode from "qrcode";

const BLOCKED = /^(chrome|edge|chrome-extension|edge-extension|about|devtools|view-source|file):/i;

const qrEl = document.getElementById("qr") as HTMLDivElement;
const subtitleEl = document.getElementById("subtitle") as HTMLParagraphElement;
const fallbackEl = document.getElementById("fallback") as HTMLDivElement;

function showFallback(message: string): void {
  subtitleEl.textContent = "";
  qrEl.hidden = true;
  fallbackEl.hidden = false;
  const text = fallbackEl.querySelector("p");
  if (text) text.textContent = message;
}

try {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = tab?.url ?? "";
  const title = tab?.title ?? url;

  if (!url || BLOCKED.test(url)) {
    showFallback("This page can't be shared as a QR code.");
  } else {
    subtitleEl.textContent = title;
    const svg = await QRCode.toString(url, {
      type: "svg",
      errorCorrectionLevel: "M",
      margin: 2,
    });
    qrEl.innerHTML = svg;
  }
} catch {
  showFallback("Couldn't read the current page.");
}
