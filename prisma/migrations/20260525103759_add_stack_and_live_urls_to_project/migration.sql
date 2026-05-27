/*
  Warnings:

  - You are about to drop the column `liveUrl` on the `Project` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Project" DROP COLUMN "liveUrl",
ADD COLUMN     "liveUrls" TEXT[],
ADD COLUMN     "stack" VARCHAR(100);
