console.log('signup_script.js loaded - before any imports');

import { signUp } from './scripts/auth.mjs';
import { addUser } from './scripts/crud.mjs';
import SignupData from './scripts/user.js';

console.log('signup_script.js - all imports completed');

const signupForm = document.getElementById('signupForm');
if (!signupForm) {
    console.error('signup_form not found. Ensure <form id="signupForm"> exists');
} else {
    console.log('signup_script: form found, adding submit handler');
}

signupForm?.addEventListener('submit', async function(event) {
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
        const major = document.getElementById('major').value; // Assuming the major select is the first one

        // Study style
        const studyStyle = document.querySelector('input[name="study"]:checked')?.parentElement?.textContent.trim().toLowerCase().replace(/\s+/g, '_') || '';

        // Interests
        const interestsCheckboxes = document.querySelectorAll('#interests input[type="checkbox"]:checked');
        const interests = Array.from(interestsCheckboxes).map(cb => cb.parentElement.textContent.trim().toLowerCase().replace(/\s+/g, '_'));

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
        const timeAvailableString = timeAvailable.join('; ');

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
            time_availible: timeAvailableString
        });

        // Sign up
        const user = await signUp(email, password);
        if (!user) throw new Error('User creation failed');

        // Add user data to Firestore
        await addUser(signupData.get_signup_data());

        messageDiv.style.color = "green";
        messageDiv.textContent = "Account created successfully! Redirecting to login...";

        Redirect to login
        
        window.location.href = 'login.html';
        

    } catch (error) {
        messageDiv.style.color = "red";
        messageDiv.textContent = "Error creating account: " + error.message;
        console.error(error);
    }
});
