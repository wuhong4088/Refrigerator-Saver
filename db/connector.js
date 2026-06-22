import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGO_URI;

if (!uri) {
  console.error('MONGO_URI is not defined in the environment variables.');
  process.exit(1);
}

const client = new MongoClient(uri);

let db = null;

try {
  // Connect to database
  await client.connect();
  db = client.db();
  console.log('Successfully connected to MongoDB.');
} catch (error) {
  console.error('Failed to connect to MongoDB:', error.message);
}

export { client, db };
