import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    if (mongoose?.connection?.readyState >= 1) {
      console.log("Already connected to MongoDB");
      return;
    }

    const connectionInstance = await mongoose.connect(
      process.env.MONGODB_URI as string,
      { dbName: "test" }
    );

    console.log(
      `MONGODB connected! DB HOST: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.error("MONGODB connection error:", error);
    throw new Error("Database connection failed");
  }
};
