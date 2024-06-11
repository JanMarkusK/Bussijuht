// src/components/BusDriver.jsx
import React, { useState, useEffect } from 'react';
import { firestoreDB, collection, addDoc, doc, updateDoc, getDoc, getDocs, onSnapshot, query, where } from '../firebase';
import Pyramid from './Pyramid';
import Hand from './Hand';
import { fetchDeck, shuffleDeck } from '../utils/deck';
import '../assets/css/styles.css';
import { array } from 'prop-types';


const BusDriver = () => {
  const [pyramid, setPyramid] = useState([]);
  const [hand, setHand] = useState([]);
  const [currentRow, setCurrentRow] = useState(4);
  const [cardsTurned, setCardsTurned] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false); // win condition state
  const lobbyCollectionRef = collection(firestoreDB, "Lobby");
  const pyramidCollectionRef = collection(firestoreDB, "Pyramid");
  const localPlayerName = localStorage.getItem('playerName')
  const localRoomCode = localStorage.getItem('lobbyCode')


  useEffect(() => {
    setupGame(); // Pass the room code and player name to setupGame
  }, []); // Include roomCode and playerName in the dependency array

  const setupGame = async () => {
    console.log('Setup game started');
    console.log('Room Code:', localRoomCode);
    console.log('Player Name:', localPlayerName);
    //Hosti kontroll
    const q = query(lobbyCollectionRef, 
      where('roomCode', '==', localRoomCode),
      where('players.name', '==', localPlayerName),
      where('players.host', '==', true)
    );
    const querySnapshotHost = await getDocs(q);


    if (!querySnapshotHost.empty) {
      let deck = await fetchDeck(); // Fetch the deck from Firestore
      deck = shuffleDeck(deck); // Shuffle the fetched deck
    
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

      // Create a new document in the pyramid collection

      const pyramidDocRef = await addDoc(pyramidCollectionRef, {
        roomCode: localRoomCode
      });
    
      let rowIndex = 0;
      let fieldIndex = 0;
      pyramidCards.forEach(row => {
        row.forEach(card => {
          fieldIndex++;
          const fieldName = "c" + fieldIndex;
          const { faceUp, value: cardValue } = card;
    
          // Update the fields of the created document
          updateDoc(pyramidDocRef, {
            [fieldName]: { faceUp, name: cardValue, row: rowIndex }
          });
        });
        rowIndex++;
      });
    
      setPyramid(pyramidCards);
      
    } else {
      await getDoc(query(pyramidCollectionRef, where('roomCode', '==', localRoomCode)));
    }

    setHand(deck.splice(0, 5)); // Give the player the first 5 cards from the remaining deck
    setCardsTurned(new Array(pyramidSetup.length).fill(false));
    setGameOver(false);
    setWin(false); // Reset win state
    setCurrentRow(4); // Reset to the bottom row
    console.log('Setup game completed');
    
  };
  
  

  const handleCardClick = (rowIndex, cardIndex) => {
    if (gameOver || win || cardsTurned[rowIndex] || rowIndex !== currentRow) return;

    const newPyramid = [...pyramid];
    newPyramid[rowIndex][cardIndex].faceUp = true;
    setPyramid(newPyramid);

    const newCardsTurned = [...cardsTurned];
    newCardsTurned[rowIndex] = true;
    setCardsTurned(newCardsTurned);

    if (newCardsTurned.some((turned, index) => index > rowIndex && turned)) {
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



  return (
    <div className="bus-driver-container">
      <div className="bus-driver">
        <h1>Bus Driver Game</h1>
        <Pyramid pyramid={pyramid} onCardClick={handleCardClick} />
        <Hand hand={hand} />
        {gameOver && <button onClick={setupGame}>Restart</button>}
        {win && (
          <div className="overlay">
            <div className="overlay-content">
              <h1>You win!</h1>
              <button onClick={setupGame}>Go again!</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusDriver;
