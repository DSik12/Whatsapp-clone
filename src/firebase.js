// firebase.js

import firebase from "firebase/compat/app";
import "firebase/compat/database";
import "firebase/compat/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAh8xaFaFwlpTJL0rGoS4dsgJH1RBG5oJU",
  authDomain: "whatappnew-2f45d.firebaseapp.com",
  databaseURL: "https://whatappnew-2f45d-default-rtdb.firebaseio.com",
  projectId: "whatappnew-2f45d",
  storageBucket: "whatappnew-2f45d.appspot.com",
  messagingSenderId: "245886853074",
  appId: "1:245886853074:web:5e73c9d38ce526a7d3320b",
  measurementId: "G-LWPFDCKH36"
};

const firebaseApp = firebase.initializeApp(firebaseConfig);
const db = firebaseApp.database(); // Initialize Realtime Database
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

export { db, auth, provider };
export default firebaseApp ;
