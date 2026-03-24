import { auth } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";

// Email sign up
await createUserWithEmailAndPassword(auth, email, password);

// Email sign in
await signInWithEmailAndPassword(auth, email, password);

// Google sign in (one-liner)
await signInWithPopup(auth, new GoogleAuthProvider());

// Sign out
await signOut(auth);