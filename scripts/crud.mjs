import { db } from "./firebase";
import { collection, addDoc, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";

async function addUser(userInfo){
}

async function getUser(email) {
    
}

async function findBuddies(){
    
}

// Create a document
await addDoc(collection(db, "users"), { name: "Alice", age: 30 });

// Read all documents in a collection
const snap = await getDocs(collection(db, "users"));
snap.forEach(doc => console.log(doc.id, doc.data()));

// Update a document
await setDoc(doc(db, "users", "abc123"), { name: "Bob" }, { merge: true });

// Delete a document
await deleteDoc(doc(db, "users", "abc123"));

// Real-time listener

onSnapshot(collection(db, "users"), (snap) => {
  snap.docs.forEach(d => console.log(d.data()));
});