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

// Pagination variables
const itemsPerPage = 20;
let currentPage = 1;
let totalResearchers = 0;
let filteredResearchers = [];
let allResearchers = [];

// Ensure user is authenticated
onAuthStateChanged(auth, user => {
    if (user) {
        initApp();
    } else {
        window.location.href = 'index.html';
    }
});

function initApp() {
    const dbRef = ref(db, 'researchers');
    get(dbRef)
        .then((snapshot) => {
            if (snapshot.exists()) {
                allResearchers = Object.values(snapshot.val());
                populateDropdowns(allResearchers);
                filterResearchers(); // Initialize filteredResearchers
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
        dropdown.innerHTML = '<option value="">All</option>'; // Reset dropdown
        items.forEach(item => {
            const option = document.createElement('option');
            option.value = item;
            option.textContent = item;
            dropdown.appendChild(option);
        });
    }

    function displayPage(page) {
        const researcherList = document.getElementById('researcher-list');
        researcherList.innerHTML = '';

        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const pageResearchers = filteredResearchers.slice(start, end);

        if (pageResearchers.length === 0) {
            researcherList.innerHTML = '<li class="py-2 text-center text-gray-500">No researchers found</li>';
            return;
        }

        pageResearchers.forEach((researcher) => {
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

        renderPagination();
    }

    function renderPagination() {
        const pagination = document.getElementById('pagination');
        pagination.innerHTML = '';

        const totalPages = Math.ceil(totalResearchers / itemsPerPage);

        if (totalPages > 1) {
            if (currentPage > 1) {
                const prevButton = document.createElement('button');
                prevButton.textContent = 'Previous';
                prevButton.className = 'pagination-button';
                prevButton.addEventListener('click', () => {
                    currentPage--;
                    displayPage(currentPage);
                });
                pagination.appendChild(prevButton);
            }

            for (let i = 1; i <= totalPages; i++) {
                const pageButton = document.createElement('button');
                pageButton.textContent = i;
                pageButton.className = `pagination-button ${i === currentPage ? 'active' : ''}`;
                pageButton.addEventListener('click', () => {
                    currentPage = i;
                    displayPage(currentPage);
                });
                pagination.appendChild(pageButton);
            }

            if (currentPage < totalPages) {
                const nextButton = document.createElement('button');
                nextButton.textContent = 'Next';
                nextButton.className = 'pagination-button';
                nextButton.addEventListener('click', () => {
                    currentPage++;
                    displayPage(currentPage);
                });
                pagination.appendChild(nextButton);
            }
        }
    }

    function filterResearchers() {
        const searchQuery = document.getElementById('search-bar').value.toLowerCase().trim();
        const selectedUniversity = document.getElementById('university-dropdown').value;
        const selectedInterest = document.getElementById('interest-dropdown').value;
        const selectedDepartment = document.getElementById('department-dropdown').value;
        const excludeEmeritus = document.getElementById('exclude-emeritus').checked;

        filteredResearchers = allResearchers.filter(researcher => {
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

        totalResearchers = filteredResearchers.length;
        currentPage = 1; // Reset to first page on new search
        displayPage(currentPage);
    }

    document.getElementById('search-bar').addEventListener('input', filterResearchers);
    document.getElementById('university-dropdown').addEventListener('change', filterResearchers);
    document.getElementById('interest-dropdown').addEventListener('change', filterResearchers);
    document.getElementById('department-dropdown').addEventListener('change', filterResearchers);
    document.getElementById('exclude-emeritus').addEventListener('change', filterResearchers);
}
