import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {
  tls: true,
};

let client: MongoClient;

const getClientPromise = async (): Promise<MongoClient> => {
  let clientPromise: Promise<MongoClient>;
  if (process.env.NODE_ENV === 'development') {
    let globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri, options);
      globalWithMongo._mongoClientPromise = client.connect().catch((err) => {
        throw err;
      });
    }
    clientPromise = globalWithMongo._mongoClientPromise;
  } else {
    try {
      clientPromise = client.connect();
    } catch (error: any) {
      throw error;
    }
  }
  return clientPromise;
};
const clientPromise = getClientPromise();

export default clientPromise;
