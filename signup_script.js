import { signUp } from './scripts/auth.mjs';
import { addUser } from './scripts/crud.mjs';
import SignupData from './scripts/signup_data.js';

document.getElementById('signupForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const messageDiv = document.getElementById('message');
    messageDiv.textContent = '';
    messageDiv.style.color = '';

    try {
        // Collect form data
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const dob = document.getElementById('dob').value;
        const semester = document.getElementById('semester').value;
        const gender = document.getElementById('gender').value;
        const major = document.querySelector('select').value; // Assuming the major select is the first one

        // Study style
        const studyStyle = document.querySelector('input[name="study"]:checked')?.parentElement.textContent.trim().toLowerCase().replace(' ', '_');

        // Interests
        const interestsCheckboxes = document.querySelectorAll('input[type="checkbox"]:not([id])'); // Assuming interests are checkboxes without id
        const interests = Array.from(interestsCheckboxes).filter(cb => cb.checked).map(cb => cb.parentElement.textContent.trim().toLowerCase().replace(' ', '_')).join(', ');

        // Time available - this is complex, need to collect from the day blocks
        const timeBlocks = document.querySelectorAll('.day-block');
        let timeAvailable = [];
        timeBlocks.forEach(block => {
            const day = block.querySelector('h4').textContent.toLowerCase();
            const times = Array.from(block.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.parentElement.textContent.trim());
            if (times.length > 0) {
                timeAvailable.push(`${day}: ${times.join(', ')}`);
            }
        });
        const timeAvailible = timeAvailable.join('; ');

        // Create SignupData
        const signupData = new SignupData({
            first_name: firstName,
            last_name: lastName,
            email: email,
            dob: dob,
            semester: semester,
            gender: gender,
            interests: interests,
            major: major,
            study_style: studyStyle,
            time_availible: timeAvailible
        });

        // Sign up
        await signUp(email, password);

        // Add user data to Firestore
        await addUser(signupData.get_signup_data());

        messageDiv.style.color = "green";
        messageDiv.textContent = "Account created successfully! Redirecting to login...";

        // Redirect to login
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);

    } catch (error) {
        messageDiv.style.color = "red";
        messageDiv.textContent = "Error creating account: " + error.message;
        console.error(error);
    }
});