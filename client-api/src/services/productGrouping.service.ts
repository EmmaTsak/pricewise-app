import prisma from "../config/prisma";
import { getPriceWiseCategory } from "../utils/categoryMap";
import { getProductMatchData } from "../utils/normalizeProduct";
import { calculateProductMatchPercentage } from "../utils/stringSimilarity";

const MATCH_THRESHOLD = 70;

type ProductForGrouping = {
  id: string;
  name: string;
  productKey: string;
  supermarket: string;
  categoryName: string | null;
  photoURL: string | null;
};

type InMemoryGroup = {
  name: string;
  categoryId: string;
  categorySlug: string;
  size: string | null;
  imageUrl: string | null;
  products: ProductForGrouping[];
  comparableName: string;
  brand: string | null;
  variantWords: string[];
};

function groupHasSupermarket(group: InMemoryGroup, supermarket: string) {
  return group.products.some(
    (product) =>
      product.supermarket.toLowerCase() === supermarket.toLowerCase()
  );
}

export async function rebuildProductGroups() {
  console.log("Starting fuzzy product grouping...");
  console.log(`Match threshold: ${MATCH_THRESHOLD}%`);

  await prisma.product.updateMany({
    data: {
      productGroupId: null,
      categoryId: null,
      normalizedName: null,
      size: null,
    },
  });

  await prisma.productGroup.deleteMany();

  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      productKey: true,
      supermarket: true,
      categoryName: true,
      photoURL: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  console.log(`Found ${products.length} products.`);

  const categoryCache = new Map<string, { id: string; slug: string }>();

  const groups: InMemoryGroup[] = [];

  for (const product of products) {
    const priceWiseCategory = getPriceWiseCategory(product.categoryName);

    let category = categoryCache.get(priceWiseCategory.slug);

    if (!category) {
      const dbCategory = await prisma.category.upsert({
        where: {
          slug: priceWiseCategory.slug,
        },
        update: {
          name: priceWiseCategory.name,
        },
        create: {
          name: priceWiseCategory.name,
          slug: priceWiseCategory.slug,
        },
      });

      category = {
        id: dbCategory.id,
        slug: dbCategory.slug,
      };

      categoryCache.set(priceWiseCategory.slug, category);
    }

    const matchData = getProductMatchData(product.name);

    let bestGroup: InMemoryGroup | null = null;
    let bestScore = 0;
    let bestRejectedReason = "No candidate found";

    for (const group of groups) {

      if (group.categorySlug !== category.slug) {
        continue;
      }

      if (group.size && matchData.size && group.size !== matchData.size) {
        continue;
      }

      if (groupHasSupermarket(group, product.supermarket)) {
        continue;
      }

      if (group.brand && matchData.brand && group.brand !== matchData.brand) {
        continue;
      }

      const score = calculateProductMatchPercentage({
        nameA: group.comparableName,
        nameB: matchData.comparableName,
        sizeA: group.size,
        sizeB: matchData.size,
        variantWordsA: group.variantWords,
        variantWordsB: matchData.variantWords,
      });

      if (score > bestScore) {
        bestScore = score;
        bestGroup = group;
        bestRejectedReason = `Best score was ${score}%`;
      }
    }

    if (bestGroup && bestScore >= MATCH_THRESHOLD) {
      bestGroup.products.push(product);

      console.log(
        `MATCH ${bestScore}%: ${product.name} (${product.supermarket}) -> ${bestGroup.name}`
      );
    } else {
      if (bestGroup && bestScore >= 45) {
        console.log("");
        console.log(`NEAR MISS ${bestScore}%`);
        console.log(`  Product: ${product.name} (${product.supermarket})`);
        console.log(`  Candidate group: ${bestGroup.name}`);
        console.log(`  Product comparableName: ${matchData.comparableName}`);
        console.log(`  Group comparableName: ${bestGroup.comparableName}`);
        console.log(`  Product size: ${matchData.size}`);
        console.log(`  Group size: ${bestGroup.size}`);
        console.log(`  Reason: ${bestRejectedReason}`);
        console.log("");
      }

      groups.push({
        name: product.name,
        categoryId: category.id,
        categorySlug: category.slug,
        size: matchData.size,
        imageUrl: product.photoURL,
        products: [product],
        comparableName: matchData.comparableName,
        brand: matchData.brand,
        variantWords: matchData.variantWords,
      });
    }
  }

  console.log(`Created ${groups.length} in-memory groups.`);
  console.log("Saving groups to database...");

  for (const [groupIndex, group] of groups.entries()) {
    const normalizedName = [
        group.categorySlug,
        group.comparableName || "unknown-name",
        group.size ?? "no-size",
        group.products.map((product) => product.supermarket).sort().join("-"),
        groupIndex,
    ].join(":");

    const dbGroup = await prisma.productGroup.create({
      data: {
        name: group.name,
        normalizedName,
        brand: group.brand,
        size: group.size,
        imageUrl: group.imageUrl,
        categoryId: group.categoryId,
      },
    });

    for (const product of group.products) {
      await prisma.product.update({
        where: {
          id: product.id,
        },
        data: {
          categoryId: group.categoryId,
          productGroupId: dbGroup.id,
          normalizedName,
          size: group.size,
        },
      });
    }
  }

  const comparableGroups = groups.filter((group) => {
    const supermarkets = new Set(
      group.products.map((product) => product.supermarket)
    );

    return supermarkets.size >= 2;
  });

  console.log("Product grouping finished.");
  console.log(`Total products: ${products.length}`);
  console.log(`Total groups: ${groups.length}`);
  console.log(`Comparable groups: ${comparableGroups.length}`);

  return {
    totalProducts: products.length,
    totalGroups: groups.length,
    comparableGroups: comparableGroups.length,
  };
}