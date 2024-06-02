import React, { useState } from 'react';
import Lobby from './components/Lobby';
import BusDriver from './components/BusDriver';
import HomePage from './components/HomePage';
import RulesPage from './components/RulesPage';

const App = () => {
  const [gameData, setGameData] = useState(null);
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [inGame, setInGame] = useState(false);
  const [inLobby, setInLobby] = useState(false);
  const [inRules, setInRules] = useState(false);

  return (
    <div>
      {!inLobby && !inRules ? (
        <HomePage setInLobby={setInLobby} setInRules={setInRules} />
      ) : (
        inRules ? (
          <RulesPage setInRules={setInRules} />
        ) : (
          !inGame ? (
            <Lobby
              setGameData={setGameData}
              setRoomCode={setRoomCode}
              setPlayerName={setPlayerName}
              setInGame={setInGame}
            />
          ) : (
            <BusDriver
              roomCode={roomCode}
              playerName={playerName}
              gameData={gameData}
            />
          )
        )
      )}
    </div>
  );
};

export default App;
