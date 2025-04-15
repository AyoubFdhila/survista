/*
  Warnings:

  - You are about to drop the column `tokenHash` on the `RefreshToken` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Integration` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SurveyManagerProfile` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `Company` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[jti]` on the table `RefreshToken` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `jti` to the `RefreshToken` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Integration" DROP CONSTRAINT "Integration_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "SurveyManagerProfile" DROP CONSTRAINT "SurveyManagerProfile_companyId_fkey";

-- DropForeignKey
ALTER TABLE "SurveyManagerProfile" DROP CONSTRAINT "SurveyManagerProfile_userId_fkey";

-- DropIndex
DROP INDEX "RefreshToken_tokenHash_key";

-- AlterTable
ALTER TABLE "RefreshToken" DROP COLUMN "tokenHash",
ADD COLUMN     "jti" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "name",
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lastLogin" TIMESTAMP(3),
ADD COLUMN     "lastName" TEXT NOT NULL;

-- DropTable
DROP TABLE "Integration";

-- DropTable
DROP TABLE "SurveyManagerProfile";

-- CreateTable
CREATE TABLE "Profile" (
    "profileId" TEXT NOT NULL,
    "jobTitle" TEXT,
    "avatarUrl" TEXT,
    "heardFrom" TEXT,
    "companyLogo" TEXT,
    "companyWebsite" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("profileId")
);

-- CreateTable
CREATE TABLE "ThirdPartyIntegration" (
    "integrationId" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "configDetails" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ThirdPartyIntegration_pkey" PRIMARY KEY ("integrationId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Company_name_key" ON "Company"("name");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_jti_key" ON "RefreshToken"("jti");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("companyId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThirdPartyIntegration" ADD CONSTRAINT "ThirdPartyIntegration_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
