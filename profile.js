document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const researcherId = urlParams.get('id');

    if (!researcherId) {
        document.getElementById('profile-container').innerHTML = '<p>Invalid researcher ID.</p>';
        return;
    }

    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            const researcher = data.find(r => r.id == researcherId);
            if (researcher) {
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
                fetchPublications(researcher);
            } else {
                document.getElementById('profile-container').innerHTML = '<p>Researcher not found.</p>';
            }
        })
        .catch(error => console.error('Error fetching data:', error));
});

function fetchPublications(researcher) {
    const query = encodeURIComponent(researcher.name);
    const url = `https://scholar.google.com/scholar?hl=en&q=${query}`;

    fetch(`https://api.scraperapi.com?api_key=c321427d8f8e9bd9afdd17a0e761a731&url=${url}`)
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const publicationElements = doc.querySelectorAll('.gs_ri .gs_rt a');
            const publicationDates = doc.querySelectorAll('.gs_ri .gs_a');

            const publications = [];
            publicationElements.forEach((element, index) => {
                if (index < 5) {
                    const title = element.innerText;
                    const link = element.href;
                    const dateElement = publicationDates[index];
                    const dateMatch = dateElement ? dateElement.innerText.match(/(\d{4})/) : null;
                    const date = dateMatch ? dateMatch[0] : 'Unknown';
                    publications.push({ title, link, date });
                }
            });
            publications.sort((a, b) => b.date - a.date); // Sort by date descending
            displayPublications(publications);
            savePublications(researcher.id, publications);
        })
        .catch(error => console.error('Error fetching publications:', error));
}

function displayPublications(publications) {
    const publicationsList = document.getElementById('publications-list');
    publicationsList.innerHTML = ''; // Clear previous publications
    publications.forEach(pub => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `<a href="${pub.link}" class="text-blue-500" target="_blank">${pub.title} (${pub.date})</a>`;
        publicationsList.appendChild(listItem);
    });
}

function savePublications(researcherId, publications) {
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            const researcher = data.find(r => r.id == researcherId);
            if (researcher) {
                researcher.papers = publications;
                // Now send updated data back to server
                fetch('/api/update-researcher', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                })
                .then(response => response.json())
                .then(result => console.log('Successfully updated publications:', result))
                .catch(error => console.error('Error updating publications:', error));
            }
        })
        .catch(error => console.error('Error fetching data for update:', error));
}
