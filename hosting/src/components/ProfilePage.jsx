// src/components/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, firestoreDB } from "../firebase";
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import '../assets/css/Profile.css';

const ProfilePage = () => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [updatedData, setUpdatedData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async (uid) => {
      console.log("Fetching data for UID: ", uid);
      try {
        const userDocRef = doc(firestoreDB, "User", uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          console.log("User data: ", userDoc.data());
          setUserData(userDoc.data());
          setUpdatedData(userDoc.data());
        } else {
          console.log("No such document!");
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data: ", error);
        setLoading(false);
      }
    };

    const listen = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserData(user.uid);
      } else {
        setLoading(false);
        navigate('/login');
      }
    });

    return () => {
      listen();
    };
  }, [navigate]);

  const handleBackClick = () => {
    navigate('/');
  };

  const handleEditClick = () => {
    setEditMode(true);
  };

  const handleSaveClick = async () => {
    const userDocRef = doc(firestoreDB, "User", auth.currentUser.uid);
    await updateDoc(userDocRef, updatedData);
    setUserData(updatedData);
    setEditMode(false);
  };

  const handleChange = (e) => {
    setUpdatedData({
      ...updatedData,
      [e.target.name]: e.target.value,
    });
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="profile-page">
      <h1>Profile</h1>
      {userData ? (
        <div>
          {editMode ? (
            <div>
              <label>First Name:</label>
              <input 
                type="text" 
                name="firstName" 
                value={updatedData.firstName} 
                onChange={handleChange} 
              />
              <label>Last Name:</label>
              <input 
                type="text" 
                name="lastName" 
                value={updatedData.lastName} 
                onChange={handleChange} 
              />
              <label>Username:</label>
              <input 
                type="text" 
                name="username" 
                value={updatedData.username} 
                onChange={handleChange} 
              />
              <label>Gender:</label>
              <select 
                name="gender" 
                value={updatedData.gender} 
                onChange={handleChange}
              >
                <option value="">Select gender</option>
                <option value="Mees">Mees</option>
                <option value="Naine">Naine</option>
                <option value="Muu">Muu</option>
              </select>
              <label>Age:</label>
              <input 
                type="number" 
                name="age" 
                value={updatedData.age} 
                onChange={handleChange} 
              />
              <label>Relationship Status:</label>
              <select 
                name="relationshipStatus" 
                value={updatedData.relationshipStatus} 
                onChange={handleChange}
              >
                <option value="">Select relationship status</option>
                <option value="vaba">vaba</option>
                <option value="hõivatud">hõivatud</option>
                <option value="ei tea">ei tea</option>
              </select>
              <label>Favorite Drink:</label>
              <input 
                type="text" 
                name="favoriteDrink" 
                value={updatedData.favoriteDrink} 
                onChange={handleChange} 
              />
              <button onClick={handleSaveClick}>Save</button>
            </div>
          ) : (
            <div>
              <p>First Name: {userData.firstName}</p>
              <p>Last Name: {userData.lastName}</p>
              <p>Username: {userData.username}</p>
              <p>Gender: {userData.gender}</p>
              <p>Age: {userData.age}</p>
              <p>Relationship Status: {userData.relationshipStatus}</p>
              <p>Favorite Drink: {userData.favoriteDrink}</p>
              <button onClick={handleEditClick}>Edit</button>
            </div>
          )}
          <button onClick={handleBackClick}>Back</button>
        </div>
      ) : (
        <p>No user data found</p>
      )}
    </div>
  );
};

export default ProfilePage;
