-- AlterTable
ALTER TABLE "User" ADD COLUMN     "teamMembers" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
