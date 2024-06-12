// src/components/ProfileForm.jsx
import React, { useState } from 'react';

const ProfileForm = ({ userData, onUpdateProfile }) => {
  const [formData, setFormData] = useState(userData);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdateProfile(formData);
  };

  return (
    <div>
      <h2>Edit Profile</h2>
      <form onSubmit={handleSubmit}>
        <label>First Name:</label>
        <input 
          type="text" 
          name="firstName" 
          value={formData.firstName} 
          onChange={handleChange} 
        />
        <label>Last Name:</label>
        <input 
          type="text" 
          name="lastName" 
          value={formData.lastName} 
          onChange={handleChange} 
        />
        <label>Username:</label>
        <input 
          type="text" 
          name="username" 
          value={formData.username} 
          onChange={handleChange} 
        />
        <label>Email:</label>
        <input 
          type="email" 
          name="email" 
          value={formData.email} 
          onChange={handleChange} 
        />
        <label>Gender:</label>
        <select 
          name="gender" 
          value={formData.gender} 
          onChange={handleChange} 
        >
          <option value="Mees">Mees</option>
          <option value="Naine">Naine</option>
          <option value="Muu">Muu</option>
        </select>
        <label>Age:</label>
        <input 
          type="number" 
          name="age" 
          value={formData.age} 
          onChange={handleChange} 
        />
        <label>Relationship Status:</label>
        <select 
          name="relationshipStatus" 
          value={formData.relationshipStatus} 
          onChange={handleChange} 
        >
          <option value="vaba">vaba</option>
          <option value="hõivatud">hõivatud</option>
          <option value="ei tea">ei tea</option>
        </select>
        <label>Favorite Drink:</label>
        <input 
          type="text" 
          name="favoriteDrink" 
          value={formData.favoriteDrink} 
          onChange={handleChange} 
        />
        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
};

export default ProfileForm;
