const uuidv1 = require('uuid/v1');
const elastic = require('./elastic');
const csv = require('csvtojson');
const https = require("https");
const fs = require("fs");

const currentYear = new Date().getFullYear();
const startYear = 2023;


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

elastic.client.indices.delete({ index: 'genderpaygap' })
  .then(() => console.log('=== Index deleted'))
  .catch(() => true)
  .then(() => {
    for (let year = startYear; year <= currentYear; year++) {
      csv({ checkType: true })
        .fromFile(`gov-uk-data-${year}-${year + 1}.csv`)
        .then((json) => {
          let data = [];
          json.forEach((item) => {
            data.push({
              index: {
                _index: 'genderpaygap',
                _id: uuidv1()
              }
            });
            data.push({
              employerName: item.EmployerName,
              address: item.Address,
              companyNumber: item.CompanyNumber,
              sicCodes: item.SicCodes,
              diffMeanHourlyPercent: item.DiffMeanHourlyPercent,
              diffMedianHourlyPercent: item.DiffMedianHourlyPercent,
              diffMeanBonusPercent: item.DiffMeanBonusPercent,
              diffMedianBonusPercent: item.DiffMedianBonusPercent,
              maleBonusPercent: item.MaleBonusPercent,
              femaleBonusPercent: item.FemaleBonusPercent,
              maleLowerQuartile: item.MaleLowerQuartile,
              femaleLowerQuartile: item.FemaleLowerQuartile,
              maleLowerMiddleQuartile: item.MaleLowerMiddleQuartile,
              femaleLowerMiddleQuartile: item.FemaleLowerMiddleQuartile,
              maleUpperMiddleQuartile: item.MaleUpperMiddleQuartile,
              femaleUpperMiddleQuartile: item.FemaleUpperMiddleQuartile,
              maleTopQuartile: item.MaleTopQuartile,
              femaleTopQuartile: item.FemaleTopQuartile,
              companyLinkToGPGInfo: item.CompanyLinkToGPGInfo,
              responsiblePerson: item.ResponsiblePerson,
              employerSize: item.EmployerSize,
              currentName: item.CurrentName,
              submittedAfterTheDeadline: item.SubmittedAfterTheDeadline
            });
          });
//          console.log('%o', data);
          // Uncomment the following lines to perform the Elasticsearch bulk operation
           elastic.client.bulk({ body: data })
             .then(() => console.log('Data indexed successfully'))
             .catch(error => console.log(error));
        })
        .catch(error => console.log(error));
    }
    elastic.client.close();
  });
