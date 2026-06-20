// js/script.js
document.addEventListener("DOMContentLoaded", () => {
    const gridContainer = document.getElementById("gridContainer");
    const searchBar = document.getElementById("searchBar");

    // Global tracking array for current visible results
    let currentMatches = [];

    function renderCards(filterText = "") {
        gridContainer.innerHTML = "";
        currentMatches = [];
        
        for (const key in openingsData) {
            const opening = openingsData[key];
            
            // Match against title or description strings
            const matchesSearch = opening.name.toLowerCase().includes(filterText.toLowerCase()) || 
                                  opening.description.toLowerCase().includes(filterText.toLowerCase());
            
            if (matchesSearch) {
                currentMatches.push(key);
                
                const card = document.createElement("div");
                card.className = "card";
                card.style.display = "block"; // Explicitly ensure visibility
                card.innerHTML = `
                    <h3>${opening.name}</h3>
                    <p>${opening.description}</p>
                `;
                
                // Clicking the card immediately launches the lesson framework page
                card.addEventListener("click", () => {
                    window.location.href = `lesson.html?opening=${key}`;
                });
                
                gridContainer.appendChild(card);
            }
        }
    }

    // Live search filtering as you type
    searchBar.addEventListener("input", (e) => {
        renderCards(e.target.value);
    });

    // Handle "Enter" key behavior safely
    searchBar.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault(); // Stop page refreshing or losing state
            if (currentMatches.length > 0) {
                // Instantly navigate to the top search result match
                window.location.href = `lesson.html?opening=${currentMatches[0]}`;
            }
        }
    });

    // CRITICAL FIX: Run immediately on page boot to populate default layout view
    renderCards("");
});
