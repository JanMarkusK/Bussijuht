// src/components/BusDriver.jsx
import React, { useState, useEffect } from 'react';
import { firestoreDB, writeBatch, collection, addDoc, doc, updateDoc, getDoc, getDocs, onSnapshot, query, where } from '../firebase';
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
  const localDocID = localStorage.getItem('doc_id')


  useEffect(() => {
    setupGame(); // Pass the room code and player name to setupGame
  }, []); // Include roomCode and playerName in the dependency array

  const setupGame = async () => {
    console.log('Setup game started');
    console.log('Room Code:', localRoomCode);
    console.log('Player Name:', localPlayerName);


    //Hosti kontroll
    /*const q = query(lobbyCollectionRef, 

      where('roomCode', '==', localRoomCode),
      where('players.name', '==', localPlayerName),
      where('players.host', '==', true)
    );
    const querySnapshotHost = await getDocs(q);

    console.log(querySnapshotHost);
    */

    const roomDocRef = doc(lobbyCollectionRef, localDocID);

    const roomDocSnap = await getDoc(roomDocRef);

    if (roomDocSnap.exists()) {
        const roomData = roomDocSnap.data();
        console.log(roomData);

        // Check if the player is in the map and is the host
        const players = roomData.players;
        const localPlayer = Object.values(players).find(player => player.name === localPlayerName);
      
      if (localPlayer && localPlayer.host) {
        let deck = await fetchDeck(); // Fetch the deck from Firestore
        deck = shuffleDeck(deck); // Shuffle the fetched deck
        console.log('Olen host');
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
        const pyramidDocRef = await addDoc(pyramidCollectionRef, {});
        
        let rowIndex = 0;
        let fieldIndex = 0;
        const batch = writeBatch(firestoreDB);  // Create a batch for batched writes
        
        pyramidCards.forEach(row => {
          row.forEach(card => {
            fieldIndex++;
            const fieldName = `row${rowIndex}_col${fieldIndex}`;
            const { faceUp, value: cardValue } = card;
        
            // Add the update to the batch
            batch.update(pyramidDocRef, {
              roomCode: localRoomCode,
              [fieldName]: { faceUp, name: cardValue, row: rowIndex }
            });
          });
          rowIndex++;
        });
        
        // Commit the batch
        try {
          await batch.commit();
          console.log('Pyramid created and Firestore updated');
        } catch (error) {
          console.error('Error creating pyramid:', error);
        }
      
        setPyramid(pyramidCards);
        setHand(deck.splice(0, 5)); // Give the player the first 5 cards from the remaining deck
        setCardsTurned(new Array(pyramidSetup.length).fill(false));
        setGameOver(false);
        setWin(false); // Reset win state
        setCurrentRow(4); // Reset to the bottom row
      } else {
        // Fetch the existing pyramid data if not the host
        const q = query(pyramidCollectionRef, where('roomCode', '==', localRoomCode));
        const querySnapshot = await getDocs(q);

        if (localPlayer) {
          const pyramidData = querySnapshot.docs[0].data();
          const pyramidCards = [];
          let currentRow = [];
          let currentRowIndex = 0;

          for (const key in pyramidData) {
            if (key.startsWith('c')) {
              const { faceUp, name, row } = pyramidData[key];
              if (row !== currentRowIndex) {
                pyramidCards.push(currentRow);
                currentRow = [];
                currentRowIndex = row;
              }
              currentRow.push({ faceUp, value: name });
            }
          }
          pyramidCards.push(currentRow); // push the last row
          setPyramid(pyramidCards);

          // For simplicity, assume the remaining deck is stored somewhere, or handle this logic separately
          // setHand(remainingDeckFromFirestore); // You need to implement fetching the hand for non-host players
          setCardsTurned(new Array(pyramidCards.length).fill(false));
          setGameOver(false);
          setWin(false);
          setCurrentRow(4);
        } else {
          console.error('No pyramid data found for this room code.');
        }
      }
      console.log('Setup game completed');
    }
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

  const restartGame = async () => {
    // Fetch and shuffle a new deck
    let deck = await fetchDeck();
    deck = shuffleDeck(deck);
    
    // Create a copy of the current pyramid
    const newPyramid = [...pyramid];
  
    // Iterate through each card in the pyramid
    newPyramid.forEach(row => {
      row.forEach(card => {
        if (card.faceUp) {
          card.value = deck.pop(); // Marked line: Assign a new card value and remove it from the deck
          card.faceUp = false; // Set the card to be face down
        }
      });
    });
  
    // Update the state with the new pyramid and new hand
    setPyramid(newPyramid);
    setHand(deck.splice(0, 5)); // Give the player the first 5 cards from the remaining deck
    
    // Reset the state for a new game
    setCardsTurned(new Array(pyramid.length).fill(false));
    setGameOver(false);
    setWin(false);
    setCurrentRow(4);
  };

  return (
    <div className="bus-driver-container">
      <div className="bus-driver">
        <h1>Bus Driver Game</h1>
        <Pyramid pyramid={pyramid} onCardClick={handleCardClick} />
        {/* <Hand hand={hand} /> */}
        {gameOver && <button onClick={restartGame}>Restart</button>}
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
