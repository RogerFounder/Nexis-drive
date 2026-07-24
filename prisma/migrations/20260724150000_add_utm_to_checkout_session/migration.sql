-- AlterTable: capture UTM params from the landing page click, all optional
ALTER TABLE "checkout_sessions"
  ADD COLUMN "utmSource" TEXT,
  ADD COLUMN "utmMedium" TEXT,
  ADD COLUMN "utmCampaign" TEXT,
  ADD COLUMN "utmContent" TEXT,
  ADD COLUMN "utmTerm" TEXT;

-- CreateIndex
CREATE INDEX "checkout_sessions_utmSource_utmCampaign_idx" ON "checkout_sessions"("utmSource", "utmCampaign");
