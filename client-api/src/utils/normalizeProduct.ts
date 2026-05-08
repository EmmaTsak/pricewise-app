export type ProductMatchData = {
  originalName: string;
  comparableName: string;
  size: string | null;
  brand: string | null;
  variantWords: string[];
};

/*
  Turns Greek + English product text into simpler text.

  Example:
  "Coca-Cola Αναψυκτικό 1,5L"
  becomes:
  "coca cola αναψυκτικο 1.5l"
*/
export const normalizeText = (text: string) => {
  return text
    .toLowerCase()
    .replace(",", ".")
    .replace(/-/g, " ")
    .replace(/[ά]/g, "α")
    .replace(/[έ]/g, "ε")
    .replace(/[ήίϊΐ]/g, "ι")
    .replace(/[ό]/g, "ο")
    .replace(/[ύϋΰ]/g, "υ")
    .replace(/[ώ]/g, "ω")
    .replace(/[^\p{L}\p{N}. ]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
};

/*
  Finds product size.

  Examples:
  "1.5L"  -> "1.5l"
  "1,5lt" -> "1.5l"
  "500ml" -> "500ml"
  "250gr" -> "250g"
*/
export const extractSize = (name: string) => {
  const normalized = normalizeText(name);

  const match = normalized.match(/(\d+(\.\d+)?)\s?(l|lt|ml|kg|g|gr)/);

  if (!match) {
    return null;
  }

  const amount = match[1];
  let unit = match[3];

  if (unit === "lt") unit = "l";
  if (unit === "gr") unit = "g";

  return `${amount}${unit}`;
};

const removeSize = (text: string) => {
  return text.replace(/(\d+(\.\d+)?)\s?(l|lt|ml|kg|g|gr)/g, "");
};

/*
  These words often appear in product titles,
  but they usually do not identify the exact product.
*/
const STOP_WORDS = new Set([
  "αναψυκτικο",
  "ροφημα",
  "ποτο",
  "φιαλη",
  "μπουκαλι",
  "συσκευασια",
  "τεμαχιο",
  "τεμ",
  "προσφορα",
  "νεο",
  "super",
  "classic",
  "drink",
  "beverage",
  "bottle",
  "package",
  "τονωτικό",
  "ενεργειακό",
  "με",
  "και",
  "σε",
  "για",
  "το",
  "η",
  "ο",
  "φρεσκο",
  "φρεσκια",
  "φρεσκος",
  "ελληνικο",
  "ελληνικη",
  "σπιτικό",
  "σπιτική",
  "σπιτικο",
]);

/*
  These words are important.

  They change the product, so we must not ignore them.
*/
const VARIANT_WORDS = new Set([
  "zero",
  "light",
  "diet",
  "max",
  "stevia",
  "χωρις",
  "ζαχαρη",
  "χωριςζαχαρη",
  "ολικης",
  "βιολογικο",
  "bio",
]);

/*
  Common brands that may appear with different spellings.
  We can grow this list slowly as we see real products.
*/
const BRAND_ALIASES: Record<string, string> = {
  "coca": "coca cola",
  "cola": "coca cola",
  "coca cola": "coca cola",
  "cocacola": "coca cola",

  "hellmanns": "hellmanns",
  "hellmann": "hellmanns",

  "dove": "dove",
  "erdinger": "erdinger",
  "ολυμπος": "ολυμπος",
  "ροδοπη": "ροδοπη",
  "δελτα": "δελτα",
  "barilla": "barilla",
  "fix": "fix",
  "φιξ": "fix",
  "fix ελλας": "fix",
  "φιξ ελλας": "fix",
  "whiskas": "whiskas",
};

const getWords = (text: string) => {
  return text
    .split(" ")
    .map((word) => word.trim())
    .filter(Boolean);
};

const detectBrand = (words: string[]) => {
  const firstTwoWords = words.slice(0, 2).join(" ");
  const firstWord = words[0];

  if (BRAND_ALIASES[firstTwoWords]) {
    return BRAND_ALIASES[firstTwoWords];
  }

  if (BRAND_ALIASES[firstWord]) {
    return BRAND_ALIASES[firstWord];
  }

  /*
    Simple MVP rule:
    For packaged products, the first word is often the brand.

    Examples:
    "dove αποσμητικο"
    "barilla σπαγγετι"
    "ροδοπη λευκο τυρι"
  */
  return firstWord ?? null;
};

export const getProductMatchData = (productName: string): ProductMatchData => {
  const normalized = normalizeText(productName);
  const size = extractSize(productName);
  const withoutSize = removeSize(normalized);

  const allWords = getWords(withoutSize);

  const brand = detectBrand(allWords);

  const words = allWords.filter((word) => !STOP_WORDS.has(word));

  const variantWords = words.filter((word) => VARIANT_WORDS.has(word));

  return {
    originalName: productName,
    comparableName: words.join(" "),
    size,
    brand,
    variantWords,
  };
};