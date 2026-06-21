document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('materials-container');
    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector('.search-btn');
    const applyFiltersBtn = document.querySelector('.filter-sidebar .btn-primary');

    let materialsData = [];

    function renderMaterials(data) {
        container.innerHTML = '';
        if (data.length === 0) {
            container.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); font-size: 1.1rem; padding: 40px;">No materials found matching your criteria.</p>';
            return;
        }

        data.forEach(material => {
            const card = document.createElement('div');
            card.className = 'card material-card reveal active';

            card.innerHTML = `
                <span class="material-type-badge">${material.type}</span>
                <h3 class="material-title">${material.title}</h3>
                <div class="material-meta">
                    <span><i class="fas fa-building"></i> ${material.subject}</span>
                    <span>&bull;</span>
                    <span><i class="fas fa-clock"></i> ${material.semester}</span>
                </div>
                <div class="material-footer">
                    <span style="font-size: 0.8rem; color: var(--text-muted);">Source: ${material.date}</span>
                    <a href="#" onclick="return window.handleDownload(event, '${material.url}')" class="btn btn-outline" style="padding: 6px 12px; font-size: 0.85rem;">
                        <i class="fas fa-download"></i> View / Download
                    </a>
                </div>
            `;
            container.appendChild(card);
        });
    }

    function applyFilters(isInitialLoad = false) {
        const checkedOptions = Array.from(document.querySelectorAll('.filter-option input:checked')).map(el => el.parentElement.textContent.trim());
        const searchQuery = searchInput ? searchInput.value.toLowerCase().trim() : '';

        let filtered = materialsData.filter(material => {
            const matchesSearch = material.title.toLowerCase().includes(searchQuery) ||
                                  material.subject.toLowerCase().includes(searchQuery);

            if (checkedOptions.length === 0) {
                return matchesSearch;
            }

            const matchesAnyFilter = checkedOptions.some(opt =>
                opt === material.department ||
                opt === material.semester ||
                opt === material.type ||
                material.subject.includes(opt)
            );

            return matchesSearch && matchesAnyFilter;
        });

        if (isInitialLoad && checkedOptions.length === 0 && searchQuery === '') {
            filtered = filtered.slice(0, 8);
        }

        renderMaterials(filtered);
    }

    async function loadMaterials() {
        if (!container) {
            console.error('materials-container element not found');
            return;
        }

        if (typeof API_BASE_URL === 'undefined') {
            container.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); font-size: 1.1rem; padding: 40px;">Configuration error: API URL not set. Make sure js/config.js is loaded.</p>';
            return;
        }

        container.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); font-size: 1.1rem; padding: 40px;">Loading materials...</p>';

        try {
            const response = await fetch(`${API_BASE_URL}/api/materials`);
            if (!response.ok) throw new Error(`Failed to load materials (${response.status})`);
            materialsData = await response.json();
            applyFilters(true);
        } catch (err) {
            console.error('Materials load failed:', err);
            container.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); font-size: 1.1rem; padding: 40px;">Unable to load materials right now. Check that the backend URL in js/config.js matches your Render service.</p>';
        }
    }

    loadMaterials();

    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', applyFilters);
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', applyFilters);
    }

    if (searchInput) {
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') applyFilters();
        });
    }

    window.handleDownload = function(e, url) {
        e.preventDefault();
        if (!window.checkLogin()) return false;

        const token = localStorage.getItem('token');
        fetch(`${API_BASE_URL}/api/download-track`, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + token }
        }).then(() => {
            window.open(url, '_blank');
            const dC = document.getElementById('nav-downloads-count');
            const mDc = document.getElementById('mob-nav-downloads-count');
            if (dC) dC.innerText = parseInt(dC.innerText) + 1;
            if (mDc) mDc.innerText = parseInt(mDc.innerText) + 1;
        }).catch(err => {
            console.error(err);
            window.open(url, '_blank');
        });
        return false;
    };
});
