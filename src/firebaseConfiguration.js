import { initializeApp } from "firebase/app"; // Import Firebase initialization function
import { getAuth } from "firebase/auth"; // Import Firebase Authentication
import { getFirestore } from "firebase/firestore"; // Import Firestore

const firebaseConfig = {
  apiKey: "AIzaSyDqMcfS7gcbrX7lz3LdNBSXNq6zuS2Emt4", // Your Firebase API key
  authDomain: "bugdetapp-login.firebaseapp.com", // Your Firebase project auth domain
  projectId: "bugdetapp-login", // Your Firebase project ID
  storageBucket: "bugdetapp-login.firebasestorage.app", // Your Firebase storage bucket
  messagingSenderId: "828731732870", // Your messaging sender ID
  appId: "1:828731732870:web:2141530d97718df4f0b207", // Your Firebase app ID
};

// Initialize Firebase app with the config
const app = initializeApp(firebaseConfig); // Make sure this line is correct

// Initialize Firebase Authentication and Firestore
const auth = getAuth(app); // Get Auth instance using the initialized app
const db = getFirestore(app); // Get Firestore instance using the initialized app

// Export the app, auth, and db for use across your application
export { app, auth, db };
