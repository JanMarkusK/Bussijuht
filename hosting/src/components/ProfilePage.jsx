// src/components/ProfilePage.jsx
import React from 'react';
import ProfileData from './ProfileData';
import ProfileForm from './ProfileForm';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";



const ProfilePage = ({ userData, onUpdateProfile }) => {
  return (
    <div className='profile'>
      <h1>Profile</h1>
      {userData ? (
        <>
          <ProfileData userData={userData} />
          <ProfileForm userData={userData} onUpdateProfile={onUpdateProfile} />
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default ProfilePage;

