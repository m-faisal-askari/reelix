import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => {
      console.log("Database Connected successfully to:", mongoose.connection.name);
    });

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB runtime error:", err.message);
    });

    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error("MONGODB_URI is not set in environment variables");
    }

    // Connect using explicit dbName option so trailing slashes or query parameters do not corrupt auth
    await mongoose.connect(uri, {
      dbName: "reelix",
    });
  } catch (error) {
    console.error("Database Connection Error:", error.message);
  }
};

export default connectDB;
