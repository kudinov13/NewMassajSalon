import React from 'react';
import {
  Route,
  Routes
} from 'react-router-dom';
import './App.css';
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
import CoursesPage from "./views/CoursesPage";
import CourseViewPage from "./views/CourseViewPage";

function App() {
  return <>
    <Routes>
      <Route path='/' element={<Layout/>}>
        <Route index element={<Home />} />
        <Route path='/login' element={<LoginView/>} />
        <Route path='/registration' element={<RegistrationView/>} />
        <Route path='/shop' element={<ShopPage/>} />
        <Route path='/cart' element={<CartPage/>} />
        <Route path='/schedule' element={<SchedulePage/>} />
        <Route path='/profile' element={<ProfilePage/>} />
        <Route path='/tibetan-bowls' element={<TibetanBowlsPage/>} />
        <Route path='/tibetan-bowls/booking' element={<BowlsBookingPage/>} />
        <Route path='/courses' element={<CoursesPage/>} />
        <Route path='/courses/:id' element={<CourseViewPage/>} />
        <Route path='/diagnostics/:type' element={<DiagnosticsPage/>} />
        <Route path='/diagnostics/:type/details' element={<DiagnosticsDetailPage/>} />
        <Route path='/analyses' element={<AnalysesPage/>} />
        <Route path='/streams' element={<StreamsPage/>} />
        <Route path='/admin' element={<AdminPage/>} />
        <Route path='/psychology' element={<PsychologyPage/>} />
        <Route path='/psychology/booking' element={<BookingPage/>} />
        <Route path='/psychologist' element={<PsychologistPanel/>} />
        <Route path='/room/:roomId' element={<VideoRoomPage/>} />
        <Route path='/broadcast/:streamId' element={<StreamBroadcastPage/>} />
        <Route path='/stream/:streamId' element={<StreamViewerPage/>} />
      </Route>
    </Routes>
  </>;
}

export default App;
