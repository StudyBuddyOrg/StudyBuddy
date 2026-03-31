import { db, auth } from "./main.mjs";
import { collection, addDoc, getDocs, doc, setDoc, deleteDoc, query, where } from "firebase/firestore";
import {User} from './user.js';

async function addUser(userData) {
  const user = requireUser();
  await setDoc(doc(db, "users", user.uid), userData);
}

const user = new User({first_name: "Nathan", last_name: "sharp", email: "email@gmail.com"})



const docRef = await addDoc(collection(db, "users"), user.get_signup_data());