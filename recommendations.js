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

// Ensure user is authenticated
onAuthStateChanged(auth, user => {
    if (user) {
        generateRecommendationsForUser(user.uid);
    } else {
        console.error('No user is signed in.');
    }
});

// Function to generate recommendations for the authenticated user
async function generateRecommendationsForUser(uid) {
    try {
        const researchersSnapshot = await get(ref(db, 'researchers'));
        const usersSnapshot = await get(ref(db, `user-data/${uid}`));
        
        if (!researchersSnapshot.exists() || !usersSnapshot.exists()) {
            console.error('No data available');
            return;
        }

        const researchers = Object.values(researchersSnapshot.val());
        const user = usersSnapshot.val();

        if (!user.Interest_Id || user.Interest_Id.length === 0) {
            console.error('User has no interest IDs.');
            return;
        }

        // Create a list of unique universities and research interests
        const universities = Array.from(new Set(researchers.map(res => res.university)));
        let interests = Array.from(new Set(researchers.flatMap(res => res.research_interests)));
        interests = interests.concat(Array.from(new Set(researchers.flatMap(res => res.interest))));

        // Function to create feature vector for a researcher
        function createFeatureVector(researcher) {
            const universityVector = universities.map(uni => researcher.university === uni ? 1 : 0);
            const interestVector = interests.map(interest => (researcher.research_interests.includes(interest) || researcher.interest.includes(interest)) ? 1 : 0);
            return universityVector.concat(interestVector);
        }

        // Create feature vectors for all researchers
        const researcherVectors = researchers.map(createFeatureVector);

        // Function to generate recommendations for a user
        function generateRecommendations(viewedIds, topN = 5) {
            const viewedVectors = viewedIds.map(id => researcherVectors.find((_, idx) => researchers[idx].id === id));
            const userProfileVector = viewedVectors.reduce((acc, vec) => acc.map((val, idx) => val + vec[idx]), new Array(viewedVectors[0].length).fill(0)).map(val => val / viewedVectors.length);

            const similarityScores = researcherVectors.map(vec => cosineSimilarity(userProfileVector, vec));

            const recommendations = similarityScores
                .map((score, idx) => ({ id: researchers[idx].id, score }))
                .filter(({ id }) => !viewedIds.includes(id))
                .sort((a, b) => b.score - a.score)
                .slice(0, topN)
                .map(({ id }) => id);

            return recommendations;
        }

        // Generate recommendations for the currently signed-in user
        const viewedIds = user.Interest_Id;
        const recommendedIds = generateRecommendations(viewedIds);

        // Update recommendations in Firebase
        const userRef = ref(db, `user-data/${uid}/recommendations`);
        await update(userRef, { recommendations: recommendedIds });

        console.log('Recommended researcher IDs:', recommendedIds);
    } catch (error) {
        console.error('Error generating recommendations:', error);
    }
}

// Cosine Similarity Function
function cosineSimilarity(vecA, vecB) {
    const dotProduct = vecA.reduce((sum, a, idx) => sum + a * vecB[idx], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
}
