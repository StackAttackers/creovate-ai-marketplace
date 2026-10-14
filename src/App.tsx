import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import LandingPage from './pages/LandingPage';
import DiscoverPage from './pages/DiscoverPage';
import CreatorProfilePage from './pages/CreatorProfilePage';
import MatchingPage from './pages/MatchingPage';
import AuthPage from './pages/AuthPage';
import BrandDashboardPage from './pages/BrandDashboardPage';
import CreatorDashboardPage from './pages/CreatorDashboardPage';
import NotFoundPage from './pages/NotFoundPage';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-blue-500/20 selection:text-blue-900">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/discover" element={<DiscoverPage />} />
              <Route path="/creators/:id" element={<CreatorProfilePage />} />
              <Route path="/creator/:id" element={<CreatorProfilePage />} />
              <Route path="/matching" element={<MatchingPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/brand-dashboard" element={<BrandDashboardPage />} />
              <Route path="/brand/dashboard" element={<BrandDashboardPage />} />
              <Route path="/creator-dashboard" element={<CreatorDashboardPage />} />
              <Route path="/creator/dashboard" element={<CreatorDashboardPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
