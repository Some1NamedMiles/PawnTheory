// js/engine.js
document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const openingKey = urlParams.get('opening');
    const opening = openingsData[openingKey];
    
    if (!opening) {
        window.location.href = 'index.html';
        return;
    }

    // Engine Core Rules Instance References
    let game = new Chess();
    let board = null;

    // Active Study State Tracking values
    let activeBranch = null;
    let currentStepIndex = 0;
    let baseMovesCount = 0;
    let cleanBaseMoves = [];

    // UI Element bindings
    const lessonViewTitle = document.getElementById("lessonViewTitle");
    const coachBubbleSpeech = document.getElementById("coachBubbleSpeech");
    const movesPillFlow = document.getElementById("movesPillFlow");
    const variationsMenuBox = document.getElementById("variationsMenuBox");
    const coachDisplayCard = document.getElementById("coachDisplayCard");
    const coachFaceGraphic = document.getElementById("coachFaceGraphic");
    const coachStatusField = document.getElementById("coachStatusField");
    const actionGridHeader = document.getElementById("actionGridHeader");
    const navHomeBtn = document.getElementById("navHomeBtn");

    // Load initial context titles
    lessonViewTitle.textContent = opening.name;
    coachBubbleSpeech.textContent = opening.philosophy;

    // Parse base moves out into separate arrays
    opening.moves.forEach(moveStr => {
        const parts = moveStr.split(" ").slice(1);
        parts.forEach(m => { if(m) cleanBaseMoves.push(m); });
    });
    baseMovesCount = cleanBaseMoves.length;

    // Apply basic opening baseline state setup strings to start out positions
    cleanBaseMoves.forEach(m => game.move(m));
    refreshBaseMovePills();

    // Hook piece drag movements rules logic boundary parameters
    function onDragStart(source, piece, position, orientation) {
        // Prevent interaction completely if user hasn't selected a track variation line yet
        if (!activeBranch) return false;

        // Block dragging Black pieces directly during White challenges
        if (game.game_over() || piece.search(/^b/) !== -1) return false;
    }

    function onDrop(source, target) {
        const targetStep = activeBranch.steps[currentStepIndex];

        // Execute localized simulation test on drop targets
        let moveCheck = game.move({
            from: source,
            to: target,
            promotion: 'q' 
        });

        // Block invalid standard physics moves entirely
        if (moveCheck === null) return 'snapback';

        // Check if user drop target execution string matches course requirements
        if (moveCheck.san !== targetStep.notation) {
            game.undo(); // Instantly revert model engine memory matrix states
            updateCoachUI("error", "Incorrect Move", `Not quite! Think about the goal: ${targetStep.explanation}. Try dragging a different piece!`);
            return 'snapback';
        }

        // --- SUCCESS TRACK: Move fits variation plan constraints ---
        updateCoachUI("success", "Excellent!", targetStep.explanation);
        appendHistoryMovePill(moveCheck.san, true);

        // Advance indices block to verify remaining variations length counts
        if (currentStepIndex < activeBranch.steps.length - 1) {
            currentStepIndex++;

            // Run black opponent immediate auto-responses
            setTimeout(() => {
                const blackStep = activeBranch.steps[currentStepIndex];
                const blackMove = game.move(blackStep.notation);
                
                board.position(game.fen());
                appendHistoryMovePill(blackMove.san, false);

                if (currentStepIndex < activeBranch.steps.length - 1) {
                    currentStepIndex++;
                    promptUserChallengeTurn();
                } else {
                    triggerCourseBranchSuccess();
                }
            }, 750);

        } else {
            triggerCourseBranchSuccess();
        }
    }

    function onSnapEnd() {
        board.position(game.fen());
    }

    // Initialize draggable active game board module framework
    board = Chessboard('interactiveChessboard', {
        position: game.fen(),
        draggable: true,
        onDragStart: onDragStart,
        onDrop: onDrop,
        onSnapEnd: onSnapEnd,
        pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png'
    });

    // Bypasses container computation scale bugs inside modern grid nodes
    setTimeout(() => { board.resize(); }, 150);

    // Render course line list navigation tracks
    function renderLineSelections() {
        actionGridHeader.textContent = "Select Your Training Line";
        variationsMenuBox.innerHTML = "";

        opening.branches.forEach(branch => {
            const btn = document.createElement("button");
            btn.className = "line-select-btn";
            btn.innerHTML = `${branch.id}) ${branch.title} <span style="float:right; font-size:0.75rem; color:var(--accent-primary);">${branch.type}</span>`;
            
            btn.addEventListener("click", () => {
                startInteractiveLineTraining(branch);
            });
            variationsMenuBox.appendChild(btn);
        });
    }

    function startInteractiveLineTraining(branch) {
        activeBranch = branch;
        currentStepIndex = 0;

        resetStateToOpeningBase();
        lessonViewTitle.textContent = `${opening.name} - Line: ${branch.title}`;

        // Verify who possesses first move order values
        if (branch.steps[0].move.startsWith("White") || !branch.steps[0].move.includes("...")) {
            promptUserChallengeTurn();
        } else {
            // Run automatic initial Black reply if variation tree dataset begins on Black's turn
            const botInitMove = game.move(branch.steps[0].notation);
            board.position(game.fen());
            appendHistoryMovePill(botInitMove.san, false);
            currentStepIndex = 1;
            promptUserChallengeTurn();
        }
    }

    function promptUserChallengeTurn() {
        const step = activeBranch.steps[currentStepIndex];
        updateCoachUI("guide", "Your Turn", `Play the move: **${step.notation}**. Challenge objective: ${step.explanation}`);

        variationsMenuBox.innerHTML = `
            <button id="cancelBranchBtn" class="back-action-btn" style="width:100%; text-align:center; padding:0.75rem;">
                🏳 Leave Training Line
            </button>
        `;
        document.getElementById("cancelBranchBtn").addEventListener("click", exitBranchTrainingMode);
    }

    function updateCoachUI(mode, statusText, speechMessage) {
        coachDisplayCard.classList.remove("success-flash", "error-flash");
        
        if (mode === "success") {
            coachDisplayCard.classList.add("success-flash");
            coachStatusField.style.color = "var(--accent-success)";
            coachFaceGraphic.textContent = "🎯";
        } else if (mode === "error") {
            coachDisplayCard.classList.add("error-flash");
            coachStatusField.style.color = "var(--accent-error)";
            coachFaceGraphic.textContent = "🤫";
        } else {
            coachStatusField.style.color = "var(--accent-primary)";
            coachFaceGraphic.textContent = "👨‍🏫";
        }

        coachStatusField.textContent = statusText;
        coachBubbleSpeech.innerHTML = speechMessage;
    }

    function triggerCourseBranchSuccess() {
        updateCoachUI("success", "Line Complete!", "Excellent technique! You successfully maintained target mastery parameters across this opening tree layout sequence variation.");
        
        variationsMenuBox.innerHTML = `
            <button id="finishBranchBtn" class="line-select-btn" style="text-align:center; border-color:var(--accent-success); color:var(--accent-success);">
                ✔ Chapter Challenge Cleared (Return to List)
            </button>
        `;
        document.getElementById("finishBranchBtn").addEventListener("click", exitBranchTrainingMode);
    }

    function appendHistoryMovePill(sanText, isUser) {
        const pill = document.createElement("span");
        pill.className = "move-pill active-pill";
        if (!isUser) {
            pill.style.borderColor = "var(--text-muted)";
            pill.style.color = "var(--text-muted)";
        }
        pill.textContent = sanText;
        movesPillFlow.appendChild(pill);
    }

    function refreshBaseMovePills() {
        movesPillFlow.innerHTML = "";
        opening.moves.forEach(m => {
            const pill = document.createElement("span");
            pill.className = "move-pill";
            pill.textContent = m;
            movesPillFlow.appendChild(pill);
        });
    }

    function resetStateToOpeningBase() {
        game.reset();
        cleanBaseMoves.forEach(m => game.move(m));
        board.position(game.fen());
        refreshBaseMovePills();
    }

    function exitBranchTrainingMode() {
        activeBranch = null;
        currentStepIndex = 0;
        resetStateToOpeningBase();

        lessonViewTitle.textContent = opening.name;
        updateCoachUI("guide", "GUIDE", opening.philosophy);
        renderLineSelections();
    }

    navHomeBtn.addEventListener("click", () => {
        window.location.href = "index.html";
    });

    // Execute list assembly load properties
    renderLineSelections();

    window.addEventListener('resize', () => {
        if (board) board.resize();
    });
});
