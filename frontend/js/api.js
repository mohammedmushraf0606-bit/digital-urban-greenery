/**
 * Digital Urban Greenery Management System
 * API Client & UI Utilities
 */

// Base API URL configuration
// Dynamically matches whatever host you browse with (http://localhost:8080, http://localhost, etc.)
const API_BASE = (window.location.protocol.startsWith('http'))
    ? `${window.location.origin}/api`
    : 'http://localhost:8080/api';

async function apiRequest(endpoint, method = 'GET', body = null) {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        credentials: 'omit' // Simple session/mock mode
    };

    if (body && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(url, options);
        const data = await response.json().catch(() => ({}));
        
        if (!response.ok) {
            const errorMsg = data.message || (data.errors ? data.errors.join(', ') : `HTTP Error ${response.status}`);
            throw new Error(errorMsg);
        }
        return data;
    } catch (err) {
        console.error(`[API Error] ${method} ${endpoint}:`, err);
        throw err;
    }
}

// Convenience API wrappers
const apiGet = (endpoint) => apiRequest(endpoint, 'GET');
const apiPost = (endpoint, data) => apiRequest(endpoint, 'POST', data);
const apiPut = (endpoint, data) => apiRequest(endpoint, 'PUT', data);
const apiPatch = (endpoint, data) => apiRequest(endpoint, 'PATCH', data);
const apiDelete = (endpoint) => apiRequest(endpoint, 'DELETE');

// Toast Notification System
function showToast(message, type = 'success') {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container-custom';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast-custom ${type}`;

    let icon = 'fa-check-circle text-success';
    if (type === 'error') icon = 'fa-exclamation-circle text-danger';
    if (type === 'warning') icon = 'fa-triangle-exclamation text-warning';

    toast.innerHTML = `
        <i class="fa-solid ${icon} fa-lg"></i>
        <div style="flex: 1; font-size: 0.88rem; font-weight: 500;">${message}</div>
        <button type="button" style="border:none;background:none;color:#94a3b8;cursor:pointer;" onclick="this.parentElement.remove()">
            <i class="fa-solid fa-xmark"></i>
        </button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        if (toast.parentElement) {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }
    }, 4000);
}

// Global search handling
document.addEventListener('DOMContentLoaded', () => {
    // Mobile sidebar toggle
    const toggleBtn = document.getElementById('mobileSidebarToggle');
    const sidebar = document.querySelector('.sidebar');
    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('show');
        });
    }

    // Universal Topbar Live Search
    const searchInput = document.getElementById('globalSearchInput');
    const searchDropdown = document.getElementById('globalSearchResults');

    if (searchInput && searchDropdown) {
        let debounceTimer;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            const query = e.target.value.trim();
            if (query.length < 2) {
                searchDropdown.style.display = 'none';
                return;
            }

            debounceTimer = setTimeout(async () => {
                try {
                    const res = await apiGet(`/reports/search?q=${encodeURIComponent(query)}`);
                    if (res.results && res.results.length > 0) {
                        searchDropdown.innerHTML = res.results.map(r => `
                            <a href="${r.url}" class="dropdown-item py-2 px-3 border-bottom text-decoration-none d-block">
                                <div class="d-flex justify-content-between align-items-center">
                                    <strong class="text-dark font-size-sm">${r.title}</strong>
                                    <span class="badge bg-secondary font-size-xs">${r.category}</span>
                                </div>
                                <div class="text-muted small">${r.subtitle || ''}</div>
                            </a>
                        `).join('');
                        searchDropdown.style.display = 'block';
                    } else {
                        searchDropdown.innerHTML = '<div class="p-3 text-center text-muted small">No greenery records found.</div>';
                        searchDropdown.style.display = 'block';
                    }
                } catch (err) {
                    console.error('Search error:', err);
                }
            }, 300);
        });

        // Close search on click outside
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !searchDropdown.contains(e.target)) {
                searchDropdown.style.display = 'none';
            }
        });
    }
});
