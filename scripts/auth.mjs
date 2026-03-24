import { auth } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";

export async function signUp(params) {
  const {user} = await createUserWithEmailAndPassword(auth, email, password);
  return user;
}


export async function signIn(email, password) {
  const {user} = await signInWithEmailAndPassword(auth, email, password);
  return user;
}

export async function signUpWithGoogle(params) {
  const {user} = await signInWithPopup(auth, new GoogleAuthProvider());
  return user;
}

export async function logOut() {
  await signOut(auth)
}

export {auth};

// // Email sign up
// await createUserWithEmailAndPassword(auth, email, password);

// // Email sign in
// await signInWithEmailAndPassword(auth, email, password);

// // Google sign in (one-liner)
// await signInWithPopup(auth, new GoogleAuthProvider());

// // Sign out
// await signOut(auth);