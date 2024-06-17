import React, { useState, useEffect } from 'react';
import Pyramid from './Pyramid';
import { firestoreDB, writeBatch, collection, doc, updateDoc, getDoc, getDocs, addDoc, query, where, onSnapshot } from '../firebase'; // Ensure all necessary Firestore functions are imported
import { fetchDeck, shuffleDeck } from '../utils/deck';
import '../assets/css/styles.css';

const FirstFaze = () => {
  const [pyramid, setPyramid] = useState([]);
  const [hand, setHand] = useState([]);
  const [currentRow, setCurrentRow] = useState(4);
  const [gameOver, setGameOver] = useState(false);
  const [selectedCardIndex, setSelectedCardIndex] = useState(null);
  const [selectedHandCard, setSelectedHandCard] = useState(null);
  const [isHost, setIsHost] = useState(false); // State to determine if current player is host
  const [skipSnapshot, setSkipSnapshot] = useState(false);

  const pyramid1CollectionRef = collection(firestoreDB, "Pyramid1");
  const localPlayerName = localStorage.getItem('playerName');
  const localRoomCode = localStorage.getItem('lobbyCode');
  const localDocID = localStorage.getItem('doc_id');
  const pyramidDocId = localStorage.getItem('pyramidDocId');

  useEffect(() => {
    setupGame();
  }, []); 

  useEffect(() => {
    if (pyramidDocId) {
      const pyramidDocRef = doc(pyramid1CollectionRef, pyramidDocId);

      const unsubscribe = onSnapshot(pyramidDocRef, (doc) => {
        if (skipSnapshot) {
          return; // Skip updating state if skipSnapshot is true
        }
        if (doc.exists()) {
          const pyramidData = doc.data();
          const pyramidCards = [[], [], [], [], []];

          for (const key in pyramidData) {
            if (key.startsWith('row')) {
              const { faceUp, name, row, col } = pyramidData[key];
              pyramidCards[row][col] = { faceUp, value: name };
            }
          }

          setPyramid(pyramidCards);

          let lastFlippedRow = 3;
          for (let i = 0; i < pyramidCards.length; i++) {
            console.log("index: " + i )
            if (pyramidCards[i].some(card => card && card.faceUp)) {
              console.log("index: " + i )
              if (i == 0) {
                lastFlippedRow = i
              } else{
                lastFlippedRow = i -1;
              }
              console.log("lastFlippedRow2: " + lastFlippedRow)
              setCurrentRow(lastFlippedRow);
              break;
            }
          }

          console.log("lastFlippedRow3: " + lastFlippedRow)
          // Check for the win condition
          if (lastFlippedRow === 0) {
            // const lastCard = pyramidCards[0].find(card => card && card.faceUp);
            // if (lastCard) {
            //   const cardValue = lastCard.value.split('_')[0];
            //   const cardFace = lastCard.faceUp;
            //   if (cardValue !== 'J' && cardValue !== 'Q' && cardValue !== 'K' && cardValue !== 'A', cardFace ) {
            //     setWin(true);
            //     console.log("voitsin")
            //   }
            // }
          }

        }
      });

      return () => unsubscribe();
    }
  }, [pyramidDocId]);

  const setupGame = async () => {
    console.log('Setting up game...');

    const localPlayer = await firestoreQuery();

    if (localPlayer && localPlayer.host) {
      setIsHost(true);
      await initializeHostGame();
    } else {
      await initializeJoinerGame();
    }
  };

  const initializeHostGame = async () => {
    try {
      await getDeck();
      let deck = localStorage.getItem('deck').split(',');

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
      setCurrentRow(4);

      const pyramidDocRef = await addDoc(pyramid1CollectionRef, {});
      const pyramidDocId = pyramidDocRef.id;
      localStorage.setItem('pyramidDocId', pyramidDocId);
      console.log('Pyramid document ID:', pyramidDocId);

      const batch = writeBatch(firestoreDB);

      pyramidCards.forEach((row, rowIndex) => {
        row.forEach((card, colIndex) => {
          const fieldName = `row${rowIndex}_col${colIndex}`;
          batch.set(pyramidDocRef, {
            roomCode: localRoomCode,
            [fieldName]: { faceUp: card.faceUp, name: card.value, row: rowIndex, col: colIndex }
          }, { merge: true });
        });
      });

      await batch.commit();
      console.log('Pyramid setup complete in Firestore');

    } catch (error) {
      console.error('Error setting up host game:', error);
      // Add error handling
    }
  };

  const initializeJoinerGame = async () => {
    try {
      const q = query(pyramid1CollectionRef, where('roomCode', '==', localRoomCode));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const pyramidData = querySnapshot.docs[0].data();
        const pyramidCards = [[], [], [], [], []];

        for (const key in pyramidData) {
          if (key.startsWith('row')) {
            const { faceUp, name, row, col } = pyramidData[key];
            pyramidCards[row][col] = { faceUp, value: name };
          }
        }

        setPyramid(pyramidCards);
        setHand(deck.splice(0, 5));
        setCurrentRow(4);

      } else {
        console.error('No pyramid data found for this room code.');
      }

    } catch (error) {
      console.error('Error setting up joiner game:', error);
      // Add error handling
    }
  };

  const getDeck = async () => {
    try {
      let deck = await fetchDeck(); // Fetch the deck from Firestore
      deck = shuffleDeck(deck);
      localStorage.setItem('deck', deck.join(',')); // store the deck as a comma-separated string
      console.log("Fetched and shuffled deck: ", deck);

    } catch (error) {
      console.error('Error fetching or shuffling deck:', error);
      // Add error handling
    }
  };

  const firestoreQuery = async () => {
    try {
      const roomDocRef = doc(collection(firestoreDB, "Lobby"), localDocID);
      const roomDocSnap = await getDoc(roomDocRef);

      if (roomDocSnap.exists()) {
        const roomData = roomDocSnap.data();
        const players = roomData.players;
        const localPlayer = Object.values(players).find(player => player.name === localPlayerName);
        return localPlayer;
      }

    } catch (error) {
      console.error('Error querying Firestore:', error);
      // Add error handling
    }
  };

  const handleHandCardClick = (index) => {
    if (gameOver) return;

    setSelectedCardIndex(index);
    setSelectedHandCard(hand[index]);
  };

  const handlePyramidCardClick = async (rowIndex, cardIndex) => {
    if (gameOver) return;
  
    const pyramidDocRef = doc(pyramid1CollectionRef, pyramidDocId);
  
    try {
      console.log(`Clicked card at row ${rowIndex}, col ${cardIndex}`);
  
      if (rowIndex === currentRow - 1) {
        setSkipSnapshot(true); // Disable snapshot listener
  
        const newPyramid = [...pyramid];
        newPyramid[rowIndex].forEach(card => {
          card.faceUp = true; // Set faceUp to true for all cards in the row
        });
        console.log('newPyramid before setState:', newPyramid);
        setPyramid(newPyramid); // Update local state
        console.log('newPyramid after setState:', pyramid);
  
        const batch = writeBatch(firestoreDB);
        newPyramid[rowIndex].forEach((card, colIndex) => {
          const fieldName = `row${rowIndex}_col${colIndex}`;
          batch.update(pyramidDocRef, {
            [`${fieldName}.faceUp`]: true
          });
        });
  
        await batch.commit(); // Commit batch update to Firestore
        console.log('Firestore updated with flipped cards');
        
        setTimeout(() => {
          setCurrentRow(currentRow - 1); // Move to the next row
          console.log(`currentRow updated to ${currentRow - 1}`);
          console.log(`Row ${rowIndex} turned over`);
          setSkipSnapshot(false); // Re-enable snapshot listener
        }, 500); // Adjust the delay as needed
  
      } else {
        const handCardValue = selectedHandCard.split('_')[0];
        const pyramidCardValue = pyramid[rowIndex][cardIndex].value.split('_')[0];
  
        if (handCardValue !== pyramidCardValue) return;
  
        const handCardIndex = hand.findIndex(card => card === selectedHandCard);
        if (handCardIndex === -1) return;
  
        setSkipSnapshot(true); // Disable snapshot listener
  
        const newHand = [...hand];
        newHand.splice(handCardIndex, 1);
        setHand(newHand);
  
        const newPyramid = [...pyramid];
        newPyramid[rowIndex][cardIndex].faceUp = true;
        setPyramid(newPyramid);
  
        await updateDoc(pyramidDocRef, {
          [`row${rowIndex}_col${cardIndex}.faceUp`]: true
        });
  
        if (rowIndex === 0) {
          setGameOver(true); // Set game over logic here
        } else if (newPyramid[rowIndex - 1].every(card => card.faceUp)) {
          setTimeout(() => {
            setCurrentRow(currentRow - 1);
            setSkipSnapshot(false); // Re-enable snapshot listener
          }, 500); // Adjust the delay as needed
        }
  
        setSelectedCardIndex(null);
        setSelectedHandCard(null);
        console.log(`Card ${cardIndex} in row ${rowIndex} turned over`);
      }
  
    } catch (error) {
      console.error('Error updating pyramid:', error);
      setSkipSnapshot(false); // Re-enable snapshot listener in case of error
    }
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
