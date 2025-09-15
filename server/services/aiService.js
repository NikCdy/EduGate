const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

class AIService {
  constructor() {
    this.apiEndpoint = process.env.DEEPSEEK_API_ENDPOINT;
    this.apiKey = process.env.DEEPSEEK_API_KEY;
    this.model = process.env.DEEPSEEK_MODEL || 'deepseek-chat';
    this.initialized = false;
    this.conversationHistory = new Map(); // Store conversation history by user
  }

  async initialize() {
    try {
      if (!this.apiKey || !this.apiEndpoint) {
        console.log('AI service not configured - continuing without AI features');
        return false;
      }
      
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('AI service initialization failed:', error.message);
      return false;
    }
  }

  async enhanceSearchQuery(query, options = {}) {
    if (!this.initialized) {
      return {
        enhancedQuery: query,
        keywords: [query],
        academicTerms: []
      };
    }

    try {
      const prompt = `Enhance this search query for academic/educational content: "${query}"
      
      Provide:
      1. An enhanced search query
      2. Related keywords
      3. Academic terms
      
      Format as JSON: {"enhancedQuery": "...", "keywords": [...], "academicTerms": [...]}`;

      const response = await axios.post(this.apiEndpoint, {
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 200,
        temperature: 0.3
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const result = JSON.parse(response.data.choices[0].message.content);
      return {
        enhancedQuery: result.enhancedQuery || query,
        keywords: result.keywords || [query],
        academicTerms: result.academicTerms || []
      };
    } catch (error) {
      console.error('AI query enhancement failed:', error.message);
      return {
        enhancedQuery: query,
        keywords: [query],
        academicTerms: []
      };
    }
  }

  async summarizeResults(results, originalQuery) {
    if (!this.initialized || !results.length) {
      return null;
    }

    try {
      const resultsText = results.slice(0, 5).map(r => 
        `${r.title}: ${r.description || r.abstract || ''}`
      ).join('\n');

      const prompt = `Summarize these search results for query "${originalQuery}":

${resultsText}

Provide a brief, informative summary highlighting key themes and insights.`;

      const response = await axios.post(this.apiEndpoint, {
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 150,
        temperature: 0.5
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('AI summary generation failed:', error.message);
      return null;
    }
  }

  async chatAssistant(message, userId = 'default') {
    if (!this.initialized) {
      return {
        success: false,
        response: 'AI assistant is not available at the moment.',
        error: 'AI service not initialized'
      };
    }

    try {
      // Get or create conversation history for user
      if (!this.conversationHistory.has(userId)) {
        this.conversationHistory.set(userId, [
          {
            role: 'system',
            content: 'You are EduGate AI, a knowledgeable educational assistant specializing in helping students and learners. Provide clear, accurate, and educational responses. Focus on:\n\n- Explaining concepts in simple terms\n- Providing practical examples\n- Offering study tips and learning strategies\n- Encouraging curiosity and critical thinking\n- Being supportive and motivating\n\nAlways aim to educate and inspire learning.'
          }
        ]);
      }

      const history = this.conversationHistory.get(userId);
      
      // Add user message to history
      history.push({ role: 'user', content: message });
      
      // Keep only last 10 messages to manage context length
      const recentHistory = history.slice(-10);

      const response = await axios.post(this.apiEndpoint, {
        model: this.model,
        messages: recentHistory,
        max_tokens: 1000,
        temperature: 0.7,
        stream: false
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      if (!response.data?.choices?.[0]?.message?.content) {
        throw new Error('Invalid response format from DeepSeek API');
      }
      
      const aiResponse = response.data.choices[0].message.content;
      
      // Add AI response to history
      history.push({ role: 'assistant', content: aiResponse });
      
      // Update conversation history
      this.conversationHistory.set(userId, history);

      return {
        success: true,
        response: aiResponse,
        conversationId: userId
      };
    } catch (error) {
      console.error('AI chat failed:', error.message);
      
      let errorMessage = 'Sorry, I encountered an error. Please try again.';
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timed out. Please try again with a shorter message.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please check API configuration.';
      } else if (error.response?.status === 429) {
        errorMessage = 'Rate limit exceeded. Please wait a moment and try again.';
      } else if (error.response?.status === 402) {
        errorMessage = 'DeepSeek API quota exceeded. Please check your account.';
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid request format. Please try rephrasing your question.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'DeepSeek API server error. Please try again later.';
      } else if (error.response?.status >= 400) {
        errorMessage = `API error (${error.response?.status}). Please try again.`;
      }
      

      
      return {
        success: false,
        response: errorMessage,
        error: error.message
      };
    }
  }



  clearConversation(userId = 'default') {
    this.conversationHistory.delete(userId);
    return { success: true, message: 'Conversation cleared' };
  }

  getConversationHistory(userId = 'default') {
    const history = this.conversationHistory.get(userId) || [];
    return history.filter(msg => msg.role !== 'system');
  }
}

// Export singleton instance
const aiServiceInstance = new AIService();
module.exports = aiServiceInstance;