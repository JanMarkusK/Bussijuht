import React from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import '../assets/css/HomePage.css';
import '../assets/css/banner.css';
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

const HomePage = ({ setInLobby, setInRules, setInCreateAccount, setInLogIn }) => {
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

  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <div className="home-page">
      <header id="pagebegin">
        <HomePageBanner />
      </header>
      <main>
        <h1>Welcome to the Bus Driver Game!</h1>
        <h2>Mathematicians solve beers!</h2>
        <div className="button-container">
          <button onClick={handleCreateAccountClick}>Create Account</button>
          <button onClick={handleJoinGameClick}>Join by Guest</button>
          <button onClick={handleLogInClick} className="button-centered">Log In</button>
        </div>  
        <button onClick={handleRulesClick} className="offset-button">Rules</button>
        <div>
          <button onClick={handleProfileClick}>Profile</button>
        </div>
      </main>
    </div>
  );
};

HomePage.propTypes = {
  setInCreateAccount: PropTypes.func.isRequired,
  setInLobby: PropTypes.func.isRequired,
  setInLogIn: PropTypes.func.isRequired,
  setInRules: PropTypes.func.isRequired,
  setInProfile: PropTypes.func.isRequired,
};

export default HomePage;
