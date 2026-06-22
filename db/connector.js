import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGO_URI;

if (!uri) {
  console.error('MONGO_URI is not defined in the environment variables.');
  process.exit(1);
}

const client = new MongoClient(uri);

const db = client.db();

// Connect to database asynchronously so it doesn't block module imports on startup
client
  .connect()
  .then(() => {
    console.log('Successfully connected to MongoDB.');
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB:', error.message);
  });

export { client, db };
