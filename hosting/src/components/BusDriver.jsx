// src/components/BusDriver.jsx
import React, { useState, useEffect } from 'react';
import Pyramid from './Pyramid';
import Hand from './Hand';
import { generateDeck, shuffleDeck } from '../utils/deck';
import { firestoreDB, doc, setDoc, updateDoc, onSnapshot } from '../firebase';
import '../styles.css';
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
    const roomDoc = doc(firestoreDB, `Lobby/${roomCode}`);
    const unsubscribe = onSnapshot(roomDoc, (snapshot) => {
      const data = snapshot.data();
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

    return () => unsubscribe();
  }, [roomCode]);

  const handleCardClick = (rowIndex, cardIndex) => {
    if (gameOver || win || cardsTurned[rowIndex]) return;

    const newPyramid = [...pyramid];
    newPyramid[rowIndex][cardIndex].faceUp = true;
    setPyramid(newPyramid);

    const newCardsTurned = [...cardsTurned];
    newCardsTurned[rowIndex] = true;
    setCardsTurned(newCardsTurned);

    const cardValue = newPyramid[rowIndex][cardIndex].value.split('_')[0];
    if (['J', 'Q', 'K', 'A'].includes(cardValue)) {
      setGameOver(true);
      updateDoc(doc(firestoreDB, `Lobby/${roomCode}`), {
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
      setWin(true);
      updateDoc(doc(firestoreDB, `Lobby/${roomCode}`), {
        pyramid: newPyramid,
        currentRow,
        cardsTurned: newCardsTurned,
        gameOver: false,
        win: true,
        hand,
      });
      return;
    }

    if (newCardsTurned.some((turned, index) => index === currentRow && turned)) {
      setCurrentRow(currentRow - 1);
    }

    updateDoc(doc(firestoreDB, `Lobby/${roomCode}`), {
      pyramid: newPyramid,
      currentRow: newCardsTurned.some((turned, index) => index === currentRow && turned) ? currentRow - 1 : currentRow,
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
    setDoc(doc(firestoreDB, `Lobby/${roomCode}`), {
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
    <div className="bus-driver-container">
      <div className="bus-driver">
        <h1>Bus Driver Game</h1>
        <Pyramid pyramid={pyramid} onCardClick={handleCardClick} />
        {/* <Hand hand={hand} /> */}
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