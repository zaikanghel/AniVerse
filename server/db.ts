import mongoose from 'mongoose';
import { log } from './vite';

// Get MongoDB connection details from environment variables with fallbacks
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/animeverse';
const MONGODB_USER = process.env.MONGODB_USER;
const MONGODB_PASSWORD = process.env.MONGODB_PASSWORD;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'animeverse';

// Global variable to track connection status
export let isMongoConnected = false;

export async function connectDB() {
  try {
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      log('MongoDB already connected', 'mongodb');
      isMongoConnected = true;
      return true;
    }

    // Prepare connection options
    const options = {
      serverSelectionTimeoutMS: 5000,  // Timeout after 5 seconds
      connectTimeoutMS: 10000,         // Timeout after 10 seconds
      socketTimeoutMS: 30000,          // Close sockets after 30 seconds of inactivity
      maxPoolSize: 50,                 // Maintain up to 50 socket connections
      family: 4                        // Use IPv4, skip trying IPv6
    };
    
    // Build connection URI with credentials if provided
    let connectionUri = MONGODB_URI;
    if (MONGODB_USER && MONGODB_PASSWORD && !MONGODB_URI.includes('@')) {
      // Extract protocol and host
      const uriParts = MONGODB_URI.split('//');
      if (uriParts.length > 1) {
        // Insert credentials into URI
        connectionUri = `${uriParts[0]}//${MONGODB_USER}:${encodeURIComponent(MONGODB_PASSWORD)}@${uriParts[1]}`;
        log('Using MongoDB with provided credentials', 'mongodb');
      }
    }
    
    // Ensure the database name is included in URI
    if (!connectionUri.includes('/')) {
      connectionUri = `${connectionUri}/${MONGODB_DB_NAME}`;
    }
    
    // Attempt connection to external MongoDB
    log(`Connecting to MongoDB at ${connectionUri.replace(/\/\/.*@/, '//****:****@')}`, 'mongodb');
    await mongoose.connect(connectionUri, options);
    
    // Log connection success
    isMongoConnected = true;
    log('Successfully connected to external MongoDB', 'mongodb');
    
    // Set up connection event handlers
    mongoose.connection.on('error', (err) => {
      log(`MongoDB connection error: ${err}`, 'mongodb');
    });
    
    mongoose.connection.on('disconnected', () => {
      log('MongoDB disconnected, attempting to reconnect', 'mongodb');
      isMongoConnected = false;
    });
    
    return true;
  } catch (error: any) {
    isMongoConnected = false;
    log(`MongoDB connection error: ${error}`, 'mongodb');
    throw new Error(`Failed to connect to MongoDB: ${error.message || String(error)}`);
  }
}

export async function disconnectDB() {
  try {
    await mongoose.disconnect();
    log('Disconnected from MongoDB', 'mongodb');
    return true;
  } catch (error: any) {
    log(`MongoDB disconnect error: ${error}`, 'mongodb');
    return false;
  }
}