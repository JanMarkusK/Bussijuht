import React from 'react';
import PropTypes from 'prop-types';
import { auth, firestoreDB, doc, getDoc } from '../firebase';

const Card = ({ card, onClick }) => {
  const [cardBack, setCardBack] = React.useState('back.png');

  React.useEffect(() => {
    const fetchCardBack = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userRef = doc(firestoreDB, "User", currentUser.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.cardBack) {
            setCardBack(userData.cardBack);
          }
        }
      }
    };

    fetchCardBack();
  }, []);

  const cardFileName = card.faceUp ? `${card.value.replace(/ /g, '_')}.png` : cardBack;
  const cardImage = `/cards/${cardFileName}`;

  return (
    <div className={`card ${card.faceUp ? 'flipped' : ''}`} onClick={onClick}>
      <div className="card-inner">
        <div className="card-back">
          <img src={`/cards/back/${cardBack}`} alt="Card Back" />
        </div>
        <div className="card-front">
          <img src={cardImage} alt={card.value} />
        </div>
      </div>
    </div>
  );
};

Card.propTypes = {
  card: PropTypes.shape({
    faceUp: PropTypes.bool.isRequired,
    value: PropTypes.string.isRequired,
  }).isRequired,
  onClick: PropTypes.func.isRequired,
};

export default Card;