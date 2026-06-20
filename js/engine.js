// js/engine.js
document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const openingKey = urlParams.get('opening');
    const opening = openingsData[openingKey];
    
    if (!opening) {
        window.location.href = 'index.html';
        return;
    }

    // Core Chess Engine - MUST start completely empty/fresh for Move 1
    let game = new Chess(); 
    let board = null;

    let activeBranch = opening.branches[0]; 
    let currentStepIndex = 0;
    let fullLessonSteps = [];

    // UI elements
    const courseSubTitleHeader = document.getElementById("courseSubTitleHeader");
    const coachSpeechBubbleBubble = document.getElementById("coachSpeechBubbleBubble");
    const learningProgressBarFill = document.getElementById("learningProgressBarFill");
    const navQuitBtn = document.getElementById("navQuitBtn");
    const hintActionBtn = document.getElementById("hintActionBtn");

    courseSubTitleHeader.textContent = opening.name;

    // --- PARSE ENTIRE LINE FROM MOVE 1 ---
    // Extract base opening moves dynamically
    opening.moves.forEach(moveStr => {
        const parts = moveStr.split(" ").slice(1);
        if (parts[0]) {
            fullLessonSteps.push({ notation: parts[0], turn: 'w', explanation: `Let's learn the ${opening.name}. Start by playing **${parts[0]}**.` });
        }
        if (parts[1]) {
            fullLessonSteps.push({ notation: parts[1], turn: 'b', explanation: `Black plays **${parts[1]}**. Watch the board.` });
        }
    });

    // Append the branch continuation onto the step sequence
    activeBranch.steps.forEach(step => {
        let side = step.move.startsWith("White") ? 'w' : 'b';
        fullLessonSteps.push({
            notation: step.notation,
            turn: side,
            explanation: step.explanation
        });
    });

    // Drag constraints: only allow dragging the color whose turn it actually is
    function onDragStart(source, piece, position, orientation) {
        if (game.game_over()) return false;

        const currentTask = fullLessonSteps[currentStepIndex];
        if (!currentTask) return false;

        // Block dragging Black pieces on White's turn, and vice-versa
        if (currentTask.turn === 'w' && piece.search(/^b/) !== -1) return false;
        if (currentTask.turn === 'b' && piece.search(/^w/) !== -1) return false;
    }

    function onDrop(source, target) {
        const currentTask = fullLessonSteps[currentStepIndex];
        if (!currentTask) return 'snapback';

        // Test if the move is legal
        let moveAttempt = game.move({
            from: source,
            to: target,
            promotion: 'q'
        });

        if (moveAttempt === null) return 'snapback';

        // Verify if it matches the lesson notation string
        if (moveAttempt.san !== currentTask.notation) {
            game.undo(); // Revert logic state immediately
            coachSpeechBubbleBubble.textContent = `Not quite! Try another square. We want to play ${currentTask.notation}.`;
            return 'snapback';
        }

        // Move is correct! Highlight squares
        clearSquareHighlights();
        highlightBoardSquares(source, target);
        
        currentStepIndex++;
        updateProgressIndicatorBar();

        checkForNextSegment();
    }

    function checkForNextSegment() {
        if (currentStepIndex >= fullLessonSteps.length) {
            triggerCourseLineCleared();
            return;
        }

        const nextTask = fullLessonSteps[currentStepIndex];
        coachSpeechBubbleBubble.innerHTML = nextTask.explanation;

        // If the next move belongs to Black (Computer), execute it automatically
        if (nextTask.turn === 'b') {
            setTimeout(() => {
                let autoMove = game.move(nextTask.notation);
                board.position(game.fen());
                
                clearSquareHighlights();
                if (autoMove) highlightBoardSquares(autoMove.from, autoMove.to);

                currentStepIndex++;
                updateProgressIndicatorBar();

                // Look ahead to hand control back to user or finish line
                checkForNextSegment();
            }, 800);
        }
    }

    function onSnapEnd() {
        board.position(game.fen());
    }

    // Initialize Chessboard at the true 8x8 game starting position
    board = Chessboard('chessrepsBoard', {
        position: 'start', 
        draggable: true,
        onDragStart: onDragStart,
        onDrop: onDrop,
        onSnapEnd: onSnapEnd,
        pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png'
    });

    // Run layout initialization check
    if (fullLessonSteps[currentStepIndex]) {
        coachSpeechBubbleBubble.innerHTML = fullLessonSteps[currentStepIndex].explanation;
        // Handle edge case: if the first move of the whole file data happens to be Black
        if (fullLessonSteps[currentStepIndex].turn === 'b') {
            checkForNextSegment();
        }
    }

    function highlightBoardSquares(fromSquare, toSquare) {
        $('#chessrepsBoard .square-' + fromSquare).addClass('highlight-yellow');
        $('#chessrepsBoard .square-' + toSquare).addClass('highlight-yellow');
    }

    function clearSquareHighlights() {
        $('#chessrepsBoard div').removeClass('highlight-yellow');
    }

    function updateProgressIndicatorBar() {
        let percentage = (currentStepIndex / fullLessonSteps.length) * 100;
        learningProgressBarFill.style.width = `${percentage}%`;
    }

    function triggerCourseLineCleared() {
        coachSpeechBubbleBubble.innerHTML = "🎉 <strong>Line Discovered!</strong> You've completed this variation track flawlessly from the starting position.";
    }

    hintActionBtn.addEventListener("click", () => {
        if (fullLessonSteps[currentStepIndex]) {
            alert(`Hint: Look for the move "${fullLessonSteps[currentStepIndex].notation}"`);
        }
    });

    navQuitBtn.addEventListener("click", () => {
        window.location.href = "index.html";
    });

    window.addEventListener('resize', () => {
        if (board) board.resize();
    });
});
