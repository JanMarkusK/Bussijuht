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
            if (pyramidData.players && pyramidData.players[localPlayerName]) {
              const playerData = pyramidData.players[localPlayerName];
              
              if (playerData.hand && Array.isArray(playerData.hand)) {
                setHand(playerData.hand);
              }
            }
          }
    
          setPyramid(pyramidCards);
    
          let lastFlippedRow = 4;
          for (let i = 0; i < pyramidCards.length; i++) {
            console.log("index: " + i )
            if (pyramidCards[i].some(card => card && card.faceUp)) {
              console.log("index: " + i )
              lastFlippedRow = i
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

    const q = query(pyramid1CollectionRef, where('roomCode', '==', localRoomCode));
    const querySnapshot = await getDocs(q);
    console.log(hand);
    if (querySnapshot.empty) {
      const localPlayer = await firestoreQuery(1);
      const players = await firestoreQuery(2);
      if (localPlayer && localPlayer.host) {
        setIsHost(true);
        await initializeHostGame(players);
      } else {
        await setTimeout(initializeJoinerGame, 1000);
      }
    }

    
  };

 const initializeHostGame = async (players) => {
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

        // Distribute remaining cards to players by name
        await distributeCardsToPlayers(deck, players, batch, pyramidDocRef);

        await batch.commit();
        console.log('Pyramid setup complete in Firestore');

        // Add a slight delay to ensure data is committed
        await setTimeout(getHand, 1000);

    } catch (error) {
        console.error('Error setting up host game:', error);
        // Add error handling
    }
};


  const distributeCardsToPlayers = (deck, players, batch, pyramidDocRef) => {
    console.log("distribute kaardi pakk: " + deck)
    const playerNames = players.map(player => player.name);
    let currentPlayerIndex = 0;
  
    while (deck.length > 0) {
      const card = deck.pop();
      const playerName = playerNames[currentPlayerIndex];
      console.log(`Assigning card to player: ${playerName}`);
  
      // Find the player object in the players array by name
      const player = players.find(p => p.name === playerName);
      if (!player.hand) {
        player.hand = [];
      }
  
      player.hand.push(card);
  
      batch.update(pyramidDocRef, {
        [`players.${playerName}.hand`]: player.hand
      });
  
      currentPlayerIndex = (currentPlayerIndex + 1) % playerNames.length;
    }
  };
  

  const getHand = async () => {
    try {
      const q = query(pyramid1CollectionRef, where('roomCode', '==', localRoomCode));
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        const pyramidData = querySnapshot.docs[0].data(); // Assuming there's only one document
        console.log("Fetched pyramid data:", pyramidData);
  
        if (pyramidData.players && pyramidData.players[localPlayerName]) {
          const playerData = pyramidData.players[localPlayerName];
          
          if (playerData.hand && Array.isArray(playerData.hand)) {
            setHand(playerData.hand);
            console.log(`Hand for ${localPlayerName}:`, playerData.hand);
          } else {
            console.log(`No hand data for ${localPlayerName}`);
          }
        } else {
          console.log(`No player data for ${localPlayerName}`);
        }
      } else {
        console.log('No documents found for the room code:', localRoomCode);
      }
    } catch (error) {
      console.error('Error getting hand:', error);
    }
  };

  const initializeJoinerGame = async () => {
    try {
      const q = query(pyramid1CollectionRef, where('roomCode', '==', localRoomCode));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const pyramidData = querySnapshot.docs[0].data();
        const pyramidCards = [[], [], [], [], []];
        const pyramidDocId = querySnapshot.docs.map(doc =>doc.id);
        localStorage.setItem('pyramidDocId', pyramidDocId);

        for (const key in pyramidData) {
          if (key.startsWith('row')) {
            const { faceUp, name, row, col } = pyramidData[key];
            pyramidCards[row][col] = { faceUp, value: name };
          }
        }

        setPyramid(pyramidCards);
        getHand();
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

  const firestoreQuery = async (arv) => {
    try {
      const roomDocRef = doc(collection(firestoreDB, "Lobby"), localDocID);
      const roomDocSnap = await getDoc(roomDocRef);

      if (roomDocSnap.exists()) {
        const roomData = roomDocSnap.data();
        const players = roomData.players;
        console.log("mägnijad " + JSON.stringify(players, null, 2));
        const localPlayer = Object.values(players).find(player => player.name === localPlayerName);
        if (arv == 1){
          return localPlayer;
        } else if (arv == 2) {
          return players;
        }
        
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
        // setSkipSnapshot(true); // Disable snapshot listener
    
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
        console.log("batch: "+batch)
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
    
        if ( rowIndex !== currentRow) return;
    
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
