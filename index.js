const uuidv1 = require('uuid/v1');

const elastic = require('./elastic');

const csv = require('csvtojson');

elastic.client.indices
    .delete({
        index: 'genderpaygap'
    })

    .then(() => console.log('=== Index deleted'))
    .catch(() => true)
    .then(() => csv({ checkType: true })
        .fromFile('gov-uk-data-2023-2024.csv')
        .then((json) => {
            let data = [];
            json.forEach((item) => {
                data.push({
                    index: {
                        _index: 'genderpaygap', _id: uuidv1()
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

            return elastic.client.bulk({
                body: data
            });
        })
        .then(() => console.log('=== Complete'))
        .catch((error) => console.log(error))
        .finally(() => elastic.client.close())
    );
