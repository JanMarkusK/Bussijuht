// src/utils/deck.jsx
import { firestoreDB, collection, getDocs } from '../firebase';

export const fetchDeck = async () => {
  const deckCollection = collection(firestoreDB, 'CardDeck');
  const deckSnapshot = await getDocs(deckCollection);

  let deck = [];

  deckSnapshot.forEach(doc => {
    const data = doc.data();
    for (let i = 1; i <= 52; i++) {
      const cardKey = `c${i}`;
      if (data.hasOwnProperty(cardKey)) {
        deck.push(data[cardKey]);
      }
    }
  });

  console.log(deck);
  return deck;
};

export const shuffleDeck = (deck) => {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};
