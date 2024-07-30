-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "CarrierName" ADD VALUE 'Lusocargo';
ALTER TYPE "CarrierName" ADD VALUE 'Leodejong';
ALTER TYPE "CarrierName" ADD VALUE 'Kingsrod';
ALTER TYPE "CarrierName" ADD VALUE 'Alles';
ALTER TYPE "CarrierName" ADD VALUE 'Tarieven';
ALTER TYPE "CarrierName" ADD VALUE 'Dimetra';
