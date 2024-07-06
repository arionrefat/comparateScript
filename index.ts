import Papa from "papaparse";
import fs from "fs";

interface Shipment {
  fromCountryCode: string;
  toCountryCode: string;
  zipcode: string;
  flow: string;
  ldmRates: { [key: number]: number };
}

// Read the CSV file
fs.readFile("./DSV - DSV - Sheet1.csv", "utf8", (err, csvString) => {
  if (err) {
    console.error("Error reading CSV file:", err);
    return;
  }

  // Parse CSV
  Papa.parse(csvString, {
    header: true,
    dynamicTyping: true,
    complete: function (results) {
      console.log("Headers:", results.meta.fields); // Print headers
      console.log("Sample Data:", results.data.slice(0, 9)); // Print first 9 rows

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
          fromCountryCode: row["Zone \n Netherlands"], // Adjust as needed based on actual header
          toCountryCode: row["Country"], // Adjust as needed based on actual header
          zipcode: row["ZIP"], // Adjust as needed based on actual header
          flow: row["Flow"], // Adjust as needed based on actual header
          ldmRates: ldmRates,
        };

        return shipment;
      });

      console.log("Shipments:", shipments);
    },
  });
});
