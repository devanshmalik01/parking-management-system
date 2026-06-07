const pool = require('../config/database');
const elasticsearch = require('elasticsearch');
require('dotenv').config();

const elasticClient = new elasticsearch.Client({
  host: `${process.env.ELASTIC_HOST}:${process.env.ELASTIC_PORT}`
});

const INDEX_NAME = 'parking_vehicles';

async function syncToElasticsearch() {
  try {
    console.log('Starting sync to Elasticsearch...');

    // Delete existing index to avoid duplicates
    try {
      await elasticClient.indices.delete({ index: INDEX_NAME });
      console.log('Deleted existing index');
    } catch (error) {
      if (error.status !== 404) throw error;
    }

    // Create new index
    await elasticClient.indices.create({
      index: INDEX_NAME,
      body: {
        mappings: {
          properties: {
            vehicleNo: { type: 'keyword' },
            vehicleType: { type: 'keyword' },
            status: { type: 'keyword' },
            entryTime: { type: 'date' },
            exitTime: { type: 'date' },
            billAmount: { type: 'float' },
            assistantName: { type: 'text' }
          }
        }
      }
    });
    console.log('Created new index');

    // Fetch all vehicles from database
    const connection = await pool.getConnection();
    const [vehicles] = await connection.query(`
      SELECT v.*, u.name as assistant_name
      FROM vehicles v
      JOIN users u ON v.allowed_by = u.id
    `);
    await connection.release();

    // Bulk insert into Elasticsearch
    const body = vehicles.flatMap((doc) => [
      { index: { _index: INDEX_NAME } },
      {
        vehicleNo: doc.vehicle_no,
        vehicleType: doc.vehicle_type,
        status: doc.status,
        entryTime: doc.entry_time,
        exitTime: doc.exit_time,
        billAmount: doc.bill_amount,
        assistantName: doc.assistant_name
      }
    ]);

    if (body.length > 0) {
      await elasticClient.bulk({ body });
      console.log(`Synced ${vehicles.length} vehicles to Elasticsearch`);
    }

    console.log('Sync completed successfully!');
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

syncToElasticsearch();
