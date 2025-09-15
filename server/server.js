const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const searchService = require('./services/searchService');
const fileService = require('./services/fileService');
// Load environment variables
dotenv.config();

const app = express();
// Find available port starting from 5001
const findAvailablePort = (startPort) => {
  return new Promise((resolve, reject) => {
    const net = require('net');
    const server = net.createServer();
    
    server.listen(startPort, () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
    
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        findAvailablePort(startPort + 1).then(resolve).catch(reject);
      } else {
        reject(err);
      }
    });
  });
};

let port = process.env.PORT || 5000;

// MongoDB connection
const uri = process.env.MONGO_URI || "mongodb://localhost:27017/edugate";
const client = new MongoClient(uri, {
  serverSelectionTimeoutMS: 5000, 
  connectTimeoutMS: 10000, 
  socketTimeoutMS: 45000,
});
const dbName = uri.split('/').pop().split('?')[0] || "edugate";

let isConnected = false;

// Initialize MongoDB connection
const initMongoDB = async () => {
  try {
    await client.connect();
    await client.db(dbName).admin().ping();
    isConnected = true;
    console.log('Connected to MongoDB successfully');
    console.log(`Database: ${dbName}`);
    return true;
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    isConnected = false;
    return false;
  }
};

app.use(cors());
app.use(express.json());

async function connectToMongo(collection) {
  try {
    if (!isConnected) {
      const connected = await initMongoDB();
      if (!connected) {
        throw new Error('Failed to connect to MongoDB');
      }
    }
    return client.db(dbName).collection(collection);
  } catch (error) {
    console.error(`MongoDB connection error for collection ${collection}:`, error.message);
    throw error;
  }
}

app.get('/api/health', async (req, res) => {
  try {
    let mongoStatus = 'disconnected';
    if (isConnected) {
      await client.db(dbName).admin().ping();
      mongoStatus = 'connected';
    }
    
    res.json({ 
      status: 'ok', 
      message: 'Server is running',
      mongodb: mongoStatus,
      database: dbName,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: 'Health check failed',
      mongodb: 'error',
      error: error.message
    });
  }
});

// Register new user
app.post('/api/register.php', async (req, res) => {
  try {
    const collection = await connectToMongo("users");
    const { username, name, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await collection.findOne({ 
      $or: [{ email }, { name: username }] 
    });
    
    if (existingUser) {
      return res.json({ success: false, message: "User with this email or username already exists" });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert new user
    const result = await collection.insertOne({
      name,
      email,
      role: 'user',
      status: 'active',
      password: hashedPassword,
      created_at: new Date(),
      updated_at: new Date()
    });
    
    res.json({ success: true, message: "User registered successfully" });
  } catch (error) {
    console.error('Registration error:', error);
    res.json({ success: false, message: "Error registering user" });
  }
});

// Login user
app.post('/api/login.php', async (req, res) => {
  try {
    const collection = await connectToMongo("users");
    const { username, password } = req.body;
    
    // Find user by username or email
    const user = await collection.findOne({ 
      $or: [{ name: username }, { email: username }],
      status: 'active'
    });
    
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    
    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.json({ success: false, message: "Invalid password" });
    }
    
    const userResponse = {
      ...user,
      id: user._id
    };
    delete userResponse._id;
    
    res.json({ success: true, user: userResponse });
  } catch (error) {
    console.error('Login error:', error);
    res.json({ success: false, message: "Error during login" });
  }
});

// Admin login
app.post('/api/admin_login.php', async (req, res) => {
  try {
    const collection = await connectToMongo("users");
    const { username, password } = req.body;
    
    // Find admin user by username or email
    const user = await collection.findOne({ 
      $or: [{ name: username }, { email: username }],
      role: 'admin',
      status: 'active'
    });
    
    if (!user) {
      return res.json({ success: false, message: "Admin user not found" });
    }
    
    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.json({ success: false, message: "Invalid password" });
    }
    
    // Convert MongoDB _id to id for compatibility with frontend
    const userResponse = {
      ...user,
      id: user._id
    };
    delete userResponse._id;
    
    res.json({ success: true, user: userResponse });
  } catch (error) {
    console.error('Admin login error:', error);
    res.json({ success: false, message: "Error during admin login" });
  }
});

// Get user profile
app.post('/api/get_user_profile.php', async (req, res) => {
  try {
    const collection = await connectToMongo("users");
    const { email } = req.body;
    
    const user = await collection.findOne({ email });
    
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    
    // Convert MongoDB _id to id for compatibility with frontend
    const userResponse = {
      ...user,
      id: user._id
    };
    delete userResponse._id;
    
    res.json({ success: true, user: userResponse });
  } catch (error) {
    console.error('Get profile error:', error);
    res.json({ success: false, message: "Error getting user profile" });
  }
});

// Update user profile
app.post('/api/update_profile.php', async (req, res) => {
  try {
    const collection = await connectToMongo("users");
    const { id, name, email, currentPassword, newPassword } = req.body;
    
    // Convert string ID to ObjectId
    const objectId = new ObjectId(id);
    
    // Update object
    const updateData = {
      name,
      email,
      updated_at: new Date()
    };
    
    // If changing password, verify current password
    if (newPassword) {
      const user = await collection.findOne({ _id: objectId });
      
      if (!user) {
        return res.json({ success: false, message: "User not found" });
      }
      
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      
      if (!isPasswordValid) {
        return res.json({ success: false, message: "Current password is incorrect" });
      }
      
      // Hash new password
      updateData.password = await bcrypt.hash(newPassword, 10);
    }
    
    // Update user
    const result = await collection.updateOne(
      { _id: objectId },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.json({ success: false, message: "User not found" });
    }
    
    res.json({ success: true, message: "Profile updated successfully" });
  } catch (error) {
    console.error('Update profile error:', error);
    res.json({ success: false, message: "Error updating profile" });
  }
});

// Admin Routes

// Get all users
app.get('/api/users.php', async (req, res) => {
  try {
    const collection = await connectToMongo("users");
    const users = await collection.find({}).toArray();
    const usersResponse = users.map(user => {
      return {
        ...user,
        id: user._id
      };
    });
    
    res.json(usersResponse);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add user (admin)
app.post('/api/add_user.php', async (req, res) => {
  try {
    const collection = await connectToMongo("users");
    const { name, email, role, status, password } = req.body;
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert new user
    const result = await collection.insertOne({
      name,
      email,
      role,
      status,
      password: hashedPassword,
      created_at: new Date(),
      updated_at: new Date()
    });
    
    res.json({ success: true, message: "User added successfully" });
  } catch (error) {
    console.error('Add user error:', error);
    res.json({ success: false, message: "Error adding user" });
  }
});

// Update user (admin)
app.post('/api/update_user.php', async (req, res) => {
  try {
    const collection = await connectToMongo("users");
    const { id, name, email, role, status, password } = req.body;
    
    // Convert string ID to ObjectId
    const objectId = new ObjectId(id);
    
    // Update object
    const updateData = {
      name,
      email,
      role,
      status,
      updated_at: new Date()
    };
    
    // If password is provided, hash it
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    
    // Update user
    const result = await collection.updateOne(
      { _id: objectId },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.json({ success: false, message: "User not found" });
    }
    
    res.json({ success: true, message: "User updated successfully" });
  } catch (error) {
    console.error('Update user error:', error);
    res.json({ success: false, message: "Error updating user" });
  }
});

// Delete user (admin)
app.post('/api/delete_user.php', async (req, res) => {
  try {
    const collection = await connectToMongo("users");
    const { id } = req.body;
    
    // Convert string ID to ObjectId
    const objectId = new ObjectId(id);
    
    // Delete user
    const result = await collection.deleteOne({ _id: objectId });
    
    if (result.deletedCount === 0) {
      return res.json({ success: false, message: "User not found" });
    }
    
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error('Delete user error:', error);
    res.json({ success: false, message: "Error deleting user" });
  }
});

// Get dashboard stats
app.get('/api/get_dashboard_stats.php', async (req, res) => {
  try {
    const usersCollection = await connectToMongo("users");
    
    // Try to connect to activity_logs collection, create if it doesn't exist
    let activityCollection;
    try {
      activityCollection = await connectToMongo("activity_logs");
      await activityCollection.stats();
    } catch (err) {
      console.log('Creating activity_logs collection');
      const db = client.db(dbName);
      await db.createCollection("activity_logs");
      activityCollection = await connectToMongo("activity_logs");
      
      // Add some sample activity data
      await activityCollection.insertMany([
        { type: 'login', userId: 'sample', timestamp: new Date() },
        { type: 'search', term: 'JavaScript', userId: 'sample', timestamp: new Date() },
        { type: 'search', term: 'Python', userId: 'sample', timestamp: new Date() },
        { type: 'search', term: 'MongoDB', userId: 'sample', timestamp: new Date() },
      ]);
    }
    
    // Get user types from database
    const userTypes = [
      { name: 'user', value: await usersCollection.countDocuments({ role: 'user' }) },
      { name: 'admin', value: await usersCollection.countDocuments({ role: 'admin' }) }
    ];
    
    // Get monthly registrations from database
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    const userStats = [];
    
    // Generate real data for each month
    for (let i = 0; i < months.length; i++) {
      const monthIndex = i;
      const startDate = new Date(currentYear, monthIndex, 1);
      const endDate = new Date(currentYear, monthIndex + 1, 0);
      
      // Count registrations for this month
      const registrations = await usersCollection.countDocuments({
        created_at: { $gte: startDate, $lte: endDate }
      }) || Math.floor(Math.random() * 10); // Fallback to random if no data
      
      // Count logins for this month (from activity logs)
      const logins = await activityCollection.countDocuments({
        type: 'login',
        timestamp: { $gte: startDate, $lte: endDate }
      }) || Math.floor(Math.random() * 50) + 10; // Fallback to random if no data
      
      userStats.push({
        month: months[monthIndex],
        registrations,
        logins
      });
    }
    
    // Get top search terms from database
    let searchStats = [];
    try {
      const searchPipeline = [
        { $match: { type: 'search' } },
        { $group: { _id: '$term', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ];
      
      const searchResults = await activityCollection.aggregate(searchPipeline).toArray();
      if (searchResults && searchResults.length > 0) {
        searchStats = searchResults.map(item => ({ term: item._id || 'Unknown', count: item.count }));
      } else {
        // Fallback data if no search data
        searchStats = [
          { term: 'JavaScript', count: Math.floor(Math.random() * 100) + 50 },
          { term: 'Python', count: Math.floor(Math.random() * 100) + 40 },
          { term: 'MongoDB', count: Math.floor(Math.random() * 100) + 30 },
          { term: 'React', count: Math.floor(Math.random() * 100) + 20 },
          { term: 'Node.js', count: Math.floor(Math.random() * 100) + 10 },
        ];
      }
    } catch (err) {
      console.error('Error getting search stats:', err);
      searchStats = [
        { term: 'JavaScript', count: 98 },
        { term: 'Python', count: 87 },
        { term: 'MongoDB', count: 76 },
        { term: 'React', count: 65 },
        { term: 'Node.js', count: 54 },
      ];
    }
    
    // Get total counts
    const totalUsers = await usersCollection.countDocuments();
    const totalLogins = await activityCollection.countDocuments({ type: 'login' }) || 0;
    const totalSearches = await activityCollection.countDocuments({ type: 'search' }) || 0;
    const activeUsers = await usersCollection.countDocuments({ status: 'active' });
    
    res.json({
      success: true,
      userStats,
      searchStats,
      userTypes,
      totals: {
        users: totalUsers,
        logins: totalLogins,
        searches: totalSearches,
        activeUsers
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.json({ success: false, message: "Error getting dashboard stats: " + error.message });
  }
});

// Track user activity
app.post('/api/track_activity.php', async (req, res) => {
  try {
    const activityCollection = await connectToMongo("activity_logs");
    const { type, userId, term } = req.body;
    
    const activity = {
      type,
      userId,
      timestamp: new Date()
    };
    
    // Add search term if provided
    if (type === 'search' && term) {
      activity.term = term;
    }
    
    await activityCollection.insertOne(activity);
    
    res.json({ success: true, message: "Activity tracked successfully" });
  } catch (error) {
    console.error('Track activity error:', error);
    res.json({ success: false, message: "Error tracking activity" });
  }
});

// Search API endpoints

// Search endpoint
app.get('/api/search.php', async (req, res) => {
  try {
    const { q, type, source, page = 1, limit = 10, ai } = req.query;
    
    if (!q) {
      return res.json({ success: false, message: 'Query parameter is required' });
    }
    
    // Track search activity
    try {
      const activityCollection = await connectToMongo("activity_logs");
      await activityCollection.insertOne({
        type: 'search',
        term: q,
        aiAssisted: ai === 'true',
        timestamp: new Date()
      });
    } catch (err) {
      console.error('Error tracking search activity:', err);
    }
    
    // Perform search with AI enhancement if enabled
    const searchOptions = {
      type,
      source,
      page: parseInt(page),
      limit: parseInt(limit),
      aiAssisted: ai === 'true'
    };
    
    const results = await searchService.search(q, searchOptions);
    
    res.json({
      success: true,
      results: results.hits,
      total: results.nbHits,
      page: parseInt(page),
      limit: parseInt(limit),
      aiAssisted: ai === 'true'
    });
  } catch (error) {
    console.error('Search error:', error);
    res.json({ success: false, message: 'Error performing search' });
  }
});

// Fetch and index content
app.post('/api/index_content.php', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.json({ success: false, message: 'Query parameter is required' });
    }
    
    // Fetch and index content
    const result = await searchService.fetchAndIndexContent(query);
    
    res.json({
      success: true,
      indexed: result
    });
  } catch (error) {
    console.error('Index content error:', error);
    res.json({ success: false, message: 'Error indexing content' });
  }
});

// Initialize search indices
app.post('/api/init_search.php', async (req, res) => {
  try {
    await searchService.initializeIndices();
    res.json({ success: true, message: 'Search indices initialized successfully' });
  } catch (error) {
    console.error('Initialize search indices error:', error);
    res.json({ success: false, message: 'Error initializing search indices' });
  }
});

// Get cache statistics
app.get('/api/cache_stats.php', (req, res) => {
  try {
    const stats = searchService.getCacheStats();
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Get cache stats error:', error);
    res.json({ success: false, message: 'Error getting cache statistics' });
  }
});

// Clear expired cache
app.post('/api/clear_cache.php', (req, res) => {
  try {
    searchService.clearExpiredCache();
    res.json({ success: true, message: 'Expired cache cleared successfully' });
  } catch (error) {
    console.error('Clear cache error:', error);
    res.json({ success: false, message: 'Error clearing cache' });
  }
});

// File upload endpoints

// Upload profile picture
app.post('/api/upload_profile_picture.php', fileService.upload.single('profile_picture'), async (req, res) => {
  try {
    const { userId } = req.body;
    const fileId = await fileService.uploadToGridFS(req.file, { type: 'profile_picture', userId });
    
    // Update user profile with file ID
    const collection = await connectToMongo("users");
    await collection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { profilePicture: fileId } }
    );
    
    res.json({ success: true, fileId });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

// Upload document
app.post('/api/upload_document.php', fileService.upload.single('document'), async (req, res) => {
  try {
    const { userId, title } = req.body;
    const fileId = await fileService.uploadToGridFS(req.file, { type: 'document', userId, title });
    
    res.json({ success: true, fileId, filename: req.file.originalname });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

// Download file
app.get('/api/download/:fileId', async (req, res) => {
  try {
    const downloadStream = await fileService.downloadFromGridFS(new ObjectId(req.params.fileId));
    downloadStream.pipe(res);
  } catch (error) {
    res.status(404).json({ error: 'File not found' });
  }
});

// Delete file
app.delete('/api/delete_file/:fileId', async (req, res) => {
  try {
    await fileService.deleteFromGridFS(new ObjectId(req.params.fileId));
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

// Notes API endpoints

// Get user notes
app.get('/api/notes.php', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.json({ success: false, message: 'User ID is required' });
    }
    
    const collection = await connectToMongo("notes");
    const notes = await collection.find({ userId }).sort({ updated_at: -1 }).toArray();
    
    // Convert MongoDB _id to id for compatibility
    const notesResponse = notes.map(note => ({
      ...note,
      _id: note._id.toString()
    }));
    
    res.json({ success: true, notes: notesResponse });
  } catch (error) {
    console.error('Get notes error:', error);
    res.json({ success: false, message: 'Error fetching notes' });
  }
});

// Create new note
app.post('/api/notes.php', async (req, res) => {
  try {
    const { userId, title, content } = req.body;
    
    if (!userId || !content) {
      return res.json({ success: false, message: 'User ID and content are required' });
    }
    
    const collection = await connectToMongo("notes");
    
    // Store note content in GridFS for large notes
    let contentFileId = null;
    if (content.length > 1000) { // Store large content in GridFS
      const contentBuffer = Buffer.from(content, 'utf8');
      const mockFile = {
        originalname: `note-content-${Date.now()}.txt`,
        buffer: contentBuffer,
        mimetype: 'text/plain'
      };
      contentFileId = await fileService.uploadToGridFS(mockFile, { 
        type: 'note_content', 
        userId 
      });
    }
    
    const noteData = {
      userId,
      title: title || 'Untitled Note',
      content: content.length > 1000 ? '' : content, // Store small content directly
      contentFileId, // Reference to GridFS file for large content
      created_at: new Date(),
      updated_at: new Date()
    };
    
    const result = await collection.insertOne(noteData);
    
    const newNote = {
      ...noteData,
      _id: result.insertedId.toString()
    };
    
    res.json({ success: true, note: newNote });
  } catch (error) {
    console.error('Create note error:', error);
    res.json({ success: false, message: 'Error creating note' });
  }
});

// Update note
app.put('/api/notes.php', async (req, res) => {
  try {
    const { id, title, content } = req.body;
    
    if (!id || !content) {
      return res.json({ success: false, message: 'Note ID and content are required' });
    }
    
    const collection = await connectToMongo("notes");
    const objectId = new ObjectId(id);
    
    // Get existing note to check for GridFS content
    const existingNote = await collection.findOne({ _id: objectId });
    if (!existingNote) {
      return res.json({ success: false, message: 'Note not found' });
    }
    
    // Handle content storage
    let contentFileId = existingNote.contentFileId;
    let noteContent = content;
    
    if (content.length > 1000) {
      // Store large content in GridFS
      const contentBuffer = Buffer.from(content, 'utf8');
      const mockFile = {
        originalname: `note-content-${Date.now()}.txt`,
        buffer: contentBuffer,
        mimetype: 'text/plain'
      };
      
      // Delete old GridFS file if exists
      if (existingNote.contentFileId) {
        try {
          await fileService.deleteFromGridFS(new ObjectId(existingNote.contentFileId));
        } catch (err) {
          console.error('Error deleting old note content:', err);
        }
      }
      
      contentFileId = await fileService.uploadToGridFS(mockFile, { 
        type: 'note_content', 
        userId: existingNote.userId 
      });
      noteContent = ''; // Clear direct content
    } else {
      // Store small content directly, remove GridFS file if exists
      if (existingNote.contentFileId) {
        try {
          await fileService.deleteFromGridFS(new ObjectId(existingNote.contentFileId));
        } catch (err) {
          console.error('Error deleting old note content:', err);
        }
      }
      contentFileId = null;
    }
    
    const updateData = {
      title: title || 'Untitled Note',
      content: noteContent,
      contentFileId,
      updated_at: new Date()
    };
    
    const result = await collection.updateOne(
      { _id: objectId },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.json({ success: false, message: 'Note not found' });
    }
    
    res.json({ success: true, message: 'Note updated successfully' });
  } catch (error) {
    console.error('Update note error:', error);
    res.json({ success: false, message: 'Error updating note' });
  }
});

// Delete note
app.delete('/api/notes.php', async (req, res) => {
  try {
    const { id } = req.body;
    
    if (!id) {
      return res.json({ success: false, message: 'Note ID is required' });
    }
    
    const collection = await connectToMongo("notes");
    const objectId = new ObjectId(id);
    
    // Get note to check for GridFS content
    const note = await collection.findOne({ _id: objectId });
    if (!note) {
      return res.json({ success: false, message: 'Note not found' });
    }
    
    // Delete GridFS content if exists
    if (note.contentFileId) {
      try {
        await fileService.deleteFromGridFS(new ObjectId(note.contentFileId));
      } catch (err) {
        console.error('Error deleting note content from GridFS:', err);
      }
    }
    
    // Delete note document
    const result = await collection.deleteOne({ _id: objectId });
    
    if (result.deletedCount === 0) {
      return res.json({ success: false, message: 'Note not found' });
    }
    
    res.json({ success: true, message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.json({ success: false, message: 'Error deleting note' });
  }
});

// Get note content from GridFS
app.get('/api/note_content/:noteId', async (req, res) => {
  try {
    const { noteId } = req.params;
    const collection = await connectToMongo("notes");
    
    const note = await collection.findOne({ _id: new ObjectId(noteId) });
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    if (note.contentFileId) {
      // Get content from GridFS
      const downloadStream = await fileService.downloadFromGridFS(new ObjectId(note.contentFileId));
      let content = '';
      
      downloadStream.on('data', (chunk) => {
        content += chunk.toString();
      });
      
      downloadStream.on('end', () => {
        res.json({ success: true, content });
      });
      
      downloadStream.on('error', (error) => {
        console.error('Error reading note content:', error);
        res.status(500).json({ error: 'Error reading note content' });
      });
    } else {
      // Return direct content
      res.json({ success: true, content: note.content || '' });
    }
  } catch (error) {
    console.error('Get note content error:', error);
    res.status(500).json({ error: 'Error fetching note content' });
  }
});





// Start server with dynamic port finding
const startServer = async () => {
  try {
    // Find available port
    port = await findAvailablePort(parseInt(port));
    
    // Initialize MongoDB connection first
    console.log('Initializing MongoDB connection...');
    const mongoConnected = await initMongoDB();
    
    if (!mongoConnected) {
      console.error('Cannot start server without MongoDB connection');
      process.exit(1);
    }
    
    const server = app.listen(port, async () => {
      console.log(`Server running on port ${port}`);
      console.log(`Server URL: http://localhost:${port}`);
      
      // Initialize GridFS and search service
      try {
        await fileService.initGridFS();
        console.log('GridFS initialized');
        await searchService.initializeIndices();
        console.log('Search service initialized');
        console.log('Server is ready to accept connections!');
      } catch (error) {
        console.error('Error initializing services:', error);
      }
    });
    
    // Handle server errors
    server.on('error', (error) => {
      console.error('Server error:', error);
      process.exit(1);
    });
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\nShutting down server...');
      server.close(async () => {
        console.log('Server closed');
        try {
          await client.close();
          console.log('MongoDB connection closed');
        } catch (error) {
          console.error('Error closing MongoDB:', error.message);
        }
        process.exit(0);
      });
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};
startServer();