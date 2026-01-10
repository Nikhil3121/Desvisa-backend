// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDsdieA-oSKROiqdK1rlleMEkkJHbUSo-k",
  authDomain: "desvisa-6d7aa.firebaseapp.com",
  projectId: "desvisa-6d7aa",
  storageBucket: "desvisa-6d7aa.firebasestorage.app",
  messagingSenderId: "707871973466",
  appId: "1:707871973466:web:dfc1fb444d73f5d2707863",
  measurementId: "G-7WQ10JPDSD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);