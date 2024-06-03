// src/components/Lobby.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { firestoreDB, doc, setDoc, updateDoc, getDoc, getDocs, onSnapshot, collection, addDoc, query, where } from '../firebase';
import PropTypes from 'prop-types';
import '../assets/css/Lobby.css'; // Import the CSS file

const Lobby = ({ setGameData, setRoomCode, setPlayerName, setInGame }) => {
  const [localRoomCode, setLocalRoomCode] = useState('');  // vist peab tegema teise variable hosti koodi ja liituja koodi jaoks, et igal pool localRoomCode ei oleks kasutusel
  const [localPlayerName, setLocalPlayerName] = useState('');
  const [isJoining, setIsJoining] = useState(true);
  const [players, setPlayers] = useState([]);
  const navigate = useNavigate();
  const lobbyCollectionRef = collection(firestoreDB, "Lobby")

  /*useEffect(() => {
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
  */
  const handleRoomCode = async () => {
    const newRoomCode = Math.floor(Math.random() * 90000) + 10000; //luua parem koodi süsteem et ei ole võimalust et tekib sama kood
    setRoomCode(newRoomCode); // Use the prop function to set the room code in the parent component
    setLocalRoomCode(newRoomCode);
  };


  const handleCreateRoom = async () => {
    await handleRoomCode;
    await addDoc(lobbyCollectionRef, {
      roomCode: localRoomCode, 
      players: [{ name: localPlayerName, ready: false }], //siia teha hiljem teine versioon kus on sisselogitud kasutaja andmed
      inGame: false 
    });
    await handleJoinRoom();
  };

  const handleJoinRoom = async () => {
    try {
      const q = query(lobbyCollectionRef, where('roomCode', '==', localRoomCode));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        querySnapshot.forEach(async (doc) => {
          const roomData = doc.data();
          const updatedPlayers = [...roomData.players, { name: localPlayerName, ready: false }];
          await updateDoc(doc.ref, { players: updatedPlayers });
          /*joinRoom(localRoomCode);*/
        });
      } else {
        console.log('No matching room found for the provided room code.');
      }
    } catch (error) {
      console.error('Error joining room:', error);
    }
  };
  
  const handleStartGame = async () => {
    try {
      //Otsib docs
      const q = query(lobbyCollectionRef, where('roomCode', '==', localRoomCode));
      //Toob docs
      const querySnapshot = await getDocs(q);
      //Käib docs läbi
      if (!querySnapshot.empty) {
        querySnapshot.forEach((doc) => {
          console.log('Document data:', doc.data());
          if (doc.exists()) {
            const docRef = doc.data;
            updateDoc(docRef, { inGame: true });
            navigate('/2faas');
          }
        })
      } else {
        console.log('No matching room found for the provided room code.');
      }
    } catch (error) {
      console.error('Error starting game:', error);
    }
  };
  /*const joinRoom = (localRoomCode) => {
    const roomDoc = doc(firestoreDB, `Lobby`, localRoomCode);
    onSnapshot(roomDoc, (snapshot) => {
      const data = snapshot.data();
      if (data) {
        setGameData(data);
        setRoomCode(localRoomCode);
        setPlayerName(localPlayerName);
        setPlayers(data.players || []);
      }
    });
  };
  */


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