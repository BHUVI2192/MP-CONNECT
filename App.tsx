
import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { MockDataProvider } from './context/MockDataContext';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { MpDashboard } from './pages/dashboards/MpDashboard';
import { CitizenDashboard } from './pages/dashboards/CitizenDashboard';
import { StaffDashboard } from './pages/staff/StaffDashboard';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from './components/UI/Button';
import { AlertCircle } from 'lucide-react';
import { UserRole } from './types';

// MP View Pages
import { ToursMpPage } from './pages/mp/ToursMpPage';
import { WorksMpPage } from './pages/mp/WorksMpPage';
import { MpladsMpPage } from './pages/mp/MpladsMpPage';
import { ComplaintsMpPage } from './pages/mp/ComplaintsMpPage';
import { LiveLocationPage } from './pages/mp/LiveLocationPage';
import { GalleryMpPage } from './pages/mp/GalleryMpPage';

// PA View Pages
import { PaDashboard } from './pages/pa/PaDashboard';
import { PlanTodayPage } from './pages/pa/PlanTodayPage';
import { DaybookPage } from './pages/pa/DaybookPage';
import { ToursPaPage } from './pages/pa/ToursPaPage';
import { ScheduleTourWizard } from './pages/pa/ScheduleTourWizard';
import { LettersPaPage } from './pages/pa/LettersPaPage';
import { GreetingsPaPage } from './pages/pa/GreetingsPaPage';
import { ComplaintsPaPage } from './pages/pa/ComplaintsPaPage';
import { GalleryPaPage } from './pages/pa/GalleryPaPage';
import { SpeechArchivePage } from './pages/pa/SpeechArchivePage';
import { ParliamentLettersPage } from './pages/pa/ParliamentLettersPage';
import { ParliamentQuestionsPage } from './pages/pa/ParliamentQuestionsPage';
import { ParliamentTrackerPage } from './pages/pa/ParliamentTrackerPage';
import { PaEqDashboardPage } from './pages/pa/PaEqDashboardPage';

// Staff View Pages
import { WorksEntryPage } from './pages/staff/WorksEntryPage';
import { MediaManagerPage } from './pages/staff/MediaManagerPage';
import { StaffComplaintsPage } from './pages/staff/StaffComplaintsPage';
import { PlanTodayStaffPage } from './pages/staff/PlanTodayStaffPage';
import { StaffLettersPage } from './pages/staff/StaffLettersPage';
import { StaffToursPage } from './pages/staff/StaffToursPage';
import { ContactDetailPage } from './pages/staff/ContactDetailPage';
import { ContactBookPage } from './pages/staff/ContactBookPage';
import { BulkUploadPage } from './pages/staff/BulkUploadPage';
import { AuditLogsPage } from './pages/staff/AuditLogsPage';
import { SpeechUploadPage } from './pages/staff/SpeechUploadPage';
import { StaffParliamentEntryPage } from './pages/staff/StaffParliamentEntryPage';
import { StaffEqRequestPage } from './pages/staff/StaffEqRequestPage';

import { ContactFormPage } from './pages/staff/ContactFormPage';
import { UploadWorkPage } from './pages/staff/UploadWorkPage';
import { DevelopmentWorkUploadPage } from './pages/staff/DevelopmentWorkUploadPage';
import { DevelopmentWorksBrowsePage } from './pages/DevelopmentWorksBrowsePage';
import { DevelopmentWorksSearchPage } from './pages/DevelopmentWorksSearchPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { PhotoGalleryPage } from './pages/PhotoGalleryPage';
import { SubmitComplaintPage } from './pages/citizen/SubmitComplaintPage';
import { PublicTourSchedulePage } from './pages/citizen/PublicTourSchedulePage';

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode; officialOnly?: boolean; roles?: UserRole[] }> = ({ children, officialOnly = false, roles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to={officialOnly ? "/official/secure-access" : "/login"} replace />;
  }
  if (officialOnly && user?.role === UserRole.CITIZEN) {
    return <Navigate to="/citizen" replace />;
  }
  if (roles && user && user.role !== UserRole.ADMIN && !roles.includes(user.role)) {
    if (user.role === UserRole.MP) return <Navigate to="/mp" replace />;
    if (user.role === UserRole.PA) return <Navigate to="/pa" replace />;
    if (user.role === UserRole.STAFF) return <Navigate to="/staff" replace />;
    return <Navigate to="/citizen" replace />;
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
        {isAuthenticated && !isPublicPage && <TopNav />}
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
      <NotificationProvider>
        <MockDataProvider>
          <HashRouter>
            <AppLayout>
              <Routes>
                <Route path="/" element={<LandingPage />} />

                {/* Isolated Login Portals */}
                <Route path="/login" element={<LoginPage portalType="citizen" />} />
                <Route path="/official/secure-access" element={<LoginPage portalType="official" />} />

                {/* MP Routes (Protected Official) */}
                <Route path="/mp" element={<ProtectedRoute officialOnly roles={[UserRole.MP, UserRole.ADMIN]}><MpDashboard /></ProtectedRoute>} />
                <Route path="/mp/live" element={<ProtectedRoute officialOnly roles={[UserRole.MP, UserRole.ADMIN]}><LiveLocationPage /></ProtectedRoute>} />
                <Route path="/mp/tours" element={<ProtectedRoute officialOnly roles={[UserRole.MP, UserRole.ADMIN]}><ToursMpPage /></ProtectedRoute>} />
                <Route path="/mp/mplads" element={<ProtectedRoute officialOnly roles={[UserRole.MP, UserRole.ADMIN]}><MpladsMpPage /></ProtectedRoute>} />
                <Route path="/mp/complaints" element={<ProtectedRoute officialOnly roles={[UserRole.MP, UserRole.ADMIN]}><ComplaintsMpPage /></ProtectedRoute>} />
                <Route path="/mp/works" element={<ProtectedRoute officialOnly roles={[UserRole.MP, UserRole.ADMIN]}><DevelopmentWorksBrowsePage /></ProtectedRoute>} />
                <Route path="/mp/works/search" element={<ProtectedRoute officialOnly roles={[UserRole.MP, UserRole.ADMIN]}><DevelopmentWorksSearchPage /></ProtectedRoute>} />
                <Route path="/mp/works/:id" element={<ProtectedRoute officialOnly roles={[UserRole.MP, UserRole.ADMIN]}><ProjectDetailPage /></ProtectedRoute>} />
                <Route path="/mp/gallery" element={<ProtectedRoute officialOnly roles={[UserRole.MP, UserRole.ADMIN]}><GalleryMpPage /></ProtectedRoute>} />

                {/* PA Routes (Protected Official) */}
                <Route path="/pa" element={<ProtectedRoute officialOnly roles={[UserRole.PA, UserRole.ADMIN]}><PaDashboard /></ProtectedRoute>} />
                <Route path="/pa/plan" element={<ProtectedRoute officialOnly roles={[UserRole.PA, UserRole.ADMIN]}><PlanTodayPage /></ProtectedRoute>} />
                <Route path="/pa/daybook" element={<ProtectedRoute officialOnly roles={[UserRole.PA, UserRole.ADMIN]}><DaybookPage /></ProtectedRoute>} />
                <Route path="/pa/works" element={<ProtectedRoute officialOnly roles={[UserRole.PA, UserRole.ADMIN]}><DevelopmentWorksBrowsePage /></ProtectedRoute>} />
                <Route path="/pa/works/search" element={<ProtectedRoute officialOnly roles={[UserRole.PA, UserRole.ADMIN]}><DevelopmentWorksSearchPage /></ProtectedRoute>} />
                <Route path="/pa/works/:id" element={<ProtectedRoute officialOnly roles={[UserRole.PA, UserRole.ADMIN]}><ProjectDetailPage /></ProtectedRoute>} />
                <Route path="/pa/letters" element={<ProtectedRoute officialOnly roles={[UserRole.PA, UserRole.ADMIN]}><LettersPaPage /></ProtectedRoute>} />
                <Route path="/pa/tours" element={<ProtectedRoute officialOnly roles={[UserRole.PA, UserRole.ADMIN]}><ToursPaPage /></ProtectedRoute>} />
                <Route path="/pa/tours/new" element={<ProtectedRoute officialOnly roles={[UserRole.PA, UserRole.ADMIN]}><ScheduleTourWizard /></ProtectedRoute>} />
                <Route path="/pa/greetings" element={<ProtectedRoute officialOnly roles={[UserRole.PA, UserRole.ADMIN]}><GreetingsPaPage /></ProtectedRoute>} />
                <Route path="/pa/complaints" element={<ProtectedRoute officialOnly roles={[UserRole.PA, UserRole.ADMIN]}><ComplaintsPaPage /></ProtectedRoute>} />
                <Route path="/pa/gallery" element={<ProtectedRoute officialOnly roles={[UserRole.PA, UserRole.ADMIN]}><GalleryPaPage /></ProtectedRoute>} />
                <Route path="/pa/speeches" element={<ProtectedRoute officialOnly roles={[UserRole.PA, UserRole.ADMIN]}><SpeechArchivePage /></ProtectedRoute>} />
                <Route path="/pa/parliament" element={<ProtectedRoute officialOnly roles={[UserRole.PA, UserRole.ADMIN]}><ParliamentTrackerPage /></ProtectedRoute>} />
                <Route path="/pa/parliament/letters" element={<ProtectedRoute officialOnly roles={[UserRole.PA, UserRole.ADMIN]}><ParliamentLettersPage /></ProtectedRoute>} />
                <Route path="/pa/parliament/questions" element={<ProtectedRoute officialOnly roles={[UserRole.PA, UserRole.ADMIN]}><ParliamentQuestionsPage /></ProtectedRoute>} />
                <Route path="/pa/railway-eq" element={<ProtectedRoute officialOnly roles={[UserRole.PA, UserRole.ADMIN]}><PaEqDashboardPage /></ProtectedRoute>} />

                {/* Staff Routes (Protected Official) */}
                <Route path="/staff" element={<ProtectedRoute officialOnly roles={[UserRole.STAFF, UserRole.ADMIN]}><StaffDashboard /></ProtectedRoute>} />
                <Route path="/staff/plan-today" element={<ProtectedRoute officialOnly roles={[UserRole.STAFF, UserRole.ADMIN]}><PlanTodayStaffPage /></ProtectedRoute>} />
                <Route path="/staff/entry" element={<ProtectedRoute officialOnly roles={[UserRole.STAFF, UserRole.ADMIN]}><WorksEntryPage /></ProtectedRoute>} />
                <Route path="/staff/works/new" element={<ProtectedRoute officialOnly roles={[UserRole.STAFF, UserRole.ADMIN]}><DevelopmentWorkUploadPage /></ProtectedRoute>} />
                <Route path="/staff/media" element={<ProtectedRoute officialOnly roles={[UserRole.STAFF, UserRole.ADMIN]}><MediaManagerPage /></ProtectedRoute>} />
                <Route path="/staff/complaints" element={<ProtectedRoute officialOnly roles={[UserRole.STAFF, UserRole.ADMIN]}><StaffComplaintsPage /></ProtectedRoute>} />
                <Route path="/staff/letters" element={<ProtectedRoute officialOnly roles={[UserRole.STAFF, UserRole.ADMIN]}><StaffLettersPage /></ProtectedRoute>} />
                <Route path="/staff/tours" element={<ProtectedRoute officialOnly roles={[UserRole.STAFF, UserRole.ADMIN]}><StaffToursPage /></ProtectedRoute>} />
                <Route path="/staff/works/upload" element={<ProtectedRoute officialOnly roles={[UserRole.STAFF, UserRole.ADMIN]}><UploadWorkPage /></ProtectedRoute>} />
                <Route path="/staff/contacts" element={<ProtectedRoute officialOnly roles={[UserRole.STAFF, UserRole.ADMIN]}><ContactBookPage /></ProtectedRoute>} />
                <Route path="/staff/contacts/bulk" element={<ProtectedRoute officialOnly roles={[UserRole.STAFF, UserRole.ADMIN]}><BulkUploadPage /></ProtectedRoute>} />
                <Route path="/staff/contacts/new" element={<ProtectedRoute officialOnly roles={[UserRole.STAFF, UserRole.ADMIN]}><ContactFormPage /></ProtectedRoute>} />
                <Route path="/staff/contacts/edit/:id" element={<ProtectedRoute officialOnly roles={[UserRole.STAFF, UserRole.ADMIN]}><ContactFormPage /></ProtectedRoute>} />
                <Route path="/staff/contacts/:id" element={<ProtectedRoute officialOnly roles={[UserRole.STAFF, UserRole.ADMIN]}><ContactDetailPage /></ProtectedRoute>} />
                <Route path="/staff/audit" element={<ProtectedRoute officialOnly roles={[UserRole.STAFF, UserRole.ADMIN]}><AuditLogsPage /></ProtectedRoute>} />
                <Route path="/staff/speech/upload" element={<ProtectedRoute officialOnly roles={[UserRole.STAFF, UserRole.ADMIN]}><SpeechUploadPage /></ProtectedRoute>} />
                <Route path="/staff/parliament/entry" element={<ProtectedRoute officialOnly roles={[UserRole.STAFF, UserRole.ADMIN]}><StaffParliamentEntryPage /></ProtectedRoute>} />
                <Route path="/staff/railway-eq" element={<ProtectedRoute officialOnly roles={[UserRole.STAFF, UserRole.ADMIN]}><StaffEqRequestPage /></ProtectedRoute>} />

                {/* Citizen Routes (Protected Public) */}
                <Route path="/citizen" element={<ProtectedRoute><CitizenDashboard /></ProtectedRoute>} />
                <Route path="/citizen/new" element={<ProtectedRoute><SubmitComplaintPage /></ProtectedRoute>} />
                <Route path="/citizen/schedule" element={<ProtectedRoute><PublicTourSchedulePage /></ProtectedRoute>} />

                {/* Public Routes */}
                <Route path="/development-works" element={<DevelopmentWorksSearchPage />} />
                <Route path="/development-works/:id" element={<ProjectDetailPage />} />
                <Route path="/gallery" element={<PhotoGalleryPage />} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AppLayout>
          </HashRouter>
        </MockDataProvider>
      </NotificationProvider>
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
