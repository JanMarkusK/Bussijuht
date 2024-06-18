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
  const [isPremium, setIsPremium] = useState(false); // State to track if the user is premium
  const [cardBack, setCardBack] = useState('back.png'); // State to track current card back
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
          setIsPremium(userData.premium || false); // Check if user is premium
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
            setPlayers((prevPlayers) => {
              if (JSON.stringify(prevPlayers) !== JSON.stringify(data.players)) {
                return data.players || [];
              }
              return prevPlayers;
            });
            if (data.inGame) {
              setInGame(true);
              setGameData(data);
              navigate('/2faas');
            }
            setIsHost(data.players.some(player => player.name === localPlayerName && player.host)); // Check if current user is the host
            setCardBack(data.cardBack); // Set the card back for the room
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
    // Paneb kõik vajaliku info Firestore doci
    const lobbyDocRef = await addDoc(lobbyCollectionRef, {
      roomCode: newRoomCode,
      players: [{ name: localPlayerName, host: true, ready: false }],
      inGame: false,
      cardBack: 'default.png' // Default card back
    });
    localStorage.setItem('lobbyCode', newRoomCode);
    localStorage.setItem('playerName', localPlayerName);
    localStorage.setItem('doc_id', lobbyDocRef.id);
    console.log("Document ID host:", lobbyDocRef.id);
    // Muudab proppide valuet, mdea kas need on tegelt vajalikud veel
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
    console.log();
    const q = query(lobbyCollectionRef, where('roomCode', '==', localRoomCode));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      querySnapshot.forEach(async (doc) => {
        const roomData = doc.data();
        localStorage.setItem('doc_id', doc.id);
        // Test
        const localTestPlayerName = localStorage.getItem('playerName');
        const localTestLobbyCode = localStorage.getItem('lobbyCode');
        console.log("Liituja nimi:", localTestPlayerName);
        console.log("Liituja kood:", localTestLobbyCode);
        const updatedPlayers = [...roomData.players, { name: localPlayerName, host: false, ready: false }];
        await updateDoc(doc.ref, { players: updatedPlayers });
        setCardBack(roomData.cardBack); // Set the card back for the room
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
    setNotification("You must be logged in to create lobby");
    setTimeout(() => setNotification(''), 3000); // Clear notification after 3 seconds
  };

  const handleSwitchToCreate = async () => {
    if (!localPlayerName) {
      alert("Please enter a player name.");
      return;
    }
    await handleCreateRoom();
  };

  const handleCardBackChange = async (newCardBack) => {
    if (isPremium) {
      setCardBack(newCardBack);
      const q = query(lobbyCollectionRef, where('roomCode', '==', localRoomCode));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        querySnapshot.forEach(async (doc) => {
          await updateDoc(doc.ref, { cardBack: newCardBack });
        });
      }
    } else {
      alert("You must be a premium user to change the card back.");
    }
  };

  return (
    <div className="lobby-page">
      <div className="input-container">
        {isLoggedIn ? (
          <>
            <div className="top-buttons">
              <div className="switch-buttons-container">
                <button onClick={isJoining ? handleSwitchToCreate : () => setIsJoining(true)}>
                  {isJoining ? 'Switch to Create' : 'Switch to Join'}
                </button>
              </div>
            </div>
            <div className="room-code-container">
              <div className="room-code">
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
              </div>
            </div>
            <div className="player-name-container">
              <span>Name: {localPlayerName}</span>
            </div>
            {isJoining ? (
              <button className="join-room-button" onClick={handleJoinRoom}>Join Room</button>
            ) : null}
            {isHost && !isJoining && (
              <button className="start-game-button" onClick={handleStartGame}>Start Game</button>
            )}
          </>
        ) : (
          <>
            <div className="sulPoleKontot">
              <h4>You must be logged in to create a game</h4>
            </div>
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
            <button className="join-room-button" onClick={handleJoinRoom}>Join Room</button>
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
      {isPremium && !isJoining && isHost && (
        <div className="card-back-selector">
          <h3>Select Card Back:</h3>
          <div className="card-backs">
            {['back.png', 'back1.png', 'back2.png', 'back3.png', 'back4.png', 'back5.png', 'back6.png', 'back7.png', 'back8.png', 'back9.png', 'back10.png'].map((back, index) => (
              <img
                key={index}
                src={`/cards/back/${back}`}
                alt={`Card back ${index}`}
                onClick={() => handleCardBackChange(back)}
                className={`card-back-option ${cardBack === back ? 'selected' : ''}`}
              />
            ))}
          </div>
        </div>
      )}
      {!isHost && (
        <div className="current-card-back">
          <h3>Current Card Back:</h3>
          <img src={`/cards/back/${cardBack}`} alt="Current card back" />
        </div>
      )}
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
