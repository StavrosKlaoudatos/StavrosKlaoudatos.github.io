// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
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

// Ensure user is authenticated
onAuthStateChanged(auth, user => {
    if (user) {
        initApp();
    } else {
        window.location.href = 'index.html';
    }
});

function initApp() {
    let researchers = [];
    const dbRef = ref(db, '/');
    get(dbRef)
        .then((snapshot) => {
            if (snapshot.exists()) {
                researchers = Object.keys(snapshot.val()).map(key => ({ id: key, ...snapshot.val()[key] }));
                populateDropdowns(researchers);
                displayResearchers(researchers);
            } else {
                console.error('No data available');
            }
        })
        .catch((error) => {
            console.error('Error fetching data:', error);
        });

    function populateDropdowns(data) {
        const universities = new Set();
        const interests = new Set();
        const departments = new Set();

        data.forEach(researcher => {
            universities.add(researcher.university);
            interests.add(researcher.interest);
            departments.add(researcher.department);
        });

        populateDropdown('university-dropdown', universities);
        populateDropdown('interest-dropdown', interests);
        populateDropdown('department-dropdown', departments);
    }

    function populateDropdown(dropdownId, items) {
        const dropdown = document.getElementById(dropdownId);
        items.forEach(item => {
            const option = document.createElement('option');
            option.value = item;
            option.textContent = item;
            dropdown.appendChild(option);
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
                <a href="profile.html?id=${researcher.id}" class="text-gray-600 block p-1">
                    <div class="flex justify-between items-center">
                        <div>
                            <div class="flex items-center">
                                <div class="font-bold text-lg-1000">${researcher.name}</div>
                                ${researcher.Emeritus === 1 ? '<span class="bg-gray-200 text-gray-700 text-xs font-semibold ml-2 px-2.5 py-0.5 rounded">Emeritus</span>' : ''}
                            </div>
                            <div class ="text-yellow-600">${researcher.university}</div>
                            <div class="text-gray-600">${researcher.interest}</div>
                        </div>
                    </div>
                </a>`;
            researcherList.appendChild(listItem);
        });
    }

    function filterResearchers() {
        const searchQuery = document.getElementById('search-bar').value.toLowerCase().trim();
        const selectedUniversity = document.getElementById('university-dropdown').value;
        const selectedInterest = document.getElementById('interest-dropdown').value;
        const selectedDepartment = document.getElementById('department-dropdown').value;
        const excludeEmeritus = document.getElementById('exclude-emeritus').checked;

        const filteredResearchers = researchers.filter(researcher => {
            const matchesSearchQuery = searchQuery ? (
                researcher.name.toLowerCase().includes(searchQuery) ||
                researcher.university.toLowerCase().includes(searchQuery) ||
                researcher.interest.toLowerCase().includes(searchQuery) ||
                researcher.department.toLowerCase().includes(searchQuery) ||
                (researcher.research_interests && researcher.research_interests.some(interest => interest.toLowerCase().includes(searchQuery)))
            ) : true;

            const matchesUniversity = selectedUniversity ? researcher.university === selectedUniversity : true;
            const matchesInterest = selectedInterest ? researcher.interest === selectedInterest : true;
            const matchesDepartment = selectedDepartment ? researcher.department === selectedDepartment : true;
            const matchesEmeritus = excludeEmeritus ? researcher.Emeritus !== 1 : true;

            return matchesSearchQuery && matchesUniversity && matchesInterest && matchesDepartment && matchesEmeritus;
        });

        displayResearchers(filteredResearchers);
    }

    document.getElementById('search-bar').addEventListener('input', filterResearchers);
    document.getElementById('university-dropdown').addEventListener('change', filterResearchers);
    document.getElementById('interest-dropdown').addEventListener('change', filterResearchers);
    document.getElementById('department-dropdown').addEventListener('change', filterResearchers);
    document.getElementById('exclude-emeritus').addEventListener('change', filterResearchers);
}
