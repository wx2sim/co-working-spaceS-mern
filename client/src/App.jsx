import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Profile from './pages/Profile';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp'; 
import About from './pages/About';
import Header from './components/Header';
import PrivateRoutes from './components/PrivateRoutes';
import { AnimatePresence } from 'framer-motion';
import Listing from './pages/Listing';
import Search from './pages/Search';

// Error Pages
import NotFound from './pages/Other Pages/NotFound';
import Unauthorized from './pages/Other Pages/Unauthorized';
import Forbidden from './pages/Other Pages/Forbidden';
import ServerError from './pages/Other Pages/ServerError';
import ServiceUnavailable from './pages/Other Pages/ServiceUnavailable';
import ErrorPage from './pages/Other Pages/ErrorPage';


function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path='/' element={<Home />} />
        <Route path='/signin' element={<SignIn />} />
        <Route path='/signup' element={<SignUp />} />
        <Route path='/about' element={<About />} />
        <Route path='/listing/:listingId' element={<Listing />} />
        <Route path='/search' element={<Search />} />
        <Route element={<PrivateRoutes />} >
          <Route path='/profile' element={<Profile />} />
        </Route>      

        {/* Error Routes */}
        <Route path='/error/401' element={<Unauthorized />} />
        <Route path='/error/403' element={<Forbidden />} />
        <Route path='/error/500' element={<ServerError />} />
        <Route path='/error/503' element={<ServiceUnavailable />} />
        <Route path='/error/:code' element={<DynamicErrorPage />} />

        {/* Catch-all → 404 */}
        <Route path='*' element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}

// Dynamic error page for any /error/:code route
function DynamicErrorPage() {
  const location = useLocation();
  const params = location.pathname.split('/');
  const code = parseInt(params[params.length - 1]) || 500;
  const searchParams = new URLSearchParams(location.search);
  const message = searchParams.get('message');
  return <ErrorPage statusCode={code} message={message} />;
}

export default function App() {
  return (
    <BrowserRouter>  
      <Header />
      <AnimatedRoutes />
    </BrowserRouter>
  );
}