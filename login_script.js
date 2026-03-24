import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js';
import { getAuth, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB4sFHwYgWueO2-ZKIvc3lmPfEGeKhVliQ",
  authDomain: "studybuddy-b1e01.firebaseapp.com",
  projectId: "studybuddy-b1e01",
  storageBucket: "studybuddy-b1e01.firebasestorage.app",
  messagingSenderId: "755708087089",
  appId: "1:755708087089:web:8e3885ae5e5cb9e1063e10"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.getElementById('loginForm').addEventListener('submit', function(event) {
    // 1. Prevent the form from submitting the old-fashioned way (refreshing the page)
    event.preventDefault();

    // 2. Get the values from the inputs
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const messageDiv = document.getElementById('message');

    // Clear previous messages
    messageDiv.textContent = '';
    messageDiv.style.color = '';

    // 3. Attempt to sign in with Firebase
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in
            const user = userCredential.user;
            messageDiv.style.color = "#f6e866";
            messageDiv.textContent = "Logging in...";
            
            // Redirect to a dashboard or home page after 1 second
            setTimeout(() => {
                window.location.href = 'index.html'; 
            }, 1000);
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            // Show an error
            messageDiv.style.color = "red";
            messageDiv.textContent = "Invalid email or password. Please try again.";
            console.error(errorMessage);
        });
});