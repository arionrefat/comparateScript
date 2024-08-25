/*
  Warnings:

  - The values [Tarieven] on the enum `CarrierName` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CarrierName_new" AS ENUM ('Dsv', 'ScanGlobalLogistics', 'VanDijken', 'ThomasBoers', 'Roemaat', 'Raben', 'Rabelink', 'Palletways', 'NTGRoad', 'MooijTransport', 'Mandersloot', 'Drost', 'Lusocargo', 'Leodejong', 'Kingsrod', 'Alles', 'TarievenDeWit', 'TarievenElst', 'Dimetra', 'Rhenus', 'TarievenEasy');
ALTER TABLE "Carrier" ALTER COLUMN "name" TYPE "CarrierName_new" USING ("name"::text::"CarrierName_new");
ALTER TYPE "CarrierName" RENAME TO "CarrierName_old";
ALTER TYPE "CarrierName_new" RENAME TO "CarrierName";
DROP TYPE "CarrierName_old";
COMMIT;
