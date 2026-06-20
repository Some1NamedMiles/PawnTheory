// js/engine.js
document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const openingKey = urlParams.get('opening');
    const opening = openingsData[openingKey];
    
    if (!opening) {
        window.location.href = 'index.html';
        return;
    }

    // Initialize logic engine
    const game = new Chess();
    let board = null;

    // Track active move walkthrough states
    let activeBranch = null;
    let currentStepIndex = 0;
    let baseMovesCount = 0;

    // Element bindings
    const titleEl = document.getElementById("openingTitle");
    const philosophyEl = document.getElementById("openingPhilosophy");
    const movesTrackerEl = document.getElementById("movesTracker");
    const branchesContainerEl = document.getElementById("branchesContainer");

    // Populate foundational data
    titleEl.textContent = opening.name;
    philosophyEl.textContent = opening.philosophy;

    // Process foundational opening moves
    const cleanBaseMoves = [];
    opening.moves.forEach(moveStr => {
        const parts = moveStr.split(" ").slice(1);
        parts.forEach(move => { if(move) cleanBaseMoves.push(move); });
    });
    baseMovesCount = cleanBaseMoves.length;

    // Run base opening moves in rules engine
    cleanBaseMoves.forEach(move => game.move(move));

    // Render initial move tags visually
    opening.moves.forEach(move => {
        const span = document.createElement("span");
        span.className = "move-tag";
        span.textContent = move;
        movesTrackerEl.appendChild(span);
    });

    // Initialize physical chessboard layout at base opening state
    board = Chessboard('chessBoard', {
        position: game.fen(), 
        draggable: false,     
        pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png'
    });

    // Handle container sizing fallback delay
    setTimeout(() => { board.resize(); }, 150);

    // Build branch choices selection cards
    function renderBranchOptions() {
        branchesContainerEl.innerHTML = "";
        
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
            `;

            optionBox.addEventListener("click", () => {
                startBranchWalkthrough(branch);
            });

            branchesContainerEl.appendChild(optionBox);
        });
    }

    // Launch the active interactive move-by-move engine mode
    function startBranchWalkthrough(branch) {
        activeBranch = branch;
        currentStepIndex = 0;
        
        // Clear out selection list to focus purely on active learning workspace
        branchesContainerEl.innerHTML = "";

        const interactiveContainer = document.createElement("div");
        interactiveContainer.className = "interactive-walkthrough-panel";
        interactiveContainer.style.background = "var(--bg-card)";
        interactiveContainer.style.padding = "1.5rem";
        interactiveContainer.style.borderRadius = "8px";
        interactiveContainer.style.border = "1px solid var(--accent-blue)";

        interactiveContainer.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h4 style="color: var(--accent-blue); font-size: 1.2rem;">Exploring Line: ${branch.title}</h4>
                <button id="resetBranchBtn" class="back-btn" style="margin: 0; padding: 0.3rem 0.7rem;">Change Variation</button>
            </div>
            <div id="stepMoveIndicator" style="font-family: monospace; font-size: 1.3rem; margin-bottom: 0.5rem; color: var(--text-main);"></div>
            <p id="stepExplanation" style="color: var(--text-muted); line-height: 1.5; margin-bottom: 1.5rem; min-height: 60px;"></p>
            <button id="nextStepBtn" class="card" style="width: 100%; text-align: center; padding: 1rem; background: var(--accent-dark-blue); color: white; border: none; font-weight: bold;">See Next Move →</button>
        `;

        branchesContainerEl.appendChild(interactiveContainer);

        // Map internal step controller actions
        document.getElementById("resetBranchBtn").addEventListener("click", resetToOpeningBase);
        document.getElementById("nextStepBtn").addEventListener("click", advanceStep);

        // Render step zero details immediately
        showCurrentStep();
    }

    // Render the specific explanations and position update for the active step index
    function showCurrentStep() {
        if (!activeBranch) return;
        
        const currentStep = activeBranch.steps[currentStepIndex];
        const indicatorEl = document.getElementById("stepMoveIndicator");
        const explanationEl = document.getElementById("stepExplanation");
        const nextBtn = document.getElementById("nextStepBtn");

        // 1. Progress the board to include moves up to this active index
        const stepGame = new Chess();
        
        // Apply opening base moves
        cleanBaseMoves.forEach(move => stepGame.move(move));
        
        // Append branch path moves up to the active step
        for (let i = 0; i <= currentStepIndex; i++) {
            stepGame.move(activeBranch.steps[i].notation);
        }

        // Move the visible board configuration
        board.position(stepGame.fen(), true);

        // 2. Update descriptive layout text fields
        indicatorEl.textContent = `Move: ${currentStep.move}`;
        explanationEl.textContent = currentStep.explanation;

        // 3. Update active move tag tracking bar highlights
        refreshMoveTrackerHighlights();

        // Check if user has reached the final variation cap step
        if (currentStepIndex >= activeBranch.steps.length - 1) {
            nextBtn.textContent = "Line Fully Explored! (Explore Another Variation)";
            nextBtn.style.background = "var(--type-solid)";
        } else {
            nextBtn.textContent = "See Next Move →";
            nextBtn.style.background = "var(--accent-dark-blue)";
        }
    }

    // Advance the frame forward
    function advanceStep() {
        if (currentStepIndex < activeBranch.steps.length - 1) {
            currentStepIndex++;
            showCurrentStep();
        } else {
            resetToOpeningBase();
        }
    }

    // Update historical tag highlights in the container top strip
    function refreshMoveTrackerHighlights() {
        // Clear out custom dynamic added branch tags from past cycles
        while (movesTrackerEl.children.length > baseMovesCount) {
            movesTrackerEl.removeChild(movesTrackerEl.lastChild);
        }

        // Add dynamic visual text labels for branch moves up to current position
        for (let i = 0; i <= currentStepIndex; i++) {
            const span = document.createElement("span");
            span.className = "move-tag";
            span.style.borderColor = "var(--accent-blue)";
            span.style.color = "var(--accent-blue)";
            span.textContent = activeBranch.steps[i].move;
            movesTrackerEl.appendChild(span);
        }
    }

    // Reset workflow layout back to structural options tier
    function resetToOpeningBase() {
        activeBranch = null;
        currentStepIndex = 0;
        
        // Reset rules logic container back to baseline opening fen
        game.reset();
        cleanBaseMoves.forEach(move => game.move(move));
        board.position(game.fen(), true);

        // Reset text tags tracking strip
        while (movesTrackerEl.children.length > baseMovesCount) {
            movesTrackerEl.removeChild(movesTrackerEl.lastChild);
        }

        // Remap choice buttons grid
        renderBranchOptions();
    }

    // Initial default render trigger execution
    renderBranchOptions();

    window.addEventListener('resize', () => {
        if (board) board.resize();
    });
});
