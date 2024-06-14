import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, firestoreDB, collection, addDoc, updateDoc, getDocs, onSnapshot, query, where } from '../firebase';
import PropTypes from 'prop-types';
import '../assets/css/Lobby.css'; // Import the CSS file

const Lobby = ({ setGameData, setRoomCode, setPlayerName, setInGame }) => {
  const [localRoomCode, setLocalRoomCode] = useState('');
  const [localPlayerName, setLocalPlayerName] = useState('');
  const [isJoining, setIsJoining] = useState(true);
  const [players, setPlayers] = useState([]);
  const [roomCreated, setRoomCreated] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [notification, setNotification] = useState('');
  const [isHost, setIsHost] = useState(false); // State to track if the user is the host
  const navigate = useNavigate();
  const lobbyCollectionRef = collection(firestoreDB, "Lobby");

  useEffect(() => {
    const fetchUserName = async (email) => {
      try {
        const q = query(collection(firestoreDB, "User"), where("email", "==", email));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const userData = userDoc.data();
          setLocalPlayerName(userData.username);
          setIsLoggedIn(true);
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
            setIsHost(data.players.some(player => player.name === localPlayerName && player.host)); // Check if current user is the host
          }
        });
      });

      return () => unsubscribe();
    }
  }, [localRoomCode, localPlayerName, setGameData, setInGame, navigate, lobbyCollectionRef]);

  const handleRoomCode = async () => {
    const newRoomCode = Math.floor(Math.random() * 90000) + 10000;
    setRoomCode(newRoomCode);
    setLocalRoomCode(newRoomCode.toString());
    return newRoomCode.toString();
  };

  const handleCreateRoom = async () => {
    if (!localPlayerName) {
      alert("Please enter a player name.");
      return;
    }
    const newRoomCode = await handleRoomCode();
    const lobbyDocRef = await addDoc(lobbyCollectionRef, {
      roomCode: newRoomCode,
      players: [{ name: localPlayerName, host: true, ready: false }],
      inGame: false
    });
    localStorage.setItem('lobbyCode', newRoomCode);
    localStorage.setItem('playerName', localPlayerName);
    localStorage.setItem('doc_id', lobbyDocRef.id);
    setPlayerName(localPlayerName);
    setRoomCode(localRoomCode);
    setRoomCreated(true);
    setIsJoining(false);
    setIsHost(true); // The creator of the room is always the host
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

  const handleDisabledClick = () => {
    setNotification("You must be logged in");
    setTimeout(() => setNotification(''), 3000); // Clear notification after 3 seconds
  };

  const handleSwitchToCreate = async () => {
    if (!localPlayerName) {
      alert("Please enter a player name.");
      return;
    }
    await handleCreateRoom();
  };

  return (
    <div className="lobby-page">
      <div className="input-container">
        {isLoggedIn ? (
          <>
            <div className="top-buttons">
              <button onClick={isJoining ? handleSwitchToCreate : () => setIsJoining(true)}>
                {isJoining ? 'Switch to Create' : 'Switch to Join'}
              </button>
            </div>
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
            ) : null}
            {isHost && !isJoining && (
              <button onClick={handleStartGame}>Start Game</button>
            )}
          </>
        ) : (
          <>
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
            <button onClick={handleJoinRoom}>Join Room</button>
          </>
        )}
        {notification && <p className="notification">{notification}</p>}
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
