/*
  Warnings:

  - You are about to drop the column `category` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `matchKey` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `normalizedCategory` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `sizeUnit` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `sizeValue` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `ProductGroup` table. All the data in the column will be lost.
  - You are about to drop the column `matchKey` on the `ProductGroup` table. All the data in the column will be lost.
  - You are about to drop the column `photoURL` on the `ProductGroup` table. All the data in the column will be lost.
  - You are about to drop the column `sizeUnit` on the `ProductGroup` table. All the data in the column will be lost.
  - You are about to drop the column `sizeValue` on the `ProductGroup` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[categoryId,normalizedName]` on the table `ProductGroup` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `categoryId` to the `ProductGroup` table without a default value. This is not possible if the table is not empty.
  - Added the required column `normalizedName` to the `ProductGroup` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Product_category_idx";

-- DropIndex
DROP INDEX "Product_matchKey_idx";

-- DropIndex
DROP INDEX "Product_normalizedCategory_idx";

-- DropIndex
DROP INDEX "ProductGroup_matchKey_key";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "category",
DROP COLUMN "matchKey",
DROP COLUMN "normalizedCategory",
DROP COLUMN "sizeUnit",
DROP COLUMN "sizeValue",
ADD COLUMN     "categoryId" TEXT,
ADD COLUMN     "categoryName" TEXT,
ADD COLUMN     "size" TEXT;

-- AlterTable
ALTER TABLE "ProductGroup" DROP COLUMN "category",
DROP COLUMN "matchKey",
DROP COLUMN "photoURL",
DROP COLUMN "sizeUnit",
DROP COLUMN "sizeValue",
ADD COLUMN     "categoryId" TEXT NOT NULL,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "normalizedName" TEXT NOT NULL,
ADD COLUMN     "size" TEXT;

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Product_categoryName_idx" ON "Product"("categoryName");

-- CreateIndex
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");

-- CreateIndex
CREATE INDEX "Product_normalizedName_idx" ON "Product"("normalizedName");

-- CreateIndex
CREATE INDEX "ProductGroup_categoryId_idx" ON "ProductGroup"("categoryId");

-- CreateIndex
CREATE INDEX "ProductGroup_normalizedName_idx" ON "ProductGroup"("normalizedName");

-- CreateIndex
CREATE UNIQUE INDEX "ProductGroup_categoryId_normalizedName_key" ON "ProductGroup"("categoryId", "normalizedName");

-- AddForeignKey
ALTER TABLE "ProductGroup" ADD CONSTRAINT "ProductGroup_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
