import fs from "fs";
import csv from "csv-parser";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface Shipment {
  fromCountryCode: string;
  toCountryCode: string;
  zipcode: string;
  flow: string;
  ldmRates: { [key: number]: number };
}

async function main() {
  const shipments: Shipment[] = [];

  // Parse CSV file
  fs.createReadStream("path/to/your/DSV - Sheet1.csv")
    .pipe(csv({ separator: "," }))
    .on("data", (row) => {
      if (row["Unnamed: 1"] && row["Unnamed: 2"] && row["Unnamed: 3"]) {
        // Extract data
        const fromCountryCode = "NL"; // Assuming Netherlands for all rows as per the file
        const toCountryCode = row["Unnamed: 1"];
        const zipcode = row["Unnamed: 2"];
        const flow = row["Unnamed: 3"];
        const ldmRates: { [key: number]: number } = {};

        for (let i = 4; i < Object.keys(row).length; i += 2) {
          if (
            row[Object.keys(row)[i]] &&
            row[Object.keys(row)[i]].replace(",", ".")
          ) {
            const ldm = parseFloat(
              Object.keys(row)[i].split(" ")[1].replace(",", "."),
            );
            const rate = parseFloat(row[Object.keys(row)[i]].replace(",", "."));
            ldmRates[ldm] = rate;
          }
        }

        shipments.push({
          fromCountryCode,
          toCountryCode,
          zipcode,
          flow,
          ldmRates,
        });
      }
    })
    .on("end", async () => {
      // Get or create countries and carrier
      const fromCountry = await prisma.country.upsert({
        where: { code: "NL" },
        update: {},
        create: { code: "NL" },
      });

      // Upsert countries based on the 'toCountryCode' values in the CSV
      const uniqueToCountryCodes = [
        ...new Set(shipments.map((s) => s.toCountryCode)),
      ];
      const toCountries: { [code: string]: any } = {};
      for (const code of uniqueToCountryCodes) {
        toCountries[code] = await prisma.country.upsert({
          where: { code },
          update: {},
          create: { code },
        });
      }

      const carrier = await prisma.carrier.upsert({
        where: { name: "Dsv" },
        update: {},
        create: { name: "Dsv" },
      });

      // Insert shipments and LDM values
      for (const shipment of shipments) {
        const newShipment = await prisma.shipment.create({
          data: {
            fromCountryId: fromCountry.id,
            toCountryId: toCountries[shipment.toCountryCode].id,
            zipcode: shipment.zipcode,
            flow: shipment.flow,
            carrierId: carrier.id,
            ldmValues: {
              create: Object.entries(shipment.ldmRates).map(([ldm, rate]) => ({
                ldm: parseFloat(ldm),
                rate: parseFloat(rate),
              })),
            },
          },
        });
      }

      console.log("Data import complete");
      await prisma.$disconnect();
    });
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
