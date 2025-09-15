const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config({ path: '../project/.env' });

const app = express();
const port = process.env.PORT || 3001;

// MongoDB connection string
const uri = process.env.MONGO_URI || "mongodb://localhost:27017/edugate";
const client = new MongoClient(uri);
const dbName = uri.split('/').pop().split('?')[0] || "edugate";

// Enable CORS
app.use(cors());

// Connect to MongoDB
async function connectToMongo(collection) {
  try {
    await client.connect();
    console.log("Connected to MongoDB at", uri);
    return client.db(dbName).collection(collection);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    console.error("Please make sure MongoDB is running and the connection string is correct.");
    console.error("Current connection string:", uri);
    return null;
  }
}

// Search endpoint for educational content
app.get('/api/search', async (req, res) => {
  try {
    const collection = await connectToMongo("searchResults");
    if (!collection) {
      return res.status(500).json({ error: 'Database connection failed' });
    }
    
    const query = req.query.q;
    const type = req.query.type;
    
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }
    
    // Create search query
    const searchQuery = {
      $text: { $search: query }
    };
    
    // Add type filter if provided
    if (type) {
      searchQuery.type = type;
    }
    
    // Execute search
    const results = await collection.find(searchQuery)
      .project({ score: { $meta: "textScore" } })
      .sort({ score: { $meta: "textScore" } })
      .limit(10)
      .toArray();
    
    res.json({ results });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

// AI assistant knowledge base endpoint
app.get('/api/ai-knowledge', async (req, res) => {
  try {
    const collection = await connectToMongo("aiKnowledge");
    if (!collection) {
      return res.status(500).json({ error: 'Database connection failed' });
    }
    
    const query = req.query.q;
    
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }
    
    // Create search query
    const searchQuery = {
      $text: { $search: query }
    };
    
    // Execute search
    const results = await collection.find(searchQuery)
      .project({ score: { $meta: "textScore" } })
      .sort({ score: { $meta: "textScore" } })
      .limit(5)
      .toArray();
    
    res.json({ results });
  } catch (error) {
    console.error('AI knowledge search error:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

// Add content endpoint
app.post('/api/content', express.json(), async (req, res) => {
  try {
    const collection = await connectToMongo("searchResults");
    const content = req.body;
    
    if (!content || !content.title || !content.type) {
      return res.status(400).json({ error: 'Invalid content data' });
    }
    
    const result = await collection.insertOne({
      ...content,
      date: content.date || new Date().toISOString()
    });
    
    res.status(201).json({ 
      success: true, 
      id: result.insertedId 
    });
  } catch (error) {
    console.error('Content addition error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add AI knowledge endpoint
app.post('/api/ai-knowledge', express.json(), async (req, res) => {
  try {
    const collection = await connectToMongo("aiKnowledge");
    const knowledge = req.body;
    
    if (!knowledge || !knowledge.question || !knowledge.answer) {
      return res.status(400).json({ error: 'Invalid knowledge data' });
    }
    
    const result = await collection.insertOne({
      ...knowledge,
      timestamp: new Date().toISOString()
    });
    
    res.status(201).json({ 
      success: true, 
      id: result.insertedId 
    });
  } catch (error) {
    console.error('AI knowledge addition error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`MongoDB API server running on port ${port}`);
});

// Create text indexes on startup
(async () => {
  try {
    const searchCollection = await connectToMongo("searchResults");
    if (searchCollection) {
      try {
        await searchCollection.createIndex({ 
          title: "text", 
          description: "text" 
        });
        console.log("Search results text index created");
      } catch (indexError) {
        console.error("Error creating search results index:", indexError);
      }
    }
    
    const aiCollection = await connectToMongo("aiKnowledge");
    if (aiCollection) {
      try {
        await aiCollection.createIndex({ 
          question: "text", 
          answer: "text",
          keywords: "text"
        });
        console.log("AI knowledge text index created");
      } catch (indexError) {
        console.error("Error creating AI knowledge index:", indexError);
      }
    }
  } catch (error) {
    console.error("Error setting up database indexes:", error);
  }
})();