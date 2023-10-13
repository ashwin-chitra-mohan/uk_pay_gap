const elasticsearch = require('elasticsearch');

const client = new elasticsearch.Client({
    "host": "localhost:9200",
    "log": "info",
    "httpAuth": "elastic:R1yYzUcCV7Q248qXkWyn",
    "requestTimeout": 6000000 // Set timeout to 60 seconds
});

module.exports = { client };
