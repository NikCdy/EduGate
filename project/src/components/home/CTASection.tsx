import React from 'react';
import { ArrowRight } from 'lucide-react';

const CTASection: React.FC = () => {
  return (
    <section className="py-24 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>
      
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-6 py-2 bg-white/10 backdrop-blur-sm text-white text-sm font-semibold rounded-full mb-8 shadow-lg">
            🚀 Join the Learning Revolution
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Ready to Revolutionize Your
            <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              Learning Experience?
            </span>
          </h2>
          
          <p className="text-xl mb-10 text-white/90 leading-relaxed max-w-3xl mx-auto">
            Join thousands of students, researchers, and educators who have 
            already discovered the power of EduGate's intelligent learning platform.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <button className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 focus:ring-4 focus:ring-white/20 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              Explore Features
            </button>
            <button className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-blue-600 focus:ring-4 focus:ring-white/20 transition-all duration-300 flex items-center justify-center">
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* Enhanced Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { number: '25,000+', label: 'Active Users', icon: '👥' },
            { number: '1M+', label: 'Educational Resources', icon: '📚' },
            { number: '99%', label: 'Satisfaction Rate', icon: '⭐' }
          ].map((stat, index) => (
            <div key={index} className="text-center group">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-2 shadow-lg hover:shadow-2xl">
                <div className="text-4xl mb-2">{stat.icon}</div>
                <div className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                  {stat.number}
                </div>
                <div className="text-white/80 font-medium">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CTASection;