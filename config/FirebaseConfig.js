// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

import {getFirestore} from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC6xIsJl5kD35zA_5qa-8ziz_IhWqcEWjw",
  authDomain: "navalok-f0404.firebaseapp.com",
  projectId: "navalok-f0404",
  storageBucket: "navalok-f0404.firebasestorage.app",
  messagingSenderId: "632755655844",
  appId: "1:632755655844:android:b6cb343198f55a5acb8231"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db=getFirestore(app);
