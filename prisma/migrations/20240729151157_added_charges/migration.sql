-- AlterTable
ALTER TABLE "Carrier" ADD COLUMN     "fuelSurchargePercentage" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "maxWeightPerLDM" INTEGER NOT NULL DEFAULT 0;
