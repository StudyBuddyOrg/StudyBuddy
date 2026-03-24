import { db } from "./firebase";
import { collection, addDoc, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";
import { collection, getDocs, query, where } from "firebase/firestore"; /* Possibly to be added to the import above */

// Internal helper — throws if no user is signed in
function requireUser() {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  return user;
}

async function addUser(first_nameP, last_nameP, ){
    await addDoc(collection(db, "users"), { first_name: first_nameP, last_name: last_nameP, age: 30 });
}

/* await addDoc(collection(db, "users"), {
        first_name: first_nameP,
        last_name: last_nameP,
        email: email,
        age: 30
    }); -- Claude recommended adding this to the addUser function in order to make it work  */

async function getUser(email) {
    const q = query(collection(db, "users"), where("email", "==", email));
    const snap = await getDocs(q);

    if (snap.empty) {
        console.log("No user found with that email.");
        return null;
    }

    const userDoc = snap.docs[0];
    return { id: userDoc.id, ...userDoc.data() };
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