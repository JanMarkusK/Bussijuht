import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { firestoreDB, collection, addDoc, doc, updateDoc, getDocs, onSnapshot, query, where, setDoc } from '../firebase';
import PropTypes from 'prop-types';
import { fetchDeck, shuffleDeck } from '../utils/deck';
import '../assets/css/Lobby.css';

const Lobby = ({ setGameData, setRoomCode, setPlayerName, setInGame }) => {
  const [localRoomCode, setLocalRoomCode] = useState('');
  const [localPlayerName, setLocalPlayerName] = useState('');
  const [isJoining, setIsJoining] = useState(true);
  const [players, setPlayers] = useState([]);
  const [roomCreated, setRoomCreated] = useState(false);
  const navigate = useNavigate();
  const lobbyCollectionRef = collection(firestoreDB, "Lobby");

  useEffect(() => {
    if (localRoomCode) {
      const q = query(lobbyCollectionRef, where('roomCode', '==', localRoomCode));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data) {
            setPlayers(data.players || []);
            if (data.inGame) {
              setInGame(true);
              setGameData(data);
              navigate('/2faas');
            }
          }
        });
      });

      return () => unsubscribe();
    }
  }, [localRoomCode, setGameData, setInGame, navigate]);

  const handleRoomCode = async () => {
    const newRoomCode = Math.floor(Math.random() * 90000) + 10000;
    setRoomCode(newRoomCode);
    setLocalRoomCode(newRoomCode.toString());
    return newRoomCode.toString();
  };

  const handleCreateRoom = async () => {
    const newRoomCode = await handleRoomCode();
    const lobbyDocRef = await addDoc(lobbyCollectionRef, {
      roomCode: newRoomCode,
      players: [{ name: localPlayerName, host: true, ready: false, hand: [] }],
      inGame: false,
      pyramid: [], // Initialize pyramid array
      currentTurn: 0,
      currentRow: 4,
      gameOver: false,
      win: false,
    });
    localStorage.setItem('lobbyCode', newRoomCode);
    localStorage.setItem('playerName', localPlayerName);
    localStorage.setItem('doc_id', lobbyDocRef.id);
    setPlayerName(localPlayerName);
    setRoomCode(newRoomCode);
    setRoomCreated(true);
  };

  const handleJoinRoom = async () => {
    if (!localRoomCode || !localPlayerName) {
      alert("Please enter both a room code and a player name.");
      return;
    }
    localStorage.setItem('playerName', localPlayerName);
    localStorage.setItem('lobbyCode', localRoomCode);
    const q = query(lobbyCollectionRef, where('roomCode', '==', localRoomCode));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      querySnapshot.forEach(async (doc) => {
        const roomData = doc.data();
        localStorage.setItem('doc_id', doc.id);
        const updatedPlayers = [...roomData.players, { name: localPlayerName, host: false, ready: false, hand: [] }];
        await updateDoc(doc.ref, { players: updatedPlayers });
      });
    } else {
      alert('No matching room found for the provided room code.');
    }
  };

  const handleStartGame = async () => {
    const q = query(lobbyCollectionRef, where('roomCode', '==', localRoomCode));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      querySnapshot.forEach(async (doc) => {
        const data = doc.data();
        if (Object.keys(data.players).length < 2) {
          alert('Need at least 2 players to start the game.');
          return;
        }
  
        // Setup game logic here (syncing pyramid, hands, etc.)
        const deck = await fetchDeck(); // Replace with your deck fetching logic
        const shuffledDeck = shuffleDeck(deck);
        const pyramidSetup = [
          Array(1).fill('X'),
          Array(2).fill('X'),
          Array(3).fill('X'),
          Array(4).fill('X'),
          Array(5).fill('X')
        ];
        const pyramidCards = pyramidSetup.map(row => row.map(() => {
          const cardValue = shuffledDeck.pop();
          return { faceUp: false, value: cardValue };
        }));
  
        // Update players' hands
        const updatedPlayers = {};
        Object.keys(data.players).forEach(playerId => {
          updatedPlayers[playerId] = {
            ...data.players[playerId],
            hand: shuffledDeck.splice(0, Math.ceil(deck.length / Object.keys(data.players).length)),
          };
        });
  
        await updateDoc(doc.ref, {
          inGame: true,
          pyramid: pyramidCards,
          players: updatedPlayers,
        });
  
        setGameData({ ...data, inGame: true, pyramid: pyramidCards });
        setInGame(true);
        navigate('/1faas');
      });
    } else {
      alert('No matching room found for the provided room code.');
    }
  };
  
  
  

  return (
    <div className="lobby-page">
      <div className="input-container">
        {isJoining ? (
          <input
            type="text"
            placeholder="Room Code"
            value={localRoomCode}
            onChange={(e) => setLocalRoomCode(e.target.value)}
          />
        ) : (
          roomCreated && <div>Room Code: {localRoomCode}</div>
        )}
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
