// src/config/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyC60jhFS5qcf7neBDt0Ce9OkeaArpm1x3U",
  authDomain: "icollab-af2e4.firebaseapp.com",
  projectId: "icollab-af2e4",
  storageBucket: "icollab-af2e4.firebasestorage.app",
  messagingSenderId: "117097271429",
  appId: "1:117097271429:web:59263492703561a2d359ec",
  measurementId: "G-E9NZ89EWE4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Add scopes for user profile and email
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.email');
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');

export { auth, googleProvider };