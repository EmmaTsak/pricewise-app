const tokenize = (text: string) => {
  return text
    .split(" ")
    .map((word) => word.trim())
    .filter(Boolean);
};

const unique = (items: string[]) => {
  return Array.from(new Set(items));
};

const tokenSimilarity = (a: string, b: string) => {
  const tokensA = unique(tokenize(a));
  const tokensB = unique(tokenize(b));

  if (tokensA.length === 0 || tokensB.length === 0) {
    return 0;
  }

  const shared = tokensA.filter((token) => tokensB.includes(token));

  return (2 * shared.length) / (tokensA.length + tokensB.length);
};

const containsSimilarity = (a: string, b: string) => {
  if (!a || !b) {
    return 0;
  }

  const shorter = a.length <= b.length ? a : b;
  const longer = a.length > b.length ? a : b;

  if (longer.includes(shorter)) {
    return shorter.length / longer.length;
  }

  return 0;
};

const levenshteinDistance = (a: string, b: string) => {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
};

const levenshteinSimilarity = (a: string, b: string) => {
  if (!a || !b) {
    return 0;
  }

  const maxLength = Math.max(a.length, b.length);

  if (maxLength === 0) {
    return 1;
  }

  const distance = levenshteinDistance(a, b);

  return 1 - distance / maxLength;
};

const sameVariantWords = (a: string[], b: string[]) => {
  const sortedA = [...a].sort().join("|");
  const sortedB = [...b].sort().join("|");

  return sortedA === sortedB;
};

export const calculateProductMatchPercentage = (params: {
  nameA: string;
  nameB: string;
  sizeA: string | null;
  sizeB: string | null;
  variantWordsA: string[];
  variantWordsB: string[];
}) => {
  const {
    nameA,
    nameB,
    sizeA,
    sizeB,
    variantWordsA,
    variantWordsB,
  } = params;

  /*
    If both sizes exist and they are different,
    do not match.

    Example:
    Coca-Cola 1.5L
    Coca-Cola 330ml
  */
  if (sizeA && sizeB && sizeA !== sizeB) {
    return 0;
  }

  /*
    If one says Zero/Light and the other does not,
    do not match.
  */
  if (!sameVariantWords(variantWordsA, variantWordsB)) {
    return 0;
  }

  const tokenScore = tokenSimilarity(nameA, nameB);
  const textScore = levenshteinSimilarity(nameA, nameB);
  const containsScore = containsSimilarity(nameA, nameB);

  /*
    We use the strongest useful signal.

    Token score is usually best for product names.
    Contains score helps when one name is shorter.
    Levenshtein helps with small spelling differences.
  */
  const finalScore = Math.max(
    tokenScore * 0.75 + textScore * 0.25,
    containsScore
  );

  return Math.round(finalScore * 100);
};