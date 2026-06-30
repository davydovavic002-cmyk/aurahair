export const PORTFOLIO_HEIGHT_MESSAGE_TYPE = "portfolio:content-height";

const REPORT_DELAYS_MS = [0, 50, 150, 400, 900, 1800] as const;

export function isPortfolioEmbed(): boolean {
  return document.documentElement.getAttribute("data-embed") === "portfolio";
}

export function measureContentHeight(): number {
  const sentinel = document.getElementById("embed-height-sentinel");
  if (sentinel) {
    const top = document.documentElement.getBoundingClientRect().top;
    return Math.ceil(sentinel.getBoundingClientRect().bottom - top);
  }

  const footer = document.querySelector("footer");
  if (footer) {
    const top = document.documentElement.getBoundingClientRect().top;
    return Math.ceil(footer.getBoundingClientRect().bottom - top);
  }

  return Math.ceil(document.documentElement.scrollHeight);
}

export function reportHeight(): void {
  if (!isPortfolioEmbed()) return;

  const height = Math.max(measureContentHeight(), 1);
  window.parent.postMessage(
    { type: PORTFOLIO_HEIGHT_MESSAGE_TYPE, height },
    "*",
  );
}

export function scheduleHeightReports(): void {
  for (const delay of REPORT_DELAYS_MS) {
    if (delay === 0) {
      reportHeight();
    } else {
      window.setTimeout(reportHeight, delay);
    }
  }
}

export function initPortfolioEmbedDetection(): void {
  const isEmbed =
    new URLSearchParams(window.location.search).get("embed") === "portfolio";

  if (isEmbed) {
    document.documentElement.setAttribute("data-embed", "portfolio");
  }
}

export function preserveEmbedSearchParams(url: URL): void {
  const current = new URLSearchParams(window.location.search);
  const embed = current.get("embed");
  const lang = current.get("lang");

  if (embed) url.searchParams.set("embed", embed);
  if (lang) url.searchParams.set("lang", lang);
}
