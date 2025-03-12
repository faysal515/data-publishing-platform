import mongoose from "mongoose";
import logger from "../utils/logger";

export const connectToDatabase = async (): Promise<void> => {
  try {
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/dataset-platform";

    logger.info("Connecting to MongoDB...");
    await mongoose.connect(mongoUri);

    logger.info("Connected to MongoDB successfully");
  } catch (error: any) {
    logger.error(`MongoDB connection error: ${error.message}`, { error });
    throw error;
  }
};

export const disconnectFromDatabase = async (): Promise<void> => {
  try {
    logger.info("Disconnecting from MongoDB...");
    await mongoose.disconnect();
    logger.info("Disconnected from MongoDB");
  } catch (error: any) {
    logger.error(`Error disconnecting from MongoDB: ${error.message}`, {
      error,
    });
    throw error;
  }
};
