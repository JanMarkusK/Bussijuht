// src/components/Lobby.jsx
import React, { useState, useEffect } from 'react';
import { ref, set, onValue, update } from 'firebase/database';
import { realtimeDB } from '../firebase';
import PropTypes from 'prop-types';

const Lobby = ({ setGameData, setRoomCode, setPlayerName, setInGame }) => {
  const [localRoomCode, setLocalRoomCode] = useState('');
  const [localPlayerName, setLocalPlayerName] = useState('');
  const [isJoining, setIsJoining] = useState(true);
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    if (localRoomCode) {
      const roomRef = ref(realtimeDB, `rooms/${localRoomCode}`);
      onValue(roomRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setPlayers(data.players || []);
          if (data.inGame) {
            setInGame(true);
            setGameData(data);
          }
        }
      });
    }
  }, [localRoomCode, setGameData, setInGame]);

  const handleCreateRoom = async () => {
    const roomRef = ref(realtimeDB, `rooms/${localRoomCode}`);
    set(roomRef, { players: [{ name: localPlayerName, ready: false }], inGame: false });
    joinRoom(localRoomCode);
  };

  const handleJoinRoom = async () => {
    const roomRef = ref(realtimeDB, `rooms/${localRoomCode}/players`);
    update(roomRef, { [players.length]: { name: localPlayerName, ready: false } });
    joinRoom(localRoomCode);
  };

  const joinRoom = (code) => {
    const roomRef = ref(realtimeDB, `rooms/${code}`);
    onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setGameData(data);
        setRoomCode(code);
        setPlayerName(localPlayerName);
        setPlayers(data.players || []);
      }
    });
  };

  const handleStartGame = () => {
    const roomRef = ref(realtimeDB, `rooms/${localRoomCode}`);
    update(roomRef, { inGame: true });
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Room Code"
        value={localRoomCode}
        onChange={(e) => setLocalRoomCode(e.target.value)}
      />
      <input
        type="text"
        placeholder="Player Name"
        value={localPlayerName}
        onChange={(e) => setLocalPlayerName(e.target.value)}
      />
      {isJoining ? (
        <button onClick={handleJoinRoom}>Join Room</button>
      ) : (
        <button onClick={handleCreateRoom}>Create Room</button>
      )}
      <button onClick={() => setIsJoining(!isJoining)}>
        {isJoining ? 'Switch to Create' : 'Switch to Join'}
      </button>
      <div>
        <h3>Players in Lobby:</h3>
        <ul>
          {players.map((player, index) => (
            <li key={index}>{player.name}</li>
          ))}
        </ul>
      </div>
      <button onClick={handleStartGame}>Start Game</button>
    </div>
  );
};

Lobby.propTypes = {
  setGameData: PropTypes.func.isRequired,
  setRoomCode: PropTypes.func.isRequired,
  setPlayerName: PropTypes.func.isRequired,
  setInGame: PropTypes.func.isRequired,
};

export default Lobby;
