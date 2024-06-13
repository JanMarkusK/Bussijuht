// src/components/Lobby.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, firestoreDB, collection, addDoc, doc, updateDoc, getDocs, onSnapshot, query, where } from '../firebase';
import PropTypes from 'prop-types';
import '../assets/css/Lobby.css'; // Import the CSS file

const Lobby = ({ setGameData, setRoomCode, setPlayerName, setInGame }) => {
  const [localRoomCode, setLocalRoomCode] = useState('');
  const [localPlayerName, setLocalPlayerName] = useState('');
  const [isJoining, setIsJoining] = useState(true);
  const [players, setPlayers] = useState([]);
  const [roomCreated, setRoomCreated] = useState(false);
  const navigate = useNavigate();
  const lobbyCollectionRef = collection(firestoreDB, "Lobby");

  // Uus: Kasutaja nime saamiseks Firestore'ist
  useEffect(() => {
    const fetchUserName = async (email) => {
      try {
        const q = query(collection(firestoreDB, "User"), where("email", "==", email));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const userData = userDoc.data();
          setLocalPlayerName(userData.username);
        }
      } catch (error) {
        console.error("Error fetching user data: ", error);
      }
    };

    const currentUser = auth.currentUser;
    if (currentUser) {
      fetchUserName(currentUser.email);
    }
  }, []);

  console.log("laen lehte")
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
    // Teeb ruumi koodi
    const newRoomCode = await handleRoomCode();
    // Paneb kõik vajaliku info Firestore doci
    const lobbyDocRef = await addDoc(lobbyCollectionRef, {
      roomCode: newRoomCode,
      players: [{ name: localPlayerName, host: true, ready: false }],
      inGame: false
    });
    localStorage.setItem('lobbyCode', newRoomCode);
    localStorage.setItem('playerName', localPlayerName);
    localStorage.setItem('doc_id', lobbyDocRef.id);
    console.log("Document ID host:", lobbyDocRef.id);
    // Muudab proppide valuet, mdea kas need on tegelt vajalikud veel
    setPlayerName(localPlayerName);
    setRoomCode(localRoomCode);
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
        const updatedPlayers = [...roomData.players, { name: localPlayerName, host: false, ready: false }];
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
        await updateDoc(doc.ref, { inGame: true });
        setInGame(true);
        navigate('/2faas');
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
        <div>
          <span>Player Name: {localPlayerName}</span>
        </div>
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
