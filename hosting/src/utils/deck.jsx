// src/utils/deck.jsx
export const generateDeck = () => {
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const values = [
      '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'
    ];
    const deck = [];
  
    for (let suit of suits) {
      for (let value of values) {
        deck.push(`${value} of ${suit}`);
      }
    }
  
    return deck;
  };
  
  export const shuffleDeck = (deck) => {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  };
  