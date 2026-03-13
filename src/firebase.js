// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCf6hv8s0RYyT9a4nF1kLseAIl0e1pRfnk",
  authDomain: "ada2-87122.firebaseapp.com",
  projectId: "ada2-87122",
  storageBucket: "ada2-87122.firebasestorage.app",
  messagingSenderId: "107353079111",
  appId: "1:107353079111:web:bb69d8a272ac7bd3ea6062",
  measurementId: "G-F4MJF7R5T3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);