// src/components/Card.jsx
import React from 'react';
import PropTypes from 'prop-types';

const Card = ({ card, onClick }) => {
  const cardFileName = card.faceUp ? `${card.value.replace(' ', '_')}.png` : 'back.png';
  const cardImage = `/cards/${cardFileName}`;

  return (
    <img
      src={cardImage}
      alt={card.faceUp ? card.value : 'Card Back'}
      onClick={onClick}
      className="card"
    />
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
