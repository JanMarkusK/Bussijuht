// src/components/Lobby.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { firestoreDB, doc, setDoc, updateDoc, getDoc, onSnapshot } from '../firebase';
import PropTypes from 'prop-types';
import '../assets/css/Lobby.css'; // Import the CSS file

const Lobby = ({ setGameData, setRoomCode, setPlayerName, setInGame }) => {
  const [localRoomCode, setLocalRoomCode] = useState('');
  const [localPlayerName, setLocalPlayerName] = useState('');
  const [isJoining, setIsJoining] = useState(true);
  const [players, setPlayers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (localRoomCode) {
      const roomDoc = doc(firestoreDB, `Lobby/${localRoomCode}`);
      const unsubscribe = onSnapshot(roomDoc, (snapshot) => {
        const data = snapshot.data();
        if (data) {
          setPlayers(data.players || []);
          if (data.inGame) {
            setInGame(true);
            setGameData(data);
          }
        }
      });

      return () => unsubscribe();
    }
  }, [localRoomCode, setGameData, setInGame]);

  const handleRoomCode = async () => {
    const newRoomCode = Math.floor(Math.random() * 90000) + 10000;
    setRoomCode(newRoomCode); // Use the prop function to set the room code in the parent component
  };


  const handleCreateRoom = async () => {
    const roomDoc = doc(firestoreDB, `Lobby/${handleRoomCode}`);
    await setDoc(roomDoc, { players: [{ name: localPlayerName, ready: false }], inGame: false });
    joinRoom(handleRoomCode);
  };

  const handleJoinRoom = async () => {
    const roomDoc = doc(firestoreDB, `Lobby/${handleRoomCode}`);
    const docSnapshot = await getDoc(roomDoc);
    if (docSnapshot.exists()) {
      const roomData = docSnapshot.data();
      const updatedPlayers = [...roomData.players, { name: localPlayerName, ready: false }];
      await updateDoc(roomDoc, { players: updatedPlayers });
      joinRoom(handleRoomCode);
    }
  };

  const joinRoom = (code) => {
    const roomDoc = doc(firestoreDB, `Lobby/${code}`);
    onSnapshot(roomDoc, (snapshot) => {
      const data = snapshot.data();
      if (data) {
        setGameData(data);
        setRoomCode(code);
        setPlayerName(localPlayerName);
        setPlayers(data.players || []);
      }
    });
  };

  const handleStartGame = async () => {
    const roomDoc = doc(firestoreDB, `Lobby/${handleRoomCode}`);
    await updateDoc(roomDoc, { inGame: true });
    navigate('/2faas');
  };

  return (
    <div className="lobby-page">
      <div className="input-container">
        {isJoining ? (<input
          type="text"
          placeholder="Room Code"
          value={localRoomCode}
          onChange={(e) => setLocalRoomCode(e.target.value)}
        />) : (<></>)}
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
        <button onClick={handleStartGame}>Start Game</button>
      </div>
      <div className="player-list-container">
        <h3>Players in Lobby:</h3>
        <ul>
          {players.map((player, index) => (
            <li key={index}>{player.name}</li>
          ))}
        </ul>
      </div>
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