const https = require("https");
const fs = require("fs");

// URL of the image
const url = "https://gender-pay-gap.service.gov.uk/viewing/download-data/2021";

https.get(url, (res) => {
   const path = "gov-uk-data-2021-2022.csv";
   const writeStream = fs.createWriteStream(path);

   res.pipe(writeStream);

   writeStream.on("finish", () => {
      writeStream.close();
      console.log("Download Completed!");
   })
})
