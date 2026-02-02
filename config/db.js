import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Validate MONGO_URI exists
    if (!process.env.MONGO_URI) {
      throw new Error(
        'MONGO_URI environment variable is not defined.\n' +
        'Please check your .env file and ensure it contains: MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/jagoindia'
      );
    }

    // Validate connection string format
    if (!process.env.MONGO_URI.startsWith('mongodb+srv://')) {
      throw new Error(
        'Invalid MONGO_URI format. Must start with "mongodb+srv://"\n' +
        'Current value: ' + process.env.MONGO_URI.substring(0, 50) + '...\n' +
        'Expected format: mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/database'
      );
    }

    // Validate no duplicate cluster names in the URI
    if (process.env.MONGO_URI.includes('cluster0.Cluster0') || process.env.MONGO_URI.includes('Cluster0.cluster0')) {
      throw new Error(
        'Invalid MONGO_URI: Cluster name is duplicated (cluster0.Cluster0 found).\n' +
        'Correct format: cluster0.xxxxx.mongodb.net (single cluster0 reference)\n' +
        'Current value: ' + process.env.MONGO_URI
      );
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`\n❌ MongoDB Connection Error:`);
    console.error(`   ${error.message}\n`);
    process.exit(1);
  }
};

export default connectDB;
