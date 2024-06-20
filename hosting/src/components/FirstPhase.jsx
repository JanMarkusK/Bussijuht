import React, { useState, useEffect } from 'react';
import Pyramid from './Pyramid';
import { firestoreDB, writeBatch, collection, doc, updateDoc, getDoc, getDocs, addDoc, query, where, onSnapshot } from '../firebase'; // Ensure all necessary Firestore functions are imported
import { fetchDeck, shuffleDeck } from '../utils/deck';
import '../assets/css/styles.css';
import { useNavigate } from 'react-router-dom';

const FirstFaze = () => {
  const [pyramid, setPyramid] = useState([]);
  const [hand, setHand] = useState([]);
  const [currentRow, setCurrentRow] = useState(4);
  const [gameOver, setGameOver] = useState(false);
  const [selectedCardIndex, setSelectedCardIndex] = useState(null);
  const [selectedHandCard, setSelectedHandCard] = useState(null);
  const [isHost, setIsHost] = useState(false); // State to determine if current player is host
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [points, setPoints] = useState({});
  const [pointsAssigned, setPointsAssigned] = useState(true); // New state to track if points are assigned
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0); // Index to track current player turn
  const [localPlayerTurn, setLocalPlayerTurn] = useState(false); // State to track if it's local player's turn
  //const [loser, setLoser] = useState(null)
  const [pointValue, setPointValue] = useState(5); // New state for point value
  const navigate = useNavigate();

  const pyramid1CollectionRef = collection(firestoreDB, "Pyramid1");
  const lobbyCollectionRef = collection(firestoreDB, "Lobby");
  const localPlayerName = localStorage.getItem('playerName');
  const localRoomCode = localStorage.getItem('lobbyCode');
  const localDocID = localStorage.getItem('doc_id');
  const pyramidDocId = localStorage.getItem('pyramidDocId');
  const allPlayers = localStorage.getItem('playerNames');
  const playerList = allPlayers ? allPlayers.split(';') : [];

  useEffect(() => {
    setupGame();
  }, []); 

  useEffect(() => {
    if (pyramidDocId, localDocID) {
    const pyramidDocRef = doc(pyramid1CollectionRef, pyramidDocId);
    // let loser = 0
    // let joever = false
      const unsubscribe = onSnapshot(pyramidDocRef, (doc) => {
        if (doc.exists()) {
          const pyramidData = doc.data();
          const pyramidCards = [[], [], [], [], []];
          const localPlayerData = pyramidData.players[localPlayerName];

          //turn updater
          if (localPlayerData && localPlayerData.isTurn) {
            setLocalPlayerTurn(true);
          } else {
            setLocalPlayerTurn(false);
          }

          //pyramid updater
          for (const key in pyramidData) {
            if (key.startsWith('row')) {
              const { faceUp, name, row, col } = pyramidData[key];
              pyramidCards[row][col] = { faceUp, value: name };
            }
            if (key.startsWith('row0')) {
              
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
          // Extract the card from row 0, column 0
          const row0Card = pyramidCards[0][0].value;

          // Check if any player has the row0Card in their hand
          let gameShouldEnd = true;
          let playerHands = {};
          Object.keys(pyramidData.players).forEach(playerName => {
            const playerHand = pyramidData.players[playerName].hand || [];
            playerHands[playerName] = playerHand.length;
            if (playerHand.includes(row0Card)) {
              gameShouldEnd = false;
            }
          });

          // If no player has the card, end the game
          if (gameShouldEnd) {
            // Determine the player with the most cards in their hand
            const maxCardsPlayer = Object.keys(playerHands).reduce((a, b) => playerHands[a] > playerHands[b] ? a : b);
            loser = maxCardsPlayer;
            joever = true;
            setTimeout(async () => {
              setGameOver(true);
              console.log('Game Over: No player has the card in row 0');
            }, 3000); // 3-second delay
          }
        }
      }
    });

      const lobbyDocRef = doc(lobbyCollectionRef, localDocID);
      const unsubscribe2 = onSnapshot(lobbyDocRef, (doc) => {
        if (doc.exists()) {
          const lobbyData = doc.data();
          const newPoints = {};
    
        // Convert lobbyData.players to an array if it is an object
        const players = Array.isArray(lobbyData.players) 
            ? lobbyData.players 
            : Object.values(lobbyData.players);

        players.forEach((player) => {
            newPoints[player.name] = player.points || 0;
        });
        
          setPoints(newPoints);
          console.log("Updated points:", newPoints); // Log updated points for debugging
        } else {
          console.log("Document does not exist.");
        }
        // if (joever){
        //   updateDoc(lobbyDocRef, {
        //     [`players.${loser}.busdriver`]: true
        //   });
        // }
      }, (error) => {
        console.error("Error fetching document:", error);
      });


      return () => {
        unsubscribe();
        unsubscribe2();
      };
    }
  }, [pyramidDocId, localDocID]);

  useEffect(() => {
    setPointValue(5 - currentRow); // Update point value based on current row
  }, [currentRow]);

  const setupGame = async () => {
    console.log('Setting up game...');

    const q = query(pyramid1CollectionRef, where('roomCode', '==', localRoomCode));
    const querySnapshot = await getDocs(q);
    console.log(hand);
    if (querySnapshot.empty) {
      const localPlayer = await firestoreQuery(1);
      const players = await firestoreQuery(2);
      console.log("players array setup : " + JSON.stringify(players))
      const updatedPlayers = players.map((player, index) => ({
        ...player,
        index,
        isTurn: false, // Assuming initially no one's turn
      }));
      console.log("players array?: " + JSON.stringify(updatedPlayers))
      setPlayers(updatedPlayers);


      if (localPlayer && localPlayer.host) {
        setIsHost(true);
        await initializeHostGame(updatedPlayers);
      } else {
        await setTimeout(() => initializeJoinerGame(updatedPlayers), 1000);
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
        await initializeTurn(players, pyramidDocRef);
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

  const initializeJoinerGame = async (players) => {
    console.log("joiners lobbycode: " + localRoomCode)
    try {
      const q = query(pyramid1CollectionRef, where('roomCode', '==', localRoomCode));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const pyramidData = querySnapshot.docs[0].data();
        const pyramidCards = [[], [], [], [], []];
        const pyramidDocId = querySnapshot.docs[0].id;
        localStorage.setItem('pyramidDocId', pyramidDocId);
        const pyramidDocRef = doc(pyramid1CollectionRef, pyramidDocId);

        for (const key in pyramidData) {
          if (key.startsWith('row')) {
            const { faceUp, name, row, col } = pyramidData[key];
            pyramidCards[row][col] = { faceUp, value: name };
          }
        }

        setPyramid(pyramidCards);
        getHand();
        setCurrentRow(4);

        await initializeTurn(players, pyramidDocRef); // Initialize the turn after setting up the game
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

  const handleAssignPoints = async (playerName) => {
    if (playerName === localPlayerName) {
      return; // Prevent assigning points to self
    }

    const newPoints = { ...points };
    if (!newPoints[playerName]) {
      newPoints[playerName] = 0;
    }

    newPoints[playerName] += pointValue; // Use pointValue from state
    setPoints(newPoints);

    // Update Firestore
    const lobbyDocRef = doc(lobbyCollectionRef, localDocID);
    const lobbyDoc = await getDoc(lobbyDocRef);
    if (lobbyDoc.exists()) {
      const lobbyData = lobbyDoc.data();
      const updatedPlayers = lobbyData.players.map(player => {
        if (player.name === playerName) {
          return { ...player, points: newPoints[playerName] };
        }
        return player;
      });

      await updateDoc(lobbyDocRef, {
        players: updatedPlayers
      });

      setSelectedPlayer(null); // Reset selected player
      setPointsAssigned(true); // Set points assigned flag to true

      await transitionToNextTurn(updatedPlayers);
    } else {
      console.error('Lobby document does not exist.');
    }
  };

  //Turns functions
  const transitionToNextTurn = async (players) => {
    const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
    const currentPlayerName = players[currentPlayerIndex].name;
    const nextPlayerName = players[nextPlayerIndex].name;

    const pyramidDocRef = doc(pyramid1CollectionRef, pyramidDocId);
    await updateDoc(pyramidDocRef, {
      [`players.${currentPlayerName}.isTurn`]: false,
      [`players.${nextPlayerName}.isTurn`]: true,
    });

    setCurrentPlayerIndex(nextPlayerIndex);
    setLocalPlayerTurn(nextPlayerName === localPlayerName); // Update local player's turn status
    setPointsAssigned(true); // Reset points assigned flag
  };

  const initializeTurn = async (players, pyramidDocRef) => {
    console.log("players array?: " + JSON.stringify(players))
    console.log("localplayername: " + localPlayerName)
    const localPlayerIndex = players.findIndex((player) => player.name === localPlayerName);
  
    if (localPlayerIndex === 0) {
      // Host player's turn
      try {
        await updateDoc(pyramidDocRef, {
          [`players.${localPlayerName}.isTurn`]: true,
        });
        const updatedPlayers = [...players];
        updatedPlayers[localPlayerIndex].isTurn = true;
        setPlayers(updatedPlayers);
      } catch (error) {
        console.error('Error updating host player turn:', error);
        // Handle error
      }
    } else if (localPlayerIndex > 0) {
      // Joiner's turn
      //const localPlayerTurn = players[localPlayerIndex].isTurn;
      try {
        await updateDoc(pyramidDocRef, {
          [`players.${localPlayerName}.isTurn`]: false,
        });
        const updatedPlayers = [...players];
        updatedPlayers[localPlayerIndex].isTurn = false;
        setPlayers(updatedPlayers);
      } catch (error) {
        console.error('Error updating joiner player turn:', error);
        // Handle error
      }
    } else {
      console.error('Local player index not found in players array.');
      // Handle error or edge case where local player is not found
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
    if (gameOver || !pointsAssigned || !localPlayerTurn) return;
    
    const pyramidDocRef = doc(pyramid1CollectionRef, pyramidDocId);
    
    try {
      console.log(`Clicked card at row ${rowIndex}, col ${cardIndex}`);
    
      if (rowIndex === currentRow - 1) {
    
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

        await handleAssignPoints(rowIndex);

        console.log("batch: "+ batch);
        await batch.commit(); // Commit batch update to Firestore
    
        console.log('Firestore updated with flipped cards');
        
        setTimeout(() => {
          setCurrentRow(currentRow - 1); // Move to the next row
          console.log(`currentRow updated to ${currentRow - 1}`);
          console.log(`Row ${rowIndex} turned over`);
        }, 500); // Adjust the delay as needed
    
      } else {
        const handCardValue = selectedHandCard.split('_')[0];
        const pyramidCardValue = pyramid[rowIndex][cardIndex].value.split('_')[0];
    
        if (handCardValue !== pyramidCardValue) return;
    
        if ( rowIndex !== currentRow) return;
    
        const handCardIndex = hand.findIndex(card => card === selectedHandCard);
        if (handCardIndex === -1) return;
    
        const newHand = [...hand];
        newHand.splice(handCardIndex, 1);
        setHand(newHand);
    
        const newPyramid = [...pyramid];
        newPyramid[rowIndex][cardIndex].faceUp = true;
        setPyramid(newPyramid);
    
        await updateDoc(pyramidDocRef, {
          [`row${rowIndex}_col${cardIndex}.faceUp`]: true
        });

        // Update the player's hand in Firestore
        await updateDoc(pyramidDocRef, {
          [`players.${localPlayerName}.hand`]: newHand
        });
    
        // if (rowIndex === 0) {
        //   setGameOver(true); // Set game over logic here
        // } else if (newPyramid[rowIndex - 1].every(card => card.faceUp)) {
        //   setTimeout(() => {
        //     setCurrentRow(currentRow - 1);
        //   }, 500); // Adjust the delay as needed
        // }

        setPointsAssigned(false); // Reset points assigned flag
    
        setSelectedCardIndex(null);
        setSelectedHandCard(null);
        console.log(`Card ${cardIndex} in row ${rowIndex} turned over`);
      }
    
    } catch (error) {
      console.error('Error updating pyramid:', error);
    }
    };
  

  const restartGame = () => {
    setupGame();
  };


  return (
    <div className="first-faze-container">
      <div className="first-faze">
        <h1>First Faze Game</h1>
        <div className="players">
            <h2>Players</h2>
            <div className="player-list">
            {playerList.map(player => (
              <div>
                {player} ({points[player] || 0} points)
              </div>
            ))}
            </div>
          </div>

        {!pointsAssigned && (
          <div className="points-assignment">
            <h2>Assign Points ({pointValue} lonksu)</h2>
            <div className="player-points-assign">
            {playerList.map(player => (
              <div
                key={player}
                className={`player-item ${selectedPlayer === player ? 'selected' : ''}`}
                onClick={() => handleAssignPoints(player)}
              >
                {player}
              </div>
            ))}
            </div>
          </div>
        )}
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
        {gameOver && <button onClick={navigate("/2faas")}>Next phase</button>}
        <ul>
          
        </ul>
      </div>
    </div>
  );
  
};

export default FirstFaze;