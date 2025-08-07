/*
  Warnings:

  - A unique constraint covering the columns `[identifier,token,type]` on the table `verificationtokens` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `type` to the `verificationtokens` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AuthTokenType" AS ENUM ('EMAIL_VERIFICATION', 'PASSWORD_RESET');

-- CreateEnum
CREATE TYPE "OtpType" AS ENUM ('PHONE_VERIFICATION', 'TWO_FACTOR_AUTH');

-- DropIndex
DROP INDEX "verificationtokens_identifier_token_key";

-- AlterTable
ALTER TABLE "verificationtokens" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "type" "AuthTokenType" NOT NULL;

-- CreateTable
CREATE TABLE "otps" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "type" "OtpType" NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "otps_expiresAt_idx" ON "otps"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "otps_userId_type_key" ON "otps"("userId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "verificationtokens_identifier_token_type_key" ON "verificationtokens"("identifier", "token", "type");

-- AddForeignKey
ALTER TABLE "otps" ADD CONSTRAINT "otps_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
