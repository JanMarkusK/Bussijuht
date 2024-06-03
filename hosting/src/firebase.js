// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBfYoZeDgpcTAtja_GdeM13JtYkmWZIKUc",
  authDomain: "bussijuht.firebaseapp.com",
  projectId: "bussijuht",
  storageBucket: "bussijuht.appspot.com",
  messagingSenderId: "774160422123",
  appId: "1:774160422123:web:b6f7995f5d6dba33c65aae",
  measurementId: "G-73LLQLQZ0M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const realtimeDB = getDatabase(app);
const analytics = getAnalytics(app);
const auth = getAuth(app);


export { realtimeDB };
