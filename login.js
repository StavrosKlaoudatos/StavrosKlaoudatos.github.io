// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCSBPcjnnT1SpwkTqqzz0zRGvwjLTW96FI",
    authDomain: "researchhub-d0a31.firebaseapp.com",
    databaseURL: "https://researchhub-d0a31-default-rtdb.firebaseio.com",
    projectId: "researchhub-d0a31",
    storageBucket: "researchhub-d0a31.appspot.com",
    messagingSenderId: "279820246029",
    appId: "1:279820246029:web:0a8796a4989f15a7f0c944",
    measurementId: "G-7B6S7J1W35"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.getElementById('login-btn').addEventListener('click', () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            window.location.href = 'main.html';
        })
        .catch((error) => {
            document.getElementById('error-message').textContent = error.message;
        });
});

document.getElementById('register-btn').addEventListener('click', () => {
    window.location.href = 'register.html';
});
