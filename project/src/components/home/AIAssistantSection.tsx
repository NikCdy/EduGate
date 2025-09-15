import React from 'react';
import { BrainCircuit, MessageSquare, Sparkles, Zap } from 'lucide-react';

const AIAssistantSection: React.FC = () => {
  return (
    <section className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 py-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl mb-8 shadow-lg">
            <BrainCircuit className="w-10 h-10 text-white" />
          </div>
          <div className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 text-sm font-semibold rounded-full mb-6 shadow-sm">
            🤖 AI ASSISTANT
          </div>
          <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-6">
            Your Personal
            <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              AI Learning Assistant
            </span>
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
            Get instant help with your studies, research, and learning needs with our advanced AI assistant trained on educational materials.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
          <div className="order-2 lg:order-1">
            <div className="bg-white p-8 rounded-2xl shadow-2xl border border-gray-100 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50 opacity-50"></div>
              <div className="relative z-10">
                <div className="flex items-start space-x-4 mb-8">
                  <div className="bg-gradient-to-r from-blue-100 to-indigo-100 p-3 rounded-2xl">
                    <MessageSquare className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800 font-semibold mb-2">User</p>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <p className="text-gray-700">Can you explain the concept of photosynthesis in simple terms?</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 rounded-2xl shadow-lg">
                    <BrainCircuit className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800 font-semibold mb-2 flex items-center gap-2">
                      AI Assistant
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        ✨ Active
                      </span>
                    </p>
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-200">
                      <p className="text-gray-700 leading-relaxed">
                        Photosynthesis is how plants make their own food. They take in sunlight, water, and carbon dioxide, 
                        and convert them into oxygen and glucose (sugar). The sunlight provides energy, water comes from the 
                        roots, and carbon dioxide from the air. The plant uses the glucose for energy and releases oxygen 
                        as a byproduct, which is what we breathe!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="order-1 lg:order-2">
            <h3 className="text-3xl font-bold text-gray-900 mb-8">How Our AI Assistant Helps You</h3>
            
            <div className="space-y-8">
              <div className="flex items-start space-x-6 group">
                <div className="bg-gradient-to-r from-pink-100 to-rose-100 p-4 rounded-2xl flex-shrink-0 group-hover:from-pink-600 group-hover:to-rose-600 transition-all duration-300 shadow-lg">
                  <Sparkles className="h-7 w-7 text-pink-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-pink-600 transition-colors duration-300">Personalized Learning</h4>
                  <p className="text-gray-600 leading-relaxed">Get explanations tailored to your level of understanding and learning style.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-6 group">
                <div className="bg-gradient-to-r from-yellow-100 to-orange-100 p-4 rounded-2xl flex-shrink-0 group-hover:from-yellow-600 group-hover:to-orange-600 transition-all duration-300 shadow-lg">
                  <Zap className="h-7 w-7 text-yellow-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-yellow-600 transition-colors duration-300">Instant Answers</h4>
                  <p className="text-gray-600 leading-relaxed">Receive immediate responses to your questions without having to search through multiple sources.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-6 group">
                <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-4 rounded-2xl flex-shrink-0 group-hover:from-green-600 group-hover:to-emerald-600 transition-all duration-300 shadow-lg">
                  <MessageSquare className="h-7 w-7 text-green-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors duration-300">Interactive Conversations</h4>
                  <p className="text-gray-600 leading-relaxed">Have natural, flowing conversations to deepen your understanding of complex topics.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Experience AI-Powered Learning</h3>
            <p className="text-gray-600 mb-6">Start having intelligent conversations with our AI assistant and accelerate your learning journey.</p>
            <button 
              onClick={() => window.location.href = '/ai-learning'}
              className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:ring-4 focus:ring-indigo-200 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Try AI Assistant Now
              <BrainCircuit className="ml-2 w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIAssistantSection;