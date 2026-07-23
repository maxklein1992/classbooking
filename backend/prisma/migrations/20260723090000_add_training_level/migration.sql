-- CreateEnum
CREATE TYPE "Level" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- AlterTable
ALTER TABLE "Training" ADD COLUMN     "level" "Level";

-- CreateIndex
CREATE INDEX "Training_level_idx" ON "Training"("level");
