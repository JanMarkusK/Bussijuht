// src/components/FirstFaze.jsx
import React, { useState, useEffect } from 'react';
import Pyramid from './Pyramid';
import { fetchDeck, shuffleDeck } from '../utils/deck';
import '../assets/css/styles.css';

const FirstFaze = () => {
  const [pyramid, setPyramid] = useState([]);
  const [hand, setHand] = useState([]);
  const [currentRow, setCurrentRow] = useState(4);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false); // win condition state
  const [selectedCardIndex, setSelectedCardIndex] = useState(null); // track selected card index
  const [selectedHandCard, setSelectedHandCard] = useState(null); // track selected card from hand

  useEffect(() => {
    setupGame();
  }, []); 

  const getDeck = async () => {
    // Simulate fetching deck from an API or local data
    let deck = await fetchDeck();
    localStorage.setItem('deck', JSON.stringify(deck));
    console.log("Fetched deck: " + deck);
  }

  const setupGame = async () => {
    console.log('Setup game started');
    await getDeck();
    let deck = JSON.parse(localStorage.getItem('deck'));
    deck = shuffleDeck(deck);
    console.log('Shuffled deck: ' + deck);

    const pyramidSetup = [
      Array(1).fill('X'),
      Array(2).fill('X'),
      Array(3).fill('X'),
      Array(4).fill('X'),
      Array(5).fill('X')
    ];
  
    const pyramidCards = pyramidSetup.map(row => row.map(() => {
      const cardValue = deck.pop();
      return { faceUp: false, value: cardValue };
    }));

    const bottomRow = pyramidCards[4];
    bottomRow.forEach(card => card.faceUp = true);

    setPyramid(pyramidCards);
    setHand(deck.splice(0, 5));
    setGameOver(false);
    setWin(false);
    setCurrentRow(4);
    localStorage.setItem('deck', JSON.stringify(deck));
  };  

  const handleHandCardClick = (index) => {
    if (gameOver || win) return;

    // Toggle selection: if the same card is clicked again, deselect it
    setSelectedCardIndex(prevIndex => prevIndex === index ? null : index);
    setSelectedHandCard(prevIndex => prevIndex === index ? null : hand[index]);
  };

  const handlePyramidCardClick = (rowIndex, cardIndex) => {
    if (gameOver || win || (rowIndex !== currentRow && rowIndex !== currentRow - 1)) return;

    if (rowIndex === currentRow - 1) {
      setCurrentRow(currentRow - 1);
      const newPyramid = [...pyramid];
      newPyramid[rowIndex].forEach(card => card.faceUp = true);
      setPyramid(newPyramid);
      return;
    }

    // Check if a card is selected from hand
    if (selectedHandCard === null) return;

    const handCardValue = selectedHandCard.split('_')[0];
    const pyramidCardValue = pyramid[rowIndex][cardIndex].value.split('_')[0];

    // Check if the selected card from hand matches the pyramid card (only values are checked)
    if (handCardValue !== pyramidCardValue) return;

    // Find the exact selected card in hand and place it on pyramid
    const handCardIndex = hand.findIndex(handCard => handCard === selectedHandCard);

    if (handCardIndex === -1) return;

    const newHand = [...hand];
    newHand.splice(handCardIndex, 1);
    setHand(newHand);

    const newPyramid = [...pyramid];
    newPyramid[rowIndex][cardIndex].faceUp = true;
    setPyramid(newPyramid);

    if (rowIndex === 0) {
      setWin(true);
    } else if (newPyramid[rowIndex - 1].every(card => card.faceUp)) {
      setCurrentRow(currentRow - 1);
    }

    // Reset selected card from hand after placing it in pyramid
    setSelectedCardIndex(null);
    setSelectedHandCard(null);
  };

  const restartGame = () => {
    setupGame();
  };

  return (
    <div className="first-faze-container">
      <div className="first-faze">
        <h1>First Faze Game</h1>
        <Pyramid pyramid={pyramid} onCardClick={handlePyramidCardClick} />
        <div className="hand">
          {hand.map((card, index) => (
            <img 
              key={index} 
              src={`cards/${card}.png`} 
              alt={card} 
              className={selectedCardIndex === index ? "hand-card selected" : "hand-card"}
              onClick={() => handleHandCardClick(index)}
            />
          ))}
        </div>
        {gameOver && <button onClick={restartGame}>Restart</button>}
      </div>
    </div>
  );
};

export default FirstFaze;
