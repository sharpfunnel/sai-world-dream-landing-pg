-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScrollEvent" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "depth" INTEGER NOT NULL,
    "timeToReach" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScrollEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CtaEvent" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "ctaId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "timeBeforeClick" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CtaEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormEvent" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "fieldName" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FormEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerformanceMetric" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "rating" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PerformanceMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ErrorEvent" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "stack" TEXT,
    "path" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ErrorEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Event_sessionId_idx" ON "Event"("sessionId");

-- CreateIndex
CREATE INDEX "Event_name_idx" ON "Event"("name");

-- CreateIndex
CREATE INDEX "ScrollEvent_sessionId_idx" ON "ScrollEvent"("sessionId");

-- CreateIndex
CREATE INDEX "ScrollEvent_path_depth_idx" ON "ScrollEvent"("path", "depth");

-- CreateIndex
CREATE INDEX "CtaEvent_sessionId_idx" ON "CtaEvent"("sessionId");

-- CreateIndex
CREATE INDEX "CtaEvent_ctaId_action_idx" ON "CtaEvent"("ctaId", "action");

-- CreateIndex
CREATE INDEX "FormEvent_sessionId_idx" ON "FormEvent"("sessionId");

-- CreateIndex
CREATE INDEX "FormEvent_formId_action_idx" ON "FormEvent"("formId", "action");

-- CreateIndex
CREATE INDEX "PerformanceMetric_sessionId_idx" ON "PerformanceMetric"("sessionId");

-- CreateIndex
CREATE INDEX "PerformanceMetric_path_metric_idx" ON "PerformanceMetric"("path", "metric");

-- CreateIndex
CREATE INDEX "ErrorEvent_sessionId_idx" ON "ErrorEvent"("sessionId");

-- CreateIndex
CREATE INDEX "ErrorEvent_type_createdAt_idx" ON "ErrorEvent"("type", "createdAt");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScrollEvent" ADD CONSTRAINT "ScrollEvent_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CtaEvent" ADD CONSTRAINT "CtaEvent_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormEvent" ADD CONSTRAINT "FormEvent_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformanceMetric" ADD CONSTRAINT "PerformanceMetric_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ErrorEvent" ADD CONSTRAINT "ErrorEvent_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
