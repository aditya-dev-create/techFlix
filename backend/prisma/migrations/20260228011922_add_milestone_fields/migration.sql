-- AlterTable
ALTER TABLE "Milestone" ADD COLUMN     "fundsReleased" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "milestoneIndex" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "requiredApprovals" INTEGER NOT NULL DEFAULT 1;
