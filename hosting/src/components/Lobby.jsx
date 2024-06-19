import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, firestoreDB, collection, addDoc, updateDoc, deleteDoc, getDocs, onSnapshot, query, where, doc } from '../firebase';
import PropTypes from 'prop-types';
import '../assets/css/Lobby.css'; // Import the CSS file

const MIN_PLAYERS = 3;
const MAX_PLAYERS = 8;

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
  const [hasJoinedRoom, setHasJoinedRoom] = useState(false); // State to track if the user has joined a room
  const navigate = useNavigate();
  const lobbyCollectionRef = collection(firestoreDB, "Lobby");

  useEffect(() => {
    const storedPlayerName = localStorage.getItem('playerName');
    const storedLobbyCode = localStorage.getItem('lobbyCode');

    if (storedPlayerName && storedLobbyCode) {
      setLocalPlayerName(storedPlayerName);
      setLocalRoomCode(storedLobbyCode);
      setIsLoggedIn(true);
      setHasJoinedRoom(true);
      setupRealTimeListener(localStorage.getItem('doc_id')); // Setup listener for players list
    }

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
      inGame: false,
      cardBack: 'back.png' // Default card back
    });
    localStorage.setItem('lobbyCode', newRoomCode);
    localStorage.setItem('playerName', localPlayerName);
    localStorage.setItem('doc_id', lobbyDocRef.id);
    console.log("Document ID host:", lobbyDocRef.id);
    setPlayerName(localPlayerName);
    setRoomCode(localRoomCode);
    setRoomCreated(true);
    setIsJoining(false);
    setIsHost(true); // The creator of the room is always the host
    setHasJoinedRoom(true);
    setupRealTimeListener(lobbyDocRef.id); // Setup listener for players list
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
        if (roomData.players.length >= MAX_PLAYERS) {
          alert('Room is full.');
          return;
        }
        const updatedPlayers = [...roomData.players, { name: localPlayerName, host: false, ready: false }];
        await updateDoc(doc.ref, { players: updatedPlayers });
        setCardBack(roomData.cardBack); // Set the card back for the room
        setPlayers(updatedPlayers); // Update the players state
        setIsHost(false); // Joining user is not the host
        setHasJoinedRoom(true); // Set the state to true indicating the user has joined the room
        setupRealTimeListener(doc.id); // Setup listener for players list
      });
    } else {
      alert('No matching room found for the provided room code.');
    }
  };

  const handleStartGame = async () => {
    if (players.length < 3) {
      //siit setNotification ei tööta (GameStartListener all on teavitus kõigile)
      setNotification("At least 3 players are required to start the game.");
      return;
    }
    const q = query(lobbyCollectionRef, where('roomCode', '==', localRoomCode));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      querySnapshot.forEach(async (doc) => {
        await updateDoc(doc.ref, { inGame: true });
        setInGame(true);
        navigate('/1faas');
      });
    } else {
      alert('No matching room found for the provided room code.');
    }
  };
  
//seda hetkel ei ole enam kasutusel
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

  const setupCardBackListener = (docRef) => {
    return onSnapshot(docRef, (doc) => {
      const data = doc.data();
      if (data && data.cardBack) {
        setCardBack(data.cardBack);
      }
    });
  };

  const setupPlayersListener = (docId) => {
    const docRef = doc(firestoreDB, 'Lobby', docId);
    return onSnapshot(docRef, (doc) => {
      const data = doc.data();
      if (data && data.players) {
        setPlayers(data.players);
      }
    });
  };

  const setupGameStartListener = (docId) => {
    const docRef = doc(firestoreDB, 'Lobby', docId);
    return onSnapshot(docRef, (doc) => {
      const data = doc.data();
      if (data && data.players) {
        setPlayers(data.players);
        if (data.players.length < 3) {
          setNotification("At least 3 players are required to start the game.");
        } else {
          setNotification(''); // Clear notification when there are 3 or more players
        }
      }
      if (data && data.inGame) {
        setInGame(true);
        navigate('/1faas'); // All players navigate to the new route
      }
    });
  };
  

  const setupLobbyDeletionListener = (docId) => {
    const docRef = doc(firestoreDB, 'Lobby', docId);
    return onSnapshot(docRef, (docSnapshot) => {
      if (!docSnapshot.exists) {
        // If the document no longer exists, redirect to the home page
        navigate('/');
      }
    });
  };

  const setupRealTimeListener = (docId) => {
    const unsubscribePlayers = setupPlayersListener(docId);
    const unsubscribeGameStart = setupGameStartListener(docId);
    const unsubscribeLobbyDeletion = setupLobbyDeletionListener(docId);
    const q = query(lobbyCollectionRef, where('roomCode', '==', localRoomCode));
    getDocs(q).then((querySnapshot) => {
      if (!querySnapshot.empty) {
        querySnapshot.forEach((doc) => {
          const unsubscribeCardBack = setupCardBackListener(doc.ref);
        });
      }
    });
    return () => {
      unsubscribePlayers();
      unsubscribeGameStart();
      unsubscribeLobbyDeletion();
    };
  };
// leave lobby code
const handleLeaveLobby = async () => {
  const docId = localStorage.getItem('doc_id');
  if (docId) {
    const lobbyDocRef = doc(firestoreDB, 'Lobby', docId);
    if (isHost) {
      // Märgista lobby kui "disbanded"
      await updateDoc(lobbyDocRef, { disbanded: true });
      // Kustuta lobby dokument Firestore'ist
      await deleteDoc(lobbyDocRef);
      // Suuna kasutaja avalehele
      navigate('/');
      //siia tuleks lisada kood mis viiks teised mängijad ka avalehele!!!!
      const q = query(lobbyCollectionRef, where('roomCode', '==', localRoomCode));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        querySnapshot.forEach(async (doc) => {
          const roomData = doc.data();
          const updatedPlayers = roomData.players.filter(player => player.name !== localPlayerName);
          await updateDoc(doc.ref, { players: updatedPlayers });
        });
      }
    } else {
      // Eemalda mängija lobby dokumentist, kui kasutaja pole host
      const q = query(lobbyCollectionRef, where('roomCode', '==', localRoomCode));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        querySnapshot.forEach(async (doc) => {
          const roomData = doc.data();
          const updatedPlayers = roomData.players.filter(player => player.name !== localPlayerName);
          await updateDoc(doc.ref, { players: updatedPlayers });
          navigate('/');
        });
      }
    }
    // Puhasta lokaalne salvestus ja olek
    localStorage.removeItem('lobbyCode');
    localStorage.removeItem('playerName');
    localStorage.removeItem('doc_id');
    setLocalRoomCode('');
    setLocalPlayerName('');
    setIsLoggedIn(false);
    setIsHost(false);
    setHasJoinedRoom(false);
    setPlayers([]);
    setRoomCreated(false);
    setInGame(false);
    navigate('/'); // Suuna kasutaja avalehele
  }
};

useEffect(() => {
  let unsubscribe;

  if (hasJoinedRoom) {
    const docId = localStorage.getItem('doc_id');
    if (docId) {
      const lobbyDocRef = doc(firestoreDB, 'Lobby', docId);

      unsubscribe = onSnapshot(lobbyDocRef, (doc) => {
        const data = doc.data();
        if (data && data.disbanded) {
          navigate('/'); // Redirect to home page if the lobby is disbanded
        } else {
          setPlayers(data.players || []);
        }
      });
    }
  }

  return () => {
    if (unsubscribe) unsubscribe();
  };
}, [hasJoinedRoom, localRoomCode, localPlayerName, navigate]);


  return (
    <div className="lobby-page">
      <div className="input-container">
        {isLoggedIn ? (
          <>
            {!hasJoinedRoom && (
              <div className="top-buttons">
                <div className="switch-buttons-container">
                  <button onClick={isJoining ? handleSwitchToCreate : () => setIsJoining(true)}>
                    {isJoining ? 'Switch to Create' : 'Switch to Join'}
                  </button>
                </div>
              </div>

            )}
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
            {isJoining && !hasJoinedRoom && (
              <button
                className="join-room-button"
                onClick={handleJoinRoom}
                disabled={players.length >= MAX_PLAYERS}
              >
                Join Room
              </button>
            )}
            {isHost && !isJoining && (
              <button
                className="start-game-button"
                onClick={handleStartGame}
                disabled={players.length < MIN_PLAYERS}
              >
                Start Game
              </button>
            )}
            {/* Leave Lobby button */}
            {hasJoinedRoom && (
              <button className="leave-lobby-button" onClick={handleLeaveLobby}>
                Leave Lobby
              </button>
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
            {!hasJoinedRoom && (
              <button className="join-room-button" onClick={handleJoinRoom}>Join Room</button>
            )}
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
          <img src={`/cards/back/${cardBack}`} alt="Default card" />
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
