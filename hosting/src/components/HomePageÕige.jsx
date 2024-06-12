// src/components/HomePage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import '../assets/css/HomePage.css';
import '../assets/css/banner.css';
import '../assets/css/bannerbuss.css';
import drinkingImage from '../assets/drinking.png'; 
import bannerImage from '/banner/bannerRinde.png';
import porgandImage from '/banner/porgand.png';
import rahaImage from '/banner/200.png';
import viinImage from '/banner/viin.png';
import teeImage from '/banner/tee.png';
import bussImage from '/banner/buss.png';
import peatusImage from '/banner/peatus.png';
import smokeImage from '/banner/smoke.png';

const HomePageBanner = () => {
  return (
    <>
      <div className="banner">
        <img src={bannerImage} alt="Banner" className="banner-image" />
        <img src={porgandImage} alt="Porgand" className="overlay-image porgand" />
        <img src={rahaImage} alt="200" className="overlay-image raha" />
        <img src={viinImage} alt="Viin" className="overlay-image viin" />
      </div>

      <div className="bannerbussijuht">
        <div className="road-container">
          <img src={teeImage} alt="tee" className="tee-image" />
          <img id="buss" src={bussImage} alt="buss" className="overlay-image buss" />
          <img id="peatus" src={peatusImage} alt="peatus" className="overlay-image peatus" />
          <img id="smoke" src={smokeImage} alt="smoke" className="overlay-image smoke" />
        </div>
      </div>
    </>
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
        <img 
          src={bannerImage} 
          alt="lehe bänner" 
          className="banner"
        />
        <div id="peamine" className="peamine">
          <div className="peamine-border">
            <img 
              className="porgandilaadnetoode" 
              src={porgandImage} 
              alt="porgand" 
            />
          </div>  
          <img 
            className="raha" 
            src={rahaImage} 
            alt="klots" 
          />
          <img 
            className="viin" 
            src={viinImage} 
            alt="alx" 
          />
        </div>
        <img 
          src={teeImage} 
          alt="lehe bänner" 
          className="bannerbussijuht"
        />
        <div id="alumine" className="alumine">
          <div className="alumine-border">
            <img 
              id="buss" 
              className="buss" 
              src={bussImage} 
              alt="buss" 
            />
          </div>  
          <img 
            id="peatus" 
            className="peatus" 
            src={peatusImage} 
            alt="peatus" 
          />
          <img 
            id="smoke" 
            className="smoke" 
            src={smokeImage} 
            alt="smoke" 
          />
        </div>
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
