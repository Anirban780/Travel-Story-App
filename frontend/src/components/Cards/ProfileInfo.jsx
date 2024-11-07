import React from 'react'
import { getInitials } from '../../utils/helper';
import LogoutButton from '../Input/LogoutButton';

const ProfileInfo = ({ userInfo, onLogOut }) => {
    return (
        userInfo && (
            <div className='flex items-center gap-3'>
                <div className='w-10 h-10 flex items-center justify-center rounded-full text-slate-950 font-medium bg-slate-100'>
                    {getInitials(userInfo ? userInfo.fullName : "")}
                </div>

                <div className='flex items-center '>
                    <p className='text-[16px] font-medium mr-3'>{userInfo.fullName || ""} </p>
                    <LogoutButton onClick={onLogOut} buttonText="Log Out" />
                </div>
            </div>
        )
    );
};

export default ProfileInfo

