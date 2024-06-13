// src/components/HomePage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/css/HomePage.css';
import '../assets/css/bannerbuss.css';
import teeImage from '/banner/tee.png';
import bussImage from '/banner/buss.png';
import peatusImage from '/banner/peatus.png';
import pealkiriImage from '/banner/pealkiri.png';

const HomePageBanner = () => {
  return (
    <div className="banner-container">
      <div className="road-container">
        <img id="tee" src={teeImage} alt="tee" className="tee-image" />
        <img id="peatus" src={peatusImage} alt="peatus" className="overlay-image peatus" />
      </div>
      <img id="pealkiri" src={pealkiriImage} alt="pealkiri" className="overlay-image pealkiri" />
      <img id="buss" src={bussImage} alt="buss" className="overlay-image buss" />
    </div>
  );
};

const HomePage = () => {
  const navigate = useNavigate();

  const handleCreateAccountClick = () => {
    navigate('/signup');
  };

  const handleJoinGameClick = () => {
    navigate('/guestlobby');
  };

  const handleLogInClick = () => {
    navigate('/login');
  };

  const handleRulesClick = () => {
    navigate('/rules');
  };

  return (
    <div className="home-page">
      <header id="pagebegin">
        <HomePageBanner />
      </header>
      <main>
        <h1>Bus Driver Game</h1>
        <h3>Drink water and have fun with your friends!</h3>
        <div className="button-container">
          <button onClick={handleCreateAccountClick}>Create Account</button>
          <button onClick={handleLogInClick} className="button-centered">Log In</button>
        </div>
        <div className="centered-button-container">
          <button onClick={handleJoinGameClick} className="centered-button">Join by Guest</button>
          <button onClick={handleRulesClick} className="rules-button">Rules</button>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
