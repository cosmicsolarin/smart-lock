import mongoose from "mongoose";

const { MONGODB_URI } = process.env;

let isConnected = false; // Track the connection status

export const connectDB = async () => {
  if (isConnected) {
    console.log("Using existing database connection.");
    return;
  }

  try {
    const { connection } = await mongoose.connect(MONGODB_URI as string, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      bufferCommands: false, // Disable buffering of commands before a connection is established
    });

    isConnected = connection.readyState === 1; // 1 means connected

    console.log("Database connected successfully.");
  } catch (error) {
    console.error("Database connection error:", error);
    throw new Error("Failed to connect to database");
  }
};
