/**
 * Urban Forest Management Controller
 */

let currentForests = [];
let forestModalInstance = null;

async function loadForests() {
    const search = document.getElementById('searchForestInput')?.value.trim() || '';
    const density = document.getElementById('filterDensity')?.value || '';

    try {
        const queryParams = new URLSearchParams();
        if (search) queryParams.append('search', search);
        if (density) queryParams.append('density', density);

        const res = await apiGet(`/urban-forests?${queryParams.toString()}`);
        currentForests = res.data || [];
        renderForestsTable(currentForests);

        const countBadge = document.getElementById('totalForestsCount');
        if (countBadge) countBadge.textContent = `${currentForests.length} Urban Forests`;

    } catch (err) {
        console.error('Error loading urban forests:', err);
        showToast('Failed to load urban forests: ' + err.message, 'error');
    }
}

function renderForestsTable(forests) {
    const tbody = document.getElementById('forestsTableBody');
    if (!tbody) return;

    if (forests.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-5 text-muted">
                    <i class="fa-solid fa-mountain-sun fa-3x mb-3 text-secondary" style="opacity: 0.4;"></i>
                    <p class="mb-0 fw-medium">No urban forest reserves found.</p>
                </td>
            </tr>`;
        return;
    }

    tbody.innerHTML = forests.map(f => {
        let densityBadge = 'badge-good';
        if (f.canopy_density === 'Dense') densityBadge = 'badge-active';
        else if (f.canopy_density === 'Low') densityBadge = 'badge-fair';

        return `
            <tr>
                <td><strong>#${f.id}</strong></td>
                <td>
                    <div class="fw-bold text-dark">${f.forest_name}</div>
                    <small class="text-muted"><i class="fa-solid fa-map-pin me-1 text-danger"></i>${f.location}</small>
                </td>
                <td><span class="badge bg-light text-dark border">${f.forest_type}</span></td>
                <td><strong>${f.area_hectares} ha</strong> <small class="text-muted">(${f.area_hectares * 10000} m²)</small></td>
                <td><span class="fw-bold text-success">${Number(f.tree_count).toLocaleString()}</span></td>
                <td>
                    <div class="d-flex align-items-center gap-2">
                        <div class="progress" style="width: 70px; height: 8px;">
                            <div class="progress-bar bg-success" style="width: ${(f.biodiversity_index / 5.0) * 100}%"></div>
                        </div>
                        <span class="small fw-semibold">${f.biodiversity_index}/5.0</span>
                    </div>
                </td>
                <td><span class="badge-custom ${densityBadge}">${f.canopy_density}</span></td>
                <td class="text-end">
                    <button class="action-btn" title="Edit Forest" onclick="editForest(${f.id})">
                        <i class="fa-solid fa-pen-to-square text-success"></i>
                    </button>
                    <button class="action-btn delete" title="Delete Forest" onclick="deleteForest(${f.id}, '${f.forest_name.replace(/'/g, "\\'")}')">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function openAddForestModal() {
    document.getElementById('forestForm').reset();
    document.getElementById('forestId').value = '';
    document.getElementById('forestModalTitle').innerHTML = '<i class="fa-solid fa-plus-circle me-2 text-success"></i>Add Urban Forest Reserve';

    if (!forestModalInstance) {
        forestModalInstance = new bootstrap.Modal(document.getElementById('forestModal'));
    }
    forestModalInstance.show();
}

function editForest(id) {
    const f = currentForests.find(item => item.id === id);
    if (!f) return;

    document.getElementById('forestId').value = f.id;
    document.getElementById('forestName').value = f.forest_name;
    document.getElementById('forestLocation').value = f.location;
    document.getElementById('forestArea').value = f.area_hectares;
    document.getElementById('forestTreeCount').value = f.tree_count;
    document.getElementById('forestBiodiversity').value = f.biodiversity_index;
    document.getElementById('forestDensity').value = f.canopy_density;
    document.getElementById('forestType').value = f.forest_type;
    document.getElementById('forestYear').value = f.established_year || '';
    document.getElementById('forestRemarks').value = f.remarks || '';

    document.getElementById('forestModalTitle').innerHTML = '<i class="fa-solid fa-pen-to-square me-2 text-success"></i>Edit Urban Forest Details';

    if (!forestModalInstance) {
        forestModalInstance = new bootstrap.Modal(document.getElementById('forestModal'));
    }
    forestModalInstance.show();
}

async function handleForestSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('forestId').value;
    const isEdit = Boolean(id);

    const payload = {
        forest_name: document.getElementById('forestName').value.trim(),
        location: document.getElementById('forestLocation').value.trim(),
        area_hectares: parseFloat(document.getElementById('forestArea').value),
        tree_count: parseInt(document.getElementById('forestTreeCount').value || 0),
        biodiversity_index: parseFloat(document.getElementById('forestBiodiversity').value || 3.5),
        canopy_density: document.getElementById('forestDensity').value,
        forest_type: document.getElementById('forestType').value,
        established_year: document.getElementById('forestYear').value ? parseInt(document.getElementById('forestYear').value) : null,
        remarks: document.getElementById('forestRemarks').value.trim()
    };

    try {
        if (isEdit) {
            await apiPut(`/urban-forests/${id}`, payload);
            showToast('Urban forest updated successfully!');
        } else {
            await apiPost('/urban-forests', payload);
            showToast('New urban forest recorded successfully!');
        }

        if (forestModalInstance) forestModalInstance.hide();
        loadForests();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function deleteForest(id, name) {
    if (!confirm(`Are you sure you want to delete urban forest reserve "${name}"?`)) {
        return;
    }

    try {
        await apiDelete(`/urban-forests/${id}`);
        showToast(`Urban forest "${name}" deleted successfully.`);
        loadForests();
    } catch (err) {
        showToast('Error deleting forest: ' + err.message, 'error');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadForests();

    const searchInput = document.getElementById('searchForestInput');
    if (searchInput) {
        let debounce;
        searchInput.addEventListener('input', () => {
            clearTimeout(debounce);
            debounce = setTimeout(loadForests, 300);
        });
    }

    const densityFilter = document.getElementById('filterDensity');
    if (densityFilter) densityFilter.addEventListener('change', loadForests);

    const form = document.getElementById('forestForm');
    if (form) form.addEventListener('submit', handleForestSubmit);
});
