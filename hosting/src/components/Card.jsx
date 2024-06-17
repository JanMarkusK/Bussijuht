import React from 'react';
import PropTypes from 'prop-types';

const Card = ({ card, onClick, cardBack }) => {
  const cardFileName = card.faceUp ? `${card.value.replace(/ /g, '_')}.png` : cardBack;
  const cardImage = `../../cards/${cardFileName}`;
  const cardBack = `../../cards/back${cardFileName}`;
  // Wherever you're rendering the Card component
//<Card card={yourCard} onClick={yourOnClickFunction} cardBack={selectedCardBack} />


  return (
    <div className={`card ${card.faceUp ? 'flipped' : ''}`} onClick={onClick}>
      <div className="card-inner">
        <div className="card-back">
          <img src={`../../cards/back/${cardBack}`} alt="back.png" />
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
  cardBack: PropTypes.string.isRequired, // Add this prop
};

export default Card;
