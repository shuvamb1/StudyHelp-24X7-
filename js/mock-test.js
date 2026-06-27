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

            grid.innerHTML = papers.map((paper, idx) => {
                const pdfCount = (paper.pdfFiles && paper.pdfFiles.length) || (paper.pdfUrl ? 1 : 0);
                const hasPDFs = pdfCount > 0;
                return `
                <div class="paper-card ${hasPDFs ? '' : 'paper-card-disabled'}" data-idx="${idx}" data-title="${escapeHtml(paper.title)}" data-subject="${escapeHtml(paper.subject)}" data-dept="${escapeHtml(paper.department)}" data-sem="${escapeHtml(paper.semester)}">
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
                    <div class="paper-card-footer">
                        <button class="btn btn-give-test ${hasPDFs ? '' : 'disabled'}" ${hasPDFs ? '' : 'disabled'} onclick="event.stopPropagation(); window.startTestForPaper(${idx})"><i class="fas fa-play"></i> Give Test</button>
                        <button class="btn btn-past-results" onclick="event.stopPropagation(); window.showPastResultsForPaper(${idx})"><i class="fas fa-chart-bar"></i> Past Results</button>
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
        document.getElementById('question-type').value = 'mcq';

        // Fetch previous result to show adaptive difficulty
        const prevResultContainer = document.getElementById('prev-result-info');
        if (prevResultContainer) {
            prevResultContainer.innerHTML = '<div style="text-align:center; padding:10px; color:var(--text-muted); font-size:0.85rem;"><i class="fas fa-spinner fa-spin"></i> Checking past performance...</div>';
            fetch(`${API_BASE_URL}/api/mock-tests/${paper._id}/previous-result`, {
                headers: { 'Authorization': 'Bearer ' + token }
            })
            .then(res => res.json())
            .then(data => {
                if (data.hasPreviousResult) {
                    let diffLabel = 'Standard';
                    let diffColor = '#6b7280';
                    let bgColor = '#f8fafc';
                    let borderColor = '#e2e8f0';
                    let iconColor = '#6b7280';
                    if (data.targetDifficulty === 'easy') {
                        diffLabel = 'Easier';
                        diffColor = '#22c55e';
                        bgColor = '#f0fdf4';
                        borderColor = '#22c55e';
                        iconColor = '#15803d';
                    } else if (data.targetDifficulty === 'medium-hard') {
                        diffLabel = 'Harder';
                        diffColor = '#f59e0b';
                        bgColor = '#fffbeb';
                        borderColor = '#f59e0b';
                        iconColor = '#b45309';
                    } else if (data.targetDifficulty === 'hard') {
                        diffLabel = 'Hard';
                        diffColor = '#dc2626';
                        bgColor = '#fef2f2';
                        borderColor = '#dc2626';
                        iconColor = '#b91c1c';
                    }
                    prevResultContainer.innerHTML = `
                    <div style="background: ${bgColor}; border: 1px solid ${borderColor}; border-radius: 10px; padding: 15px; margin-bottom: 20px;">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                            <i class="fas fa-chart-line" style="color: ${iconColor};"></i>
                            <strong style="color: ${iconColor};">Adaptive Difficulty Active</strong>
                        </div>
                        <div style="font-size: 0.9rem; color: var(--text-dark);">
                            Your previous score: <strong>${data.percentage}%</strong> (${data.score}/${data.totalMarks})
                        </div>
                        <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 5px;">
                            Next test difficulty: <span style="font-weight: 700; color: ${diffColor};">${diffLabel}</span>
                        </div>
                    </div>
                    `;
                } else {
                    prevResultContainer.innerHTML = `
                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 15px; margin-bottom: 20px; font-size: 0.9rem; color: var(--text-muted);">
                        <i class="fas fa-info-circle" style="color: var(--primary-color); margin-right: 8px;"></i>
                        No previous result for this paper. Difficulty will be set to <strong>Standard</strong> (same as PYQs).
                    </div>
                    `;
                }
            })
            .catch(() => {
                prevResultContainer.innerHTML = '';
            });
        }

        // Update button handler
        const startBtn = document.getElementById('start-test-btn');
        startBtn.onclick = () => generateAndStartTest();
    }

    // ====== GENERATE & START TEST ======
    async function generateAndStartTest() {
        const marks = Number(document.getElementById('test-marks').value) || 30;
        const duration = Number(document.getElementById('test-duration').value) || 60;
        const questionType = document.getElementById('question-type').value || 'mcq';
        const btn = document.getElementById('start-test-btn');

        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating Questions with AI...';
        answers = {}; // reset answers for new test

        try {
            const res = await fetch(`${API_BASE_URL}/api/mock-tests/${currentPaper._id}/start`, {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ marks, duration, questionType })
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
            securityViolationShown = false;
            blurCount = 0;

            // Request fullscreen immediately
            document.documentElement.requestFullscreen().catch(() => {});

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

            // Hide all overlays just in case
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
        if (q.type === 'descriptive') {
            const existingAnswer = answers[index] || {};
            const hasFile = existingAnswer.fileId;
            optionsContainer.innerHTML = `
                <div style="background: #f8fafc; border: 2px dashed #E2E8F0; border-radius: 12px; padding: 30px; text-align: center;" id="upload-area-${index}">
                    <i class="fas fa-file-upload" style="font-size: 2.5rem; color: var(--primary-color); margin-bottom: 15px; display: block;"></i>
                    <div style="font-weight: 600; color: var(--text-dark); margin-bottom: 8px; font-size: 1.05rem;">Upload Your Written Answer</div>
                    <div style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 20px; line-height: 1.5;">
                        Write your answer on paper.<br>
                        Take a clear photo or scan it.<br>
                        Convert to PDF (preferred) and upload.
                    </div>
                    <label class="btn btn-primary" style="cursor: pointer; display: inline-block; position: relative; overflow: hidden;">
                        <i class="fas fa-cloud-upload-alt"></i> ${hasFile ? 'Replace File' : 'Select File (PDF/Image)'}
                        <input type="file" accept="application/pdf,image/png,image/jpeg,image/jpg" 
                            onchange="window.handleFileUpload(${index}, this)" 
                            style="position: absolute; left: 0; top: 0; opacity: 0; width: 100%; height: 100%; cursor: pointer;">
                    </label>
                    <div id="file-status-${index}" style="margin-top: 15px; font-size: 0.85rem;">
                        ${hasFile ? renderFileStatus(existingAnswer) : '<span style="color: var(--text-muted);">Max file size: 5 MB</span>'}
                    </div>
                </div>
            `;
        } else {
            optionsContainer.innerHTML = q.options.map((opt, i) => `
                <label class="option-item ${answers[index] === i ? 'selected' : ''}" onclick="window.selectOption(${index}, ${i})">
                    <input type="radio" name="q${index}" value="${i}" ${answers[index] === i ? 'checked' : ''}>
                    <span>${escapeHtml(opt)}</span>
                </label>
            `).join('');
        }

        document.getElementById('btn-prev').disabled = index === 0;
        document.getElementById('btn-next').innerHTML = index === questions.length - 1
            ? 'Submit <i class="fas fa-check-circle"></i>'
            : 'Next <i class="fas fa-chevron-right"></i>';

        // Update nav
        document.querySelectorAll('.q-nav-btn').forEach(btn => {
            btn.classList.remove('active', 'current');
            const btnIndex = parseInt(btn.dataset.index);
            if (btnIndex === index) btn.classList.add('active', 'current');
            if (isAnswered(btnIndex)) btn.classList.add('answered');
        });
    }

    function renderFileStatus(answer) {
        if (!answer || !answer.fileId) return '';
        return `
            <div style="display: flex; align-items: center; justify-content: center; gap: 10px; background: #dcfce7; border: 1px solid #22c55e; border-radius: 8px; padding: 10px 15px;">
                <i class="fas fa-check-circle" style="color: #15803d;"></i>
                <span style="color: #15803d; font-weight: 600;">${escapeHtml(answer.fileName || 'Uploaded')}</span>
                <button onclick="event.stopPropagation(); window.removeFileAnswer(${currentQuestionIndex})" 
                    style="background: none; border: none; color: #b91c1c; cursor: pointer; font-size: 0.9rem; margin-left: 8px;" 
                    title="Remove file">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;
    }

    window.handleFileUpload = async function(qIndex, input) {
        const file = input.files[0];
        if (!file) return;
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            alert('File size exceeds 5 MB limit. Please upload a smaller file.');
            input.value = '';
            return;
        }
        const statusEl = document.getElementById(`file-status-${qIndex}`);
        if (statusEl) {
            statusEl.innerHTML = '<div style="color: var(--primary-color);"><i class="fas fa-spinner fa-spin"></i> Uploading...</div>';
        }
        try {
            const formData = new FormData();
            formData.append('answerFile', file);
            const res = await fetch(`${API_BASE_URL}/api/mock-tests/${currentPaper._id}/upload-answer`, {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + token },
                body: formData
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.error || 'Upload failed');
            }
            answers[qIndex] = { fileId: data.fileId, fileName: data.fileName };
            renderQuestion(qIndex);
        } catch (err) {
            console.error('Upload error:', err);
            if (statusEl) {
                statusEl.innerHTML = `<div style="color: #dc2626;"><i class="fas fa-exclamation-circle"></i> Upload failed: ${escapeHtml(err.message)}</div>`;
            }
            alert('Failed to upload answer file: ' + err.message);
        }
    };

    window.removeFileAnswer = function(qIndex) {
        if (confirm('Are you sure you want to remove this uploaded file?')) {
            answers[qIndex] = undefined;
            renderQuestion(qIndex);
        }
    };

    // ====== NAVIGATION ======
    window.goToQuestion = function(index) {
        if (index >= 0 && index < questions.length) renderQuestion(index);
    };

    window.selectOption = function(qIndex, optionIndex) {
        answers[qIndex] = optionIndex;
        renderQuestion(qIndex);
    };

    window.updateTextAnswer = function(qIndex, value) {
        answers[qIndex] = value;
        // Update nav button visually
        document.querySelectorAll('.q-nav-btn').forEach(btn => {
            const btnIndex = parseInt(btn.dataset.index);
            if (btnIndex === qIndex) {
                if (value.trim() !== '') btn.classList.add('answered');
                else btn.classList.remove('answered');
            }
        });
    };

    function isAnswered(qIndex) {
        const q = questions[qIndex];
        if (!q) return false;
        const ans = answers[qIndex];
        if (q.type === 'descriptive') {
            if (ans && typeof ans === 'object' && ans.fileId) return true;
            if (typeof ans === 'string' && ans.trim() !== '') return true;
            return false;
        }
        return ans !== undefined && ans !== null;
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

        const timeTaken = Math.round((currentPaper.duration || 60) * 60 - secondsLeft);
        const formattedAnswers = Object.entries(answers).map(([qId, val]) => {
            const q = questions[parseInt(qId)];
            if (q && q.type === 'descriptive') {
                if (val && typeof val === 'object' && val.fileId) {
                    return { questionId: parseInt(qId), selectedOption: -1, textAnswer: '', fileId: val.fileId, fileName: val.fileName || '' };
                }
                return { questionId: parseInt(qId), selectedOption: -1, textAnswer: val || '' };
            }
            return { questionId: parseInt(qId), selectedOption: val };
        });

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

        // Hide all overlays
        document.getElementById('blur-overlay').style.display = 'none';
        document.getElementById('tab-warning-overlay').style.display = 'none';
        document.getElementById('security-overlay').style.display = 'none';

        // Exit fullscreen if active
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
        }

        document.getElementById('result-paper-title').textContent = currentPaper.title;
        document.getElementById('score-value').textContent = data.percentage + '%';
        document.getElementById('score-circle').style.setProperty('--score-deg', (data.percentage * 3.6) + 'deg');
        document.getElementById('stat-correct').textContent = data.correctCount;
        document.getElementById('stat-wrong').textContent = data.wrongCount;
        document.getElementById('stat-unanswered').textContent = data.unansweredCount;
        document.getElementById('stat-score').textContent = data.score;

        const container = document.getElementById('detailed-results');
        container.innerHTML = data.detailedResults.map((r, i) => {
            if (r.type === 'descriptive') {
                const hasFile = r.fileId && r.fileName;
                const status = hasFile ? 'unanswered' : 'unanswered';
                const statusText = hasFile ? 'Answer Uploaded (Manual Evaluation)' : 'Unanswered';
                return `
                <div class="result-question">
                    <div class="result-question-header">
                        <strong>Q${i + 1}.</strong> ${escapeHtml(r.question)}
                        <span class="result-status ${status}">${statusText}</span>
                    </div>
                    <div style="background: #f8fafc; padding: 12px; border-radius: 8px; margin-bottom: 8px; border: 1px solid #e2e8f0;">
                        <strong style="color: var(--text-dark);">Your Answer:</strong><br>
                        ${hasFile ? `<a href="${API_BASE_URL}/api/answer-files/${r.fileId}" target="_blank" style="color: var(--primary-color); text-decoration: none; font-weight: 600;"><i class="fas fa-file-pdf"></i> ${escapeHtml(r.fileName)}</a>` : '<span style="color: var(--text-muted);">Not answered</span>'}
                    </div>
                    ${r.modelAnswer ? `<div style="background: #dcfce7; padding: 12px; border-radius: 8px; margin-bottom: 8px; border: 1px solid #22c55e;">
                        <strong style="color: #15803d;">Model Answer:</strong><br>
                        <span style="color: #15803d;">${escapeHtml(r.modelAnswer)}</span>
                    </div>` : ''}
                    <div style="font-size: 0.85rem; color: var(--text-muted);">
                        Marks: ${r.marks} (Manual evaluation required)
                    </div>
                </div>
                `;
            }
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
        securityViolationShown = false;
        clearInterval(timerInterval);
        detachAntiCheat();

        // Remove past results modal if present
        const prModal = document.getElementById('past-results-modal');
        if (prModal) prModal.remove();

        // Hide all overlays
        document.getElementById('blur-overlay').style.display = 'none';
        document.getElementById('tab-warning-overlay').style.display = 'none';
        document.getElementById('security-overlay').style.display = 'none';

        // Exit fullscreen if active
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
        }

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

        // Auto-submit after a short delay so user sees the message
        setTimeout(() => {
            if (testActive) submitTest();
        }, 1500);
    }

    function attachAntiCheat() {
        // Tab/window switch detection
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleWindowBlur);
        document.addEventListener('fullscreenchange', handleFullscreenChange);

        // Keyboard blocking (screenshots, dev tools, copy, select all, view source)
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);

        // Mouse / context menu blocking
        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mouseup', handleMouseUp);

        // Copy / cut / paste / drag blocking
        document.addEventListener('copy', handleCopyCut);
        document.addEventListener('cut', handleCopyCut);
        document.addEventListener('dragstart', handleDrag);
        document.addEventListener('drag', handleDrag);
        document.addEventListener('selectstart', handleSelectStart);

        // Print / screenshot via print dialog
        window.addEventListener('beforeprint', handleBeforePrint);

        // Back button / navigation trapping
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

    // === Tab / Window Switch ===
    function handleVisibilityChange() {
        if (!testActive) return;
        if (document.hidden) {
            submitOnViolation('Tab switching or window minimization is not allowed. Your test has been submitted automatically.');
        }
    }

    function handleWindowBlur() {
        if (!testActive) return;
        // Small delay to avoid false positives from clicking inside the app
        setTimeout(() => {
            if (!testActive) return;
            if (!document.hasFocus() || document.hidden) {
                submitOnViolation('Window focus was lost. Your test has been submitted automatically.');
            }
        }, 200);
    }

    // === Fullscreen Enforcement ===
    function handleFullscreenChange() {
        if (!testActive) return;
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
        }
    }

    // === Keyboard Security ===
    function handleKeyDown(e) {
        if (!testActive) return;
        const key = e.key;
        const code = e.code;
        const ctrl = e.ctrlKey || e.metaKey;
        const shift = e.shiftKey;
        const alt = e.altKey;

        // Screenshot / system keys
        if (code === 'PrintScreen' || key === 'PrintScreen' || key === 'Snapshot') {
            e.preventDefault();
            submitOnViolation('Screenshots are not allowed. Your test has been submitted automatically.');
            return;
        }

        // F12 (DevTools)
        if (key === 'F12') {
            e.preventDefault();
            submitOnViolation('Developer tools are not allowed during the test. Your test has been submitted automatically.');
            return;
        }

        // Ctrl+Shift+I / Ctrl+Shift+J / Ctrl+Shift+C (DevTools)
        if (ctrl && shift && (key === 'I' || key === 'J' || key === 'C' || code === 'KeyI' || code === 'KeyJ' || code === 'KeyC')) {
            e.preventDefault();
            submitOnViolation('Developer tools are not allowed during the test. Your test has been submitted automatically.');
            return;
        }

        // Ctrl+U (View Source)
        if (ctrl && (key === 'u' || key === 'U' || code === 'KeyU')) {
            e.preventDefault();
            submitOnViolation('Viewing page source is not allowed. Your test has been submitted automatically.');
            return;
        }

        // Ctrl+Shift+S (Windows Snipping Tool / Save As)
        if (ctrl && shift && (key === 'S' || code === 'KeyS')) {
            e.preventDefault();
            submitOnViolation('Screenshots are not allowed. Your test has been submitted automatically.');
            return;
        }

        // Windows+Shift+S (Snipping tool) — can't fully block, but we can try
        if (shift && (key === 'S' || code === 'KeyS') && !ctrl && !alt) {
            // Can't reliably detect Windows key alone, but we can be aggressive on Shift+S
            // This is a heuristic — it may cause false positives if user types Shift+S in a textarea
            // But for exam security, it's acceptable
        }

        // Ctrl+A (Select All)
        if (ctrl && (key === 'a' || key === 'A' || code === 'KeyA')) {
            e.preventDefault();
            return;
        }

        // Ctrl+C / Ctrl+X (Copy / Cut)
        if (ctrl && (key === 'c' || key === 'C' || key === 'x' || key === 'X' || code === 'KeyC' || code === 'KeyX')) {
            e.preventDefault();
            submitOnViolation('Copying content is not allowed. Your test has been submitted automatically.');
            return;
        }

        // Ctrl+S (Save Page)
        if (ctrl && (key === 's' || key === 'S' || code === 'KeyS')) {
            e.preventDefault();
            submitOnViolation('Saving the page is not allowed. Your test has been submitted automatically.');
            return;
        }

        // Alt+Left / Backspace (Back navigation)
        if (key === 'Backspace' || key === 'Alt' || alt) {
            // Let Backspace work in textareas, but block it elsewhere
            const targetTag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
            if (key === 'Backspace' && (targetTag === 'input' || targetTag === 'textarea' || e.target.isContentEditable)) {
                return; // allow backspace in text inputs
            }
            if (alt && (key === 'ArrowLeft' || key === 'ArrowRight' || key === 'Left' || key === 'Right')) {
                e.preventDefault();
                submitOnViolation('Back navigation is not allowed during the test. Your test has been submitted automatically.');
                return;
            }
        }

        // Escape key (can exit fullscreen)
        if (key === 'Escape') {
            e.preventDefault();
            document.documentElement.requestFullscreen().catch(() => {});
            return;
        }
    }

    function handleKeyUp(e) {
        if (!testActive) return;
        // Detect PrintScreen on keyup (some systems trigger it on keyup)
        if (e.code === 'PrintScreen' || e.key === 'PrintScreen' || e.key === 'Snapshot') {
            e.preventDefault();
            submitOnViolation('Screenshots are not allowed. Your test has been submitted automatically.');
        }
    }

    // === Mouse Security ===
    function handleContextMenu(e) {
        if (!testActive) return;
        e.preventDefault();
        submitOnViolation('Right-click / context menu is not allowed during the test. Your test has been submitted automatically.');
    }

    function handleMouseDown(e) {
        if (!testActive) return;
        // Block right-click (button 2) and middle-click (button 1)
        if (e.button === 2) {
            e.preventDefault();
            submitOnViolation('Right-click is not allowed during the test. Your test has been submitted automatically.');
        }
        // Block middle-click (often opens in new tab)
        if (e.button === 1) {
            e.preventDefault();
        }
    }

    function handleMouseUp(e) {
        if (!testActive) return;
        if (e.button === 2) {
            e.preventDefault();
        }
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

    // === Print / Screenshot ===
    function handleBeforePrint(e) {
        if (!testActive) return;
        e.preventDefault();
        submitOnViolation('Printing the page is not allowed. Your test has been submitted automatically.');
    }

    // === Navigation / Back Button ===
    function handleBeforeUnload(e) {
        if (!testActive) return;
        // Submit the test before leaving
        submitTest();
        const msg = 'You are leaving the test. It will be submitted automatically.';
        e.returnValue = msg;
        return msg;
    }

    let backTrapState = null;
    function trapBackButton() {
        if (!testActive) return;
        // Push a dummy state so the user can't go back normally
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

    // ====== SEARCH & FILTER ======
    function filterPapers() {
        const searchVal = (document.getElementById('mock-search')?.value || '').toLowerCase();
        const checkedDepts = [...document.querySelectorAll('.filter-dept:checked')].map(cb => cb.value);
        const checkedSems = [...document.querySelectorAll('.filter-sem:checked')].map(cb => cb.value);

        document.querySelectorAll('#papers-grid .paper-card').forEach(card => {
            const title = (card.dataset.title || '').toLowerCase();
            const subject = (card.dataset.subject || '').toLowerCase();
            const dept = card.dataset.dept || '';
            const sem = card.dataset.sem || '';

            const matchesSearch = !searchVal || title.includes(searchVal) || subject.includes(searchVal);
            const matchesDept = !checkedDepts.length || checkedDepts.includes(dept);
            const matchesSem = !checkedSems.length || checkedSems.includes(sem);

            card.style.display = (matchesSearch && matchesDept && matchesSem) ? '' : 'none';
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        document.getElementById('mock-search')?.addEventListener('input', filterPapers);
        document.getElementById('apply-filters-btn')?.addEventListener('click', filterPapers);
    });

    window.startTestForPaper = function(idx) {
        const paper = papers[idx];
        if (paper) showConfigureScreen(paper);
    };

    window.showPastResultsForPaper = async function(idx) {
        const paper = papers[idx];
        if (!paper) return;
        selectionScreen.style.display = 'none';
        instructionsScreen.style.display = 'none';
        resultsScreen.style.display = 'none';
        testScreen.style.display = 'none';

        const container = document.createElement('div');
        container.id = 'past-results-modal';
        container.style.cssText = 'max-width:800px; margin:0 auto; padding:20px 0;';
        container.innerHTML = `
            <div style="display:flex; align-items:center; gap:15px; margin-bottom:25px;">
                <button class="btn btn-outline" onclick="document.getElementById('past-results-modal').remove(); document.getElementById('selection-screen').style.display='block';" style="padding:8px 16px;"><i class="fas fa-arrow-left"></i></button>
                <h2 style="margin:0;"><i class="fas fa-chart-bar" style="color:var(--primary-color);"></i> Past Results — ${escapeHtml(paper.title)}</h2>
            </div>
            <div id="paper-results-loading" style="text-align:center; padding:40px; color:var(--text-muted);">
                <i class="fas fa-spinner fa-spin" style="font-size:1.5rem;"></i> Loading results...
            </div>
            <div id="paper-results-list"></div>
        `;
        document.getElementById('main-content').appendChild(container);

        try {
            const res = await fetch(`${API_BASE_URL}/api/mock-tests/results?paperId=${paper._id}`, {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            if (!res.ok) throw new Error('Failed');
            const results = await res.json();
            const loadingEl = document.getElementById('paper-results-loading');
            const listEl = document.getElementById('paper-results-list');

            if (!results.length) {
                loadingEl.innerHTML = '<p style="text-align:center; padding:30px; color:var(--text-muted);">No past results for this paper yet.</p>';
                return;
            }
            loadingEl.style.display = 'none';
            listEl.innerHTML = results.map(r => {
                const date = new Date(r.completedAt).toLocaleDateString();
                const percentage = r.totalMarks > 0 ? ((r.score / r.totalMarks) * 100).toFixed(1) : 0;
                return `
                <div style="background:white; border-radius:12px; padding:20px; border:1px solid #E2E8F0; margin-bottom:15px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                        <div>
                            <div style="font-weight:700; color:var(--text-dark);">${escapeHtml(paper.title)}</div>
                            <div style="font-size:0.85rem; color:var(--text-muted);">${date}</div>
                        </div>
                        <div style="text-align:right;">
                            <div style="font-size:1.5rem; font-weight:800; color:var(--primary-color);">${percentage}%</div>
                            <div style="font-size:0.8rem; color:var(--text-muted);">${r.score}/${r.totalMarks} marks</div>
                        </div>
                    </div>
                    <div style="display:flex; gap:15px; font-size:0.85rem;">
                        <span style="color:#22c55e;"><i class="fas fa-check-circle"></i> ${r.correctCount} Correct</span>
                        <span style="color:#dc2626;"><i class="fas fa-times-circle"></i> ${r.wrongCount} Wrong</span>
                        <span style="color:#6b7280;"><i class="fas fa-minus-circle"></i> ${r.unansweredCount} Unanswered</span>
                    </div>
                </div>`;
            }).join('');
        } catch (err) {
            document.getElementById('paper-results-loading').innerHTML = '<p style="text-align:center; padding:30px; color:var(--text-muted);">Could not load results.</p>';
        }
    };

    // ====== INIT ======
    document.addEventListener('DOMContentLoaded', () => {
        if (!token) {
            window.location.href = 'login.html';
            return;
        }
        fetchPapers();
    });
})();
