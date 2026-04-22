-- CreateTable
CREATE TABLE "audit_log" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userAzureId" TEXT,
    "userEmail" TEXT,
    "userDisplay" TEXT,
    "method" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "resource" TEXT,
    "resourceId" TEXT,
    "action" TEXT NOT NULL,
    "statusCode" INTEGER NOT NULL,
    "payload" JSONB,
    "response" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audit_log_timestamp_idx" ON "audit_log"("timestamp");

-- CreateIndex
CREATE INDEX "audit_log_userAzureId_idx" ON "audit_log"("userAzureId");

-- CreateIndex
CREATE INDEX "audit_log_resource_resourceId_idx" ON "audit_log"("resource", "resourceId");
