/*
  Warnings:

  - The primary key for the `RateLimit` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `RateLimit` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[identifier]` on the table `RateLimit` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `identifier` to the `RateLimit` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "RateLimit_resetTime_idx";

-- AlterTable
ALTER TABLE "RateLimit" DROP CONSTRAINT "RateLimit_pkey",
ADD COLUMN     "identifier" VARCHAR(100) NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE INDEX "ContactMessage_createdAt_isRead_idx" ON "ContactMessage"("createdAt", "isRead");

-- CreateIndex
CREATE UNIQUE INDEX "RateLimit_identifier_key" ON "RateLimit"("identifier");

-- CreateIndex
CREATE INDEX "RateLimit_identifier_resetTime_idx" ON "RateLimit"("identifier", "resetTime");
