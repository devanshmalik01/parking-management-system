const elasticsearch = require('elasticsearch');
require('dotenv').config();

const elasticClient = new elasticsearch.Client({
  host: `${process.env.ELASTIC_HOST}:${process.env.ELASTIC_PORT}`
});

module.exports = elasticClient;
