document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('materials-filter-system');
    let materialsData = [];

    const filterDefinitions = [
        {
            key: 'department',
            label: 'Department',
            options: [
                { value: 'Computer Science', label: 'Computer Science' },
                { value: 'Microbiology', label: 'Microbiology' },
                { value: 'Mathematics', label: 'Mathematics' },
                { value: 'Statistics', label: 'Statistics' },
                { value: 'Physics', label: 'Physics' }
            ]
        },
        {
            key: 'semester',
            label: 'Semester',
            options: [
                { value: 'Semester I', label: 'Semester I' },
                { value: 'Semester II', label: 'Semester II' },
                { value: 'Semester III', label: 'Semester III' },
                { value: 'Semester IV', label: 'Semester IV' },
                { value: 'Semester V', label: 'Semester V' },
                { value: 'Semester VI', label: 'Semester VI' }
            ]
        },
        {
            key: 'type',
            label: 'Material Type',
            options: [
                { value: 'Lecture Notes', label: 'Lecture Notes' },
                { value: 'Previous Year Papers', label: 'Previous Year Papers' },
                { value: 'Assignments', label: 'Assignments' },
                { value: 'Question Banks', label: 'Question Banks' },
                { value: 'Reference Books', label: 'Reference Books' }
            ]
        }
    ];

    function onRenderCard(item, index) {
        return `
            <span class="card-badge">${item.type || 'Material'}</span>
            <h3 class="card-title">${item.title}</h3>
            <div class="card-meta">
                <span><i class="fas fa-building"></i> ${item.subject || item.department || ''}</span>
                <span class="meta-divider">&bull;</span>
                <span><i class="fas fa-clock"></i> ${item.semester || ''}</span>
            </div>
            <div class="card-footer">
                <span class="footer-note">${item.date || ''}</span>
                <button class="btn-link" data-download data-url="${item.url || ''}">View / Download</button>
            </div>
        `;
    }

    function onDownload(item) {
        if (!window.checkLogin || !window.checkLogin()) return;
        const token = localStorage.getItem('token');
        fetch(`${API_BASE_URL}/api/download-track`, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + token }
        }).then(() => {
            window.open(item.url, '_blank');
            const dC = document.getElementById('nav-downloads-count');
            const mDc = document.getElementById('mob-nav-downloads-count');
            if (dC) dC.innerText = parseInt(dC.innerText) + 1;
            if (mDc) mDc.innerText = parseInt(mDc.innerText) + 1;
        }).catch(err => {
            console.error(err);
            window.open(item.url, '_blank');
        });
    }

    function parseUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const dept = urlParams.get('dept');
        const deptMap = {
            'cs': 'Computer Science',
            'micro': 'Microbiology',
            'stats': 'Statistics',
            'physics': 'Physics',
            'bcom': 'B.Com (Commerce)',
            'english': 'English'
        };
        return dept && deptMap[dept] ? deptMap[dept] : null;
    }

    async function loadMaterials() {
        if (!container) {
            console.error('materials-filter-system element not found');
            return;
        }
        if (typeof API_BASE_URL === 'undefined') {
            container.innerHTML = '<p style="text-align:center;padding:40px;color:var(--text-muted);">Configuration error: API URL not set.</p>';
            return;
        }

        container.innerHTML = '<p style="text-align:center;padding:40px;color:var(--text-muted);">Loading materials...</p>';

        try {
            const response = await fetch(`${API_BASE_URL}/api/materials`);
            const ct = response.headers.get('content-type') || '';
            if (!response.ok || !ct.includes('application/json')) {
                throw new Error(`Unexpected response (${response.status})`);
            }
            materialsData = await response.json();

            // Initialize FilterSystem
            const fs = new window.FilterSystem({
                container: container,
                data: materialsData,
                filters: filterDefinitions,
                itemsPerPage: 15,
                onRender: onRenderCard,
                onDownload: onDownload
            });
            fs.init();

            // Apply URL param filter if present
            const deptName = parseUrlParams();
            if (deptName) {
                fs._toggleFilterValue('department', deptName, true);
                fs._syncDropdownCheckboxes('department');
                fs._updateDropdownLabel('department', fs.dropdowns['department']?.btn);
                fs._updateActivePills();
                fs.applyFilters();
            }
        } catch (err) {
            console.error('Materials load failed:', err);
            container.innerHTML = '<p style="text-align:center;padding:40px;color:var(--text-muted);">Unable to load materials right now. Check that the backend URL in js/config.js matches your Render service.</p>';
        }
    }

    loadMaterials();
});
