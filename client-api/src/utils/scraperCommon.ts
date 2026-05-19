import { Page } from "playwright";

export function normalizeSpaces(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-");
}

export function buildFullUrl(pathOrUrl: string, baseUrl: string): string {
  return new URL(pathOrUrl, baseUrl).toString();
}

export function parseGreekPrice(text: string): number | null {
  const cleanText = text.replace(/\u00a0/g, " ");

  const match = cleanText.match(/(\d+[,.]\d{1,2})/);

  if (!match) {
    return null;
  }

  const price = Number(match[1].replace(",", "."));

  if (Number.isNaN(price) || price <= 0) {
    return null;
  }

  return Number(price.toFixed(2));
}

export async function closeCookiePopup(page: Page) {
  try {
    const button = page
      .locator(
        'button:has-text("Αποδοχή"), button:has-text("Αποδέχομαι"), button:has-text("Accept")'
      )
      .first();

    if (await button.isVisible({ timeout: 1500 })) {
      await button.click();
      await page.waitForTimeout(500);
    }
  } catch {
  
  }
}