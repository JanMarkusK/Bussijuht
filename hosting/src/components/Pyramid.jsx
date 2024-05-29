// src/components/Pyramid.jsx
import React from 'react';
import PropTypes from 'prop-types';

const Pyramid = ({ pyramid, onCardClick }) => {
  return (
    <div className="pyramid">
      {pyramid.map((row, rowIndex) => (
        <div key={rowIndex} className="row">
          {row.map((card, cardIndex) => (
            <div key={cardIndex} className="card" onClick={() => onCardClick(rowIndex, cardIndex)}>
              {card.faceUp ? card.value : 'X'}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

Pyramid.propTypes = {
  pyramid: PropTypes.arrayOf(
    PropTypes.arrayOf(
      PropTypes.shape({
        faceUp: PropTypes.bool.isRequired,
        value: PropTypes.string.isRequired
      })
    )
  ).isRequired,
  onCardClick: PropTypes.func.isRequired
};

export default Pyramid;
