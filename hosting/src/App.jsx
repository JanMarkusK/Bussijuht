import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Lobby from './components/Lobby';
import BusDriver from './components/BusDriver';
import FirstPhase from './components/FirstPhase';
import HomePage from './components/HomePage';
import RulesPage from './components/RulesPage';
import SignIn from './components/authentication/SignIn';
import SignUp from './components/authentication/SignUp';
import ProfilePage from './components/ProfilePage';
import Premium from './components/Premium';

const App = () => {
  const [gameData, setGameData] = useState(null);
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [inGame, setInGame] = useState(false);
  const [inLobby, setInLobby] = useState(false);
  const [inRules, setInRules] = useState(false);
  const [inPremium, setInPremium] = useState(false);

  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<HomePage setInLobby={setInLobby} setInRules={setInRules} />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<SignIn />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/rules" element={<RulesPage setInRules={setInRules} />} />
          <Route path="/guestlobby" element={<Lobby setGameData={setGameData} setRoomCode={setRoomCode} setPlayerName={setPlayerName} setInGame={setInGame} setInPremium={setInPremium} />} />
          <Route path="/2faas" element={<BusDriver />} />
          <Route path="/1faas" element={<FirstPhase />} />
          <Route path="/premium" element={<Premium setInPremium={setInPremium} />} /> {/* Lisasin siia ka premium marsruudi */}
        </Routes>
      </div>
    </Router>
  );
};

export default App;
