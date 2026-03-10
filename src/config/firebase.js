// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCXFzYszlTtqMMkKdUWPuTMpCbx5JzjNmw",
  authDomain: "studysyncproject-34e02.firebaseapp.com",
  projectId: "studysyncproject-34e02",
  storageBucket: "studysyncproject-34e02.firebasestorage.app",
  messagingSenderId: "1013300362250",
  appId: "1:1013300362250:web:feb97440dcb6163d2af3f3",
  measurementId: "G-TGFPN9VG95"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
