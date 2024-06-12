// src/components/HomePage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import '../assets/css/HomePage.css';
import '../assets/css/banner.css';
import '../assets/css/bannerbuss.css';
import drinkingImage from '../assets/drinking.png'; 
import teeImage from '/banner/tee.png';
import bussImage from '/banner/buss.png';
import peatusImage from '/banner/peatus.png';
import smokeImage from '/banner/smoke.png';
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
      <img id="smoke" src={smokeImage} alt="smoke" className="overlay-image smoke" />
      <img id="smoke" src={smokeImage} alt="smoke" className="overlay-image smoke smoke2" />
      <img id="smoke" src={smokeImage} alt="smoke" className="overlay-image smoke smoke3" />
      <img id="smoke" src={smokeImage} alt="smoke" className="overlay-image smoke smoke4" />
      <img id="smoke" src={smokeImage} alt="smoke" className="overlay-image smoke smoke5" />
      <img id="smoke" src={smokeImage} alt="smoke" className="overlay-image smoke smoke6" />
    </div>
  );
};

const HomePage = ({ setInLobby, setInRules, setInCreateAccount, setInLogIn }) => {
  const navigate = useNavigate();

  const handleCreateAccountClick = () => {
    setInCreateAccount(true);
  };

  const handleJoinGameClick = () => {
    navigate('/guestlobby');
  };

  const handleLogInClick = () => {
    setInLogIn(true);
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
        <h1>Tere tulemast Bussijuhi mängu!</h1>
        <h2>Matemaatikud lahendavad õllesid!</h2>
        <img src={drinkingImage} alt="Drinking Game" className="home-page-image" />
        <div className="button-container">
          <button onClick={handleCreateAccountClick}>Create Account(puudub)</button>
          <button onClick={handleJoinGameClick}>Join by Guest</button>
          <button onClick={handleLogInClick} className="button-centered">Log In(puudub)</button>
        </div>  
        <button onClick={handleRulesClick} className="offset-button">Rules</button>
      </main>
      <footer>
        <hr />
        <address>TLÜ, Narva mnt 25, Tallinn 10120</address>
      </footer>
    </div>
  );
};

HomePage.propTypes = {
  setInCreateAccount: PropTypes.func.isRequired,
  setInLobby: PropTypes.func.isRequired,
  setInLogIn: PropTypes.func.isRequired,
  setInRules: PropTypes.func.isRequired,
};

export default HomePage;
