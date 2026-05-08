export type PriceWiseCategory = {
  name: string;
  slug: string;
};

/*
  These are PriceWise internal categories.

  Important:
  These do NOT need to be exactly the same as each supermarket category.

  Supermarkets have many messy/different categories.
  PriceWise needs clean broad categories so products can be compared.
*/
export const PRICEWISE_CATEGORIES: Record<string, PriceWiseCategory> = {
  "fresh-food": {
    name: "Fresh Food",
    slug: "fresh-food",
  },
  "meat-fish": {
    name: "Meat & Fish",
    slug: "meat-fish",
  },
  "dairy-eggs": {
    name: "Dairy & Eggs",
    slug: "dairy-eggs",
  },
  "bread-bakery": {
    name: "Bread & Bakery",
    slug: "bread-bakery",
  },
  "drinks": {
    name: "Drinks",
    slug: "drinks",
  },
  "coffee-tea-cocoa": {
    name: "Coffee, Tea & Cocoa",
    slug: "coffee-tea-cocoa",
  },
  "pantry": {
    name: "Pantry",
    slug: "pantry",
  },
  "frozen-food": {
    name: "Frozen Food",
    slug: "frozen-food",
  },
  "ready-meals": {
    name: "Ready Meals",
    slug: "ready-meals",
  },
  "snacks-sweets": {
    name: "Snacks & Sweets",
    slug: "snacks-sweets",
  },
  "baby": {
    name: "Baby",
    slug: "baby",
  },
  "pet": {
    name: "Pet",
    slug: "pet",
  },
  "health-beauty": {
    name: "Health & Beauty",
    slug: "health-beauty",
  },
  "cleaning-household": {
    name: "Cleaning & Household",
    slug: "cleaning-household",
  },
  "home-garden": {
    name: "Home & Garden",
    slug: "home-garden",
  },
  "clothing": {
    name: "Clothing",
    slug: "clothing",
  },
  "non-grocery": {
    name: "Non Grocery",
    slug: "non-grocery",
  },
  "unknown": {
    name: "Unknown",
    slug: "unknown",
  },
};

/*
  This function cleans Greek text so matching is easier.

  Example:
  "Χυμοί & Αναψυκτικά"
  becomes:
  "χυμοι αναψυκτικα"
*/
function normalizeCategoryText(text: string) {
  return text
    .toLowerCase()

    // Fix common HTML entity noise if it exists in scraped text.
    .replace(/&[a-z0-9#]+;/gi, " ")

    // Greek accent normalization.
    .replace(/[ά]/g, "α")
    .replace(/[έ]/g, "ε")
    .replace(/[ήίϊΐ]/g, "ι")
    .replace(/[ό]/g, "ο")
    .replace(/[ύϋΰ]/g, "υ")
    .replace(/[ώ]/g, "ω")

    // Keep only letters, numbers and spaces.
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function includesAny(text: string, words: string[]) {
  return words.some((word) => text.includes(word));
}

/*
  Main category mapping.

  Instead of exact matching every category name,
  we use keywords.

  This is much better for your project because:
  - AB, Lidl, Sklavenitis may use different category names
  - some categories have broken encoded text
  - new categories may appear later
*/
export function getPriceWiseCategory(supermarketCategoryName?: string | null) {
  if (!supermarketCategoryName) {
    return PRICEWISE_CATEGORIES["unknown"];
  }

  const text = normalizeCategoryText(supermarketCategoryName);

  // Fresh fruit / vegetables
  if (
    includesAny(text, [
      "φρεσκα φρουτα",
      "φρουτα",
      "λαχανικα",
      "μανιταρια",
      "κηπος μπαλκονι",
      "φυτα",
      "λουλουδια",
    ])
  ) {
    return PRICEWISE_CATEGORIES["fresh-food"];
  }

  // Meat / fish / poultry
  if (
    includesAny(text, [
      "κρεας",
      "κοτοπουλο",
      "πουλερικα",
      "χοιρινο",
      "μοσχαρι",
      "αλλαντικα",
      "ψαρια",
      "θαλασσινα",
      "ψαρι",
      "νωπα κρεατα",
    ])
  ) {
    return PRICEWISE_CATEGORIES["meat-fish"];
  }

  // Dairy / eggs / chilled desserts
  if (
    includesAny(text, [
      "γαλα",
      "γαλακτοκομικα",
      "τυρια",
      "τυρι",
      "αυγα",
      "βουτυρο",
      "μαργαρινη",
      "γιαουρτι",
      "κρεμα",
      "επιδορπια",
      "φυτικα ροφηματα",
    ])
  ) {
    return PRICEWISE_CATEGORIES["dairy-eggs"];
  }

  // Bread / bakery
  if (
    includesAny(text, [
      "ψωμι",
      "αρτοσκευασματα",
      "φρυγανιες",
      "παξιμαδια",
      "κριτσινια",
      "μπισκοτα",
      "κρουασαν",
      "χαλβας",
    ])
  ) {
    return PRICEWISE_CATEGORIES["bread-bakery"];
  }

  // Drinks
  if (
    includesAny(text, [
      "χυμοι",
      "αναψυκτικα",
      "νερα",
      "νερο",
      "ποτα",
      "μπυρες",
      "κρασι",
      "οινοπνευματωδη",
      "ισοτονικα",
      "ενεργειακα",
    ])
  ) {
    return PRICEWISE_CATEGORIES["drinks"];
  }

  // Coffee / tea / cocoa
  if (
    includesAny(text, [
      "καφες",
      "καφεδες",
      "τσαϊ",
      "τσαι",
      "κακαο",
      "σοκολατα ροφημα",
    ])
  ) {
    return PRICEWISE_CATEGORIES["coffee-tea-cocoa"];
  }

  // Pantry: pasta, rice, legumes, oil, sauces, cans, spices
  if (
    includesAny(text, [
      "ζυμαρικα",
      "μακαρονια",
      "ρυζι",
      "οσπρια",
      "λαδι",
      "ξυδι",
      "κονσερβες",
      "σπιτικες σαλτσες",
      "σαλτσες",
      "dressings",
      "μπαχαρικα",
      "αλευρι",
      "ζαχαρη",
      "μελι",
      "μαρμελαδες",
      "δημητριακα",
      "ντελικατεσεν",
      "μαγειρικη",
      "πραλινα",
    ])
  ) {
    return PRICEWISE_CATEGORIES["pantry"];
  }

  // Frozen
  if (
    includesAny(text, [
      "κατεψυγμενα",
      "παγωτα",
      "χυμοι ψυγειου",
      "χορτοφαγικες λυσεις",
    ])
  ) {
    return PRICEWISE_CATEGORIES["frozen-food"];
  }

  // Ready meals
  if (
    includesAny(text, [
      "ετοιμα γευματα",
      "ετοιμα φαγητα",
      "ετοιμες σαλατες",
      "ετοιμα σαντουιτς",
      "σουπες",
      "πιτσες",
      "φυλλα πιτες",
      "προετοιμασια τραπεζιου",
    ])
  ) {
    return PRICEWISE_CATEGORIES["ready-meals"];
  }

  // Snacks / sweets
  if (
    includesAny(text, [
      "σνακ",
      "ζαχαρωδη",
      "σοκολατες",
      "καραμελες",
      "τσίχλες",
      "τσιχλες",
      "ξηροι καρποι",
      "υγιεινη ζωη",
    ])
  ) {
    return PRICEWISE_CATEGORIES["snacks-sweets"];
  }

  // Baby
  if (
    includesAny(text, [
      "βρεφικες τροφες",
      "βρεφικος",
      "παιδικος",
      "πανες",
      "μωρου",
      "αξεσουαρ για το μωρο",
      "βρεφικη περιποιηση",
      "βρεφικα ρουχα",
    ])
  ) {
    return PRICEWISE_CATEGORIES["baby"];
  }

  // Pet
  if (
    includesAny(text, [
      "τροφες κατοικιδιων",
      "κατοικιδιο",
      "για γατες",
      "για σκυλους",
      "λιχουδιες για κατοικιδια",
    ])
  ) {
    return PRICEWISE_CATEGORIES["pet"];
  }

  // Health / beauty / personal care
  if (
    includesAny(text, [
      "υγεια",
      "ομορφια",
      "προσωπικη υγιεινη",
      "φροντιδα σωματος",
      "φροντιδα μαλλιων",
      "στοματικη υγιεινη",
      "θερμανση",
      "φροντιδα περιποιηση",
    ])
  ) {
    return PRICEWISE_CATEGORIES["health-beauty"];
  }

  // Cleaning / household
  if (
    includesAny(text, [
      "χαρτι οικιακης χρησης",
      "ειδη οικιακης χρησης",
      "καθαρισμου",
      "καθαριοτητα",
      "απορρυπαντικα",
      "πλυντηριου ρουχων",
      "πιατων",
      "αποθηκευση οργανωση",
      "κουζινα σε τραπεζαρια",
    ])
  ) {
    return PRICEWISE_CATEGORIES["cleaning-household"];
  }

  // Home / garden / tools
  if (
    includesAny(text, [
      "κηπος",
      "μπαλκονι",
      "φυτικα",
      "διακοσμηση",
      "εργαλεια",
      "μπαταριας",
      "εργαστηριου",
      "χειρος",
      "καμπινγκ",
      "δραστηριοτητες",
      "ομαδικα αθληματα",
      "ειδη γυμναστικης",
    ])
  ) {
    return PRICEWISE_CATEGORIES["home-garden"];
  }

  // Clothing
  if (
    includesAny(text, [
      "ανδρικη ενδυση",
      "γυναικεια μοδα",
      "γυναικεια ενδυση",
      "ρουχα",
      "υποδηματα",
    ])
  ) {
    return PRICEWISE_CATEGORIES["clothing"];
  }

  // Non-grocery / equipment / electronics
  if (
    includesAny(text, [
      "ηλεκτρικα εργαλεια",
      "ηλεκτρικες συσκευες",
      "εξοπλισμος εργαστηριου",
      "εξοπλισμος κηπου",
      "συσκευες κουζινας",
      "εργαλεια μπαταριας",
      "μπαταριες",
      "σχολικα ειδη",
      "παιχνιδια",
      "αξεσουαρ",
    ])
  ) {
    return PRICEWISE_CATEGORIES["non-grocery"];
  }

  return PRICEWISE_CATEGORIES["unknown"];
}