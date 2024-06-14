// src/components/Premium.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
//import '../assets/css/Premium.css'; // Veendu, et sul on see CSS fail olemas

const Premium = ({ setInPremium }) => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate('/');
  };

  return (
    <div className="premium-page">
      <h2>OSTA PREMIUM</h2>
      <h3>
        Kas soovid soetada Premium kontot?
      </h3>
      <button onClick={() => navigate('/')} className='back-button'>Jah!</button>
      <button onClick={() => navigate('/')} className='back-button'>Ei, olen vaene rott</button>
      <button onClick={handleBackClick}>Back</button>
    </div>
  );
};

Premium.propTypes = {
  setInPremiumn: PropTypes.func.isRequired,
};

export default Premium;
