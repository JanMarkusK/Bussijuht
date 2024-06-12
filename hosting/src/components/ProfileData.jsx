
// src/components/ProfileData.jsx
import React from 'react';

const ProfileData = ({ userData }) => {
  return (
    <div>
      <h2>Profile Information</h2>
      <p>First Name: {userData.firstName}</p>
      <p>Last Name: {userData.lastName}</p>
      <p>Username: {userData.username}</p>
      <p>Email: {userData.email}</p>
      <p>Gender: {userData.gender}</p>
      <p>Age: {userData.age}</p>
      <p>Relationship Status: {userData.relationshipStatus}</p>
      <p>Favorite Drink: {userData.favoriteDrink}</p>
    </div>
  );
};

export default ProfileData;