-- AlterEnum
ALTER TYPE "StationStatus" ADD VALUE 'READY';

-- AlterTable
ALTER TABLE "LockerStation" ALTER COLUMN "status" SET DEFAULT 'INACTIVE';

-- DropTable
DROP TABLE "OutboxEvent";

-- DropEnum
DROP TYPE "OutboxEventStatus";
