// src/components/BusDriver.jsx
/**/import React, { useState, useEffect } from 'react';
import { firestoreDB, writeBatch, collection, addDoc, doc, updateDoc, getDoc, getDocs, onSnapshot, query, where, deleteDoc } from '../firebase';
import Pyramid from './Pyramid';
import Hand from './Hand';
import { fetchDeck, shuffleDeck } from '../utils/deck';
import '../assets/css/styles.css';
import { array } from 'prop-types';
import { useNavigate } from 'react-router-dom';


const BusDriver = () => {
  const [pyramid, setPyramid] = useState([]);
  const [hand, setHand] = useState([]);
  const [currentRow, setCurrentRow] = useState();
  const [cardsTurned, setCardsTurned] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false); // win condition state
  const [cardCounter, setCardCounter] = useState(0);
  const [notInGame, setNotInGame] = useState('');
  const navigate = useNavigate();

  const lobbyCollectionRef = collection(firestoreDB, "Lobby");
  const pyramidCollectionRef = collection(firestoreDB, "Pyramid");
  const localPlayerName = localStorage.getItem('playerName');
  const localRoomCode = localStorage.getItem('lobbyCode');
  const localDocID = localStorage.getItem('doc_id');
  const pyramidDocId = localStorage.getItem('pyramidDocId');

  
  console.log ("laen lehte")
  useEffect(() => {
    setupGame(); // Pass the room code and player name to setupGame
  }, []); // Include roomCode and playerName in the dependency array
  
  useEffect(() => {
    console.log('pyramidDocId:', pyramidDocId); // Add this line to check the value of pyramidDocId
    const pyramidDocRef = doc(pyramidCollectionRef, pyramidDocId);

    const unsubscribe = onSnapshot(pyramidDocRef, (doc) => {
      if (doc.exists()) {
        const pyramidData = doc.data();
        const pyramidCards = [[], [], [], [], []]; // Initialize pyramid structure with 5 rows

        for (const key in pyramidData) {
          if (key.startsWith('row')) {
            const { faceUp, name, row, col } = pyramidData[key];
            pyramidCards[row][col] = { faceUp, value: name }; // Place card in the correct position in the pyramid
          }
        }

        setPyramid(pyramidCards);

        let lastFlippedRow = 4;
        console.log("lasFlippedRow: " + lastFlippedRow)
        for (let i = 0; i < pyramidCards.length; i++) {
          if (pyramidCards[i].some(card => card && card.faceUp)) {
            console.log("index: " + i )
            if (i == 0) {
              lastFlippedRow = i
            } else{
              lastFlippedRow = i -1;
            }
            console.log("lasFlippedRow2: " + lastFlippedRow)
            setCurrentRow(lastFlippedRow);
            break;

          }
        }

        // Update currentRow

        console.log("lasFlippedRow3: " + lastFlippedRow)
        // Check for the win condition
        if (lastFlippedRow === 0) {
          const lastCard = pyramidCards[0].find(card => card && card.faceUp);
          if (lastCard) {
            const cardValue = lastCard.value.split('_')[0];
            const cardFace = lastCard.faceUp;
            if (cardValue !== 'J' && cardValue !== 'Q' && cardValue !== 'K', cardFace ) {
              setWin(true);
              console.log("voitsin")
            }
          }
        }
      }
    });
    // if (win){
    //   return () => unsubscribe();
    // }
  }, [pyramidDocId]);
  

  // const deleteAllDocuments = async (collectionRef) => {
  //   const querySnapshot = await getDocs(collectionRef);
  //   const batch = writeBatch(firestoreDB);

  //   querySnapshot.forEach((doc) => {
  //     batch.delete(doc.ref);
  //   });

  //   await batch.commit();
  //   console.log('All documents in the collection have been deleted.');
  // };

  
  const getDeck = async () => {
    let deck = [];
    deck = await fetchDeck(); // Fetch the deck from Firestore
    deck = shuffleDeck(deck);
    localStorage.setItem('deck', deck);
    console.log("sain selle decki " + deck);
  }

  const firestoreQuery = async () => {
    const roomDocRef = doc(lobbyCollectionRef, localDocID);

    const roomDocSnap = await getDoc(roomDocRef);

    if (roomDocSnap.exists()) {
        const roomData = roomDocSnap.data();
        console.log(roomData);

        // Check if the player is in the map and is the host
        const players = roomData.players;
        const localPlayer = Object.values(players).find(player => player.name === localPlayerName);
        return localPlayer;
    }
  };


  const joinerStart = async () => {
    const localPlayer = await firestoreQuery();
    console.log('Player name: ' + localPlayer);
    
    const q = query(pyramidCollectionRef, where('roomCode', '==', localRoomCode));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const pyramidData = querySnapshot.docs[0].data();
      const pyramidDocId = querySnapshot.docs.map(doc =>doc.id);
      localStorage.setItem('pyramidDocId', pyramidDocId);
      const pyramidCards = [[], [], [], [], []]; // Initialize pyramid structure with 5 rows
  
      for (const key in pyramidData) {
        if (key.startsWith('row')) {
          const { faceUp, name, row, col } = pyramidData[key];
          pyramidCards[row][col] = { faceUp, value: name }; // Place card in the correct position in the pyramid
        }
      }
  
      setPyramid(pyramidCards);
      setCardsTurned(new Array(pyramidCards.length).fill(false));
      setGameOver(false);
      setWin(false);
      setCurrentRow(4);
    } else {
      console.error('No pyramid data found for this room code.');
    }
  
    console.log('Setup game completed');
  };
  

  const setupGame = async () => {
    console.log('Setup game started');
    console.log('Room Code:', localRoomCode);
    console.log('Player Name:', localPlayerName);
    const localPlayer = await firestoreQuery();

    // // Usage
    // const pyramidCollectionRef = collection(firestoreDB, "Pyramid");
    // deleteAllDocuments(pyramidCollectionRef);

    //Hosti kontroll
    /*const q = query(lobbyCollectionRef, 

      where('roomCode', '==', localRoomCode),
      where('players.name', '==', localPlayerName),
      where('players.host', '==', true)
    );
    const querySnapshotHost = await getDocs(q);

    console.log(querySnapshotHost);
    */

    
      
      if (localPlayer && localPlayer.host) {
        //HOST
        await getDeck();
        let deck = [];
        deck = localStorage.getItem('deck').split(',');        
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
        const pyramidDocId = pyramidDocRef.id;
        localStorage.setItem('pyramidDocId', pyramidDocId);
        console.log('Pyramiidi doc ref: ' + pyramidDocId)
        let rowIndex = 0;
        const batch = writeBatch(firestoreDB);  // Create a batch for batched writes
        
        pyramidCards.forEach(row => {
          let colIndex = -1;
          row.forEach(card => {
            colIndex++;
            const fieldName = `row${rowIndex}_col${colIndex}`;
            const { faceUp, value: cardValue } = card;
        
            // Add the update to the batch
            batch.update(pyramidDocRef, {
              roomCode: localRoomCode,
              [fieldName]: { faceUp, name: cardValue, row: rowIndex, col: colIndex }
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
        //setHand(deck.splice(0, 5)); // Give the player the first 5 cards from the remaining deck
        setCardsTurned(new Array(pyramidSetup.length).fill(false));
        setGameOver(false);
        setWin(false); // Reset win state
        setCurrentRow(4); // Reset to the bottom row
        localStorage.setItem('deck', deck.join(','));
      } else {
        setTimeout(joinerStart, 1000);
      }
      
    };  


  const updateCardFaceUpInFirestore = async (rowIndex, cardIndex) => {
      const pyramidDocRef = doc(pyramidCollectionRef, pyramidDocId);
      const cardFieldName = `row${rowIndex}_col${cardIndex}`;
      await updateDoc(pyramidDocRef, {
        [`${cardFieldName}.faceUp`]: true
      });
    };

  const handleCardClick = async (rowIndex, cardIndex) => {
    if (gameOver || win || cardsTurned[rowIndex] || rowIndex !== currentRow) return;
    setCardCounter(cardCounter +1)
    const newPyramid = [...pyramid];
    newPyramid[rowIndex][cardIndex].faceUp = true;
    setPyramid(newPyramid);

    const newCardsTurned = [...cardsTurned];
    newCardsTurned[rowIndex] = true;
    setCardsTurned(newCardsTurned);

    await updateCardFaceUpInFirestore(rowIndex, cardIndex); // Update Firestore

    //setCurrentRow(currentRow - 1);
    
    const cardValue = newPyramid[rowIndex][cardIndex].value.split('_')[0];
    if (cardValue === 'J' || cardValue === 'Q' || cardValue === 'K') {
      setGameOver(true);
    }

    if (currentRow === 0 && cardValue !== 'J' && cardValue !== 'Q' && cardValue !== 'K') {
      setWin(true);
    }
    
  };

  const restartGame = async () => {
    // siia panna if statement kui kaardi pakkis on vahem kui umberpooratuid kaarte teeb kaardi decki uuesti ja savib local storagisse
    let deck = []
    let storedDeck = localStorage.getItem('deck');
    console.log("kaarte pööratud: " + cardCounter)
    if (storedDeck) {
      try {
        deck = storedDeck.split(',');
      } catch (error) {
        console.error('Error parsing deck from localStorage:', error);
      }
    }
    //kontroll kui on vaja uut decki TEE KA NII ET SEE ANNAB ÜLEJÄÄNUD FUNKTSIOONILE DECKI
    if (deck.length < cardCounter) {
      // If so, fetch a new deck
      await getDeck();
      storedDeck = localStorage.getItem('deck'); // Update storedDeck after fetching new deck
      console.log("tegin uue decki :))");
      
      // Parse the newly fetched deck
      if (storedDeck) {
        try {
          deck = storedDeck.split(',');
        } catch (error) {
          console.error('Error parsing deck from localStorage:', error);
        }
      }
    }

    // Create a copy of the current pyramid
    const newPyramid = [...pyramid];
    // Initialize Firestore batch
    const batch = writeBatch(firestoreDB);
    const pyramidDocRef = doc(pyramidCollectionRef, pyramidDocId);

    // Iterate through each card in the pyramid
    newPyramid.forEach((row, rowIndex) => {
      row.forEach((card, colIndex) => {
        if (card.faceUp) {
          console.log("restart deck2"+deck)
          const newCard = deck.pop();
          card.value = newCard;
          card.faceUp = false; // Set the card to be face down
          const fieldName = `row${rowIndex}_col${colIndex}`;
          batch.update(pyramidDocRef, {
            [`${fieldName}`]: { faceUp: false, name: card.value, row: rowIndex, col: colIndex }
          });
        }
      });
    });

    // Commit Firestore batch update
    try {
      await batch.commit();
      console.log('Pyramid updated and Firestore synced for restart');
    } catch (error) {
      console.error('Error updating pyramid:', error);
    }
  
    // Update the state with the new pyramid and new hand
    setPyramid(newPyramid);
    setHand(deck.splice(0, 5)); // Give the player the first 5 cards from the remaining deck
    
    // Reset the state for a new game
    setCardsTurned(new Array(pyramid.length).fill(false));
    setGameOver(false);
    setWin(false);
    setCurrentRow(4);
    localStorage.setItem('deck', deck.join(','));
  };
  const handleWin = async () => {
    const pyramidDocRef = doc(pyramidCollectionRef, pyramidDocId);
    try {
      await deleteDoc(pyramidDocRef);
      console.log("Document successfully deleted!");
      //navigate('/');
    } catch (error) {
      console.error("Error removing document: ", error);
    }

    const roomDocRef = doc(lobbyCollectionRef, localDocID);

    const roomDocSnap = await getDoc(roomDocRef);

    if (roomDocSnap.exists()) {
        const roomData = roomDocSnap.data();
        console.log(roomData);
        await updateDoc(roomDocRef, {inGame: false})
        console.log(roomData);
        // Check if the player is in the map and is the host
        setNotInGame(true);

    }
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
              <button onClick={handleWin}>Go to endscreen</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusDriver;