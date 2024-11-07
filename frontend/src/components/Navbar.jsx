import React from 'react'
import LOGO from '../assets/Images/logo.svg';
import ProfileInfo from './Cards/ProfileInfo';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ userInfo }) => {

  const isToken= localStorage.getItem("token");
  const navigate= useNavigate();

  const onLogOut = () => {
    localStorage.clear();
    navigate("/login");
  }


  return (
    <div className='bg-white flex items-center justify-between px-6 pt-2 drop-shadow sticky top-0 z-10'>
      <img src={LOGO} alt="travel story" className='h-12' />

      {isToken && <ProfileInfo userInfo={userInfo} onLogOut={onLogOut}/>}
    </div>
  );
};

export default Navbar