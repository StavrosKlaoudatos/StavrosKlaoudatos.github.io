// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

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
const auth = getAuth();
const db = getDatabase(app);

// Sign Up
document.getElementById('register-button').addEventListener('click', () => {
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    createUserWithEmailAndPassword(auth, email, password)
        .then(userCredential => {
            const user = userCredential.user;
            console.log('User registered:', user);
            hideAuthModal();
        })
        .catch(error => {
            console.error('Error registering:', error);
        });
});

// Log In
document.getElementById('login-button').addEventListener('click', () => {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    signInWithEmailAndPassword(auth, email, password)
        .then(userCredential => {
            const user = userCredential.user;
            console.log('User logged in:', user);
            hideAuthModal();
        })
        .catch(error => {
            console.error('Error logging in:', error);
        });
});

// Show/Hide Forms
document.getElementById('show-register').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('register-form').classList.remove('hidden');
});

document.getElementById('show-login').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('register-form').classList.add('hidden');
    document.getElementById('login-form').classList.remove('hidden');
});

// Authentication State Observer
onAuthStateChanged(auth, (user) => {
    if (user) {
        document.querySelector('.container').classList.remove('hidden');
        loadResearchers();
        console.log('User is signed in:', user);
    } else {
        document.querySelector('.container').classList.add('hidden');
        console.log('No user is signed in');
    }
});

function hideAuthModal() {
    document.getElementById('auth-modal').classList.add('hidden');
}

// Load researchers from Firebase Realtime Database
function loadResearchers() {
    const researcherList = document.getElementById('researcher-list');
    const dbRef = ref(db, '/');

    onValue(dbRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const researchers = Object.values(data);
            displayResearchers(researchers);
        } else {
            researcherList.innerHTML = '<li class="py-2 text-center text-gray-500">No researchers found</li>';
        }
    });
}

function displayResearchers(data) {
    const researcherList = document.getElementById('researcher-list');
    researcherList.innerHTML = '';
    if (data.length === 0) {
        researcherList.innerHTML = '<li class="py-2 text-center text-gray-500">No researchers found</li>';
        return;
    }
    data.forEach(researcher => {
        const listItem = document.createElement('li');
        listItem.className = 'list-item bg-white shadow-md';
        listItem.innerHTML = `
            <a href="profile.html?id=${researcher.id}" class="text-gray-600 block p-4">
                <div class="flex justify-between items-center">
                    <div>
                        <div class="flex items-center">
                            <div class="font-bold text-lg">${researcher.name}</div>
                            ${researcher.Emeritus === 1 ? '<span class="bg-gray-200 text-gray-700 text-xs font-semibold ml-2 px-2.5 py-0.5 rounded">Emeritus</span>' : ''}
                        </div>
                        <div class="text-lg text-yellow-600">${researcher.university}</div>
                        <div class="text-gray-600 text-lg">${researcher.interest}</div>
                    </div>
                </div>
            </a>`;
        researcherList.appendChild(listItem);
    });
}