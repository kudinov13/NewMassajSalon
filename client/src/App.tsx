import React, { useState, useEffect } from 'react';
import {
  Route,
  Routes,
  useLocation
} from 'react-router-dom';
import './App.css';
import LoadingScreen from "./components/LoadingScreen";
import Home from "./views/Home";
import Layout from "./views/Layout";
import LoginView from "./views/LoginView";
import RegistrationView from "./views/RegistrationView";
import ShopPage from "./views/ShopPage/ShopPage";
import CartPage from "./views/CartPage";
import ProfilePage from "./views/ProfilePage";
import TibetanBowlsPage from "./views/TibetanBowlsPage";
import DiagnosticsPage from "./views/DiagnosticsPage";
import DiagnosticsDetailPage from "./views/DiagnosticsDetailPage";
import AnalysesPage from "./views/AnalysesPage";
import StreamsPage from "./views/StreamsPage";
import AdminPage from "./views/AdminPage";
import PsychologyPage from "./views/PsychologyPage";
import BookingPage from "./views/BookingPage";
import PsychologistPanel from "./views/PsychologistPanel";
import VideoRoomPage from "./views/VideoRoomPage";
import StreamBroadcastPage from "./views/StreamBroadcastPage";
import StreamViewerPage from "./views/StreamViewerPage";
import SchedulePage from "./views/SchedulePage";
import BowlsBookingPage from "./views/BowlsBookingPage";
import DiagnosticsSchedulePage from "./views/DiagnosticsSchedulePage";
import DiagnosticsBookingPage from "./views/DiagnosticsBookingPage";
import CoursesPage from "./views/CoursesPage";
import CourseViewPage from "./views/CourseViewPage";
import MyCoursesPage from "./views/MyCoursesPage";
import PurchaseHistoryPage from "./views/PurchaseHistoryPage";
import GuidePage from "./views/GuidePage";
import BowlsMediaPage from "./views/BowlsMediaPage";
import BowlsSpecialistPanel from "./views/BowlsSpecialistPanel";
import CookieConsent from "./components/CookieConsent";

const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsVisible(false);
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, [location]);

  return (
    <div className={`transition-opacity duration-300 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {children}
    </div>
  );
};

function App() {
  return <>
    <LoadingScreen />
    <CookieConsent />
    <Routes>
      <Route path='/' element={<Layout/>}>
        <Route index element={<PageTransition><Home /></PageTransition>} />
        <Route path='/login' element={<PageTransition><LoginView/></PageTransition>} />
        <Route path='/registration' element={<PageTransition><RegistrationView/></PageTransition>} />
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
