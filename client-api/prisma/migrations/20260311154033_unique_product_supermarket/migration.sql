/*
  Warnings:

  - A unique constraint covering the columns `[productKey,supermarket]` on the table `Product` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Product_productKey_supermarket_key" ON "Product"("productKey", "supermarket");
