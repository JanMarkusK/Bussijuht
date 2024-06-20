// JUST IN CASE

import React, { useEffect } from 'react';
import { firestoreDB } from '../firebase';
import { collection, doc, setDoc, writeBatch } from 'firebase/firestore';

const AddDeckToFirestore = () => {
  useEffect(() => {
    const addDeck = async () => {
      const suits = ['clubs', 'diamonds', 'hearts', 'spades'];
      const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
      const cardDeckCollectionRef = collection(firestoreDB, 'CardDeck');
      const cardDeckDocRef = doc(cardDeckCollectionRef, 'carddeck_id');
      const batch = writeBatch(firestoreDB);

      let cardData = {};
      let cardIndex = 1;

      for (let rank of ranks) {
        for (let suit of suits) {
          const cardName = `${rank}_of_${suit}`;
          const cardKey = `c${cardIndex}`;
          cardData[cardKey] = cardName;
          cardIndex++;
        }
      }

      // Add the entire cardData to the document in a single batch set
      batch.set(cardDeckDocRef, cardData);

      try {
        await batch.commit();
        console.log('Deck added to Firestore');
      } catch (error) {
        console.error('Error adding deck to Firestore:', error);
      }
    };

    addDeck();
  }, []);

  return (
    <div>
      <h1>Adding Deck to Firestore...</h1>
    </div>
  );
};

export default AddDeckToFirestore;
