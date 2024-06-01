// src/components/Card.jsx
import React from 'react';
import PropTypes from 'prop-types';
//import '../flip.css';

const Card = ({ card, onClick }) => {
  const cardFileName = card.faceUp ? `${card.value.replace(/ /g, '_')}.png` : 'back.png';
  const cardImage = `/cards/${cardFileName}`;

  return (
    <div className={`card ${card.faceUp ? 'flipped' : ''}`} onClick={onClick}>
      <div className="card-inner">
        <div className="card-front">
          <img src="/cards/back.png" alt="Card Back" />
        </div>
        <div className="card-back">
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
