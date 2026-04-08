import React from 'react';
import { Dropdown } from 'antd';
import { SettingOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  signOutUserStart, 
  signOutUserSuccess, 
  signOutUserFailure 
} from '../redux/user/userSlice';

export default function ProfileDropdown() {
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
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
        
      } catch (error) {
        const message = error.response?.data?.message || error.message;
          toast.error(message, { duration: 3000 });
          dispatch(signOutUserFailure(error.message));
      }
    };

  const items = [
    {
      key: '1',
      label: <Link to="/profile">Profile</Link>,
      icon: <UserOutlined />,
    },
    {
      key: '2',
      label: 'Settings',
      icon: <SettingOutlined />,
    },
    { type: 'divider' },
    {
      key: '3',
      label: <span onClick={handleSignOut} na>Sign Out</span>,
      icon: <LogoutOutlined />,
      danger: true,
    },
  ];

  return (
    <Dropdown menu={{ items }} placement="bottomRight" arrow>
      <div className="cursor-pointer">
        <img
          className="rounded-full h-8 w-8 object-cover"
          src={currentUser?.avatar || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'}
          alt="profile"
        />
      </div>
    </Dropdown>
  );
}