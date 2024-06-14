//src/components/authentication/SignIn.jsx
import React, { useState } from 'react';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, firestoreDB, collection, getDocs, query, where } from "../../firebase";
import { useNavigate, Link } from 'react-router-dom';
import '../../assets/css/SignIn.css';

const SignIn = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [userData, setUserData] = useState(null);
    const navigate = useNavigate();
    
    const signIn = async (e) => {
        e.preventDefault();
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log(userCredential);

            // Fetch additional user information from Firestore
            const userCollectionRef = collection(firestoreDB, "User");
            const q = query(userCollectionRef, where("email", "==", email));
            const querySnapshot = await getDocs(q);

            querySnapshot.forEach((doc) => {
                setUserData(doc.data());
            });

            setSuccessMessage("Successfully logged in!");
            setErrorMessage('');

            // Navigate to the lobby page after successful sign-in
            navigate('../');

        } catch (error) {
            console.log(error);
            setErrorMessage("Email or password is incorrect.");
            setSuccessMessage('');
        }
    }

    return (
        <div className='sign-in-container'>
            <form onSubmit={signIn} className='sign-in-form'>
                <label>Log in to your account</label>
                <input 
                    type="email" 
                    placeholder='Enter your email' 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input 
                    type="password" 
                    placeholder='Enter your password' 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
                <button type='submit'>Log In</button>
            <Link to="/signup" className='signup-link'>No account? Create an account</Link>
            </form>
            <button onClick={() => navigate('/')} className='back-button'>Back</button>
        </div>
    )
}

export default SignIn;
