const https = require("https");
const fs = require("fs");

const currentYear = new Date().getFullYear();
const startYear = 2017;

for (let year = startYear; year <= currentYear; year++) {
    const path = `gov-uk-data-${year}-${year + 1}.csv`;

    // Check if the file already exists
    if (fs.existsSync(path)) {
        console.log(`File for ${year}-${year + 1} already exists. Skipping download.`);
    } else {
        const url = `https://gender-pay-gap.service.gov.uk/viewing/download-data/${year}`;

        https.get(url, (res) => {
            const writeStream = fs.createWriteStream(path);

            res.pipe(writeStream);

            writeStream.on("finish", () => {
                writeStream.close();
                console.log(`Download for ${year}-${year + 1} completed!`);
            });

            writeStream.on("error", (err) => {
                console.error(`Error writing file for ${year}-${year + 1}: ${err}`);
            });
        });
    }
}

