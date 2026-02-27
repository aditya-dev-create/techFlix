/*
  Warnings:

  - A unique constraint covering the columns `[blockchainId]` on the table `Campaign` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "blockchainId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Campaign_blockchainId_key" ON "Campaign"("blockchainId");
