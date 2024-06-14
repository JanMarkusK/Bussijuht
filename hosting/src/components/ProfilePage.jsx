// src/components/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, firestoreDB } from "../firebase";
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import '../assets/css/Profile.css';

const ProfilePage = () => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [updatedData, setUpdatedData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async (email) => {
      try {
        const q = query(collection(firestoreDB, "User"), where("email", "==", email));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
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
        fetchUserData(user.email);
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
    const q = query(collection(firestoreDB, "User"), where("email", "==", auth.currentUser.email));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      const userDocRef = doc(firestoreDB, "User", userDoc.id);
      await updateDoc(userDocRef, updatedData);
      setUserData(updatedData);
      setEditMode(false);
    }
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
                <option value="Man">Man</option>
                <option value="Woman">Woman</option>
                <option value="Another">Another</option>
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
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="In a relationship">In a relationship</option>
                <option value="Do not know">Do not know</option>
                <option value="Drunk">Drunk</option>
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
