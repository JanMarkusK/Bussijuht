//src/components/HomePage.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import '../assets/css/HomePage.css'; 
import drinkingImage from '../assets/drinking.png'; 
import bannerImage from '/banner/bannerRinde.png';
import porgandImage from '/banner/porgand.png';
import rahaImage from '/banner/200.png';
import viinImage from '/banner/viin.png';

const HomePageBanner = () => {
  return (
    <div className="banner">
      <img src={bannerImage} alt="Banner" className="banner-image" />
      <img src={porgandImage} alt="Porgand" className="overlay-image porgand" />
      <img src={rahaImage} alt="200" className="overlay-image raha" />
      <img src={viinImage} alt="Viin" className="overlay-image viin" />
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
      </header>
      <main>
        <h1>Tere tulemast Bussijuhi mängu!</h1>
        <h2>Matemaatikud lahendavad õllesid!</h2>
        <img src={drinkingImage} alt="Drinking Game" className="home-page-image" />
        <div className="button-container">
          <button onClick={handleCreateAccountClick}>Create Account</button>
          <button onClick={handleJoinGameClick}>Join by Guest</button>
          <button onClick={handleLogInClick} className="button-centered">Log In</button>
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
