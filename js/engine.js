// js/engine.js
document.addEventListener("DOMContentLoaded", () => {
    // 1. Determine which opening path to render from URL string parameter
    const urlParams = new URLSearchParams(window.location.search);
    const openingKey = urlParams.get('opening');
    const opening = openingsData[openingKey];
    
    // Redirect safe guard if url key is missing or manually mistyped
    if (!opening) {
        window.location.href = 'index.html';
        return;
    }

    // Initialize logic engines
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

    // Process the opening foundation moves through the rules validator
    const cleanBaseMoves = [];
    opening.moves.forEach(moveStr => {
        // Splitting "1. e4 e5" into separate moves
        const parts = moveStr.split(" ").slice(1);
        parts.forEach(move => { if(move) cleanBaseMoves.push(move); });
    });

    // Run basic lines sequentially in virtual rules game engine
    cleanBaseMoves.forEach(move => game.move(move));

    // Render base tracking tags visually on screen
    opening.moves.forEach(move => {
        const span = document.createElement("span");
        span.className = "move-tag";
        span.textContent = move;
        movesTrackerEl.appendChild(span);
    });

    // Build the structural interactive chessboard layout frame
    board = Chessboard('chessBoard', {
        position: game.fen(), 
        draggable: false,     
        // Standard absolute fallbacks to bypass local environment relative routing issues
        pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png'
    });

    // Force rendering engine layout check to guarantee initialization sizes calculate cleanly
    setTimeout(() => {
        board.resize();
    }, 150);

    // Render tactical decision branches tree dynamically
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

            // Isolated simulation engine for tracking branch specific progress
            const branchGame = new Chess();
            cleanBaseMoves.forEach(move => branchGame.move(move));

            // Parse and clean secondary deep notation strings
            const cleanBranchMoves = [];
            branch.nextMoves.forEach(moveStr => {
                const parts = moveStr.replace(/^\d+\.+\s*/, "").split(" ");
                parts.forEach(m => { if(m) cleanBranchMoves.push(m); });
            });

            // Pass choices moves to the virtual chess logic state checker
            for (let m of cleanBranchMoves) {
                try {
                    branchGame.move(m);
                } catch(err) {
                    console.warn("Skipping dynamic step details mapping format: ", m);
                }
            }

            // Animate board configuration dynamically to show variance options
            board.position(branchGame.fen(), true);
        });

        branchesContainerEl.appendChild(optionBox);
    });

    // Ensure responsive layout adjustments scale properly if screens resize orientation
    window.addEventListener('resize', () => {
        if (board) board.resize();
    });
});
