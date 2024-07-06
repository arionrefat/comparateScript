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
  // Read the CSV file
  fs.readFile("./DSV - DSV - Sheet1.csv", "utf8", async (err, csvString) => {
    if (err) {
      console.error("Error reading CSV file:", err);
      return;
    }

    // Parse CSV
    Papa.parse(csvString, {
      header: true,
      dynamicTyping: true,
      complete: async function (results) {
        const shipments: Shipment[] = results.data.map((row: any) => {
          const ldmRates: { [key: number]: number } = {};

          for (const key in row) {
            if (key.startsWith("LDM-")) {
              const ldmValue = parseFloat(key.replace("LDM-", ""));
              ldmRates[ldmValue] = parseFloat(
                (row[key] || "0").replace(",", "."),
              );
            }
          }

          const shipment: Shipment = {
            fromCountryCode: row["Zone \n Netherlands"],
            toCountryCode: row["Country"],
            zipcode: row["ZIP"],
            flow: row["Flow"],
            ldmRates: ldmRates,
          };

          return shipment;
        });
      },
    });
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
