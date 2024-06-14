// src/components/HomePage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase'; // Import auth from Firebase
import '../assets/css/HomePage.css';
import '../assets/css/bannerbuss.css';
import teeImage from '/banner/tee.png';
import bussImage from '/banner/buss.png';
import peatusImage from '/banner/peatus.png';
import pealkiriImage from '/banner/pealkiri.png';
import bannerTeloleImage from '/banner/bannertelole.png';

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

const HomePageBannerTelole = () => {
  return (
    <div className="banner-container-telole">
      <img id="bannerTelole" src={bannerTeloleImage} alt="bannertelole" className="banner-telole-image" />  
    </div>
  );
};

const HomePage = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setIsLoggedIn(!!user);
    });

    return () => unsubscribe();
  }, []);

  const handleCreateAccountClick = () => {
    navigate('/signup');
  };

  const handleJoinGameClick = () => {
    navigate('/guestlobby');
  };

  const handleLogInClick = () => {
    navigate('/login');
  };

  const handleLogOutClick = () => {
    auth.signOut().then(() => {
      setIsLoggedIn(false);
      navigate('/');
    });
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleRulesClick = () => {
    navigate('/rules');
  };

  return (
    <div className="home-page">
      <header id="pagebegin">
        <HomePageBanner />
        <HomePageBannerTelole />
      </header>
      <main>
        <h1>Bus Driver Game</h1>
        <h3>Drink water and have fun with your friends!</h3>
        {!isLoggedIn ? (
          <div className="button-container">
            <button onClick={handleCreateAccountClick}>Create Account</button>
            <button onClick={handleLogInClick}>Log In</button>
            <button onClick={handleJoinGameClick}>Join / Create</button>
            <button onClick={handleRulesClick}>Rules</button>
          </div>
        ) : (
          <div className="button-container">
            <button onClick={handleJoinGameClick}>Join as guest</button>
            <button onClick={handleProfileClick}>Profile</button>
            <button onClick={handleRulesClick}>Rules</button>
            <button onClick={handleLogOutClick} className="logout-button">Log Out</button>
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;
