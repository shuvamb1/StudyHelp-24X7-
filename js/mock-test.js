(function() {
    'use strict';

    const API_BASE_URL = window.API_BASE_URL || 'http://localhost:5000';
    const token = localStorage.getItem('token');

    // Screens
    const selectionScreen = document.getElementById('selection-screen');
    const instructionsScreen = document.getElementById('instructions-screen');
    const testScreen = document.getElementById('test-screen');
    const resultsScreen = document.getElementById('results-screen');
    const blurOverlay = document.getElementById('blur-overlay');
    const tabWarningOverlay = document.getElementById('tab-warning-overlay');

    // State
    let papers = [];
    let currentPaper = null;
    let testId = null;
    let questions = [];
    let currentQuestionIndex = 0;
    let answers = {};
    let timerInterval = null;
    let secondsLeft = 0;
    let testActive = false;
    let blurCount = 0;
    const MAX_BLUR = 3;

    // ====== LOAD PAPERS ======
    async function fetchPapers() {
        const loading = document.getElementById('papers-loading');
        const grid = document.getElementById('papers-grid');
        const noPapers = document.getElementById('no-papers');

        try {
            const res = await fetch(`${API_BASE_URL}/api/mock-tests/papers`, {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            if (!res.ok) throw new Error('Failed to load');
            papers = await res.json();

            loading.style.display = 'none';
            if (!papers.length) {
                grid.innerHTML = '';
                noPapers.style.display = 'block';
                return;
            }
            noPapers.style.display = 'none';

            grid.innerHTML = papers.map(paper => {
                const pdfCount = (paper.pdfFiles && paper.pdfFiles.length) || (paper.pdfUrl ? 1 : 0);
                const hasPDFs = pdfCount > 0;
                return `
                <div class="paper-card ${hasPDFs ? '' : 'paper-card-disabled'}">
                    <div class="paper-card-header">
                        <div class="paper-title">${escapeHtml(paper.title)}</div>
                        <span class="paper-badge">${escapeHtml(paper.department)}</span>
                    </div>
                    <div class="paper-meta">
                        <span><i class="fas fa-book"></i> ${escapeHtml(paper.subject)}</span>
                        <span><i class="fas fa-calendar"></i> ${escapeHtml(paper.semester)}</span>
                        <span><i class="fas fa-graduation-cap"></i> ${escapeHtml(paper.year || 'N/A')}</span>
                        <span><i class="fas fa-file-pdf"></i> ${pdfCount} PYQ PDF(s)</span>
                    </div>
                    <div class="paper-stats">
                        <div class="paper-stat">
                            <div class="paper-stat-value">${pdfCount}</div>
                            <div class="paper-stat-label">PYQs</div>
                        </div>
                    </div>
                    ${hasPDFs ? '' : '<div style="margin-top:12px; padding:8px 12px; background:#fef3c7; border-radius:6px; font-size:0.8rem; color:#92400e; text-align:center;"><i class="fas fa-clock"></i> Questions coming soon</div>'}
                </div>
            `;
            }).join('');

            grid.querySelectorAll('.paper-card').forEach((card, index) => {
                const paper = papers[index];
                const pdfCount = (paper.pdfFiles && paper.pdfFiles.length) || (paper.pdfUrl ? 1 : 0);
                if (pdfCount > 0) {
                    card.style.cursor = 'pointer';
                    card.addEventListener('click', () => showConfigureScreen(paper));
                }
            });
        } catch (err) {
            loading.innerHTML = '<p class="text-danger">Failed to load papers. Please try again.</p>';
        }
    }

    // ====== CONFIGURE TEST (marks & duration) ======
    function showConfigureScreen(paper) {
        currentPaper = paper;
        selectionScreen.style.display = 'none';
        instructionsScreen.style.display = 'block';
        window.scrollTo(0, 0);

        document.getElementById('inst-paper-title').textContent = paper.title;
        document.getElementById('inst-paper-subject').textContent = paper.subject || '';
        document.getElementById('inst-paper-dept').textContent = paper.department || '';
        document.getElementById('inst-paper-sem').textContent = paper.semester || '';
        document.getElementById('inst-paper-pdfs').textContent = ((paper.pdfFiles && paper.pdfFiles.length) || (paper.pdfUrl ? 1 : 0)) + ' PYQ PDF(s)';

        // Reset inputs
        document.getElementById('test-marks').value = '30';
        document.getElementById('test-duration').value = '60';

        // Update button handler
        const startBtn = document.getElementById('start-test-btn');
        startBtn.onclick = () => generateAndStartTest();
    }

    // ====== GENERATE & START TEST ======
    async function generateAndStartTest() {
        const marks = Number(document.getElementById('test-marks').value) || 30;
        const duration = Number(document.getElementById('test-duration').value) || 60;
        const btn = document.getElementById('start-test-btn');

        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating Questions with AI...';

        try {
            const res = await fetch(`${API_BASE_URL}/api/mock-tests/${currentPaper._id}/start`, {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ marks, duration })
            });
            const data = await res.json();

            if (!res.ok) {
                alert(data.error || 'Failed to generate questions. Please try again.');
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-play"></i> Generate & Start Test';
                return;
            }

            testId = data.testId;
            questions = data.questions;
            secondsLeft = data.duration * 60;

            // Update test header
            document.getElementById('test-paper-title').textContent = data.paper.title;
            document.getElementById('test-timer').textContent = formatTime(secondsLeft);
            document.getElementById('test-progress').textContent = `Question 1 of ${questions.length}`;

            // Build nav grid
            const navGrid = document.getElementById('question-nav-grid');
            navGrid.innerHTML = questions.map((_, i) =>
                `<button class="q-nav-btn ${i === 0 ? 'active' : ''}" data-index="${i}" onclick="window.goToQuestion(${i})">${i + 1}</button>`
            ).join('');

            // Show test screen
            instructionsScreen.style.display = 'none';
            testScreen.style.display = 'block';
            document.body.style.overflow = 'hidden';
            testActive = true;
            blurCount = 0;

            // Start timer
            timerInterval = setInterval(() => {
                secondsLeft--;
                const timerEl = document.getElementById('test-timer');
                timerEl.textContent = formatTime(secondsLeft);
                if (secondsLeft <= 300) timerEl.classList.add('warning');
                if (secondsLeft <= 60) timerEl.classList.add('danger');
                if (secondsLeft <= 0) { clearInterval(timerInterval); submitTest(); }
            }, 1000);

            renderQuestion(0);
            attachAntiCheat();

        } catch (err) {
            console.error(err);
            alert('Server error. Please try again.');
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-play"></i> Generate & Start Test';
        }
    }

    // ====== RENDER QUESTION ======
    function renderQuestion(index) {
        currentQuestionIndex = index;
        const q = questions[index];
        document.getElementById('q-number').textContent = `Question ${index + 1} of ${questions.length}`;
        document.getElementById('q-text').textContent = q.question;
        document.getElementById('test-progress').textContent = `Question ${index + 1} of ${questions.length}`;

        const optionsContainer = document.getElementById('q-options');
        optionsContainer.innerHTML = q.options.map((opt, i) => `
            <label class="option-item ${answers[index] === i ? 'selected' : ''}" onclick="window.selectOption(${index}, ${i})">
                <input type="radio" name="q${index}" value="${i}" ${answers[index] === i ? 'checked' : ''}>
                <span>${escapeHtml(opt)}</span>
            </label>
        `).join('');

        document.getElementById('btn-prev').disabled = index === 0;
        document.getElementById('btn-next').innerHTML = index === questions.length - 1
            ? 'Submit <i class="fas fa-check-circle"></i>'
            : 'Next <i class="fas fa-chevron-right"></i>';

        // Update nav
        document.querySelectorAll('.q-nav-btn').forEach(btn => {
            btn.classList.remove('active', 'current');
            const btnIndex = parseInt(btn.dataset.index);
            if (btnIndex === index) btn.classList.add('active', 'current');
            if (answers[btnIndex] !== undefined) btn.classList.add('answered');
        });
    }

    // ====== NAVIGATION ======
    window.goToQuestion = function(index) {
        if (index >= 0 && index < questions.length) renderQuestion(index);
    };

    window.selectOption = function(qIndex, optionIndex) {
        answers[qIndex] = optionIndex;
        renderQuestion(qIndex);
    };

    window.prevQuestion = function() {
        if (currentQuestionIndex > 0) renderQuestion(currentQuestionIndex - 1);
    };

    window.nextQuestion = function() {
        if (currentQuestionIndex < questions.length - 1) {
            renderQuestion(currentQuestionIndex + 1);
        } else {
            confirmSubmit();
        }
    };

    window.confirmSubmit = function() {
        const answered = Object.keys(answers).length;
        const total = questions.length;
        if (answered < total) {
            if (!confirm(`You have answered ${answered} of ${total} questions. Are you sure you want to submit?`)) return;
        } else {
            if (!confirm('Are you sure you want to submit the test?')) return;
        }
        submitTest();
    };

    // ====== SUBMIT TEST ======
    async function submitTest() {
        if (!testActive) return;
        testActive = false;
        clearInterval(timerInterval);
        detachAntiCheat();

        const timeTaken = Math.round((currentPaper.duration || 60) * 60 - secondsLeft);
        const formattedAnswers = Object.entries(answers).map(([qId, opt]) => ({
            questionId: parseInt(qId),
            selectedOption: opt
        }));

        try {
            const res = await fetch(`${API_BASE_URL}/api/mock-tests/${currentPaper._id}/submit`, {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    testId,
                    answers: formattedAnswers,
                    timeTaken
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Submit failed');
            showResults(data);
        } catch (err) {
            alert('Error submitting test: ' + err.message);
            showSelectionScreen();
        }
    }

    // ====== SHOW RESULTS ======
    function showResults(data) {
        testScreen.style.display = 'none';
        document.body.style.overflow = '';
        resultsScreen.style.display = 'block';
        window.scrollTo(0, 0);

        document.getElementById('result-paper-title').textContent = currentPaper.title;
        document.getElementById('score-value').textContent = data.percentage + '%';
        document.getElementById('score-circle').style.setProperty('--score-deg', (data.percentage * 3.6) + 'deg');
        document.getElementById('stat-correct').textContent = data.correctCount;
        document.getElementById('stat-wrong').textContent = data.wrongCount;
        document.getElementById('stat-unanswered').textContent = data.unansweredCount;
        document.getElementById('stat-score').textContent = data.score;

        const container = document.getElementById('detailed-results');
        container.innerHTML = data.detailedResults.map((r, i) => {
            const status = r.isCorrect ? 'correct' : (r.selectedOption === undefined || r.selectedOption === null ? 'unanswered' : 'wrong');
            const statusText = r.isCorrect ? 'Correct' : (r.selectedOption === undefined || r.selectedOption === null ? 'Unanswered' : 'Wrong');
            return `
            <div class="result-question">
                <div class="result-question-header">
                    <strong>Q${i + 1}.</strong> ${escapeHtml(r.question)}
                    <span class="result-status ${status}">${statusText}</span>
                </div>
                <div style="margin-bottom: 8px;">
                    ${r.options.map((opt, idx) => {
                        let cls = '';
                        if (idx === r.correctAnswer) cls = 'correct-ans';
                        else if (idx === r.selectedOption && !r.isCorrect) cls = 'wrong-ans';
                        return `<div class="result-option ${cls}">${String.fromCharCode(65 + idx)}. ${escapeHtml(opt)}</div>`;
                    }).join('')}
                </div>
                <div style="font-size: 0.85rem; color: var(--text-muted);">
                    Marks: ${r.isCorrect ? '+' + r.marks : '0'} / ${r.marks}
                </div>
            </div>
            `;
        }).join('');
    }

    // ====== SCREEN MANAGEMENT ======
    window.showSelectionScreen = function() {
        selectionScreen.style.display = 'block';
        instructionsScreen.style.display = 'none';
        testScreen.style.display = 'none';
        resultsScreen.style.display = 'none';
        document.body.style.overflow = '';
        testActive = false;
        clearInterval(timerInterval);
        detachAntiCheat();
        answers = {};
        questions = [];
        testId = null;
        currentQuestionIndex = 0;
        fetchPapers();
    };

    window.showInstructions = function(paperId) {
        // Legacy handler - redirect to configure screen
        const paper = papers.find(p => p._id === paperId);
        if (paper) showConfigureScreen(paper);
    };

    window.downloadResult = function() {
        const content = document.getElementById('results-screen').innerText;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `MockTest_Result_${currentPaper.title.replace(/\s+/g, '_')}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // ====== ANTI-CHEAT ======
    function attachAntiCheat() {
        document.addEventListener('visibilitychange', handleVisibilityChange);
        document.addEventListener('fullscreenchange', handleFullscreenChange);
    }

    function detachAntiCheat() {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }

    function handleVisibilityChange() {
        if (!testActive) return;
        if (document.hidden) {
            blurCount++;
            if (blurCount >= MAX_BLUR) {
                tabWarningOverlay.style.display = 'flex';
                setTimeout(() => submitTest(), 2000);
            } else {
                blurOverlay.style.display = 'flex';
            }
        } else {
            blurOverlay.style.display = 'none';
        }
    }

    function handleFullscreenChange() {
        if (!testActive) return;
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
        }
    }

    // ====== UTILS ======
    function formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ====== PAST RESULTS ======
    async function fetchPastResults() {
        const list = document.getElementById('past-results-list');
        try {
            const res = await fetch(`${API_BASE_URL}/api/mock-tests/results`, {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            if (!res.ok) throw new Error('Failed');
            const results = await res.json();

            if (!results.length) {
                list.innerHTML = '<p class="text-muted" style="text-align: center; padding: 30px;">No past results yet. Take a test to see your results here!</p>';
                return;
            }

            list.innerHTML = results.map(r => {
                const paper = r.paperId || {};
                const date = new Date(r.completedAt).toLocaleDateString();
                const percentage = r.totalMarks > 0 ? ((r.score / r.totalMarks) * 100).toFixed(1) : 0;
                return `
                <div style="background: white; border-radius: 12px; padding: 20px; border: 1px solid #E2E8F0; margin-bottom: 15px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <div>
                            <div style="font-weight: 700; color: var(--text-dark);">${escapeHtml(paper.title || 'Unknown')}</div>
                            <div style="font-size: 0.85rem; color: var(--text-muted);">${escapeHtml(paper.subject || '')} · ${date}</div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 1.5rem; font-weight: 800; color: var(--primary-color);">${percentage}%</div>
                            <div style="font-size: 0.8rem; color: var(--text-muted);">${r.score}/${r.totalMarks} marks</div>
                        </div>
                    </div>
                    <div style="display: flex; gap: 15px; font-size: 0.85rem;">
                        <span style="color: #22c55e;"><i class="fas fa-check-circle"></i> ${r.correctCount} Correct</span>
                        <span style="color: #dc2626;"><i class="fas fa-times-circle"></i> ${r.wrongCount} Wrong</span>
                        <span style="color: #6b7280;"><i class="fas fa-minus-circle"></i> ${r.unansweredCount} Unanswered</span>
                    </div>
                </div>
                `;
            }).join('');
        } catch (err) {
            list.innerHTML = '<p class="text-muted" style="text-align: center; padding: 30px;">Could not load past results.</p>';
        }
    }

    // ====== INIT ======
    document.addEventListener('DOMContentLoaded', () => {
        if (!token) {
            window.location.href = 'login.html';
            return;
        }
        fetchPapers();
        fetchPastResults();
    });
})();
