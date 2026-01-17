
import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { MpDashboard } from './pages/dashboards/MpDashboard';
import { CitizenDashboard } from './pages/dashboards/CitizenDashboard';
import { StaffDashboard } from './pages/staff/StaffDashboard';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from './components/UI/Button';
import { AlertCircle } from 'lucide-react';

// MP View Pages
import { ToursMpPage } from './pages/mp/ToursMpPage';
import { WorksMpPage } from './pages/mp/WorksMpPage';
import { MpladsMpPage } from './pages/mp/MpladsMpPage';
import { ComplaintsMpPage } from './pages/mp/ComplaintsMpPage';
import { LiveLocationPage } from './pages/mp/LiveLocationPage';

// PA View Pages
import { PaDashboard } from './pages/pa/PaDashboard';
import { ToursPaPage } from './pages/pa/ToursPaPage';
import { LettersPaPage } from './pages/pa/LettersPaPage';
import { GreetingsPaPage } from './pages/pa/GreetingsPaPage';
import { ComplaintsPaPage } from './pages/pa/ComplaintsPaPage';

// Staff View Pages
import { WorksEntryPage } from './pages/staff/WorksEntryPage';
import { MediaManagerPage } from './pages/staff/MediaManagerPage';
import { StaffComplaintsPage } from './pages/staff/StaffComplaintsPage';

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

// Main Layout Wrapper
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const isPublicPage = location.pathname === '/' || location.pathname === '/login';

  return (
    <div className="flex min-h-screen bg-slate-50">
      {isAuthenticated && !isPublicPage && <Sidebar />}
      <main 
        className={`flex-1 transition-all duration-300 ${
          isAuthenticated && !isPublicPage ? 'pl-64' : ''
        }`}
      >
        <div className={!isPublicPage ? 'p-8 pt-10' : ''}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            
            {/* MP Routes */}
            <Route path="/mp" element={<ProtectedRoute><MpDashboard /></ProtectedRoute>} />
            <Route path="/mp/live" element={<ProtectedRoute><LiveLocationPage /></ProtectedRoute>} />
            <Route path="/mp/tours" element={<ProtectedRoute><ToursMpPage /></ProtectedRoute>} />
            <Route path="/mp/mplads" element={<ProtectedRoute><MpladsMpPage /></ProtectedRoute>} />
            <Route path="/mp/complaints" element={<ProtectedRoute><ComplaintsMpPage /></ProtectedRoute>} />
            <Route path="/mp/works" element={<ProtectedRoute><WorksMpPage /></ProtectedRoute>} />

            {/* PA Routes */}
            <Route path="/pa" element={<ProtectedRoute><PaDashboard /></ProtectedRoute>} />
            <Route path="/pa/letters" element={<ProtectedRoute><LettersPaPage /></ProtectedRoute>} />
            <Route path="/pa/tours" element={<ProtectedRoute><ToursPaPage /></ProtectedRoute>} />
            <Route path="/pa/greetings" element={<ProtectedRoute><GreetingsPaPage /></ProtectedRoute>} />
            <Route path="/pa/complaints" element={<ProtectedRoute><ComplaintsPaPage /></ProtectedRoute>} />

            {/* Staff Routes */}
            <Route path="/staff" element={<ProtectedRoute><StaffDashboard /></ProtectedRoute>} />
            <Route path="/staff/entry" element={<ProtectedRoute><WorksEntryPage /></ProtectedRoute>} />
            <Route path="/staff/media" element={<ProtectedRoute><MediaManagerPage /></ProtectedRoute>} />
            <Route path="/staff/complaints" element={<ProtectedRoute><StaffComplaintsPage /></ProtectedRoute>} />
            <Route path="/staff/audit" element={<ProtectedRoute><PlaceholderPage title="System Audit Logs" /></ProtectedRoute>} />

            {/* Citizen Routes */}
            <Route path="/citizen" element={<ProtectedRoute><CitizenDashboard /></ProtectedRoute>} />
            <Route path="/citizen/new" element={<ProtectedRoute><PlaceholderPage title="Submit Complaint" /></ProtectedRoute>} />
            <Route path="/citizen/schedule" element={<ProtectedRoute><PlaceholderPage title="Public Tour Schedule" /></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
      </HashRouter>
    </AuthProvider>
  );
};

// Simple placeholder component for development of deeper routes
const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
  <div className="p-12 text-center max-w-2xl mx-auto">
    <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-400">
       <AlertCircle className="w-10 h-10" />
    </div>
    <h2 className="text-3xl font-bold text-slate-900 mb-2">{title}</h2>
    <p className="text-slate-500 mb-8">This module is currently being finalized. Please check back shortly as we integrate real-time constituency data.</p>
    <Button variant="outline" onClick={() => window.history.back()}>Go Back</Button>
  </div>
);

export default App;
