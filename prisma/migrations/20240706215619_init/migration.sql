-- CreateEnum
CREATE TYPE "CarrierName" AS ENUM ('Dsv', 'ScanGlobalLogistics', 'VanDijken', 'ThomasBoers', 'Roemaat', 'Raben', 'Rabelink', 'Palletways', 'NTGRoad', 'MooijTransport', 'Mandersloot');

-- CreateTable
CREATE TABLE "Carrier" (
    "id" SERIAL NOT NULL,
    "name" "CarrierName" NOT NULL,

    CONSTRAINT "Carrier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Country" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shipment" (
    "id" SERIAL NOT NULL,
    "fromCountryId" INTEGER NOT NULL,
    "toCountryId" INTEGER NOT NULL,
    "zipcode" TEXT NOT NULL,
    "flow" TEXT NOT NULL,
    "ldmRates" JSONB NOT NULL,
    "carrierId" INTEGER NOT NULL,
    "countryId" INTEGER,

    CONSTRAINT "Shipment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Carrier_name_key" ON "Carrier"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Country_code_key" ON "Country"("code");

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_fromCountryId_fkey" FOREIGN KEY ("fromCountryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_toCountryId_fkey" FOREIGN KEY ("toCountryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "Carrier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;
