-- CreateTable
CREATE TABLE "TrainingSeries" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sport" "Sport" NOT NULL,
    "location" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "neighborhood" TEXT,
    "postalCode" TEXT,
    "capacity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "freeTrialAvailable" BOOLEAN NOT NULL DEFAULT false,
    "daysOfWeek" INTEGER[],
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "activeFrom" TIMESTAMP(3) NOT NULL,
    "activeUntil" TIMESTAMP(3) NOT NULL,
    "trainerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingSeries_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Training" ADD COLUMN "seriesId" TEXT;

-- CreateIndex
CREATE INDEX "Training_seriesId_idx" ON "Training"("seriesId");

-- AddForeignKey
ALTER TABLE "Training" ADD CONSTRAINT "Training_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "TrainingSeries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingSeries" ADD CONSTRAINT "TrainingSeries_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
