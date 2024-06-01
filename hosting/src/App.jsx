// src/App.jsx
import React, { useState } from 'react';
import Lobby from './components/Lobby';
import BusDriver from './components/BusDriver';
import Pyramid from './components/Pyramid';

const App = () => {
  const [gameData, setGameData] = useState(null);
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [inGame, setInGame] = useState(false);

  return (
    <div>
      {!inGame ? (
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
      )}
    </div>
  );
};

export default App;
