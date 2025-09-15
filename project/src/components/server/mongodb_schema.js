/**
 * MongoDB Schema Documentation
 * 
 * This file documents the MongoDB schema used in the EduGate application.
 * It is not used in the application code but serves as documentation.
 */

// User Schema
const userSchema = {
  _id: "ObjectId", // MongoDB ObjectId
  name: "String", // User's name
  email: "String", // User's email address
  role: "String", // User role ('admin' or 'user')
  status: "String", // User status ('active' or 'inactive')
  password: "String", // User's password (should be hashed in production)
  profileImage: "String", // Base64 encoded image or URL to image
  created_at: "Date", // Creation timestamp
  updated_at: "Date" // Last update timestamp
};

// Activity Log Schema
const activityLogSchema = {
  _id: "ObjectId", // MongoDB ObjectId
  type: "String", // Activity type ('login', 'register', 'search')
  userId: "String", // User ID (null for anonymous activities)
  details: "Object", // Additional details about the activity
  timestamp: "Date", // When the activity occurred
  ip: "String" // IP address of the user
};

// Example Activity Log Documents
const exampleLogs = [
  {
    _id: "60d21b4667d0d8992e610c85",
    type: "login",
    userId: "60d21b4667d0d8992e610c85",
    details: { email: "user@example.com" },
    timestamp: new Date("2023-06-01T10:30:00Z"),
    ip: "192.168.1.1"
  },
  {
    _id: "60d21b4667d0d8992e610c86",
    type: "register",
    userId: null,
    details: { email: "newuser@example.com", username: "newuser" },
    timestamp: new Date("2023-06-01T11:15:00Z"),
    ip: "192.168.1.2"
  },
  {
    _id: "60d21b4667d0d8992e610c87",
    type: "search",
    userId: "60d21b4667d0d8992e610c85",
    details: { term: "Python programming" },
    timestamp: new Date("2023-06-01T12:45:00Z"),
    ip: "192.168.1.1"
  }
];

// MongoDB Indexes
const activityLogIndexes = [
  { type: 1 }, // Index on activity type
  { userId: 1 }, // Index on user ID
  { timestamp: 1 }, // Index on timestamp for date-based queries
  { "details.term": 1 } // Index on search terms
];

// Export schemas (for documentation purposes only)
module.exports = {
  userSchema,
  activityLogSchema,
  exampleLogs,
  activityLogIndexes
};