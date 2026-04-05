// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "co-working-mern.firebaseapp.com",
  projectId: "co-working-mern",
  storageBucket: "co-working-mern.firebasestorage.app",
  messagingSenderId: "333234279612",
  appId: "1:333234279612:web:c2d0efabc9eec98d9eacb9"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);