document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('materials-container');
    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector('.search-btn');
    const applyFiltersBtn = document.querySelector('.filter-sidebar .btn-primary');

    let materialsData = [];
    let currentPage = 1;
    const itemsPerPage = 8;

    function renderPagination(totalItems, activePage) {
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        const existingPagination = document.querySelector('.pagination-container');
        if (existingPagination) existingPagination.remove();

        if (totalPages <= 1) return;

        const paginationContainer = document.createElement('div');
        paginationContainer.className = 'pagination-container';
        paginationContainer.style.cssText = 'display: flex; justify-content: center; align-items: center; gap: 8px; margin-top: 30px; flex-wrap: wrap;';

        // Prev button
        const prevBtn = document.createElement('button');
        prevBtn.className = 'btn btn-outline';
        prevBtn.style.cssText = 'padding: 6px 12px; font-size: 0.85rem;';
        prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i> Prev';
        prevBtn.disabled = currentPage === 1;
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                applyFilters(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
        paginationContainer.appendChild(prevBtn);

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = 'btn';
            pageBtn.style.cssText = `padding: 6px 12px; font-size: 0.85rem; min-width: 36px; ${i === activePage ? 'background-color: var(--primary-color); color: white; border-color: var(--primary-color);' : ''}`;
            pageBtn.textContent = i;
            pageBtn.addEventListener('click', () => {
                currentPage = i;
                applyFilters(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
            paginationContainer.appendChild(pageBtn);
        }

        // Next button
        const nextBtn = document.createElement('button');
        nextBtn.className = 'btn btn-outline';
        nextBtn.style.cssText = 'padding: 6px 12px; font-size: 0.85rem;';
        nextBtn.innerHTML = 'Next <i class="fas fa-chevron-right"></i>';
        nextBtn.disabled = activePage === totalPages;
        nextBtn.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                applyFilters(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
        paginationContainer.appendChild(nextBtn);

        // Results count
        const resultsCount = document.createElement('div');
        resultsCount.style.cssText = 'width: 100%; text-align: center; color: var(--text-muted); font-size: 0.85rem; margin-top: 8px;';
        resultsCount.textContent = `Showing ${Math.min((activePage - 1) * itemsPerPage + 1, totalItems)}-${Math.min(activePage * itemsPerPage, totalItems)} of ${totalItems} materials`;
        paginationContainer.appendChild(resultsCount);

        container.parentElement.appendChild(paginationContainer);
    }

    function renderMaterials(data) {
        container.innerHTML = '';
        if (data.length === 0) {
            container.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); font-size: 1.1rem; padding: 40px;">No materials found matching your criteria.</p>';
            const existingPagination = document.querySelector('.pagination-container');
            if (existingPagination) existingPagination.remove();
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

        // Always paginate - show 8 per page
        const totalItems = filtered.length;
        const startIndex = (currentPage - 1) * itemsPerPage;
        const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);

        renderMaterials(paginated);
        renderPagination(totalItems, currentPage);
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

        if (dept && deptMap[dept]) {
            const deptName = deptMap[dept];
            const checkboxes = document.querySelectorAll('.filter-option input[type="checkbox"]');
            checkboxes.forEach(cb => {
                const label = cb.parentElement.textContent.trim();
                if (label === deptName) {
                    cb.checked = true;
                }
            });
            // Reset to page 1 when applying URL filter
            currentPage = 1;
        }
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
            
            parseUrlParams();
            applyFilters(true);
        } catch (err) {
            console.error('Materials load failed:', err);
            container.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); font-size: 1.1rem; padding: 40px;">Unable to load materials right now. Check that the backend URL in js/config.js matches your Render service.</p>';
        }
    }

    loadMaterials();

    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', () => {
            currentPage = 1;
            applyFilters();
        });
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            currentPage = 1;
            applyFilters();
        });
    }

    if (searchInput) {
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                currentPage = 1;
                applyFilters();
            }
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
