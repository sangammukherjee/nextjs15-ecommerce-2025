/*
  Warnings:

  - A unique constraint covering the columns `[cartId,productId,size,color]` on the table `CartItem` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "CartItem_cartId_productId_size_color_key" ON "CartItem"("cartId", "productId", "size", "color");
