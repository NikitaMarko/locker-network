-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'OPERATOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "StationStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "LockerSize" AS ENUM ('S', 'M', 'L');

-- CreateEnum
CREATE TYPE "LockerStatus" AS ENUM ('AVAILABLE', 'RESERVED', 'OCCUPIED', 'FAULTY', 'EXPIRED');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'ACTIVE', 'ENDED', 'FAILED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "ErrorSeverity" AS ENUM ('INFO', 'WARN', 'ERROR', 'CRITICAL');

-- CreateEnum
CREATE TYPE "DeviceOnlineStatus" AS ENUM ('ONLINE', 'OFFLINE');

-- CreateEnum
CREATE TYPE "DoorStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "LockStatus" AS ENUM ('LOCKED', 'UNLOCKED');

-- CreateTable
CREATE TABLE "User" (
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "refreshToken" TEXT,
    "tokenVersion" INTEGER NOT NULL DEFAULT 0,
    "passwordChangedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "LockerStation" (
    "stationId" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "address" TEXT,
    "latitude" TEXT NOT NULL,
    "longitude" TEXT NOT NULL,
    "status" "StationStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LockerStation_pkey" PRIMARY KEY ("stationId")
);

-- CreateTable
CREATE TABLE "LockerBox" (
    "lockerBoxId" TEXT NOT NULL,
    "stationId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "size" "LockerSize" NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "status" "LockerStatus" NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LockerBox_pkey" PRIMARY KEY ("lockerBoxId")
);

-- CreateTable
CREATE TABLE "LockerDevice" (
    "deviceId" TEXT NOT NULL,
    "lockerBoxId" TEXT NOT NULL,
    "onlineStatus" "DeviceOnlineStatus" NOT NULL DEFAULT 'ONLINE',
    "doorStatus" "DoorStatus" NOT NULL DEFAULT 'CLOSED',
    "lockStatus" "LockStatus" NOT NULL DEFAULT 'LOCKED',
    "lastHeartbeat" TIMESTAMP(3),
    "firmware" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LockerDevice_pkey" PRIMARY KEY ("deviceId")
);

-- CreateTable
CREATE TABLE "Booking" (
    "bookingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lockerBoxId" TEXT NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "startTime" TIMESTAMP(3),
    "expectedEndTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "totalPrice" DECIMAL(10,2),
    "correlationId" TEXT NOT NULL,
    "requestId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("bookingId")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "lockerId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE INDEX "LockerStation_city_idx" ON "LockerStation"("city");

-- CreateIndex
CREATE UNIQUE INDEX "LockerBox_code_key" ON "LockerBox"("code");

-- CreateIndex
CREATE INDEX "LockerBox_stationId_idx" ON "LockerBox"("stationId");

-- CreateIndex
CREATE INDEX "LockerBox_status_idx" ON "LockerBox"("status");

-- CreateIndex
CREATE UNIQUE INDEX "LockerBox_stationId_code_key" ON "LockerBox"("stationId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "LockerDevice_lockerBoxId_key" ON "LockerDevice"("lockerBoxId");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_requestId_key" ON "Booking"("requestId");

-- CreateIndex
CREATE INDEX "Booking_lockerBoxId_idx" ON "Booking"("lockerBoxId");

-- CreateIndex
CREATE INDEX "Booking_userId_idx" ON "Booking"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_actorId_idx" ON "AuditLog"("actorId");

-- CreateIndex
CREATE INDEX "AuditLog_lockerId_idx" ON "AuditLog"("lockerId");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "LockerBox" ADD CONSTRAINT "LockerBox_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "LockerStation"("stationId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LockerDevice" ADD CONSTRAINT "LockerDevice_lockerBoxId_fkey" FOREIGN KEY ("lockerBoxId") REFERENCES "LockerBox"("lockerBoxId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_lockerBoxId_fkey" FOREIGN KEY ("lockerBoxId") REFERENCES "LockerBox"("lockerBoxId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_lockerId_fkey" FOREIGN KEY ("lockerId") REFERENCES "LockerBox"("lockerBoxId") ON DELETE SET NULL ON UPDATE CASCADE;
