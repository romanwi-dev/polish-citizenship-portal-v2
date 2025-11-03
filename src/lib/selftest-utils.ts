export function isIOSSafari() {
  const ua = navigator.userAgent;
  const iOS = /iP(hone|od|ad)/.test(ua);
  const webkit = /WebKit/.test(ua);
  const isChrome = /CriOS/.test(ua) || /Chrome/.test(ua);
  return iOS && webkit && !isChrome;
}

export function openPdfUrl(url: string) {
  // iOS prefers in-tab preview; desktop can auto-download
  if (isIOSSafari()) {
    window.open(url, '_blank', 'noopener');
    return;
  }
  const a = document.createElement('a');
  a.href = url;
  a.rel = 'noopener';
  a.download = '';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export function downloadBase64Pdf(b64: string, filename = 'document.pdf') {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const blob = new Blob([bytes], { type: 'application/pdf' });

  if (isIOSSafari()) {
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener');
    setTimeout(() => URL.revokeObjectURL(url), 30000);
    return;
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.rel = 'noopener';
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function copyToClipboard(text: string) {
  return navigator.clipboard?.writeText(text);
}

export function short(val: unknown, max = 120) {
  const s = typeof val === 'string' ? val : JSON.stringify(val);
  return s.length > max ? s.slice(0, max) + '…' : s;
}
