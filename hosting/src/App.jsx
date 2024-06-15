import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Lobby from './components/Lobby';
import BusDriver from './components/BusDriver';
import FirstPhase from './components/FirstPhase';
import HomePage from './components/HomePage';
import RulesPage from './components/RulesPage';
import SignIn from './components/authentication/SignIn';
import SignUp from './components/authentication/SignUp';
import AuthDetails from './components/authentication/AuthDetails';

const App = () => {
  const [gameData, setGameData] = useState(null);
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [inGame, setInGame] = useState(false);
  const [inLobby, setInLobby] = useState(false);
  const [inRules, setInRules] = useState(false);

  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={
            <>
              <HomePage setInLobby={setInLobby} setInRules={setInRules} />
              <SignIn />
              <SignUp />
              <AuthDetails />
            </>
          } />
          <Route path="/rules" element={<RulesPage setInRules={setInRules} />} />
          <Route path="/guestlobby" element={
            <Lobby
              setGameData={setGameData}
              setRoomCode={setRoomCode}
              setPlayerName={setPlayerName}
              setInGame={setInGame}
            />
          } />
          <Route path="/2faas" element={
            <BusDriver/>
          } />
          <Route path="/1faas" element={
            <FirstPhase/>
          } />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
