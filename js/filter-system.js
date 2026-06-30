/**
 * StudyHelp 24x7 — FilterSystem
 * Reusable filtering, sorting, search & pagination module.
 */

class FilterSystem {
  constructor(options) {
    const defaults = {
      container: null,          // HTMLElement or selector string
      data: [],                 // Array of item objects
      filters: [],              // [{ key, label, options: [{ value, label }] }]
      itemsPerPage: 12,
      onRender: null,           // fn(item, index) -> HTML string
      onDownload: null,         // fn(item) -> void
      sortOptions: [
        { value: 'latest', label: 'Latest' },
        { value: 'oldest', label: 'Oldest' },
        { value: 'az', label: 'Alphabetical A-Z' }
      ]
    };
    this.opts = { ...defaults, ...options };

    if (!this.opts.container) {
      throw new Error('FilterSystem requires a container element');
    }
    this.container = typeof this.opts.container === 'string'
      ? document.querySelector(this.opts.container)
      : this.opts.container;
    if (!this.container) {
      throw new Error(`FilterSystem container not found: ${this.opts.container}`);
    }

    this.data = this.opts.data || [];
    this.filters = this.opts.filters || [];
    this.itemsPerPage = this.opts.itemsPerPage || 12;
    this.currentPage = 1;
    this.activeFilters = {};    // { key: Set(value) }
    this.searchQuery = '';
    this.sortBy = this.opts.sortOptions[0]?.value || 'latest';
    this.dropdowns = {};        // key -> dropdown HTMLElement

    this._boundDocClick = this._onDocumentClick.bind(this);
    this._boundKeydown = this._onKeydown.bind(this);
  }

  /* ============================================================
     PUBLIC API
     ============================================================ */

  init() {
    this._buildMarkup();
    this._bindEvents();
    this.applyFilters();
  }

  destroy() {
    document.removeEventListener('click', this._boundDocClick);
    document.removeEventListener('keydown', this._boundKeydown);
    this.container.innerHTML = '';
    this.dropdowns = {};
  }

  setData(newData) {
    this.data = newData || [];
    this.currentPage = 1;
    this.applyFilters();
  }

  /* ============================================================
     DOM BUILD
     ============================================================ */

  _buildMarkup() {
    this.container.innerHTML = '';
    this.container.classList.add('filter-system-container');

    // Filter bar
    this.filterBar = document.createElement('div');
    this.filterBar.className = 'filter-bar';
    this.container.appendChild(this.filterBar);

    this.renderFilterBar();

    // Active filter pills
    this.activeFiltersContainer = document.createElement('div');
    this.activeFiltersContainer.className = 'active-filters';
    this.container.appendChild(this.activeFiltersContainer);

    // Cards grid
    this.cardsGrid = document.createElement('div');
    this.cardsGrid.className = 'cards-grid';
    this.container.appendChild(this.cardsGrid);

    // Pagination
    this.paginationContainer = document.createElement('div');
    this.paginationContainer.className = 'pagination';
    this.container.appendChild(this.paginationContainer);
  }

  renderFilterBar() {
    this.filterBar.innerHTML = '';

    // Search
    const searchWrap = document.createElement('div');
    searchWrap.className = 'filter-search';
    searchWrap.innerHTML = `
      <span class="search-icon"><i class="fas fa-search"></i></span>
      <input type="text" class="filter-search-input" placeholder="Search…" autocomplete="off">
    `;
    this.filterBar.appendChild(searchWrap);
    this.searchInput = searchWrap.querySelector('.filter-search-input');

    // Dropdowns
    this.renderDropdowns();

    // Sort dropdown
    const sortDropdown = document.createElement('div');
    sortDropdown.className = 'filter-dropdown filter-sort-dropdown';
    this.sortDropdownBtn = document.createElement('button');
    this.sortDropdownBtn.className = 'filter-dropdown-btn';
    this.sortDropdownBtn.setAttribute('type', 'button');
    this.sortDropdownBtn.setAttribute('aria-expanded', 'false');
    this.sortDropdownBtn.innerHTML = `
      <span class="dropdown-value">${this.opts.sortOptions[0]?.label || 'Sort'}</span>
      <span class="dropdown-chevron"><i class="fas fa-chevron-down"></i></span>
    `;
    sortDropdown.appendChild(this.sortDropdownBtn);

    this.sortDropdownMenu = document.createElement('div');
    this.sortDropdownMenu.className = 'filter-dropdown-menu';
    this.opts.sortOptions.forEach(opt => {
      const item = document.createElement('div');
      item.className = 'filter-dropdown-item' + (opt.value === this.sortBy ? ' selected' : '');
      item.dataset.sortValue = opt.value;
      item.innerHTML = `
        <input type="checkbox" ${opt.value === this.sortBy ? 'checked' : ''}>
        <span>${opt.label}</span>
      `;
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        this.sortBy = opt.value;
        this._updateSortDropdown();
        this.applyFilters();
        this._closeAllDropdowns();
      });
      this.sortDropdownMenu.appendChild(item);
    });
    sortDropdown.appendChild(this.sortDropdownMenu);
    this.filterBar.appendChild(sortDropdown);
    this.sortDropdown = sortDropdown;
    this.sortDropdownBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this._toggleDropdown(sortDropdown, this.sortDropdownBtn);
    });

    // Filter button (funnel icon)
    const filterBtn = document.createElement('button');
    filterBtn.className = 'filter-btn';
    filterBtn.setAttribute('type', 'button');
    filterBtn.innerHTML = '<i class="fas fa-filter"></i> Filter';
    filterBtn.addEventListener('click', () => this.applyFilters());
    this.filterBar.appendChild(filterBtn);
    this.filterBtn = filterBtn;
  }

  renderDropdowns() {
    this.filters.forEach(filterDef => {
      const dropdown = document.createElement('div');
      dropdown.className = 'filter-dropdown';
      dropdown.dataset.filterKey = filterDef.key;

      const btn = document.createElement('button');
      btn.className = 'filter-dropdown-btn';
      btn.setAttribute('type', 'button');
      btn.setAttribute('aria-expanded', 'false');
      btn.innerHTML = `
        <span class="dropdown-value">${filterDef.label}</span>
        <span class="dropdown-chevron"><i class="fas fa-chevron-down"></i></span>
      `;
      dropdown.appendChild(btn);

      const menu = document.createElement('div');
      menu.className = 'filter-dropdown-menu';

      (filterDef.options || []).forEach(opt => {
        const item = document.createElement('div');
        item.className = 'filter-dropdown-item';
        item.dataset.value = opt.value;
        item.innerHTML = `
          <input type="checkbox" data-value="${opt.value}">
          <span>${opt.label}</span>
        `;

        item.addEventListener('click', (e) => {
          e.stopPropagation();
          const checkbox = item.querySelector('input[type="checkbox"]');
          // If clicking directly on the checkbox, browser already toggled it;
          // just read its new state. Otherwise toggle it manually.
          const wasCheckboxClick = e.target === checkbox || e.target.closest('input[type="checkbox"]');
          if (!wasCheckboxClick) {
            checkbox.checked = !checkbox.checked;
          }
          this._toggleFilterValue(filterDef.key, opt.value, checkbox.checked);
          item.classList.toggle('selected', checkbox.checked);
          this._updateDropdownLabel(filterDef.key, btn);
          this._updateActivePills();
        });

        menu.appendChild(item);
      });

      dropdown.appendChild(menu);
      this.filterBar.appendChild(dropdown);
      this.dropdowns[filterDef.key] = { dropdown, btn, menu };

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this._toggleDropdown(dropdown, btn);
      });
    });
  }

  /* ============================================================
     FILTERING, SORTING, PAGINATION
     ============================================================ */

  applyFilters() {
    this.searchQuery = this.searchInput.value.trim().toLowerCase();
    let items = [...this.data];

    // Search
    if (this.searchQuery) {
      const q = this.searchQuery;
      items = items.filter(item => {
        const hay = [
          item.title,
          item.name,
          item.subject,
          item.department,
          item.type,
          item.category
        ].filter(Boolean).join(' ').toLowerCase();
        return hay.includes(q);
      });
    }

    // Multi-select dropdown filters
    Object.keys(this.activeFilters).forEach(key => {
      const vals = this.activeFilters[key];
      if (vals.size === 0) return;
      items = items.filter(item => {
        const itemVal = String(item[key] ?? '');
        return vals.has(itemVal) || vals.has(itemVal.toLowerCase());
      });
    });

    // Sort
    items = this.sortItems(items);

    // Paginate
    this.currentPage = Math.max(1, this.currentPage);
    const totalItems = items.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / this.itemsPerPage));
    if (this.currentPage > totalPages) this.currentPage = totalPages || 1;
    const paginated = this.paginate(items);

    this.render(paginated, totalItems, totalPages);
    this._dispatchEvent('filterchange', { totalItems, currentPage: this.currentPage, totalPages });
  }

  sortItems(items) {
    const sorted = [...items];
    switch (this.sortBy) {
      case 'latest':
        sorted.sort((a, b) => {
          const da = a.date ? new Date(a.date) : new Date(0);
          const db = b.date ? new Date(b.date) : new Date(0);
          return db - da;
        });
        break;
      case 'oldest':
        sorted.sort((a, b) => {
          const da = a.date ? new Date(a.date) : new Date(0);
          const db = b.date ? new Date(b.date) : new Date(0);
          return da - db;
        });
        break;
      case 'az':
      default:
        sorted.sort((a, b) => {
          const ta = String(a.title || a.name || '').toLowerCase();
          const tb = String(b.title || b.name || '').toLowerCase();
          return ta.localeCompare(tb);
        });
        break;
    }
    return sorted;
  }

  paginate(items) {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return items.slice(start, start + this.itemsPerPage);
  }

  /* ============================================================
     RENDERING
     ============================================================ */

  render(items, totalItems, totalPages) {
    this.cardsGrid.innerHTML = '';
    this.paginationContainer.innerHTML = '';

    if (items.length === 0) {
      this.cardsGrid.innerHTML = `
        <div class="no-results">
          <div class="no-results-icon"><i class="fas fa-search"></i></div>
          <div class="no-results-title">No items found</div>
          <div class="no-results-text">No items found matching your criteria. Try adjusting your filters or search.</div>
        </div>
      `;
      return;
    }

    items.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'card-item reveal';
      card.dataset.itemIndex = index;

      // Store filterable values as data-* attributes
      Object.keys(item).forEach(k => {
        if (item[k] != null && !['title', 'name', 'description', 'content'].includes(k)) {
          card.dataset[k] = String(item[k]);
        }
      });

      if (typeof this.opts.onRender === 'function') {
        card.innerHTML = this.opts.onRender(item, index);
      } else {
        card.innerHTML = this._defaultCardTemplate(item, index);
      }

      // Download handler wiring
      if (typeof this.opts.onDownload === 'function') {
        const dlBtn = card.querySelector('[data-download]');
        if (dlBtn) {
          dlBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.opts.onDownload(item);
          });
        }
      }

      this.cardsGrid.appendChild(card);

      // Trigger reveal animation on next frame
      requestAnimationFrame(() => card.classList.add('active'));
    });

    this.renderPagination(totalPages, totalItems);
  }

  renderPagination(totalPages, totalItems) {
    if (totalPages <= 1) return;

    const frag = document.createDocumentFragment();

    // Prev
    const prevBtn = document.createElement('button');
    prevBtn.className = 'pagination-btn';
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevBtn.disabled = this.currentPage === 1;
    prevBtn.addEventListener('click', () => {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.applyFilters();
        this._scrollToTop();
      }
    });
    frag.appendChild(prevBtn);

    // Page numbers (with windowing for large page counts)
    const pages = this._pageNumbers(this.currentPage, totalPages);
    pages.forEach(p => {
      if (p === '…') {
        const span = document.createElement('span');
        span.textContent = '…';
        span.style.padding = '0 4px';
        span.style.color = 'var(--text-muted, #6B7280)';
        frag.appendChild(span);
      } else {
        const btn = document.createElement('button');
        btn.className = 'pagination-btn' + (p === this.currentPage ? ' active' : '');
        btn.textContent = String(p);
        btn.addEventListener('click', () => {
          this.currentPage = p;
          this.applyFilters();
          this._scrollToTop();
        });
        frag.appendChild(btn);
      }
    });

    // Next
    const nextBtn = document.createElement('button');
    nextBtn.className = 'pagination-btn';
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextBtn.disabled = this.currentPage === totalPages;
    nextBtn.addEventListener('click', () => {
      if (this.currentPage < totalPages) {
        this.currentPage++;
        this.applyFilters();
        this._scrollToTop();
      }
    });
    frag.appendChild(nextBtn);

    // Info
    const info = document.createElement('div');
    info.className = 'pagination-info';
    const start = Math.min((this.currentPage - 1) * this.itemsPerPage + 1, totalItems);
    const end = Math.min(this.currentPage * this.itemsPerPage, totalItems);
    info.textContent = `Showing ${start}–${end} of ${totalItems}`;
    frag.appendChild(info);

    this.paginationContainer.appendChild(frag);
  }

  /* ============================================================
     ACTIVE FILTER PILLS
     ============================================================ */

  _updateActivePills() {
    this.activeFiltersContainer.innerHTML = '';

    const entries = [];
    Object.keys(this.activeFilters).forEach(key => {
      const vals = this.activeFilters[key];
      vals.forEach(val => {
        const filterDef = this.filters.find(f => f.key === key);
        const option = filterDef?.options?.find(o => o.value === val);
        const label = option?.label || val;
        entries.push({ key, val, label });
      });
    });

    if (entries.length === 0) return;

    entries.forEach(({ key, val, label }) => {
      const pill = document.createElement('span');
      pill.className = 'filter-pill';
      pill.innerHTML = `
        ${label}
        <button class="remove-pill" aria-label="Remove ${label}"><i class="fas fa-times"></i></button>
      `;
      pill.querySelector('.remove-pill').addEventListener('click', () => {
        this._toggleFilterValue(key, val, false);
        this._syncDropdownCheckboxes(key);
        this._updateDropdownLabel(key, this.dropdowns[key]?.btn);
        this._updateActivePills();
        this.applyFilters();
      });
      this.activeFiltersContainer.appendChild(pill);
    });

    const clearBtn = document.createElement('button');
    clearBtn.className = 'clear-all-filters';
    clearBtn.textContent = 'Clear all';
    clearBtn.addEventListener('click', () => this.clearAllFilters());
    this.activeFiltersContainer.appendChild(clearBtn);
  }

  /* ============================================================
     HELPERS
     ============================================================ */

  _toggleFilterValue(key, value, isChecked) {
    if (!this.activeFilters[key]) this.activeFilters[key] = new Set();
    if (isChecked) {
      this.activeFilters[key].add(value);
    } else {
      this.activeFilters[key].delete(value);
      if (this.activeFilters[key].size === 0) {
        delete this.activeFilters[key];
      }
    }
  }

  _syncDropdownCheckboxes(key) {
    const { menu } = this.dropdowns[key] || {};
    if (!menu) return;
    const vals = this.activeFilters[key] || new Set();
    menu.querySelectorAll('.filter-dropdown-item').forEach(item => {
      const v = item.dataset.value;
      const cb = item.querySelector('input[type="checkbox"]');
      const checked = vals.has(v);
      if (cb) cb.checked = checked;
      item.classList.toggle('selected', checked);
    });
  }

  _updateDropdownLabel(key, btn) {
    if (!btn) return;
    const filterDef = this.filters.find(f => f.key === key);
    const vals = this.activeFilters[key];
    const count = vals ? vals.size : 0;
    if (count === 0) {
      btn.querySelector('.dropdown-value').textContent = filterDef?.label || key;
    } else if (count === 1) {
      const v = [...vals][0];
      const opt = filterDef?.options?.find(o => o.value === v);
      btn.querySelector('.dropdown-value').textContent = opt?.label || v;
    } else {
      btn.querySelector('.dropdown-value').textContent = `${filterDef?.label || key} (${count})`;
    }
  }

  _updateSortDropdown() {
    const label = this.opts.sortOptions.find(o => o.value === this.sortBy)?.label || 'Sort';
    this.sortDropdownBtn.querySelector('.dropdown-value').textContent = label;
    this.sortDropdownMenu.querySelectorAll('.filter-dropdown-item').forEach(item => {
      const cb = item.querySelector('input[type="checkbox"]');
      const selected = item.dataset.sortValue === this.sortBy;
      if (cb) cb.checked = selected;
      item.classList.toggle('selected', selected);
    });
  }

  clearAllFilters() {
    this.activeFilters = {};
    this.searchQuery = '';
    this.searchInput.value = '';
    this.currentPage = 1;

    Object.keys(this.dropdowns).forEach(key => {
      this._syncDropdownCheckboxes(key);
      this._updateDropdownLabel(key, this.dropdowns[key]?.btn);
    });
    this._updateActivePills();
    this.applyFilters();
  }

  /* ============================================================
     PAGINATION WINDOWING
     ============================================================ */

  _pageNumbers(current, total) {
    const pages = [];
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
      return pages;
    }
    pages.push(1);
    if (current > 3) pages.push('…');
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (current < total - 2) pages.push('…');
    pages.push(total);
    return pages;
  }

  /* ============================================================
     DEFAULT CARD TEMPLATE
     ============================================================ */

  _defaultCardTemplate(item, index) {
    const badge = item.category || item.type || 'Item';
    const title = item.title || item.name || 'Untitled';
    const meta1 = item.subject || item.department || '';
    const meta2 = item.semester || item.date || '';
    const footer = item.date || '';
    return `
      <span class="card-badge">${badge}</span>
      <h3 class="card-title">${title}</h3>
      <div class="card-meta">
        ${meta1 ? `<span>${meta1}</span>` : ''}
        ${meta1 && meta2 ? '<span class="meta-divider">&bull;</span>' : ''}
        ${meta2 ? `<span>${meta2}</span>` : ''}
      </div>
      <div class="card-footer">
        <span class="footer-note">${footer}</span>
        <button class="btn-link" data-download>Download</button>
      </div>
    `;
  }

  /* ============================================================
     EVENTS & ACCESSIBILITY
     ============================================================ */

  _bindEvents() {
    document.addEventListener('click', this._boundDocClick);
    document.addEventListener('keydown', this._boundKeydown);

    // Search input debounce
    let debounceTimer;
    this.searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        this.currentPage = 1;
        this.applyFilters();
      }, 250);
    });

    this.searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        clearTimeout(debounceTimer);
        this.currentPage = 1;
        this.applyFilters();
      }
    });
  }

  _onDocumentClick(e) {
    if (!e.target.closest('.filter-dropdown')) {
      this._closeAllDropdowns();
    }
  }

  _onKeydown(e) {
    if (e.key === 'Escape') {
      this._closeAllDropdowns();
    }
  }

  _toggleDropdown(dropdown, btn) {
    const isOpen = dropdown.classList.contains('open');
    this._closeAllDropdowns();
    if (!isOpen) {
      dropdown.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  }

  _closeAllDropdowns() {
    this.filterBar.querySelectorAll('.filter-dropdown.open').forEach(dd => {
      dd.classList.remove('open');
      const btn = dd.querySelector('.filter-dropdown-btn');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    });
  }

  _scrollToTop() {
    if (this.cardsGrid) {
      this.cardsGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  _dispatchEvent(name, detail) {
    const event = new CustomEvent(`filter-system:${name}`, {
      bubbles: true,
      detail: { ...detail, instance: this }
    });
    this.container.dispatchEvent(event);
  }
}

/* Legacy UMD for direct script tag usage (optional) */
if (typeof window !== 'undefined') {
  window.FilterSystem = FilterSystem;
}
