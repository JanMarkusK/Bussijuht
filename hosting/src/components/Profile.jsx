// src/components/Profile.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import '../assets/css/Profile.css'; // Veendu, et sul on see CSS fail olemas

const ProfilePage = ({ setInProfile }) => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate('/');
  };

  return (
    <div className="rules-page">
      <h1>Profile Test</h1>
      
      <button onClick={handleBackClick}>Back</button>
    </div>
  );
};

ProfilePage.propTypes = {
  setInProfile: PropTypes.func.isRequired,
};

export default ProfilePage;
