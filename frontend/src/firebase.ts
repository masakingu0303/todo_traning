import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB6Yvr5Aqb959iMp4soIKolnK7K_ZTPi8w",
  authDomain: "todotraning.firebaseapp.com",
  projectId: "todotraning",
  storageBucket: "todotraning.firebasestorage.app",
  messagingSenderId: "1010705716336",
  appId: "1:1010705716336:web:f35621506c0ee8a4dc50b5",
  measurementId: "G-HZMT1JS9DC"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const signInWithGoogle = () => signInWithPopup(auth, provider);
export const logout = () => signOut(auth);
