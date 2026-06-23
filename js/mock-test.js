document.addEventListener('DOMContentLoaded', () => {
    // ========== STATE ==========
    let papers = [];
    let currentPaper = null;
    let questions = [];
    let userAnswers = {}; // questionId -> selectedOptionIndex
    let currentQuestionIndex = 0;
    let timerInterval = null;
    let timeRemaining = 0;
    let testSubmitted = false;
    let tabSwitchCount = 0;
    const MAX_TAB_SWITCHES = 2;
    let testResult = null;

    // ========== DOM ELEMENTS ==========
    const selectionScreen = document.getElementById('selection-screen');
    const instructionsScreen = document.getElementById('instructions-screen');
    const testScreen = document.getElementById('test-screen');
    const resultsScreen = document.getElementById('results-screen');
    const mainHeader = document.getElementById('main-header');
    const mainFooter = document.getElementById('main-footer');
    const mainContent = document.getElementById('main-content');
    const blurOverlay = document.getElementById('blur-overlay');
    const tabWarningOverlay = document.getElementById('tab-warning-overlay');

    // ========== AUTH CHECK ==========
    if (!localStorage.getItem('token')) {
        window.location.href = 'login.html?redirect=mock-test.html';
        return;
    }

    const token = localStorage.getItem('token');

    // ========== LOAD PAPERS ==========
    async function loadPapers() {
        const grid = document.getElementById('papers-grid');
        const loading = document.getElementById('papers-loading');
        const noPapers = document.getElementById('no-papers');

        try {
            const res = await fetch(`${API_BASE_URL}/api/mock-tests/papers`, {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            if (!res.ok) throw new Error('Failed to load papers');
            papers = await res.json();

            loading.style.display = 'none';

            if (papers.length === 0) {
                noPapers.style.display = 'block';
                grid.innerHTML = '';
                return;
            }

            noPapers.style.display = 'none';
            grid.innerHTML = papers.map(paper => {
                const hasQuestions = (paper.totalQuestions || 0) > 0;
                return `
                <div class="paper-card ${hasQuestions ? '' : 'paper-card-disabled'}">
                    <div class="paper-card-header">
                        <div class="paper-title">${escapeHtml(paper.title)}</div>
                        <span class="paper-badge">${escapeHtml(paper.department)}</span>
                    </div>
                    <div class="paper-meta">
                        <span><i class="fas fa-book"></i> ${escapeHtml(paper.subject)}</span>
                        <span><i class="fas fa-calendar"></i> ${escapeHtml(paper.semester)}</span>
                        <span><i class="fas fa-graduation-cap"></i> ${escapeHtml(paper.year || 'N/A')}</span>
                    </div>
                    <div class="paper-stats">
                        <div class="paper-stat">
                            <div class="paper-stat-value">${paper.totalQuestions || 0}</div>
                            <div class="paper-stat-label">Questions</div>
                        </div>
                        <div class="paper-stat">
                            <div class="paper-stat-value">${paper.totalMarks || 0}</div>
                            <div class="paper-stat-label">Marks</div>
                        </div>
                        <div class="paper-stat">
                            <div class="paper-stat-value">${paper.duration || 60}</div>
                            <div class="paper-stat-label">Minutes</div>
                        </div>
                    </div>
                    ${hasQuestions ? '' : '<div style="margin-top:12px; padding:8px 12px; background:#fef3c7; border-radius:6px; font-size:0.8rem; color:#92400e; text-align:center;"><i class="fas fa-clock"></i> Questions coming soon</div>'}
                </div>
            `;
            }).join('');

            // Attach click handlers only to cards with questions
            grid.querySelectorAll('.paper-card').forEach((card, index) => {
                if ((papers[index].totalQuestions || 0) > 0) {
                    card.style.cursor = 'pointer';
                    card.addEventListener('click', () => {
                        window.showInstructions(papers[index]._id);
                    });
                }
            });
        } catch (err) {
            console.error(err);
            loading.innerHTML = '<p style="color: #dc2626;">Failed to load papers. Please try again.</p>';
        }
    }

    // ========== SHOW INSTRUCTIONS ==========
    window.showInstructions = function(paperId) {
        currentPaper = papers.find(p => p._id === paperId);
        if (!currentPaper) return;
        if ((currentPaper.totalQuestions || 0) === 0) {
            alert('This paper does not have any questions yet. Please check back later.');
            return;
        }

        document.getElementById('inst-paper-title').textContent = currentPaper.title;
        document.getElementById('inst-questions').textContent = currentPaper.totalQuestions || 0;
        document.getElementById('inst-marks').textContent = currentPaper.totalMarks || 0;
        document.getElementById('inst-duration').textContent = currentPaper.duration || 60;

        selectionScreen.style.display = 'none';
        instructionsScreen.style.display = 'block';
        window.scrollTo(0, 0);
    };

    window.showSelectionScreen = function() {
        clearInterval(timerInterval);
        testSubmitted = false;
        userAnswers = {};
        currentQuestionIndex = 0;
        tabSwitchCount = 0;
        questions = [];
        currentPaper = null;

        instructionsScreen.style.display = 'none';
        testScreen.style.display = 'none';
        resultsScreen.style.display = 'none';
        selectionScreen.style.display = 'block';
        mainHeader.style.display = '';
        mainFooter.style.display = '';
        mainContent.style.padding = '';

        document.body.style.overflow = '';
        blurOverlay.style.display = 'none';
        tabWarningOverlay.style.display = 'none';

        removeAntiCheatListeners();
        loadPapers();
        loadPastResults();
    };

    // ========== START TEST ==========
    window.startTest = async function() {
        if (!currentPaper) return;

        document.getElementById('start-test-btn').disabled = true;
        document.getElementById('start-test-btn').innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';

        try {
            const res = await fetch(`${API_BASE_URL}/api/mock-tests/${currentPaper._id}/questions`, {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            if (!res.ok) throw new Error('Failed to load questions');
            const data = await res.json();
            questions = data.questions || [];

            if (questions.length === 0) {
                alert('No questions available for this paper yet.');
                document.getElementById('start-test-btn').disabled = false;
                document.getElementById('start-test-btn').innerHTML = '<i class="fas fa-play"></i> Start Test';
                return;
            }

            instructionsScreen.style.display = 'none';
            testScreen.style.display = 'block';
            mainHeader.style.display = 'none';
            mainFooter.style.display = 'none';
            mainContent.style.padding = '0';
            document.body.style.overflow = 'hidden';

            document.getElementById('test-paper-title').textContent = currentPaper.title;
            timeRemaining = (currentPaper.duration || 60) * 60;
            testSubmitted = false;
            userAnswers = {};
            currentQuestionIndex = 0;
            tabSwitchCount = 0;

            buildQuestionNav();
            showQuestion(0);
            startTimer();
            setupAntiCheat();

            // Attempt fullscreen
            requestFullscreen();
        } catch (err) {
            console.error(err);
            alert('Failed to start test. Please try again.');
            document.getElementById('start-test-btn').disabled = false;
            document.getElementById('start-test-btn').innerHTML = '<i class="fas fa-play"></i> Start Test';
        }
    };

    // ========== QUESTION NAVIGATION ==========
    function buildQuestionNav() {
        const grid = document.getElementById('question-nav-grid');
        grid.innerHTML = questions.map((_, i) => `
            <button class="q-nav-btn" id="q-nav-${i}" onclick="window.jumpToQuestion(${i})">${i + 1}</button>
        `).join('');
    }

    function updateQuestionNav() {
        questions.forEach((_, i) => {
            const btn = document.getElementById(`q-nav-${i}`);
            if (!btn) return;
            btn.className = 'q-nav-btn';
            if (i === currentQuestionIndex) btn.classList.add('current');
            const qId = questions[i]._id;
            if (userAnswers[qId] !== undefined) btn.classList.add('answered');
        });
    }

    function showQuestion(index) {
        if (index < 0 || index >= questions.length) return;
        currentQuestionIndex = index;

        const q = questions[index];
        document.getElementById('q-number').textContent = `Question ${index + 1} of ${questions.length}`;
        document.getElementById('q-text').textContent = q.question;
        document.getElementById('test-progress').textContent = `Question ${index + 1} of ${questions.length}`;

        const optionsContainer = document.getElementById('q-options');
        optionsContainer.innerHTML = q.options.map((opt, optIdx) => `
            <label class="option-item ${userAnswers[q._id] === optIdx ? 'selected' : ''}" onclick="window.selectOption('${q._id}', ${optIdx})">
                <input type="radio" name="q-${q._id}" value="${optIdx}" ${userAnswers[q._id] === optIdx ? 'checked' : ''}>
                <span>${escapeHtml(opt)}</span>
            </label>
        `).join('');

        document.getElementById('btn-prev').disabled = index === 0;
        document.getElementById('btn-next').innerHTML = index === questions.length - 1
            ? 'Submit <i class="fas fa-check-circle"></i>'
            : 'Next <i class="fas fa-chevron-right"></i>';

        updateQuestionNav();
    }

    window.selectOption = function(questionId, optionIndex) {
        userAnswers[questionId] = optionIndex;
        // Re-render to show selected state
        const options = document.querySelectorAll('.option-item');
        options.forEach((el, i) => {
            el.classList.toggle('selected', i === optionIndex);
            const radio = el.querySelector('input[type="radio"]');
            if (radio) radio.checked = (i === optionIndex);
        });
        updateQuestionNav();
    };

    window.jumpToQuestion = function(index) {
        showQuestion(index);
    };

    window.nextQuestion = function() {
        if (currentQuestionIndex < questions.length - 1) {
            showQuestion(currentQuestionIndex + 1);
        } else {
            confirmSubmit();
        }
    };

    window.prevQuestion = function() {
        if (currentQuestionIndex > 0) {
            showQuestion(currentQuestionIndex - 1);
        }
    };

    // ========== TIMER ==========
    function startTimer() {
        clearInterval(timerInterval);
        updateTimerDisplay();
        timerInterval = setInterval(() => {
            timeRemaining--;
            updateTimerDisplay();
            if (timeRemaining <= 0) {
                clearInterval(timerInterval);
                autoSubmitTest();
            }
        }, 1000);
    }

    function updateTimerDisplay() {
        const mins = Math.floor(timeRemaining / 60);
        const secs = timeRemaining % 60;
        const el = document.getElementById('test-timer');
        el.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        el.classList.remove('warning', 'danger');
        if (timeRemaining <= 60) el.classList.add('danger');
        else if (timeRemaining <= 300) el.classList.add('warning');
    }

    // ========== SUBMIT TEST ==========
    window.confirmSubmit = function() {
        const answered = Object.keys(userAnswers).length;
        const total = questions.length;
        if (answered < total) {
            if (!confirm(`You have answered ${answered} of ${total} questions. Are you sure you want to submit?`)) return;
        } else {
            if (!confirm('Are you sure you want to submit the test?')) return;
        }
        submitTest();
    };

    function autoSubmitTest() {
        alert('Time is up! Your test is being submitted automatically.');
        submitTest();
    }

    async function submitTest() {
        if (testSubmitted) return;
        testSubmitted = true;
        clearInterval(timerInterval);
        removeAntiCheatListeners();
        exitFullscreen();

        const answers = Object.entries(userAnswers).map(([questionId, selectedOption]) => ({
            questionId,
            selectedOption
        }));

        const timeTaken = ((currentPaper.duration || 60) * 60) - timeRemaining;

        try {
            const res = await fetch(`${API_BASE_URL}/api/mock-tests/${currentPaper._id}/submit`, {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ answers, timeTaken })
            });
            const result = await res.json();
            testResult = result;
            showResults(result);
        } catch (err) {
            console.error(err);
            alert('Failed to submit test. Please try again.');
            testSubmitted = false;
        }
    }

    // ========== SHOW RESULTS ==========
    function showResults(result) {
        testScreen.style.display = 'none';
        resultsScreen.style.display = 'block';
        mainHeader.style.display = '';
        mainFooter.style.display = '';
        mainContent.style.padding = '';
        document.body.style.overflow = '';

        document.getElementById('result-paper-title').textContent = currentPaper.title;
        document.getElementById('score-value').textContent = result.percentage + '%';
        document.getElementById('score-circle').style.setProperty('--score-deg', (result.percentage / 100 * 360) + 'deg');
        document.getElementById('stat-correct').textContent = result.correctCount;
        document.getElementById('stat-wrong').textContent = result.wrongCount;
        document.getElementById('stat-unanswered').textContent = result.unansweredCount;
        document.getElementById('stat-score').textContent = result.score + '/' + result.totalMarks;

        const detailedContainer = document.getElementById('detailed-results');
        detailedContainer.innerHTML = result.detailedResults.map((r, i) => {
            let statusClass = 'unanswered';
            let statusText = 'Not Answered';
            if (r.isCorrect) { statusClass = 'correct'; statusText = 'Correct'; }
            else if (r.selectedOption !== undefined && r.selectedOption !== null) { statusClass = 'wrong'; statusText = 'Wrong'; }

            return `
                <div class="result-question">
                    <div class="result-question-header">
                        <div><strong>Q${i + 1}.</strong> <span style="color: var(--text-muted); font-size: 0.85rem;">${escapeHtml(r.question.substring(0, 80))}${r.question.length > 80 ? '...' : ''}</span></div>
                        <span class="result-status ${statusClass}">${statusText}</span>
                    </div>
                    <div style="margin-top: 10px;">
                        ${r.options.map((opt, idx) => {
                            let cls = '';
                            if (idx === r.correctAnswer) cls = 'correct-ans';
                            else if (idx === r.selectedOption && idx !== r.correctAnswer) cls = 'wrong-ans';
                            const selectedIcon = idx === r.selectedOption ? '<i class="fas fa-check-circle"></i>' : '';
                            const correctIcon = idx === r.correctAnswer ? '<i class="fas fa-check"></i>' : '';
                            return `<div class="result-option ${cls}">${selectedIcon || correctIcon || '<i class="far fa-circle" style="opacity:0.3"></i>'} ${escapeHtml(opt)}</div>`;
                        }).join('')}
                    </div>
                    <div style="margin-top: 8px; font-size: 0.8rem; color: var(--text-muted);">
                        Marks: ${r.isCorrect ? '+' + r.marks : '0'} / ${r.marks}
                    </div>
                </div>
            `;
        }).join('');

        loadPastResults();
    }

    window.downloadResult = function() {
        if (!testResult || !currentPaper) return;
        const text = `
StudyHelp 24x7 - Mock Test Result
=================================
Paper: ${currentPaper.title}
Subject: ${currentPaper.subject}
Department: ${currentPaper.department}
Date: ${new Date().toLocaleString()}

Score: ${testResult.score} / ${testResult.totalMarks}
Percentage: ${testResult.percentage}%
Correct: ${testResult.correctCount}
Wrong: ${testResult.wrongCount}
Unanswered: ${testResult.unansweredCount}

Good luck with your exams!
        `.trim();
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `MockTest_Result_${currentPaper.title.replace(/\s+/g, '_')}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // ========== PAST RESULTS ==========
    async function loadPastResults() {
        const list = document.getElementById('past-results-list');
        try {
            const res = await fetch(`${API_BASE_URL}/api/mock-tests/results`, {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            if (!res.ok) throw new Error('Failed to load results');
            const results = await res.json();

            if (results.length === 0) {
                document.getElementById('past-results-section').style.display = 'none';
                return;
            }
            document.getElementById('past-results-section').style.display = 'block';

            list.innerHTML = results.map(r => {
                const paper = r.paperId || {};
                const pct = ((r.score / (r.totalMarks || 1)) * 100).toFixed(1);
                return `
                    <div style="background: white; border-radius: var(--border-radius); padding: 16px 20px; border: 1px solid #E2E8F0; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                        <div>
                            <div style="font-weight: 700; color: var(--text-dark);">${escapeHtml(paper.title || 'Unknown Paper')}</div>
                            <div style="font-size: 0.8rem; color: var(--text-muted);">${escapeHtml(paper.subject || '')} &bull; ${escapeHtml(paper.department || '')} &bull; ${new Date(r.completedAt).toLocaleDateString()}</div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-weight: 700; font-size: 1.2rem; color: ${pct >= 60 ? '#22c55e' : pct >= 40 ? '#f59e0b' : '#dc2626'};">${pct}%</div>
                            <div style="font-size: 0.75rem; color: var(--text-muted);">${r.score}/${r.totalMarks} &bull; ${Math.floor(r.timeTaken / 60)}m ${r.timeTaken % 60}s</div>
                        </div>
                    </div>
                `;
            }).join('');
        } catch (err) {
            console.error(err);
            document.getElementById('past-results-section').style.display = 'none';
        }
    }

    // ========== ANTI-CHEAT ==========
    let antiCheatListeners = [];

    function setupAntiCheat() {
        // Prevent right-click
        const contextMenuHandler = (e) => {
            if (testScreen.style.display === 'block') {
                e.preventDefault();
                return false;
            }
        };
        document.addEventListener('contextmenu', contextMenuHandler);
        antiCheatListeners.push(['contextmenu', contextMenuHandler, document]);

        // Prevent keyboard shortcuts
        const keydownHandler = (e) => {
            if (testScreen.style.display !== 'block') return;

            // Prevent copy/paste/cut
            if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C' || e.key === 'v' || e.key === 'V' || e.key === 'x' || e.key === 'X')) {
                e.preventDefault();
                return false;
            }
            // Prevent print
            if (e.key === 'PrintScreen' || (e.ctrlKey && e.key === 'p')) {
                e.preventDefault();
                return false;
            }
            // Prevent F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
            if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) || (e.ctrlKey && e.key === 'u')) {
                e.preventDefault();
                return false;
            }
            // Prevent Alt+Tab detection (best effort - not 100% reliable)
            if (e.key === 'Alt') {
                e.preventDefault();
            }
        };
        document.addEventListener('keydown', keydownHandler);
        antiCheatListeners.push(['keydown', keydownHandler, document]);

        // Prevent copy via selection
        const copyHandler = (e) => {
            if (testScreen.style.display === 'block') {
                e.preventDefault();
                return false;
            }
        };
        document.addEventListener('copy', copyHandler);
        antiCheatListeners.push(['copy', copyHandler, document]);

        document.addEventListener('cut', copyHandler);
        antiCheatListeners.push(['cut', copyHandler, document]);

        // Blur on focus loss
        const visibilityHandler = () => {
            if (testScreen.style.display !== 'block' || testSubmitted) return;
            if (document.hidden) {
                tabSwitchCount++;
                if (tabSwitchCount >= MAX_TAB_SWITCHES) {
                    showTabWarning();
                    submitTest();
                } else {
                    blurOverlay.style.display = 'flex';
                }
            } else {
                blurOverlay.style.display = 'none';
            }
        };
        document.addEventListener('visibilitychange', visibilityHandler);
        antiCheatListeners.push(['visibilitychange', visibilityHandler, document]);

        // Prevent window resize (possible multi-monitor setup)
        const resizeHandler = () => {
            if (testScreen.style.display === 'block' && !testSubmitted) {
                requestFullscreen();
            }
        };
        window.addEventListener('resize', resizeHandler);
        antiCheatListeners.push(['resize', resizeHandler, window]);

        // Prevent print screen via keyup
        const keyupHandler = (e) => {
            if (e.key === 'PrintScreen') {
                navigator.clipboard.writeText('Screenshots are not allowed during the test.');
            }
        };
        document.addEventListener('keyup', keyupHandler);
        antiCheatListeners.push(['keyup', keyupHandler, document]);
    }

    function removeAntiCheatListeners() {
        antiCheatListeners.forEach(([event, handler, target]) => {
            target.removeEventListener(event, handler);
        });
        antiCheatListeners = [];
    }

    function showTabWarning() {
        tabWarningOverlay.style.display = 'flex';
        testScreen.style.display = 'none';
        blurOverlay.style.display = 'none';
    }

    function requestFullscreen() {
        const el = document.documentElement;
        if (el.requestFullscreen) el.requestFullscreen();
        else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
        else if (el.msRequestFullscreen) el.msRequestFullscreen();
    }

    function exitFullscreen() {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        else if (document.msExitFullscreen) document.msExitFullscreen();
    }

    // ========== UTILS ==========
    function escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // ========== INIT ==========
    loadPapers();
    loadPastResults();
});
