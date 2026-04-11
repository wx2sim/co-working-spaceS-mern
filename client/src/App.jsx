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
import CreateListing from './pages/CreateListing';
import UpdateListing from './pages/UpdateListing';


function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path='/' element={<Home />} />
        <Route path='/signin' element={<SignIn />} />
        <Route path='/signup' element={<SignUp />} />
        <Route path='/about' element={<About />} />
        
        <Route element={<PrivateRoutes />} >
          <Route path='/profile' element={<Profile />} />
          <Route path='/createlisting' element={<CreateListing/>} />
          <Route path='/updatelisting/:listingId' element={<UpdateListing/>} />
        </Route>      

      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>  
      <Header />
      <AnimatedRoutes />
    </BrowserRouter>
  );
}