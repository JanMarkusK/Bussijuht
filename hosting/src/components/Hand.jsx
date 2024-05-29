// src/components/Hand.jsx
import React from 'react';
import PropTypes from 'prop-types';

const Hand = ({ hand }) => {
  return (
    <div className="hand">
      {hand.map((card, index) => (
        <div key={index} className="card">
          {card}
        </div>
      ))}
    </div>
  );
};

Hand.propTypes = {
  hand: PropTypes.arrayOf(PropTypes.string).isRequired
};

export default Hand;
