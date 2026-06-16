import React, { useState, useEffect, Suspense, lazy } from 'react';
import {
  Route,
  Routes,
  useLocation
} from 'react-router-dom';
import './App.css';
import LoadingScreen from "./components/LoadingScreen";
import Layout from "./views/Layout";
import Home from "./views/Home";
import CookieConsent from "./components/CookieConsent";

// Code-split: each page is loaded only when its route is visited.
const LoginView = lazy(() => import("./views/LoginView"));
const RegistrationView = lazy(() => import("./views/RegistrationView"));
const ShopPage = lazy(() => import("./views/ShopPage/ShopPage"));
const CartPage = lazy(() => import("./views/CartPage"));
const ProfilePage = lazy(() => import("./views/ProfilePage"));
const TibetanBowlsPage = lazy(() => import("./views/TibetanBowlsPage"));
const DiagnosticsPage = lazy(() => import("./views/DiagnosticsPage"));
const DiagnosticsDetailPage = lazy(() => import("./views/DiagnosticsDetailPage"));
const AnalysesPage = lazy(() => import("./views/AnalysesPage"));
const StreamsPage = lazy(() => import("./views/StreamsPage"));
const AdminPage = lazy(() => import("./views/AdminPage"));
const PsychologyPage = lazy(() => import("./views/PsychologyPage"));
const BookingPage = lazy(() => import("./views/BookingPage"));
const PsychologistPanel = lazy(() => import("./views/PsychologistPanel"));
const VideoRoomPage = lazy(() => import("./views/VideoRoomPage"));
const StreamBroadcastPage = lazy(() => import("./views/StreamBroadcastPage"));
const StreamViewerPage = lazy(() => import("./views/StreamViewerPage"));
const SchedulePage = lazy(() => import("./views/SchedulePage"));
const BowlsBookingPage = lazy(() => import("./views/BowlsBookingPage"));
const DiagnosticsSchedulePage = lazy(() => import("./views/DiagnosticsSchedulePage"));
const DiagnosticsBookingPage = lazy(() => import("./views/DiagnosticsBookingPage"));
const CoursesPage = lazy(() => import("./views/CoursesPage"));
const CourseViewPage = lazy(() => import("./views/CourseViewPage"));
const MyCoursesPage = lazy(() => import("./views/MyCoursesPage"));
const PurchaseHistoryPage = lazy(() => import("./views/PurchaseHistoryPage"));
const GuidePage = lazy(() => import("./views/GuidePage"));
const BowlsMediaPage = lazy(() => import("./views/BowlsMediaPage"));
const BowlsSpecialistPanel = lazy(() => import("./views/BowlsSpecialistPanel"));

const PageFallback = () => (
  <div className="min-h-screen bg-[#efdec5] flex items-center justify-center">
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      <div style={{ position: 'relative', width: 56, height: 56 }}>
        <div style={{ position: 'absolute', inset: 0, border: '3px solid #a6856d', borderRadius: '50%', animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', inset: 6, border: '3px solid #C9A882', borderRadius: '50%', animation: 'pulse 1.5s ease-in-out infinite', animationDelay: '0.2s' }} />
        <div style={{ position: 'absolute', inset: 12, border: '3px solid #e3cbb1', borderRadius: '50%', animation: 'pulse 1.5s ease-in-out infinite', animationDelay: '0.4s' }} />
      </div>
      <span style={{ color: '#6B5744', fontFamily: 'sans-serif', fontSize: '0.9rem', opacity: 0.75 }}>Загрузка...</span>
    </div>
  </div>
);

const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsVisible(false);
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, [location]);

  return (
    <Suspense fallback={<PageFallback />}>
      <div className={`transition-opacity duration-300 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        {children}
      </div>
    </Suspense>
  );
};

const AuthPage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Suspense fallback={<PageFallback />}>{children}</Suspense>
);

function App() {
  return <>
    <LoadingScreen />
    <CookieConsent />
    <Routes>
      <Route path='/' element={<Layout/>}>
        <Route index element={<PageTransition><Home /></PageTransition>} />
        <Route path='/login' element={<AuthPage><LoginView/></AuthPage>} />
        <Route path='/registration' element={<AuthPage><RegistrationView/></AuthPage>} />
        <Route path='/shop' element={<PageTransition><ShopPage/></PageTransition>} />
        <Route path='/cart' element={<PageTransition><CartPage/></PageTransition>} />
        <Route path='/schedule' element={<PageTransition><SchedulePage/></PageTransition>} />
        <Route path='/diagnostics-schedule' element={<PageTransition><DiagnosticsSchedulePage/></PageTransition>} />
        <Route path='/diagnostics/booking' element={<PageTransition><DiagnosticsBookingPage/></PageTransition>} />
        <Route path='/profile' element={<PageTransition><ProfilePage/></PageTransition>} />
        <Route path='/tibetan-bowls' element={<PageTransition><TibetanBowlsPage/></PageTransition>} />
        <Route path='/tibetan-bowls/booking' element={<PageTransition><BowlsBookingPage/></PageTransition>} />
        <Route path='/courses' element={<PageTransition><CoursesPage/></PageTransition>} />
        <Route path='/courses/:id' element={<PageTransition><CourseViewPage/></PageTransition>} />
        <Route path='/my-courses' element={<PageTransition><MyCoursesPage/></PageTransition>} />
        <Route path='/purchase-history' element={<PageTransition><PurchaseHistoryPage/></PageTransition>} />
        <Route path='/diagnostics/:type' element={<PageTransition><DiagnosticsPage/></PageTransition>} />
        <Route path='/diagnostics/:type/details' element={<PageTransition><DiagnosticsDetailPage/></PageTransition>} />
        <Route path='/analyses' element={<PageTransition><AnalysesPage/></PageTransition>} />
        <Route path='/streams' element={<PageTransition><StreamsPage/></PageTransition>} />
        <Route path='/admin' element={<PageTransition><AdminPage/></PageTransition>} />
        <Route path='/psychology' element={<PageTransition><PsychologyPage/></PageTransition>} />
        <Route path='/psychology/booking' element={<PageTransition><BookingPage/></PageTransition>} />
        <Route path='/psychologist' element={<PageTransition><PsychologistPanel/></PageTransition>} />
        <Route path='/bowls-specialist' element={<PageTransition><BowlsSpecialistPanel/></PageTransition>} />
        <Route path='/room/:roomId' element={<PageTransition><VideoRoomPage/></PageTransition>} />
        <Route path='/guide' element={<PageTransition><GuidePage/></PageTransition>} />
        <Route path='/tibetan-bowls/media' element={<PageTransition><BowlsMediaPage/></PageTransition>} />
        <Route path='/broadcast/:streamId' element={<PageTransition><StreamBroadcastPage/></PageTransition>} />
        <Route path='/stream/:streamId' element={<PageTransition><StreamViewerPage/></PageTransition>} />
      </Route>
    </Routes>
  </>;
}

export default App;
