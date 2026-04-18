import React from 'react';
import { useSelector } from 'react-redux';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function VerifiedRoute() {
  const { currentUser } = useSelector((state) => state.user);
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/signin" />;
  }

  if (!currentUser.isVerified) {
    // Show a toast when they are redirected from a sensitive route
    setTimeout(() => {
        toast.error('Please verify your email first to access this feature!', {
            id: 'verification-protected',
            duration: 4000
        });
    }, 100);
    
    return <Navigate to="/verify-email" state={{ from: location.pathname, email: currentUser.email }} />;
  }

  return <Outlet />;
}
