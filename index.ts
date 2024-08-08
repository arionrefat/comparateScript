import { PrismaClient } from "@prisma/client";
import Papa from "papaparse";
import fs from "fs";

const prisma = new PrismaClient();

interface Shipment {
  fromCountryCode: string;
  toCountryCode: string;
  zipcode: string;
  flow: string;
  ldmRates: { [key: number]: number };
}

async function main() {
  try {
    const csvString = fs.readFileSync(
      "./Thomas Boers import upload - Sheet1.csv",
      "utf8",
    );

    Papa.parse(csvString, {
      header: true,
      dynamicTyping: true,
      complete: async function (results) {
        const shipments: Shipment[] = results.data.map((row: any) => {
          const ldmRates: { [key: number]: number } = {};

          // for (const key in row) {
          //   if (key.startsWith("LDM-")) {
          //     const ldmValue = parseFloat(key.replace("LDM-", ""));
          //     ldmRates[ldmValue] = parseFloat(
          //       (row[key] || "0").replace("€", "").replace(",", "."),
          //     );
          //   }
          // }

          for (const key in row) {
            if (key.startsWith("LDM-")) {
              const ldmValue = parseFloat(key.replace("LDM-", ""));
              let value = row[key];

              if (typeof value === "string") {
                value = value.replace("€", "").replace(",", ".");
              }

              ldmRates[ldmValue] = parseFloat(value || "0");
            }
          }

          return {
            fromCountryCode: row["Zone Netherlands"],
            toCountryCode: row["Country"],
            zipcode: String(row["ZIP"]),
            flow: row["Flow"],
            ldmRates: ldmRates,
          };
        });

        // Ensure the Carrier exists
        let carrier = await prisma.carrier.findUnique({
          where: { name: "ThomasBoers" }, // Change this to the appropriate carrier name if needed
        });
        if (!carrier) {
          carrier = await prisma.carrier.create({
            data: { name: "ThomasBoers" },
          });
        }

        for (const shipment of shipments) {
          if (!shipment.fromCountryCode || !shipment.toCountryCode) {
            console.warn("Missing country code in shipment:", shipment);
            continue; // Skip this shipment if country codes are missing
          }

          // Find or create the from country
          let fromCountry = await prisma.country.findUnique({
            where: { code: shipment.fromCountryCode },
          });
          if (!fromCountry) {
            fromCountry = await prisma.country.create({
              data: { code: shipment.fromCountryCode },
            });
          }

          // Find or create the to country
          let toCountry = await prisma.country.findUnique({
            where: { code: shipment.toCountryCode },
          });
          if (!toCountry) {
            toCountry = await prisma.country.create({
              data: { code: shipment.toCountryCode },
            });
          }

          // Create the shipment
          await prisma.shipment.create({
            data: {
              fromCountry: {
                connect: { id: fromCountry.id },
              },
              toCountry: {
                connect: { id: toCountry.id },
              },
              zipcode: shipment.zipcode,
              flow: shipment.flow,
              ldmRates: shipment.ldmRates,
              carrier: {
                connect: { id: carrier.id },
              },
            },
          });
        }
      },
    });
  } catch (err) {
    console.error("Error reading CSV file:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
