import { MongoClient } from "mongodb";

let mongoClient: MongoClient;

const MONGODB_URI = process.env.MONGODB_URI || "";
const CONTEXT_AI_DB = process.env.MONGODB_DATABASE || "";

export const connectMongodb = async (): Promise<void> => {
  console.info(`Connecting to Mongodb...`);
  try {
    mongoClient = await MongoClient.connect(MONGODB_URI, {
      connectTimeoutMS: 5000,
    });

    await mongoClient.db().command({ ping: 1 });
    console.info(`Successfully connected to Mongodb`);
  } catch (e) {
    console.error(`Error connecting to Mongodb`);
    throw e;
  }
};

export const disconnectMongodb = async (): Promise<void> => {
  try {
    if (mongoClient) {
      console.info("Closing connection to Mongodb...");
      await mongoClient.close();
      console.info("Disconnected to MongoDB");
    }
  } catch (error) {
    console.error(`Error closing connection to mongodb: ${error}`);
  }
};

export const getMongoClient = async (): Promise<MongoClient> => {
  if (!mongoClient) {
    await connectMongodb();
  }

  return mongoClient;
};
