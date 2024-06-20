// src/components/Premium.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, firestoreDB, collection, query, where, getDocs, doc, updateDoc } from '../firebase';
import PropTypes from 'prop-types';
import '../assets/css/Premium.css'; // Ensure you have this CSS file

const Premium = ({ setInPremium }) => {
  const navigate = useNavigate();

  const handlePremiumChoice = async (choice) => {
    try {
      const q = query(collection(firestoreDB, "User"), where("uid", "==", auth.currentUser.uid));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userDocRef = doc(firestoreDB, "User", userDoc.id);
        await updateDoc(userDocRef, {
          premium: choice,
        });
        navigate('/');
      }
    } catch (error) {
      console.error("Error updating premium status: ", error);
    }
  };

  return (
    <div className="premium-page">
      <h2>OLE LAHE JA OMA PREMIUM KONTOT</h2>
      <h1>TASUTA!</h1>
      <button onClick={() => handlePremiumChoice(true)} className='premium-button'>Jah</button>
      <button onClick={() => handlePremiumChoice(false)} className='premium-button'>Ei, olen igav</button>
      <h2>Premiumi eelis:</h2>
      <h3>Saab valida mängimiseks lahedamaid kaarte</h3>
    </div>
  );
};

Premium.propTypes = {
  setInPremium: PropTypes.func.isRequired,
};

export default Premium;
