(function() {
    'use strict';

    const API_BASE_URL = window.API_BASE_URL || 'http://localhost:5000';
    const token = localStorage.getItem('token');

    // Screens
    const selectionScreen = document.getElementById('selection-screen');
    const instructionsScreen = document.getElementById('instructions-screen');
    const testScreen = document.getElementById('test-screen');
    const resultsScreen = document.getElementById('results-screen');

    // State
    let exams = [];
    let currentExam = null;
    let testId = null;
    let questions = [];
    let currentQuestionIndex = 0;
    let answers = {};
    let timerInterval = null;
    let secondsLeft = 0;
    let testActive = false;

    // ====== LOAD EXAMS ======
    async function fetchExams() {
        const loading = document.getElementById('exams-loading');
        const grid = document.getElementById('exam-grid');
        const noExams = document.getElementById('no-exams');

        // Check auth
        if (!token) {
            loading.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <i class="fas fa-lock" style="font-size: 2rem; color: #f59e0b; margin-bottom: 15px; display: block;"></i>
                    <p style="color: #92400e; font-weight: 600;">Please log in to view competitive exams.</p>
                    <a href="login.html" class="btn btn-primary" style="margin-top: 15px;"><i class="fas fa-sign-in-alt"></i> Login</a>
                </div>
            `;
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/api/competitive-exams`, {
                headers: { 'Authorization': 'Bearer ' + token }
            });

            if (res.status === 401) {
                loading.innerHTML = `
                    <div style="text-align: center; padding: 40px;">
                        <i class="fas fa-lock" style="font-size: 2rem; color: #f59e0b; margin-bottom: 15px; display: block;"></i>
                        <p style="color: #92400e; font-weight: 600;">Session expired. Please log in again.</p>
                        <a href="login.html" class="btn btn-primary" style="margin-top: 15px;"><i class="fas fa-sign-in-alt"></i> Login</a>
                    </div>
                `;
                return;
            }

            if (!res.ok) {
                console.error('fetchExams HTTP error:', res.status, res.statusText);
                throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            }

            exams = await res.json();
            console.log('[Competitive Mock] Loaded exams:', exams);

            loading.style.display = 'none';
            if (!exams.length) {
                grid.innerHTML = '';
                noExams.style.display = 'block';
                return;
            }
            noExams.style.display = 'none';

            const examIcons = {
                'NEET': 'fa-heart-pulse',
                'JEE': 'fa-atom',
                'GATE': 'fa-microchip',
                'WBJEE': 'fa-graduation-cap'
            };
            const examDescs = {
                'NEET': 'National Eligibility cum Entrance Test for medical aspirants.',
                'JEE': 'Joint Entrance Examination for engineering admissions.',
                'GATE': 'Graduate Aptitude Test in Engineering for PG admissions.',
                'WBJEE': 'West Bengal Joint Entrance Examination for state engineering & medical colleges.'
            };

            grid.innerHTML = exams.map((exam, idx) => {
                const pyqCount = exam.pyqFiles ? exam.pyqFiles.length : 0;
                const syllabusCount = exam.syllabusFiles ? exam.syllabusFiles.length : 0;
                const hasContent = pyqCount > 0 || syllabusCount > 0 || exam.pyqText || exam.syllabusText;
                const iconClass = examIcons[exam.examName] || 'fa-book';
                return `
                <div class="exam-card ${hasContent ? '' : 'exam-card-disabled'}" data-idx="${idx}">
                    <div class="exam-icon"><i class="fas ${iconClass}"></i></div>
                    <div class="exam-name">${escapeHtml(exam.displayName || exam.examName)}</div>
                    <div class="exam-desc">${escapeHtml(examDescs[exam.examName] || '')}</div>
                    <button class="btn btn-primary ${hasContent ? '' : 'disabled'}" ${hasContent ? '' : 'disabled'} onclick="event.stopPropagation(); window.startTestForExam(${idx})">
                        <i class="fas fa-play"></i> ${hasContent ? 'Give Test' : 'Coming Soon'}
                    </button>
                </div>
            `;
            }).join('');

            grid.querySelectorAll('.exam-card').forEach((card, index) => {
                const exam = exams[index];
                const hasContent = (exam.pyqFiles && exam.pyqFiles.length > 0) || (exam.syllabusFiles && exam.syllabusFiles.length > 0) || exam.pyqText || exam.syllabusText;
                if (hasContent) {
                    card.addEventListener('click', () => showConfigureScreen(exam));
                }
            });
        } catch (err) {
            console.error('[Competitive Mock] fetchExams error:', err);
            loading.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <i class="fas fa-exclamation-circle" style="font-size: 2rem; color: #dc2626; margin-bottom: 15px; display: block;"></i>
                    <p style="color: #dc2626; font-weight: 600;">Failed to load exams.</p>
                    <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 8px;">${escapeHtml(err.message || 'Please check your connection and try again.')}</p>
                    <button class="btn btn-outline" onclick="window.location.reload()" style="margin-top: 15px;"><i class="fas fa-redo"></i> Retry</button>
                </div>
            `;
        }
    }

    // ====== CONFIGURE TEST ======
    function showConfigureScreen(exam) {
        currentExam = exam;
        selectionScreen.style.display = 'none';
        instructionsScreen.style.display = 'block';
        window.scrollTo(0, 0);

        document.getElementById('inst-exam-name').textContent = exam.displayName || exam.examName;
        document.getElementById('inst-exam-title').textContent = exam.displayName || exam.examName;
        document.getElementById('inst-exam-pyqs').textContent = (exam.pyqFiles ? exam.pyqFiles.length : 0) + ' PDF(s)';
        document.getElementById('inst-exam-syllabus').textContent = (exam.syllabusFiles ? exam.syllabusFiles.length : 0) + ' PDF(s)';

        document.getElementById('test-marks').value = exam.totalMarks || 300;
        document.getElementById('test-duration').value = exam.duration || 180;

        const startBtn = document.getElementById('start-test-btn');
        startBtn.onclick = () => generateAndStartTest();
    }

    // ====== GENERATE & START TEST ======
    async function generateAndStartTest() {
        if (!currentExam) {
            alert('Please select an exam first.');
            return;
        }
        const marks = Number(document.getElementById('test-marks').value) || 300;
        const duration = Number(document.getElementById('test-duration').value) || 180;
        const btn = document.getElementById('start-test-btn');

        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating questions...';
        answers = {};

        try {
            const res = await fetch(`${API_BASE_URL}/api/competitive-exams/${currentExam.examName}/start`, {
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

            document.getElementById('test-exam-title').textContent = data.examName;
            document.getElementById('test-timer').textContent = formatTime(secondsLeft);
            document.getElementById('test-progress').textContent = `Question 1 of ${questions.length}`;

            const navGrid = document.getElementById('question-nav-grid');
            navGrid.innerHTML = questions.map((_, i) =>
                `<button class="q-nav-btn ${i === 0 ? 'active' : ''}" data-index="${i}" onclick="window.goToQuestion(${i})">${i + 1}</button>`
            ).join('');

            instructionsScreen.style.display = 'none';
            testScreen.style.display = 'block';
            document.body.style.overflow = 'hidden';
            testActive = true;
            securityViolationShown = false;

            document.documentElement.requestFullscreen().catch(() => {});

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

            document.getElementById('blur-overlay').style.display = 'none';
            document.getElementById('tab-warning-overlay').style.display = 'none';
            document.getElementById('security-overlay').style.display = 'none';

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

        document.querySelectorAll('.q-nav-btn').forEach(btn => {
            btn.classList.remove('active', 'current');
            const btnIndex = parseInt(btn.dataset.index);
            if (btnIndex === index) btn.classList.add('active', 'current');
            if (isAnswered(btnIndex)) btn.classList.add('answered');
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

    function isAnswered(qIndex) {
        return answers[qIndex] !== undefined && answers[qIndex] !== null;
    }

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
        const answered = Object.keys(answers).filter(k => isAnswered(parseInt(k))).length;
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

        const timeTaken = Math.round((currentExam.duration || 180) * 60 - secondsLeft);
        const formattedAnswers = Object.entries(answers).map(([qId, val]) => ({
            questionId: parseInt(qId),
            selectedOption: val
        }));

        try {
            const res = await fetch(`${API_BASE_URL}/api/competitive-exams/${currentExam.examName}/submit`, {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ testId, answers: formattedAnswers, timeTaken })
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

        document.getElementById('blur-overlay').style.display = 'none';
        document.getElementById('tab-warning-overlay').style.display = 'none';
        document.getElementById('security-overlay').style.display = 'none';

        if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
        }

        document.getElementById('result-exam-name').textContent = currentExam.displayName || currentExam.examName;
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
                ${r.modelAnswer ? `<div style="background: #dcfce7; padding: 12px; border-radius: 8px; margin-bottom: 8px; border: 1px solid #22c55e;">
                    <strong style="color: #15803d;">Explanation:</strong><br>
                    <span style="color: #15803d;">${escapeHtml(r.modelAnswer)}</span>
                </div>` : ''}
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
        securityViolationShown = false;
        clearInterval(timerInterval);
        detachAntiCheat();

        document.getElementById('blur-overlay').style.display = 'none';
        document.getElementById('tab-warning-overlay').style.display = 'none';
        document.getElementById('security-overlay').style.display = 'none';

        if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
        }

        answers = {};
        questions = [];
        testId = null;
        currentQuestionIndex = 0;
        fetchExams();
    };

    window.startTestForExam = function(idx) {
        const exam = exams[idx];
        if (exam) showConfigureScreen(exam);
    };

    window.downloadResult = function() {
        const content = document.getElementById('results-screen').innerText;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `CompetitiveMockTest_${(currentExam.displayName || currentExam.examName).replace(/\s+/g, '_')}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // ====== ANTI-CHEAT ======
    let securityViolationShown = false;

    function submitOnViolation(reason) {
        if (!testActive || securityViolationShown) return;
        securityViolationShown = true;
        clearInterval(timerInterval);

        const overlay = document.getElementById('security-overlay');
        const msg = document.getElementById('security-msg');
        if (overlay && msg) {
            msg.textContent = reason;
            overlay.style.display = 'flex';
        }
        setTimeout(() => {
            if (testActive) submitTest();
        }, 1500);
    }

    function attachAntiCheat() {
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleWindowBlur);
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);
        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('copy', handleCopyCut);
        document.addEventListener('cut', handleCopyCut);
        document.addEventListener('dragstart', handleDrag);
        document.addEventListener('drag', handleDrag);
        document.addEventListener('selectstart', handleSelectStart);
        window.addEventListener('beforeprint', handleBeforePrint);
        window.addEventListener('beforeunload', handleBeforeUnload);
        trapBackButton();
    }

    function detachAntiCheat() {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('blur', handleWindowBlur);
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('keyup', handleKeyUp);
        document.removeEventListener('contextmenu', handleContextMenu);
        document.removeEventListener('mousedown', handleMouseDown);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('copy', handleCopyCut);
        document.removeEventListener('cut', handleCopyCut);
        document.removeEventListener('dragstart', handleDrag);
        document.removeEventListener('drag', handleDrag);
        document.removeEventListener('selectstart', handleSelectStart);
        window.removeEventListener('beforeprint', handleBeforePrint);
        window.removeEventListener('beforeunload', handleBeforeUnload);
        releaseBackButton();
    }

    function handleVisibilityChange() {
        if (!testActive) return;
        if (document.hidden) {
            submitOnViolation('Tab switching or window minimization is not allowed. Your test has been submitted automatically.');
        }
    }

    function handleWindowBlur() {
        if (!testActive) return;
        setTimeout(() => {
            if (!testActive) return;
            if (!document.hasFocus() || document.hidden) {
                submitOnViolation('Window focus was lost. Your test has been submitted automatically.');
            }
        }, 200);
    }

    function handleFullscreenChange() {
        if (!testActive) return;
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
        }
    }

    function handleKeyDown(e) {
        if (!testActive) return;
        const key = e.key;
        const code = e.code;
        const ctrl = e.ctrlKey || e.metaKey;
        const shift = e.shiftKey;
        const alt = e.altKey;

        if (code === 'PrintScreen' || key === 'PrintScreen' || key === 'Snapshot') {
            e.preventDefault();
            submitOnViolation('Screenshots are not allowed. Your test has been submitted automatically.');
            return;
        }
        if (key === 'F12') {
            e.preventDefault();
            submitOnViolation('Developer tools are not allowed during the test. Your test has been submitted automatically.');
            return;
        }
        if (ctrl && shift && (key === 'I' || key === 'J' || key === 'C' || code === 'KeyI' || code === 'KeyJ' || code === 'KeyC')) {
            e.preventDefault();
            submitOnViolation('Developer tools are not allowed during the test. Your test has been submitted automatically.');
            return;
        }
        if (ctrl && (key === 'u' || key === 'U' || code === 'KeyU')) {
            e.preventDefault();
            submitOnViolation('Viewing page source is not allowed. Your test has been submitted automatically.');
            return;
        }
        if (ctrl && shift && (key === 'S' || code === 'KeyS')) {
            e.preventDefault();
            submitOnViolation('Screenshots are not allowed. Your test has been submitted automatically.');
            return;
        }
        if (ctrl && (key === 'a' || key === 'A' || code === 'KeyA')) {
            e.preventDefault();
            return;
        }
        if (ctrl && (key === 'c' || key === 'C' || key === 'x' || key === 'X' || code === 'KeyC' || code === 'KeyX')) {
            e.preventDefault();
            submitOnViolation('Copying content is not allowed. Your test has been submitted automatically.');
            return;
        }
        if (ctrl && (key === 's' || key === 'S' || code === 'KeyS')) {
            e.preventDefault();
            submitOnViolation('Saving the page is not allowed. Your test has been submitted automatically.');
            return;
        }
        if (key === 'Backspace' || key === 'Alt' || alt) {
            const targetTag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
            if (key === 'Backspace' && (targetTag === 'input' || targetTag === 'textarea' || e.target.isContentEditable)) {
                return;
            }
            if (alt && (key === 'ArrowLeft' || key === 'ArrowRight' || key === 'Left' || key === 'Right')) {
                e.preventDefault();
                submitOnViolation('Back navigation is not allowed during the test. Your test has been submitted automatically.');
                return;
            }
        }
        if (key === 'Escape') {
            e.preventDefault();
            document.documentElement.requestFullscreen().catch(() => {});
            return;
        }
    }

    function handleKeyUp(e) {
        if (!testActive) return;
        if (e.code === 'PrintScreen' || e.key === 'PrintScreen' || e.key === 'Snapshot') {
            e.preventDefault();
            submitOnViolation('Screenshots are not allowed. Your test has been submitted automatically.');
        }
    }

    function handleContextMenu(e) {
        if (!testActive) return;
        e.preventDefault();
        submitOnViolation('Right-click / context menu is not allowed during the test. Your test has been submitted automatically.');
    }

    function handleMouseDown(e) {
        if (!testActive) return;
        if (e.button === 2) {
            e.preventDefault();
            submitOnViolation('Right-click is not allowed during the test. Your test has been submitted automatically.');
        }
        if (e.button === 1) { e.preventDefault(); }
    }

    function handleMouseUp(e) {
        if (!testActive) return;
        if (e.button === 2) { e.preventDefault(); }
    }

    function handleCopyCut(e) {
        if (!testActive) return;
        e.preventDefault();
        submitOnViolation('Copying or cutting content is not allowed. Your test has been submitted automatically.');
    }

    function handleDrag(e) {
        if (!testActive) return;
        e.preventDefault();
    }

    function handleSelectStart(e) {
        if (!testActive) return;
        e.preventDefault();
    }

    function handleBeforePrint(e) {
        if (!testActive) return;
        e.preventDefault();
        submitOnViolation('Printing the page is not allowed. Your test has been submitted automatically.');
    }

    function handleBeforeUnload(e) {
        if (!testActive) return;
        submitTest();
        const msg = 'You are leaving the test. It will be submitted automatically.';
        e.returnValue = msg;
        return msg;
    }

    let backTrapState = null;
    function trapBackButton() {
        if (!testActive) return;
        history.pushState({ test: true }, document.title, location.href);
        backTrapState = () => {
            if (!testActive) return;
            history.pushState({ test: true }, document.title, location.href);
            submitOnViolation('Back navigation is not allowed during the test. Your test has been submitted automatically.');
        };
        window.addEventListener('popstate', backTrapState);
    }

    function releaseBackButton() {
        if (backTrapState) {
            window.removeEventListener('popstate', backTrapState);
            backTrapState = null;
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

    // Init
    fetchExams();
})();
