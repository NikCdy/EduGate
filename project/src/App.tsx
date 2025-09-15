import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HeroSection from './components/home/HeroSection';
import FeaturesSection from './components/home/FeaturesSection';
import AIAssistantSection from './components/home/AIAssistantSection';
import CTASection from './components/home/CTASection';
import { Routes, Route, useLocation } from 'react-router-dom';
import SearchDemoSection from './components/home/SearchDemoSection';
import SearchPage from './components/Search/SearchPage';
import NotesSection from './components/Notes/NotesSection';
import UserNotes from './components/Notes/UserNotes';
import LoginForm from './components/Auth/Login';
import SignupForm from './components/Auth/Signup';
import AdminLogin from './components/Auth/AdminLogin';
import AdminPanel from './components/Adminpanel/adminpanel';
import AILearningAssistant from './components/AIAssistant/AILearningAssistant';
import EditProfile from './components/Profile/EditProfile';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import ProtectedAdminRoute from './components/Auth/ProtectedAdminRoute';

function App() {
  const location = useLocation();
  const isAuthPage = ['/login', '/signup', '/admin-login'].includes(location.pathname);

  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/admin-login" element={<AdminLogin />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-primary-50">
      <Header />
      <Routes>
        <Route path="/" element={
          <main className="flex-grow px-4">
            <HeroSection />
            <NotesSection />
          </main>
        } />
        <Route path="/features" element={<><FeaturesSection /><NotesSection /></>} />
        <Route path="/search-demo" element={<><SearchDemoSection /><NotesSection /></>} />
        <Route path="/ai-assistant" element={<><AIAssistantSection /><NotesSection /></>} />
        <Route path="/cta" element={<><CTASection /><NotesSection /></>} />
        <Route path="/notes" element={<UserNotes />} />
        <Route path="/admin" element={<ProtectedAdminRoute><AdminPanel /></ProtectedAdminRoute>} />
        <Route path="/ai-learning" element={<><AILearningAssistant /><NotesSection /></>} />
        <Route path="/profile/edit" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;