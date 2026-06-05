-- AlterTable
ALTER TABLE "About" ADD COLUMN     "availability" VARCHAR(100),
ADD COLUMN     "availabilityTh" VARCHAR(100),
ADD COLUMN     "status" VARCHAR(500),
ADD COLUMN     "statusTh" VARCHAR(500),
ADD COLUMN     "yearsOfExperience" INTEGER DEFAULT 0;
