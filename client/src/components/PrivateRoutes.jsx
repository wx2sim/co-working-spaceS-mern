import React from 'react'
import { useSelector } from 'react-redux'
import { Outlet, Navigate } from 'react-router-dom'

function PrivateRoutes() {
    const {currentUser} = useSelector((state) => state.user)
  return currentUser ? <Outlet/> : <Navigate to={'/error/401'}/>
}

export default PrivateRoutes