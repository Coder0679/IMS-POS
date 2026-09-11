// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCBbvnCjUp5cMc-IdygKAV2GM1Do67UGGQ",
  authDomain: "shri-ram-hardware-2.firebaseapp.com",
  projectId: "shri-ram-hardware-2",
  storageBucket: "shri-ram-hardware-2.firebasestorage.app",
  messagingSenderId: "1032655163437",
  appId: "1:1032655163437:web:cf54c9bcb1e3203e4e28a4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);