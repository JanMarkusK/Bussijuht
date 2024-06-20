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

  const handleSaveClick = async (e) => {
    e.preventDefault();
    try {
      const q = query(collection(firestoreDB, "User"), where("email", "==", auth.currentUser.email));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userDocRef = doc(firestoreDB, "User", userDoc.id);
        await updateDoc(userDocRef, updatedData);
        setUserData(updatedData);
        setEditMode(false);
      }
    } catch (error) {
      console.error("Error updating user data: ", error);
    }
  };

  const handleCancelClick = () => {
    setEditMode(false);
    setUpdatedData(userData); // Reset updatedData to userData to discard changes
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
        <div className="profile-container">
          {editMode ? (
            <form className="profile-form" onSubmit={handleSaveClick}>
              <label>First Name:</label>
              <input 
                type="text" 
                name="firstName" 
                value={updatedData.firstName} 
                onChange={handleChange} 
                required
              />
              <label>Last Name:</label>
              <input 
                type="text" 
                name="lastName" 
                value={updatedData.lastName} 
                onChange={handleChange} 
                required
              />
              <label>Username:</label>
              <input 
                type="text" 
                name="username" 
                value={updatedData.username} 
                onChange={handleChange} 
                required
              />
              <label>Age:</label>
              <input 
                type="number" 
                name="age" 
                value={updatedData.age} 
                onChange={handleChange}
                min="1"
                max="100"
                required 
              />
              <label>Gender:</label>
              <select 
                name="gender" 
                value={updatedData.gender} 
                onChange={handleChange}
                required
              >
                <option value="">Select gender</option>
                <option value="Man">Man</option>
                <option value="Woman">Woman</option>
                <option value="Another">Another</option>
              </select>
              <label>Relationship Status:</label>
              <select 
                name="relationshipStatus" 
                value={updatedData.relationshipStatus} 
                onChange={handleChange}
                required
              >
                <option value="">Select relationship status</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="In a relationship">In a relationship</option>
                <option value="Do not know">Do not know</option>
                <option value="Drunk">Drunk</option>
              </select>
              <label>Favorite Drink:</label>
              <select 
                name="favoriteDrink" 
                value={updatedData.favoriteDrink} 
                onChange={handleChange}
                required
              >
                <option value="">Enter your favorite drink</option>
                <option value="Milk">Milk</option>
                <option value="Water">Water</option>
                <option value="Coffee">Coffee</option>
                <option value="Wine">Wine</option>
                <option value="Whiskey">Whiskey</option>
                <option value="Beer">Beer</option>
                <option value="Cocktail">Cocktail</option>
                <option value="Cider">Cider</option>
                <option value="Rum">Rum</option>
                <option value="Vodka">Vodka</option>
                <option value="Limpa limonaad">Limpa limonaad</option>
                <option value="Sparkling wine">Sparkling wine</option>
                <option value="Champagne">Champagne</option>
              </select>
              <button type="submit">Save</button>
              <button type="button" onClick={handleCancelClick} className="red-button">Cancel</button>
            </form>
          ) : (
            <div className="profile-content">
              <div className="profile-field">
                <p>First Name: {userData.firstName}</p>
              </div>
              <div className="profile-field">
                <p>Last Name: {userData.lastName}</p>
              </div>
              <div className="profile-field">
                <p>Username: {userData.username}</p>
              </div>
              <div className="profile-field">
                <p>Age: {userData.age}</p>
              </div>
              <div className="profile-field">
                <p>Gender: {userData.gender}</p>
              </div>
              <div className="profile-field">
                <p>Relationship Status: {userData.relationshipStatus}</p>
              </div>
              <div className="profile-field">
                <p>Favorite Drink: {userData.favoriteDrink}</p>
              </div>
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
