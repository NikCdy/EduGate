import React from 'react';
import { Search, BookOpen, BookText, FileText, Film, Image, Database, BrainCircuit, CheckCircle2 } from 'lucide-react';

// Add CSS for fade-in animation
const styles = `
  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .animate-fade-in {
    animation: fade-in 0.6s ease-out forwards;
    opacity: 0;
  }
`;

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-500 group border border-gray-100 hover:border-blue-200 hover:-translate-y-2 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="relative z-10">
        <div className="rounded-2xl bg-gradient-to-r from-blue-100 to-indigo-100 w-20 h-20 flex items-center justify-center mb-6 text-blue-600 group-hover:from-blue-600 group-hover:to-indigo-600 group-hover:text-white transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-3">
          {icon}
        </div>
        <h3 className="text-xl font-bold mb-4 text-gray-900 group-hover:text-blue-600 transition-colors duration-300">{title}</h3>
        <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">{description}</p>
      </div>
    </div>
  );
};

const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: <Search className="h-7 w-7" />,
      title: "Intelligent Search",
      description: "Our advanced search engine understands context and helps you find exactly what you're looking for."
    },
    {
      icon: <BookOpen className="h-7 w-7" />,
      title: "Educational Blogs",
      description: "Access thousands of expert-written blogs covering diverse educational topics and subjects."
    },
    {
      icon: <FileText className="h-7 w-7" />,
      title: "Research Papers",
      description: "Search and read through peer-reviewed research papers from respected academic journals."
    },
    {
      icon: <BookText className="h-7 w-7" />,
      title: "PDF Library",
      description: "Download and read educational PDFs including textbooks, guides, and study materials."
    },
    {
      icon: <Film className="h-7 w-7" />,
      title: "Video Content",
      description: "Watch educational videos with transcripts to enhance your learning experience."
    },
    {
      icon: <Image className="h-7 w-7" />,
      title: "Infographics",
      description: "Visual learners can benefit from our collection of educational infographics and illustrations."
    },
    {
      icon: <Database className="h-7 w-7" />,
      title: "Private Knowledge Base",
      description: "Our platform contains carefully curated educational content for reliable information."
    },
    {
      icon: <BrainCircuit className="h-7 w-7" />,
      title: "AI Learning Assistant",
      description: "Get personalized help and answers from our AI assistant trained on educational materials."
    }
  ];

  return (
    <section id="features" className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-8 shadow-lg">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <div className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 text-sm font-semibold rounded-full mb-6 shadow-sm">
            ✨ POWERFUL FEATURES
          </div>
          <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-6">
            Everything You Need to
            <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Learn Effectively
            </span>
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
            EduGate combines cutting-edge AI technology with comprehensive educational
            resources to create the ultimate learning platform.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {features.map((feature, index) => (
            <div key={index} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
              <FeatureCard
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            </div>
          ))}
        </div>
        
        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Transform Your Learning?</h3>
            <p className="text-gray-600 mb-6">Join thousands of learners who are already using EduGate to achieve their educational goals.</p>
            <a href="/signup" className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-200 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              Get Started Today
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;