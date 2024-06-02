/*src/components/HomePage.jsx*/
import React from 'react';
import PropTypes from 'prop-types';
import '../assets/css/HomePage.css'; 
import drinkingImage from '../assets/drinking.png'; // Avalehe pilt on seal

const HomePage = ({ setInLobby, setInRules }) => {
  const handleJoinGameClick = () => {
    setInLobby(true);
  };

  const handleRulesClick = () => {
    setInRules(true);
  };

  return (
    <div className="home-page">
      <h1>Tere tulemast Bussijuhi mängu!</h1>
      <h2>Joo ennast sitaks täis!</h2>
      <img src={drinkingImage} alt="Drinking Game" className="home-page-image" />
      <button onClick={handleJoinGameClick}>Lobby</button>
      <button onClick={handleRulesClick}>Rules</button>
    </div>
  );
};

HomePage.propTypes = {
  setInLobby: PropTypes.func.isRequired,
  setInRules: PropTypes.func.isRequired,
};

export default HomePage;
