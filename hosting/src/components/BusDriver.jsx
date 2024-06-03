// src/components/BusDriver.jsx
import React, { useState, useEffect } from 'react';
import Pyramid from './Pyramid';
import Hand from './Hand';
import { generateDeck, shuffleDeck } from '../utils/deck';
import { ref, set, onValue, update } from 'firebase/database';
import { realtimeDB } from '../firebase';
import '../assets/css/BusDriver.css';
import PropTypes from 'prop-types';

const BusDriver = ({ roomCode, playerName, gameData }) => {
  const [pyramid, setPyramid] = useState([]);
  const [currentRow, setCurrentRow] = useState(4);
  const [cardsTurned, setCardsTurned] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);
  const [hand, setHand] = useState([]);
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    if (gameData) {
      setPyramid(gameData.pyramid || []);
      setCurrentRow(gameData.currentRow || 4);
      setCardsTurned(gameData.cardsTurned || []);
      setGameOver(gameData.gameOver || false);
      setWin(gameData.win || false);
      setHand(gameData.hand || []);
      setPlayers(gameData.players || []);
    }
  }, [gameData]);

  useEffect(() => {
    const roomRef = ref(realtimeDB, `rooms/${roomCode}`);
    onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setPyramid(data.pyramid || []);
        setCurrentRow(data.currentRow || 4);
        setCardsTurned(data.cardsTurned || []);
        setGameOver(data.gameOver || false);
        setWin(data.win || false);
        setHand(data.hand || []);
        setPlayers(data.players || []);
      }
    });
  }, [roomCode]);

  const handleCardClick = (rowIndex, cardIndex) => {
    if (gameOver || win || cardsTurned[rowIndex] || rowIndex !== currentRow) return;
  
    const newPyramid = [...pyramid];
    newPyramid[rowIndex][cardIndex].faceUp = true;
    setPyramid(newPyramid);
  
    const newCardsTurned = [...cardsTurned];
    newCardsTurned[rowIndex] = true;
    setCardsTurned(newCardsTurned);
  
    const cardValue = newPyramid[rowIndex][cardIndex].value.split('_')[0];
    if (['J', 'Q', 'K', 'A'].includes(cardValue)) {
      setGameOver(true);
      update(ref(realtimeDB, `rooms/${roomCode}`), {
        pyramid: newPyramid,
        currentRow,
        cardsTurned: newCardsTurned,
        gameOver: true,
        win: false,
        hand,
      });
      return;
    }
  
    if (rowIndex === 0) {
      console.log("You won the game!");
      setWin(true);
      update(ref(realtimeDB, `rooms/${roomCode}`), {
        pyramid: newPyramid,
        currentRow,
        cardsTurned: newCardsTurned,
        gameOver: false,
        win: true,
        hand,
      });
      return;
    }
  
    // Check if all cards in the current row have been turned over
    if (newCardsTurned.some((turned, index) => index > rowIndex || turned)) {
      setCurrentRow(currentRow - 1);
    }
  
    update(ref(realtimeDB, `rooms/${roomCode}`), {
      pyramid: newPyramid,
      currentRow: allTurnedInCurrentRow ? currentRow - 1 : currentRow,
      cardsTurned: newCardsTurned,
      gameOver: false,
      win: false,
      hand,
    });
  };
  

  const handleStartGame = () => {
    const deck = shuffleDeck(generateDeck());
    const pyramidSetup = [
      Array(1).fill('X'),
      Array(2).fill('X'),
      Array(3).fill('X'),
      Array(4).fill('X'),
      Array(5).fill('X'),
    ];
    const pyramidCards = pyramidSetup.map(row => row.map(() => ({ faceUp: false, value: deck.pop() })));
    const playerHand = deck.splice(0, 5);
    set(ref(realtimeDB, `rooms/${roomCode}`), {
      pyramid: pyramidCards,
      currentRow: 4,
      cardsTurned: new Array(pyramidSetup.length).fill(false),
      gameOver: false,
      win: false,
      hand: playerHand,
      players,
    });
  };

  return (
    <div className="bus-driver-page">
      <div className="bus-driver-container">
        <h1>Bus Driver Game</h1>
        <Pyramid pyramid={pyramid} onCardClick={handleCardClick} />
        <div className="players-list">
          <h3>Players in Game:</h3>
          <ul>
            {players.map((player, index) => (
              <li key={index}>{player.name}</li>
            ))}
          </ul>
        </div>
        {gameOver && <button onClick={handleStartGame}>Restart</button>}
        {win && (
          <div className="overlay">
            <div className="overlay-content">
              <h1>You win!</h1>
              <button onClick={handleStartGame}>Restart</button>
            </div>
          </div>
        )}
        {!gameOver && !win && <button onClick={handleStartGame}>Start Game</button>}
      </div>
    </div>
  );
};

BusDriver.propTypes = {
  roomCode: PropTypes.string.isRequired,
  playerName: PropTypes.string.isRequired,
  gameData: PropTypes.object.isRequired,
};

export default BusDriver;
