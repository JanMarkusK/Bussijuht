// src/components/BusDriver.jsx
import React, { useState, useEffect } from 'react';
import Pyramid from './Pyramid';
import Hand from './Hand';
import { generateDeck, shuffleDeck } from '../utils/deck';

const BusDriver = () => {
  const [pyramid, setPyramid] = useState([]);
  const [hand, setHand] = useState([]);
  const [currentRow, setCurrentRow] = useState(4);
  const [cardsTurned, setCardsTurned] = useState([]);

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
      setHand(deck.splice(0, 5)); // Give the player the first 5 cards from the remaining deck
      setCardsTurned(new Array(pyramidSetup.length).fill(false));
    };

    setupGame();
  }, []);

  const handleCardClick = (rowIndex, cardIndex) => {
    if (rowIndex !== currentRow || cardsTurned[rowIndex]) return;

    const newPyramid = [...pyramid];
    newPyramid[rowIndex][cardIndex].faceUp = true;
    setPyramid(newPyramid);

    const newCardsTurned = [...cardsTurned];
    newCardsTurned[rowIndex] = true;
    setCardsTurned(newCardsTurned);

    if (newCardsTurned[rowIndex]) {
      setCurrentRow(currentRow - 1);
    }
  };

  return (
    <div className="bus-driver">
      <Pyramid pyramid={pyramid} onCardClick={handleCardClick} />
      {/* <Hand hand={hand} /> */}
    </div>
  );
};

export default BusDriver;
