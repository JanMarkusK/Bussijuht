// src/components/BusDriver.jsx
import React, { useState, useEffect } from 'react';
import Pyramid from './Pyramid';
import Hand from './Hand';
import { generateDeck, shuffleDeck } from '../utils/deck';
import '../assets/css/styles.css';

const BusDriver = () => {
  const [pyramid, setPyramid] = useState([]);
  const [hand, setHand] = useState([]);
  const [currentRow, setCurrentRow] = useState(4);
  const [cardsTurned, setCardsTurned] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false); // win condition state

  useEffect(() => {
    const setupGame = () => {
      let deck = shuffleDeck(generateDeck());
      const pyramidSetup = [
        Array(1).fill('X'),
        Array(2).fill('X'),
        Array(3).fill('X'),
        Array(4).fill('X'),
        Array(5).fill('X')
      ];
      const pyramidCards = pyramidSetup.map(row => row.map(() => ({ faceUp: false, value: deck.pop() })));
      setPyramid(pyramidCards);
      // setHand(deck.splice(0, 5)); // Give the player the first 5 cards from the remaining deck
      setCardsTurned(new Array(pyramidSetup.length).fill(false));
      setGameOver(false);
      setWin(false); // Reset win state
      setCurrentRow(4); // Reset to the bottom row
    };

    setupGame();
  }, []);

  const handleCardClick = (rowIndex, cardIndex) => {
    if (gameOver || win || cardsTurned[rowIndex] || rowIndex !== currentRow) return;

    const newPyramid = [...pyramid];
    newPyramid[rowIndex][cardIndex].faceUp = true;
    setPyramid(newPyramid);

    const newCardsTurned = [...cardsTurned];
    newCardsTurned[rowIndex] = true;
    setCardsTurned(newCardsTurned);

    if (newCardsTurned.some((turned, index) => index > rowIndex || turned)) {
      setCurrentRow(currentRow - 1);
    }

    const cardValue = newPyramid[rowIndex][cardIndex].value.split('_')[0];
    if (cardValue === 'J' || cardValue === 'Q' || cardValue === 'K' || cardValue === 'A') {
      setGameOver(true);
    }

    if (currentRow === 0 && cardValue !== 'J' && cardValue !== 'Q' && cardValue !== 'K' && cardValue !== 'A') {
      setWin(true);
    }
  };

  const handleRestart = () => {
    const newDeck = shuffleDeck(generateDeck());
    let remainingDeck = [...newDeck];
    const newPyramid = pyramid.map(row => row.map(card => {
      if (card.faceUp) {
        const newCardValue = remainingDeck.pop();
        return { faceUp: false, value: newCardValue };
      }
      return card;
    }));
    setPyramid(newPyramid);
    setHand(remainingDeck.splice(0, 5));
    setGameOver(false);
    setWin(false); // Reset win state
    setCardsTurned(new Array(pyramid.length).fill(false));
    setCurrentRow(4); // Reset to the bottom row
  };

   return (
    <div className="bus-driver-container">
      <div className="bus-driver">
        <h1>Bus Driver Game</h1>
        <Pyramid pyramid={pyramid} onCardClick={handleCardClick} />
        {/* <Hand hand={hand} /> */}
        {gameOver && <button onClick={handleRestart}>Restart</button>}
        {win && (
          <div className="overlay">
            <div className="overlay-content">
              <h1>You win!</h1>
              <button onClick={handleRestart}>Go again!</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusDriver;