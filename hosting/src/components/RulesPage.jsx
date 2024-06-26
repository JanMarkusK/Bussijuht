// src/components/RulesPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import '../assets/css/RulesPage.css'; // Veendu, et sul on see CSS fail olemas

const RulesPage = ({ setInRules }) => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate('/');
  };

  return (
    <div className="rules-page">
      <h2>Rules</h2>
      <ol>
        <li>The deck of cards is made into a pyramid - 5 cards, 4, 3, 2, and 1 card in a row.</li>
        <br />
        <li>The remaining cards are distributed among the players.</li>
        <br />
        <li>Then they start taking all the cards from the bottom (where there are five cards in a row) and turn them the right way.</li>
        <br />
        <li>Everyone who has the given cards (eg J, 4, K) places their card on top of the corresponding card and says who has to do something.</li>
        <br />
        <li>You can specify 1 action on the first or bottom line, 2 actions on the next line, etc.</li>
        <br />
        <li>If someone can't or doesn't want to lay down any more cards, the cards in the next row are flipped over.</li>
        <br />
        <li>Whoever has the most cards at the end (all the cards in the pyramid are turned over and no more cards can be put down) is the bus driver.</li>
        <br />
        <li>Next, the same pyramid is made and now, starting from the bottom, the bus driver has to take one card from each row and turn it over.</li>
        <br />
        <li>If it is a picture, the bus driver takes actions according to how many rows it was (1 action, 2 actions, etc.) and the flipped cards are put back into the deck and new ones replaced.</li>
        <br />
        <li>Max 8 people.</li>
      </ol>
      <button onClick={handleBackClick}>Back</button>
    </div>
  );
};

RulesPage.propTypes = {
  setInRules: PropTypes.func.isRequired,
};

export default RulesPage;
