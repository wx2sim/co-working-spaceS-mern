import React from 'react';
import { Dropdown } from 'antd';
import { SettingOutlined, UserOutlined, LogoutOutlined, LoginOutlined } from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  signOutUserStart, 
  signOutUserSuccess, 
  signOutUserFailure 
} from '../redux/user/userSlice';

export default function ProfileDropdown({ currentUser }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async ()=> {
      try {
        dispatch(signOutUserStart());
        const { data } = await axios.post(`/api/auth/signout`);
        console.log(data);
        if (data.success === false) {
          toast.error(data.message, { duration: 3000 });
          dispatch(signOutUserFailure(data));
          return;
        }
        dispatch(signOutUserSuccess(data));
        toast.success('User Signed out successfully!', { duration: 3000 });
        
        const currentPath = location.pathname;
        if (currentPath !== '/' && currentPath !== '/about' && currentPath !== '/search') {
          navigate('/signin');
        }
      } catch (error) {
        const message = error.response?.data?.message || error.message;
          toast.error(message, { duration: 3000 });
          dispatch(signOutUserFailure(error.message));
      }
    };

  
  const loggedInItems = [
    {
      key: '1',
      label: <Link to="/profile">Profile</Link>,
      icon: <UserOutlined />,
    },
    {
      key: '2',
      label: <Link to="/settings">Settings</Link>,
      icon: <SettingOutlined />,
    },
    { type: 'divider' },
    {
      key: '3',
      label: <span onClick={handleSignOut}>Sign Out</span>,
      icon: <LogoutOutlined />,
      danger: true,
    },
  ];

  const loggedOutItems = [
    {
      key: '1',
      label: <Link to="/signin">Sign in / Sign up</Link>,
      icon: <LoginOutlined />,
    },
  ];

  const currentItems = currentUser ? loggedInItems : loggedOutItems;

  return (
    <Dropdown menu={{ items: currentItems }} placement="bottomRight" arrow>
      <div className="cursor-pointer">
        <img
          className="rounded-full h-8 w-8 object-cover border border-slate-200"
          src={currentUser?.avatar || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'}
          alt="profile"
        />
      </div>
    </Dropdown>
  );
}