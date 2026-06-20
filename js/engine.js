// js/engine.js
document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const openingKey = urlParams.get('opening');
    const opening = openingsData[openingKey];
    
    if (!opening) {
        window.location.href = 'index.html';
        return;
    }

    // Initialize logic objects
    const game = new Chess();
    let board = null;

    // Element bindings
    const titleEl = document.getElementById("openingTitle");
    const philosophyEl = document.getElementById("openingPhilosophy");
    const movesTrackerEl = document.getElementById("movesTracker");
    const branchesContainerEl = document.getElementById("branchesContainer");

    // Populate metadata UI
    titleEl.textContent = opening.name;
    philosophyEl.textContent = opening.philosophy;

    // 1. Process the opening foundation moves through the rules validator
    // We clean up notation strings (e.g., "1. e4 e5" turns to moves: "e4", "e5")
    const cleanBaseMoves = [];
    opening.moves.forEach(moveStr => {
        const parts = moveStr.split(" ").slice(1); // removes move numbers like "1."
        parts.forEach(move => { if(move) cleanBaseMoves.push(move); });
    });

    // Run moves sequentially in virtual game engine
    cleanBaseMoves.forEach(move => game.move(move));

    // 2. Build out the visual board set to our new dynamic base layout position
    board = Chessboard('chessBoard', {
        position: game.fen(), // Set position to current engine state
        draggable: false,     // Keeps training focused on reading plans
        pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png'
    });

    // 3. Render base tracking tags
    opening.moves.forEach(move => {
        const span = document.createElement("span");
        span.className = "move-tag";
        span.textContent = move;
        movesTrackerEl.appendChild(span);
    });

    // 4. Handle choices branches
    opening.branches.forEach(branch => {
        const optionBox = document.createElement("button");
        optionBox.className = "branch-option";
        
        let badgeClass = "badge-solid";
        if (branch.type.toLowerCase().includes("best")) badgeClass = "badge-best";
        if (branch.type.toLowerCase().includes("risky")) badgeClass = "badge-risky";

        optionBox.innerHTML = `
            <div class="branch-header">
                <span class="branch-title">${branch.id}) ${branch.title}</span>
                <span class="badge ${badgeClass}">${branch.type}</span>
            </div>
            <p class="branch-desc">${branch.explanation}</p>
            <div class="branch-moves"><strong>Resulting Variation Path:</strong> ${branch.nextMoves.join(" → ")}</div>
        `;

        optionBox.addEventListener("click", () => {
            document.querySelectorAll(".branch-option").forEach(box => box.classList.remove("selected"));
            optionBox.classList.add("selected");

            // --- CHESSBOARD SYSTEM ANIMATION INTERACTION ---
            // Create a secondary isolated scratchpad instance starting from our base position
            const branchGame = new Chess();
            cleanBaseMoves.forEach(move => branchGame.move(move));

            // Parse and apply the branches' unique continuation pathing
            const cleanBranchMoves = [];
            branch.nextMoves.forEach(moveStr => {
                const parts = moveStr.replace(/^\d+\.+\s*/, "").split(" "); // Strip sub move numbers
                parts.forEach(m => { if(m) cleanBranchMoves.push(m); });
            });

            // Feed new continuation lines to update the scratch engine simulation state safely
            for (let m of cleanBranchMoves) {
                try {
                    branchGame.move(m);
                } catch(err) {
                    console.log("Skipping step rendering detail label format: ", m);
                }
            }

            // Animate our chessboard smoothly to reveal the deep variation strategy visually!
            board.position(branchGame.fen(), true);
        });

        branchesContainerEl.appendChild(optionBox);
    });

    // Keep layout looking sharp across browser window scales
    window.addEventListener('resize', board.resize);
});
