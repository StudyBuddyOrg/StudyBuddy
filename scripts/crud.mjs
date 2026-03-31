import { db, auth } from "./main.mjs";
import { collection, addDoc, getDocs, doc, setDoc, deleteDoc, query, where } from "firebase/firestore";
import {User} from "./user.js";
import {findMatches} from "../sort.js"

// Internal helper — throws if no user is signed in
function requireUser() {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  return user;
}

export async function addUser(userData, document_name) {
  const user = requireUser();
  const dataToSave = userData instanceof User ? userData.toPlainObject() : userData;
  try {
    await setDoc(doc(db, "users", user.uid), {
      ...dataToSave,
      uid: user.uid, // Ensures the ID is searchable inside the doc
      updatedAt: new Date().toISOString() 
    }, { merge: true });
    
    console.log("Profile successfully synced for:", user.uid);
  } catch (error) {
    console.error("Failed to add user to Firestore:", error);
    throw error;
  }
}

async function getUserByEmail(email) {
  const q = query(collection(db, "users"), where("email", "==", email));
  const snap = await getDocs(q);

  if (snap.empty) {
    console.log("No user found with that email.");
    return null;
  }

  const userDoc = snap.docs[0];
  return { id: userDoc.id, ...userDoc.data() };
}

/**
 *
 * @param {User}userData
 */
async function findBuddies(userData) {
    let student = userData.getStudent();

    let pool = getDocs(query(collection(db, "users"))).map(item => new User(item).getStudent());


    return findMatches(student, pool);

}
