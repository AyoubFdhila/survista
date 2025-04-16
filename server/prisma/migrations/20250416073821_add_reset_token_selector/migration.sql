/*
  Warnings:

  - A unique constraint covering the columns `[selector]` on the table `PasswordResetToken` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `selector` to the `PasswordResetToken` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "PasswordResetToken_token_key";

-- AlterTable
ALTER TABLE "PasswordResetToken" ADD COLUMN     "selector" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_selector_key" ON "PasswordResetToken"("selector");
