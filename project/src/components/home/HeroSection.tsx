import React from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  
  const handleGetStarted = () => {
    const isSignedIn = localStorage.getItem('isSignedIn') === 'true';
    if (isSignedIn) {
      navigate('/search-demo');
    } else {
      navigate('/login');
    }
  };
  
  return (
    <section id='Home' className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 pt-20 pb-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center min-h-[80vh]">
          <div className="flex-1 text-center lg:text-left mb-10 lg:mb-0">
            {/* Badge */}
            <div className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 text-sm font-semibold rounded-full mb-8 shadow-sm">
              🎆 Welcome to the Future of Learning
            </div>
            
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold leading-tight mb-6">
              <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Your Gateway to
              </span>
              <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Intelligent Learning
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed mb-10">
              EduGate combines AI-powered search with a vast educational content 
              library to help you find exactly what you need to learn effectively.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 mb-12">
              <button
                onClick={handleGetStarted}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-200 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Get Started Today
                <svg className="ml-2 w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              <button
                onClick={() => navigate('/features')}
                className="px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:text-blue-600 focus:ring-4 focus:ring-blue-100 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                Explore Features
              </button>
            </div>

            {/* Enhanced Search Preview */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 max-w-2xl mx-auto lg:mx-0">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-gradient-to-r from-blue-100 to-indigo-100 p-3 rounded-xl">
                  <Search className="h-6 w-6 text-blue-600" />
                </div>
                <input
                  type="text"
                  placeholder="Try searching for 'machine learning'..."
                  className="flex-1 py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-700"
                  onClick={() => navigate('/search')}
                  readOnly
                />
                <button 
                  onClick={() => navigate('/search')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Search
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Research Papers', icon: '📄' },
                  { label: 'Educational Blogs', icon: '📝' },
                  { label: 'Video Tutorials', icon: '🎥' },
                  { label: 'AI Assistant', icon: '🤖' }
                ].map((item, index) => (
                  <span key={index} className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 text-sm font-medium rounded-full border border-gray-200 hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 hover:border-blue-200 transition-all duration-200 cursor-pointer">
                    <span className="mr-1">{item.icon}</span>
                    {item.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Enhanced Hero Visual */}
          <div className="flex-1 lg:pl-16 relative">
            <div className="relative">
              {/* Main Image Container */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-1 shadow-2xl">
                <div className="bg-white rounded-3xl overflow-hidden">
                  <img
                    src="https://images.pexels.com/photos/4050315/pexels-photo-4050315.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                    alt="Student using EduGate on a laptop"
                    className="w-full h-auto"
                  />
                </div>
              </div>
              
              {/* Enhanced Floating Elements */}
              <div className="absolute -right-8 -top-8 bg-gradient-to-r from-pink-500 to-rose-500 text-white p-6 rounded-2xl shadow-2xl transform rotate-3 hover:rotate-6 transition-transform duration-300">
                <div className="font-bold text-lg">🤖 AI-Powered</div>
                <div className="text-sm opacity-90">Learning Assistant</div>
              </div>
              
              <div className="absolute -left-8 -bottom-8 bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-6 rounded-2xl shadow-2xl transform -rotate-3 hover:-rotate-6 transition-transform duration-300">
                <div className="font-bold text-lg">🔍 Smart Search</div>
                <div className="text-sm opacity-90">Find What You Need</div>
              </div>
              
              <div className="absolute top-1/2 -right-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white p-4 rounded-xl shadow-xl transform translate-y-[-50%] rotate-12 hover:rotate-0 transition-transform duration-300">
                <div className="font-bold">✨ 25K+</div>
                <div className="text-xs opacity-90">Active Users</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;