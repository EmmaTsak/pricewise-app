/*
  Warnings:

  - A unique constraint covering the columns `[productGroupId,supermarket]` on the table `Product` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Product_productGroupId_supermarket_key" ON "Product"("productGroupId", "supermarket");
