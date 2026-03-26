import { signIn } from './scripts/auth.mjs';

document.getElementById('loginForm').addEventListener('submit', async function(event) {
    // 1. Prevent the form from submitting the old-fashioned way (refreshing the page)
    event.preventDefault();

    // 2. Get the values from the inputs
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const messageDiv = document.getElementById('message');

    // Clear previous messages
    messageDiv.textContent = '';
    messageDiv.style.color = '';

    try {
        // 3. Attempt to sign in
        const user = await signIn(email, password);
        messageDiv.style.color = "#f6e866";
        messageDiv.textContent = "Logging in...";
        
        // Redirect to a dashboard or home page after 1 second
        setTimeout(() => {
            window.location.href = 'index.html'; 
        }, 1000);
    } catch (error) {
        // Show an error
        messageDiv.style.color = "red";
        messageDiv.textContent = "Invalid email or password. Please try again.";
        console.error(error.message);
    }
});