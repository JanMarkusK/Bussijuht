import React, { useState, useEffect } from 'react';
import Pyramid from './Pyramid';
import { firestoreDB, writeBatch, collection, addDoc, doc, updateDoc, getDoc, getDocs, onSnapshot, query, where } from '../firebase';
import { fetchDeck, shuffleDeck } from '../utils/deck';
import '../assets/css/styles.css';

const FirstFaze = () => {
  const [pyramid, setPyramid] = useState([]);
  const [hand, setHand] = useState([]);
  const [currentRow, setCurrentRow] = useState(4);
  const [gameOver, setGameOver] = useState(false);
  const [selectedCardIndex, setSelectedCardIndex] = useState(null);
  const [selectedHandCard, setSelectedHandCard] = useState(null);

  const lobbyCollectionRef = collection(firestoreDB, "Lobby");
  const pyramid1CollectionRef = collection(firestoreDB, "Pyramid1");
  const localPlayerName = localStorage.getItem('playerName');
  const localRoomCode = localStorage.getItem('lobbyCode');
  const localDocID = localStorage.getItem('doc_id');
  const pyramidDocId = localStorage.getItem('pyramidDocId');

  useEffect(() => {
    setupGame();
  }, []); 

  useEffect(() => {
    const pyramidDocRef = doc(pyramid1CollectionRef, pyramidDocId);

    const unsubscribe = onSnapshot(pyramidDocRef, (doc) => {
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

        let lastFlippedRow = 4;
        for (let i = 0; i < pyramidCards.length; i++) {
          if (pyramidCards[i].some(card => card && card.faceUp)) {
            lastFlippedRow = i === 0 ? i : i - 1;
            setCurrentRow(lastFlippedRow);
            break;
          }
        }
      }
    });

    return () => unsubscribe();
  }, [pyramidDocId]);

  const getDeck = async () => {
    let deck = await fetchDeck();
    deck = shuffleDeck(deck);
    localStorage.setItem('deck', JSON.stringify(deck));
  }

  const setupGame = async () => {
    console.log('Setting up game...');

    const localPlayer = await firestoreQuery();

    if (localPlayer && localPlayer.host) {
      // Host setup
      await getDeck();
      let deck = JSON.parse(localStorage.getItem('deck'));

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
          batch.update(pyramidDocRef, {
            roomCode: localRoomCode,
            [fieldName]: { faceUp: card.faceUp, name: card.value, row: rowIndex, col: colIndex }
          });
        });
      });

      try {
        await batch.commit();
        console.log('Pyramid setup complete in Firestore');
      } catch (error) {
        console.error('Error updating pyramid setup:', error);
      }

    } else {
      // Joiner setup
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
    }
  };

  const firestoreQuery = async () => {
    const roomDocRef = doc(lobbyCollectionRef, localDocID);
    const roomDocSnap = await getDoc(roomDocRef);

    if (roomDocSnap.exists()) {
      const roomData = roomDocSnap.data();
      const players = roomData.players;
      const localPlayer = Object.values(players).find(player => player.name === localPlayerName);
      return localPlayer;
    }
  };

  const handleHandCardClick = (index) => {
    if (gameOver) return;

    setSelectedCardIndex(index);
    setSelectedHandCard(hand[index]);
  };

  const handlePyramidCardClick = async (rowIndex, cardIndex) => {
    if (gameOver || rowIndex !== currentRow && rowIndex !== currentRow - 1) return;

    if (rowIndex === currentRow - 1) {
      setCurrentRow(currentRow - 1);
      const newPyramid = [...pyramid];
      newPyramid[rowIndex].forEach(card => card.faceUp = true);
      setPyramid(newPyramid);

      const pyramidDocRef = doc(pyramid1CollectionRef, pyramidDocId);
      await updateDoc(pyramidDocRef, {
        [`row${rowIndex}_col${cardIndex}.faceUp`]: true
      });

      return;
    }

    if (selectedHandCard === null) return;

    const handCardValue = selectedHandCard.split('_')[0];
    const pyramidCardValue = pyramid[rowIndex][cardIndex].value.split('_')[0];

    if (handCardValue !== pyramidCardValue) return;

    const handCardIndex = hand.findIndex(card => card === selectedHandCard);
    if (handCardIndex === -1) return;

    const newHand = [...hand];
    newHand.splice(handCardIndex, 1);
    setHand(newHand);

    const newPyramid = [...pyramid];
    newPyramid[rowIndex][cardIndex].faceUp = true;
    setPyramid(newPyramid);

    const pyramidDocRef = doc(pyramid1CollectionRef, pyramidDocId);
    await updateDoc(pyramidDocRef, {
      [`row${rowIndex}_col${cardIndex}.faceUp`]: true
    });

    if (rowIndex === 0) {
      setGameOver(true); // Set game over logic here
    } else if (newPyramid[rowIndex - 1].every(card => card.faceUp)) {
      setCurrentRow(currentRow - 1);
    }

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
