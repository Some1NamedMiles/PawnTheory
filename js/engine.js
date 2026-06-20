// js/engine.js
document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const openingKey = urlParams.get('opening');
    const opening = openingsData[openingKey];
    
    if (!opening) {
        window.location.href = 'index.html';
        return;
    }

    // Interactive Model Components
    let game = new Chess();
    let board = null;

    // Linear progression indices
    let activeBranch = opening.branches[0]; // Auto-load first course training line directly like Chessreps
    let currentStepIndex = 0;
    let cleanBaseMoves = [];

    // Form element lookups
    const courseSubTitleHeader = document.getElementById("courseSubTitleHeader");
    const coachSpeechBubbleBubble = document.getElementById("coachSpeechBubbleBubble");
    const navQuitBtn = document.getElementById("navQuitBtn");
    const hintActionBtn = document.getElementById("hintActionBtn");
    const prevLineStepBtn = document.getElementById("prevLineStepBtn");
    const nextLineStepBtn = document.getElementById("nextLineStepBtn");

    // Setup text values
    courseSubTitleHeader.textContent = `${opening.name} - ${activeBranch.title}`;

    // Disassemble starter base moves list configurations
    opening.moves.forEach(moveStr => {
        const parts = moveStr.split(" ").slice(1);
        parts.forEach(m => { if(m) cleanBaseMoves.push(m); });
    });

    // Fire baseline board rules alignment sets
    cleanBaseMoves.forEach(m => game.move(m));

    // Handle interactive turn-taking logic
    function onDragStart(source, piece, position, orientation) {
        if (game.game_over() || piece.search(/^b/) !== -1) return false;
    }

    function onDrop(source, target) {
        const currentTargetStep = activeBranch.steps[currentStepIndex];

        // Simulate move check validation criteria parameters
        let moveAttempt = game.move({
            from: source,
            to: target,
            promotion: 'q'
        });

        if (moveAttempt === null) return 'snapback';

        // Check if user's drag action matches step target string notation criteria
        if (moveAttempt.san !== currentTargetStep.notation) {
            game.undo();
            coachSpeechBubbleBubble.style.backgroundColor = "#fee2e2"; // Temporary red flash feedback overlay
            setTimeout(() => { coachSpeechBubbleBubble.style.backgroundColor = "#ffffff"; }, 300);
            coachSpeechBubbleBubble.textContent = `Not quite the target variation square! Try again. Goal: ${currentTargetStep.explanation}`;
            return 'snapback';
        }

        // --- SUCCESS TRACK ACTION EXECUTION ---
        coachSpeechBubbleBubble.style.backgroundColor = "#d1fae5"; // Temporary green successful flash overlay
        setTimeout(() => { coachSpeechBubbleBubble.style.backgroundColor = "#ffffff"; }, 300);
        coachSpeechBubbleBubble.textContent = currentTargetStep.explanation;

        // Progress onward down the variation tree roadmap index tracks
        if (currentStepIndex < activeBranch.steps.length - 1) {
            currentStepIndex++;

            // Run automated computer reply for Black
            setTimeout(() => {
                const autoBlackStep = activeBranch.steps[currentStepIndex];
                game.move(autoBlackStep.notation);
                board.position(game.fen());

                if (currentStepIndex < activeBranch.steps.length - 1) {
                    currentStepIndex++;
                    // Display next challenge instruction strings details parameters
                    coachSpeechBubbleBubble.textContent = activeBranch.steps[currentStepIndex].explanation;
                } else {
                    triggerBranchClearCelebration();
                }
            }, 900);
        } else {
            triggerBranchClearCelebration();
        }
    }

    function onSnapEnd() {
        board.position(game.fen());
    }

    // Mount interactive chessboard instances
    board = Chessboard('chessrepsBoard', {
        position: game.fen(),
        draggable: true,
        onDragStart: onDragStart,
        onDrop: onDrop,
        onSnapEnd: onSnapEnd,
        pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png'
    });

    // Populate initial prompt speech text strings elements explicitly on load execution frames
    if (activeBranch && activeBranch.steps[currentStepIndex]) {
        coachSpeechBubbleBubble.textContent = activeBranch.steps[currentStepIndex].explanation;
    }

    function triggerBranchClearCelebration() {
        coachSpeechBubbleBubble.textContent = "🎉 Horizon Track Cleared! You've successfully completed this course module segment branch loop challenge!";
    }

    // Configure auxiliary side button controls actions handlers
    hintActionBtn.addEventListener("click", () => {
        if (activeBranch && activeBranch.steps[currentStepIndex]) {
            const nextTargetNotation = activeBranch.steps[currentStepIndex].notation;
            alert(`Hint: The target move notation strategy requires you to play: ${nextTargetNotation}`);
        }
    });

    navQuitBtn.addEventListener("click", () => {
        window.location.href = "index.html";
    });

    // Optional directional debug button handles
    prevLineStepBtn.addEventListener("click", () => {
        if (currentStepIndex > 0) {
            currentStepIndex--;
            coachSpeechBubbleBubble.textContent = activeBranch.steps[currentStepIndex].explanation;
        }
    });

    nextLineStepBtn.addEventListener("click", () => {
        if (currentStepIndex < activeBranch.steps.length - 1) {
            currentStepIndex++;
            coachSpeechBubbleBubble.textContent = activeBranch.steps[currentStepIndex].explanation;
        }
    });

    window.addEventListener('resize', () => {
        if (board) board.resize();
    });
});
