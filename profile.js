// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, get, update } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

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
const db = getDatabase(app);
const auth = getAuth(app);

document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const researcherId = parseInt(urlParams.get('id'));

    if (isNaN(researcherId)) {
        document.getElementById('profile-container').innerHTML = '<p>Invalid researcher ID.</p>';
        return;
    }

    onAuthStateChanged(auth, user => {
        if (user) {
            const researcherRef = ref(db, 'researchers/' + researcherId);
            get(researcherRef)
                .then(snapshot => {
                    if (snapshot.exists()) {
                        const researcher = snapshot.val();
                        if (researcher) {
                            displayResearcherProfile(researcher);
                            updateInterestData(user.uid, researcherId);
                        } else {
                            document.getElementById('profile-container').innerHTML = '<p>Researcher not found.</p>';
                        }
                    } else {
                        document.getElementById('profile-container').innerHTML = '<p>Researcher not found.</p>';
                    }
                })
                .catch(error => console.error('Error fetching data:', error));
        } else {
            window.location.href = 'index.html';
        }
    });
});

function displayResearcherProfile(researcher) {
    const profileContainer = document.getElementById('profile-container');
    profileContainer.innerHTML = `
        <h2 class="text-2xl font-bold mb-2">${researcher.name}</h2>
        <p><strong>Position:</strong> ${researcher.position} ${researcher.Emeritus === 1 ? '<span class="bg-gray-200 text-gray-700 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">Emeritus</span>' : ''}</p>
        <p><strong>Department:</strong> ${researcher.department}</p>
        <p><strong>University:</strong> ${researcher.university}</p>
        <p><strong>Email:</strong> <a href="mailto:${researcher.email}" class="text-blue-500">${researcher.email}</a></p>
        <p><strong>Interests:</strong> ${researcher.interest}</p>
        <p><strong>Research Interests:</strong> ${researcher.research_interests.join(', ')}</p>
        <p><strong>Links:</strong> ${researcher.links.map(link => `<a href="${link}" class="text-blue-500">${link}</a>`).join(', ')}</p>
        <div id="publications-container">
            <h3 class="text-xl font-bold mt-4 mb-2">Recent Publications</h3>
            <ul id="publications-list" class="list-disc list-inside"></ul>
        </div>
    `;
    displayPublicationsLink(researcher);
}

function displayPublicationsLink(researcher) {
    const query = encodeURIComponent(researcher.name);
    const url = `https://scholar.google.com/scholar?hl=en&q=${query}`;
    const publicationsList = document.getElementById('publications-list');
    publicationsList.innerHTML = `<a href="${url}" class="text-blue-500" target="_blank">View recent publications on Google Scholar</a>`;
}

function updateInterestData(userId, researcherId) {
    const userRef = ref(db, 'user-data/' + userId);

    get(userRef)
        .then(snapshot => {
            let interestIds = [];
            if (snapshot.exists()) {
                const userData = snapshot.val();
                interestIds = userData.Interest_Id || [];
            }
            interestIds.push(researcherId); 
            update(userRef, { Interest_Id: interestIds })
                .then(() => {
                    console.log('Interest data updated successfully.');
                })
                .catch(error => {
                    console.error('Error updating interest data:', error);
                });
        })
        .catch(error => console.error('Error fetching user data:', error));
}

