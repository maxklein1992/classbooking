-- AlterTable
ALTER TABLE "Training" ADD COLUMN     "teacherId" TEXT;

-- CreateIndex
CREATE INDEX "Training_teacherId_idx" ON "Training"("teacherId");

-- AddForeignKey
ALTER TABLE "Training" ADD CONSTRAINT "Training_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
