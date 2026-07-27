-- CreateTable
CREATE TABLE "SessionReplay" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "seq" SERIAL NOT NULL,
    "data" BYTEA NOT NULL,
    "eventCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SessionReplay_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SessionReplay_sessionId_seq_idx" ON "SessionReplay"("sessionId", "seq");

-- AddForeignKey
ALTER TABLE "SessionReplay" ADD CONSTRAINT "SessionReplay_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
