//src/components/authentication/SignUp.jsx

import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
import { useNavigate, Link } from 'react-router-dom';
import { firestoreDB, collection, addDoc } from '../../firebase';
import '../../assets/css/SignUp.css';

const SignUp = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [gender, setGender] = useState('');
    const [age, setAge] = useState('');
    const [relationshipStatus, setRelationshipStatus] = useState('');
    const [favoriteDrink, setFavoriteDrink] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();
    const userCollectionRef = collection(firestoreDB, "User");

    const handleSignUp = async (uid) => {
        //Paneb kõik vajaliku info Firestore doci
        await addDoc(userCollectionRef, {
            uid: uid,
            email: email,
            firstName: firstName,
            lastName: lastName,
            username: username,
            gender: gender,
            age: age,
            relationshipStatus: relationshipStatus,
            favoriteDrink: favoriteDrink,
        });
    };

    const signUp = (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setErrorMessage("Passwords do not match.");
            return;
        }
        setErrorMessage('');
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                console.log(user);
                setSuccessMessage("User created successfully!");
                navigate('/guestlobby');
                handleSignUp(user.uid);
            }).catch((error) => {
                console.log(error);
                setErrorMessage(error.message);
            });
    }

    return (
        <div className='sign-up-container'>
            <form onSubmit={signUp} className='sign-up-form'>
                <label>Create an account</label>

                <input 
                    type="text" 
                    placeholder='Enter your first name *' 
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                />

                <input 
                    type="text" 
                    placeholder='Enter your last name *' 
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                />

                <input 
                    type="text" 
                    placeholder='Enter your username *' 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />

                <input 
                    type="email" 
                    placeholder='Enter your email *' 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <input 
                    type="password" 
                    placeholder='Enter your password *' 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <input 
                    type="password" 
                    placeholder='Confirm your password *' 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />

                <input 
                    type="number" 
                    placeholder='Enter your age' 
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    min="1"
                    max="100"
                    
                />

                <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                >
                    <option value="">Select gender</option>
                    <option value="Man">Man</option>
                    <option value="Woman">Woman</option>
                    <option value="Another">Another</option>
                </select>

                <select
                    value={relationshipStatus}
                    onChange={(e) => setRelationshipStatus(e.target.value)}
                >
                    <option value="">Select relationship status</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="In a relationship">In a relationship</option>
                    <option value="Do not know">Do not know</option>
                    <option value="Drunk">Drunk</option>

                </select>

                <select
                    value={favoriteDrink}
                    onChange={(e) => setFavoriteDrink(e.target.value)}
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
                    <option value="Lilimpa limonaadder">Limpa limonaad</option>

                </select>

                <input 
                    type="text" 
                    placeholder='Enter your favorite drink' 
                    value={favoriteDrink}
                    onChange={(e) => setFavoriteDrink(e.target.value)}
                />

                {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
                
                <button type='submit'>Sign Up</button>
            </form>
            <Link to="/login" className='login-link'>Have an account? Log in</Link>
            <button onClick={() => navigate('/')} className='back-button'>Back</button>
        </div>
    )
}

export default SignUp;
