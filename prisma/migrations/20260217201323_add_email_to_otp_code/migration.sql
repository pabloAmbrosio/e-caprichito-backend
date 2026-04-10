-- AlterTable
ALTER TABLE "OTPCode" ADD COLUMN     "email" TEXT,
ALTER COLUMN "phone" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "OTPCode_userId_email_verified_idx" ON "OTPCode"("userId", "email", "verified");
