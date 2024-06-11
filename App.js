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

// Pagination variables
const itemsPerPage = 20;
let currentPage = 1;
let totalResearchers = 0;
let filteredResearchers = [];
let allResearchers = [];

// Ensure user is authenticated
onAuthStateChanged(auth, user => {
    if (user) {
        initApp(user.uid);
    } else {
        window.location.href = 'index.html';
    }
});


document.getElementById('open-modal-btn').addEventListener('click', () => {
    document.getElementById('recommendation-modal').classList.remove('hidden');
});

document.getElementById('close-modal-btn').addEventListener('click', () => {
    document.getElementById('recommendation-modal').classList.add('hidden');
});


function getUniversityColor(university) {
    switch (university.toLowerCase()) {
        case 'princeton university':
        case 'caltech':
            return 'yellow-600';
        case 'harvard university':
            return 'red-600';
        default:
            return 'gray-800';
    }
}



function getUniversityColorHex(university) {
    switch (university.toLowerCase()) {
        case 'princeton university':
        case 'caltech':
            return "#ff7000";
        case 'harvard university':
            return "#ff0000";
        default:
            return '#1f2937';
    }
}






function initApp(uid) {
    const dbRef = ref(db, 'researchers');
    get(dbRef)
        .then((snapshot) => {
            if (snapshot.exists()) {
                allResearchers = Object.values(snapshot.val());
                populateDropdowns(allResearchers);
                filterResearchers(); // Initialize filteredResearchers
                displayRecommendations(uid);
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
            listItem.className = `list-item bg-white shadow-md`;

            const universityColor = getUniversityColor(researcher.university);

            listItem.innerHTML = `
                <a href="profile.html?id=${researcher.id}" class="text-gray-600 block p-1">
                    <div class="flex justify-between items-center">
                        <div>
                            <div class="flex items-center">
                                <div class="font-bold text-lg-1000">${researcher.name}</div>
                                ${researcher.Emeritus === 1 ? `<span class="bg-gray-200 text-gray-700 text-xs font-semibold ml-2 px-2.5 py-0.5 rounded">Emeritus</span>` : ''}
                            </div>
                            <div class="text-${universityColor}">${researcher.university}</div>
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
        const isSearchEmpty = !searchQuery && !selectedUniversity && !selectedInterest && !selectedDepartment && !excludeEmeritus;

        const recommendationList = document.getElementById('recommendation-list');
        const recommendationListSave = document.getElementById('recommendation-list');
        
    }




    document.getElementById('search-bar').addEventListener('input', filterResearchers);
    document.getElementById('university-dropdown').addEventListener('change', filterResearchers);
    document.getElementById('interest-dropdown').addEventListener('change', filterResearchers);
    document.getElementById('department-dropdown').addEventListener('change', filterResearchers);
    document.getElementById('exclude-emeritus').addEventListener('change', filterResearchers);
}

function displayRecommendations(uid) {
    const dbRef = ref(db, `user-data/${uid}/recommendations`);
    get(dbRef)
        .then(snapshot => {
            if (snapshot.exists()) {
                const recommendedIds = snapshot.val().recommendations;
                const recommendedResearchers = allResearchers.filter(researcher => recommendedIds.includes(researcher.id));
                const recommendationList = document.getElementById('recommendation-list');
                recommendationList.innerHTML = '';

                recommendedResearchers.forEach(researcher => {
                    const listItem = document.createElement('li');
                    const universityColor = getUniversityColor(researcher.university);
                    const universityColorHeX = getUniversityColorHex(researcher.university);

                    listItem.className = `list-item bg-gradient-to-tr from-white via-white to-${universityColor} shadow-md p-3` ;
                    listItem.className =`list-item bg-white shadow-md`;
                    listItem.innerHTML = `
                        <a href="profile.html?id=${researcher.id}" class="text-gray-600 block p-1">
                
                                <div>
                                    <div class="flex items-center">
                                    <div class="font-bold text-lg-1000">${researcher.name}</div>
                                    ${researcher.Emeritus === 1 ? `<span class="bg-gray-200 text-gray-700 text-xs font-semibold ml-2 px-2.5 py-0.5 rounded">Emeritus</span>` : ''}

                                    
                                    <svg class="h-6 w-auto ml-2" xmlns="http://www.w3.org/2000/svg" fill="${universityColorHeX}" viewBox="0 0 200 200">
    <path fill="${universityColorHeX}" d="M128.5,33.5c1.595,3.056,2.762,6.39,3.5,10c0.883,2.602,2.383,4.769,4.5,6.5c4.831,2.456,9.831,4.456,15,6c-13.504,1.504-21.004,9.004-22.5,22.5c-1.524-13.524-9.024-21.024-22.5-22.5c2.798-1.453,5.798-2.453,9-3c8.434-3.686,12.768-10.186,13-19.5z"/>
    <path fill="${universityColorHeX}" d="M67.5,48.5c2.26,5.735,4.093,11.735,5.5,18c3.5,7.5,9,13,16.5,16.5c6,1.666,12,3.333,18,5c-5.952,1.791-11.952,3.458-18,5c-7.5,3.5-13,9-16.5,16.5c-1.542,6.048-3.209,12.048-5,18c-0.794-12.751-5.96-23.251-15.5-31.5c-7.449-3.441-15.116-6.108-23-8c10.107-1.699,19.273-5.532,27.5-11.5c6.346-8.197,9.846-17.53,10.5-28z"/>
    <path fill="${universityColorHeX}" d="M142.5,92.5c1.539,6.109,3.705,12.109,6.5,18c5.82,5.326,12.654,8.66,20.5,10c-8.016,1.034-14.849,4.368-20.5,10c-2.764,5.384-4.764,11.051-6,17c-1.476-4.225-2.81-8.558-4-13c-2.247-5.212-6.08-8.712-11.5-10.5c-4.154-1.034-8.154-2.368-12-4c16.597-1.764,25.597-10.93,27-27.5z"/>
    <path fill="${universityColorHeX}" d="M94.5,132.5c1.157,9.989,6.824,15.489,17,16.5c-9.956,1.623-15.456,7.456-16.5,17.5c-1.18-3.717-2.513-7.384-4-11c-3.68-3.115-7.847-5.281-12.5-6.5c9.608-1.441,14.941-6.941,16-16.5z"/>
</svg>

                                        </div>
                                    
                                    <div class="text-${universityColor}">${researcher.university}</div>
                                    <div class="text-gray-600">${researcher.interest}</div>
                                </div>
                            </div>
                        </a>`;
                    recommendationList.appendChild(listItem);
                });
            } else {
                
                console.error('No recommendations available');
            }
        })
        .catch(error => console.error('Error fetching recommendations:', error));
}

