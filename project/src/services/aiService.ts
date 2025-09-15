const DEEPSEEK_API_ENDPOINT = 'https://api.deepseek.com/v1/chat/completions';
const DEEPSEEK_API_KEY = 'sk-6804a70005fa4930b1bc9a673d152af9';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatResponse {
  success: boolean;
  response: string;
  error?: string;
}

class AIService {
  private conversationHistory = new Map<string, ChatMessage[]>();

  async chatAssistant(message: string, userId: string = 'default'): Promise<ChatResponse> {
    try {
      // Get or create conversation history
      if (!this.conversationHistory.has(userId)) {
        this.conversationHistory.set(userId, [
          {
            role: 'system',
            content: 'You are EduGate AI, an educational assistant. Help with academic questions, study guidance, and learning strategies. Be concise and educational.'
          }
        ]);
      }

      const history = this.conversationHistory.get(userId)!;
      history.push({ role: 'user', content: message });

      // Keep only last 10 messages
      const recentHistory = history.slice(-10);

      const response = await fetch(DEEPSEEK_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: recentHistory,
          max_tokens: 1000,
          temperature: 0.7,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.choices?.[0]?.message?.content) {
        throw new Error('Invalid response format');
      }

      const aiResponse = data.choices[0].message.content;
      history.push({ role: 'assistant', content: aiResponse });

      return {
        success: true,
        response: aiResponse
      };
    } catch (error) {
      console.error('AI chat error:', error);
      return {
        success: false,
        response: 'Sorry, I encountered an error. Please try again.',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  clearConversation(userId: string = 'default'): void {
    this.conversationHistory.delete(userId);
  }

  getConversationHistory(userId: string = 'default'): ChatMessage[] {
    const history = this.conversationHistory.get(userId) || [];
    return history.filter(msg => msg.role !== 'system');
  }
}

export const aiService = new AIService();