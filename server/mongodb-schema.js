// User Schema
const userSchema = {
  _id: "ObjectId", // MongoDB ObjectId
  name: "String", // User's name
  email: "String", // User's email address
  role: "String", // User role ('admin' or 'user')
  status: "String", // User status ('active' or 'inactive')
  password: "String", 
  profileImage: "String", 
  created_at: "Date", 
  updated_at: "Date" 
};

// Example User Document
const exampleUser = {
  _id: "60d21b4667d0d8992e610c85",
  name: "John Doe",
  email: "john@example.com",
  role: "user",
  status: "active",
  password: "hashed_password_here",
  profileImage: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD...", // Base64 image data
  created_at: new Date("2023-01-01T00:00:00Z"),
  updated_at: new Date("2023-01-01T00:00:00Z")
};

// MongoDB Indexes
const userIndexes = [
  { email: 1 }, // Unique index on email
  { name: 1 } // Index on name for faster lookups
];

// Export schemas (for documentation purposes only)
module.exports = {
  userSchema,
  exampleUser,
  userIndexes
};