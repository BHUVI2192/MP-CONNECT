
import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MockDataProvider } from './context/MockDataContext';
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
import { DaybookPaPage } from './pages/pa/DaybookPaPage';

// Staff View Pages
import { WorksEntryPage } from './pages/staff/WorksEntryPage';
import { MediaManagerPage } from './pages/staff/MediaManagerPage';
import { StaffComplaintsPage } from './pages/staff/StaffComplaintsPage';
import { PlanTodayStaffPage } from './pages/staff/PlanTodayStaffPage';
import { StaffLettersPage } from './pages/staff/StaffLettersPage';
import { StaffToursPage } from './pages/staff/StaffToursPage';
import { PlanTodayPaPage } from './pages/pa/PlanTodayPaPage';

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode; officialOnly?: boolean }> = ({ children, officialOnly = false }) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to={officialOnly ? "/official/secure-access" : "/login"} replace />;
  }
  return <>{children}</>;
};

// Main Layout Wrapper
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const isPublicPage = location.pathname === '/' || location.pathname.includes('/login') || location.pathname.includes('/official/secure-access');

  return (
    <div className="flex min-h-screen bg-slate-50">
      {isAuthenticated && !isPublicPage && <Sidebar />}
      <main
        className={`flex-1 transition-all duration-300 ${isAuthenticated && !isPublicPage ? 'pl-64' : ''
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
      <MockDataProvider>
        <HashRouter>
          <AppLayout>
            <Routes>
              <Route path="/" element={<LandingPage />} />

              {/* Isolated Login Portals */}
              <Route path="/login" element={<LoginPage portalType="citizen" />} />
              <Route path="/official/secure-access" element={<LoginPage portalType="official" />} />

              {/* MP Routes (Protected Official) */}
              <Route path="/mp" element={<ProtectedRoute officialOnly><MpDashboard /></ProtectedRoute>} />
              <Route path="/mp/live" element={<ProtectedRoute officialOnly><LiveLocationPage /></ProtectedRoute>} />
              <Route path="/mp/tours" element={<ProtectedRoute officialOnly><ToursMpPage /></ProtectedRoute>} />
              <Route path="/mp/mplads" element={<ProtectedRoute officialOnly><MpladsMpPage /></ProtectedRoute>} />
              <Route path="/mp/complaints" element={<ProtectedRoute officialOnly><ComplaintsMpPage /></ProtectedRoute>} />
              <Route path="/mp/works" element={<ProtectedRoute officialOnly><WorksMpPage /></ProtectedRoute>} />

              {/* PA Routes (Protected Official) */}
              <Route path="/pa" element={<ProtectedRoute officialOnly><PaDashboard /></ProtectedRoute>} />
              <Route path="/pa/plan-today" element={<ProtectedRoute officialOnly><PlanTodayPaPage /></ProtectedRoute>} />
              <Route path="/pa/letters" element={<ProtectedRoute officialOnly><LettersPaPage /></ProtectedRoute>} />
              <Route path="/pa/tours" element={<ProtectedRoute officialOnly><ToursPaPage /></ProtectedRoute>} />
              <Route path="/pa/greetings" element={<ProtectedRoute officialOnly><GreetingsPaPage /></ProtectedRoute>} />
              <Route path="/pa/complaints" element={<ProtectedRoute officialOnly><ComplaintsPaPage /></ProtectedRoute>} />
              <Route path="/pa/daybook" element={<ProtectedRoute officialOnly><DaybookPaPage /></ProtectedRoute>} />

              {/* Staff Routes (Protected Official) */}
              <Route path="/staff" element={<ProtectedRoute officialOnly><StaffDashboard /></ProtectedRoute>} />
              <Route path="/staff/plan-today" element={<ProtectedRoute officialOnly><PlanTodayStaffPage /></ProtectedRoute>} />
              <Route path="/staff/entry" element={<ProtectedRoute officialOnly><WorksEntryPage /></ProtectedRoute>} />
              <Route path="/staff/media" element={<ProtectedRoute officialOnly><MediaManagerPage /></ProtectedRoute>} />
              <Route path="/staff/complaints" element={<ProtectedRoute officialOnly><StaffComplaintsPage /></ProtectedRoute>} />
              <Route path="/staff/letters" element={<ProtectedRoute officialOnly><StaffLettersPage /></ProtectedRoute>} />
              <Route path="/staff/tours" element={<ProtectedRoute officialOnly><StaffToursPage /></ProtectedRoute>} />
              <Route path="/staff/audit" element={<ProtectedRoute officialOnly><PlaceholderPage title="System Audit Logs" /></ProtectedRoute>} />

              {/* Citizen Routes (Protected Public) */}
              <Route path="/citizen" element={<ProtectedRoute><CitizenDashboard /></ProtectedRoute>} />
              <Route path="/citizen/new" element={<ProtectedRoute><PlaceholderPage title="Submit Complaint" /></ProtectedRoute>} />
              <Route path="/citizen/schedule" element={<ProtectedRoute><PlaceholderPage title="Public Tour Schedule" /></ProtectedRoute>} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppLayout>
        </HashRouter>
      </MockDataProvider>
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
