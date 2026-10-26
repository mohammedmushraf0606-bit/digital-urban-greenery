/**
 * Tree Inventory Management Controller
 */

let currentTrees = [];
let treeModalInstance = null;
let viewTreeModalInstance = null;

async function loadTrees() {
    const search = document.getElementById('searchTreeInput')?.value.trim() || '';
    const species = document.getElementById('filterSpecies')?.value || '';
    const health = document.getElementById('filterHealth')?.value || '';
    const parkId = document.getElementById('filterPark')?.value || '';

    try {
        const queryParams = new URLSearchParams();
        if (search) queryParams.append('search', search);
        if (species) queryParams.append('species', species);
        if (health) queryParams.append('health', health);
        if (parkId) queryParams.append('park_id', parkId);

        const res = await apiGet(`/trees?${queryParams.toString()}`);
        currentTrees = res.data || [];
        renderTreesTable(currentTrees);

        const countBadge = document.getElementById('totalTreesCount');
        if (countBadge) countBadge.textContent = `${currentTrees.length} Trees`;

    } catch (err) {
        console.error('Error loading trees:', err);
        showToast('Failed to load tree inventory: ' + err.message, 'error');
    }
}

// Populate Park dropdowns and Species list in filters
async function loadFilterOptions() {
    try {
        // Load parks
        const parksRes = await apiGet('/parks');
        const parks = parksRes.data || [];

        const filterPark = document.getElementById('filterPark');
        const formPark = document.getElementById('treeParkId');

        if (filterPark) {
            filterPark.innerHTML = '<option value="">All Parks</option>' + 
                parks.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
        }

        if (formPark) {
            formPark.innerHTML = '<option value="">-- Unassigned / Roadside --</option>' + 
                parks.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
        }

        // Load species
        const speciesRes = await apiGet('/trees/species-list');
        const speciesList = speciesRes.data || [];

        const filterSpecies = document.getElementById('filterSpecies');
        if (filterSpecies) {
            filterSpecies.innerHTML = '<option value="">All Species</option>' + 
                speciesList.map(s => `<option value="${s.species}">${s.common_name} (${s.species})</option>`).join('');
        }
    } catch (e) {
        console.error('Error populating filters:', e);
    }
}

function renderTreesTable(trees) {
    const tbody = document.getElementById('treesTableBody');
    if (!tbody) return;

    if (trees.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center py-5 text-muted">
                    <i class="fa-solid fa-tree fa-3x mb-3 text-secondary" style="opacity: 0.4;"></i>
                    <p class="mb-0 fw-medium">No tree records found matching your filters.</p>
                </td>
            </tr>`;
        return;
    }

    tbody.innerHTML = trees.map(t => {
        let healthBadge = 'badge-healthy';
        if (t.health_status === 'Fair') healthBadge = 'badge-fair';
        else if (t.health_status === 'Poor') healthBadge = 'badge-poor';
        else if (t.health_status === 'Critical') healthBadge = 'badge-critical';

        let maintBadge = 'badge-good';
        if (t.maintenance_status === 'Pruning Needed') maintBadge = 'badge-pruning-needed';
        else if (t.maintenance_status === 'Pest Treatment Required') maintBadge = 'badge-poor';
        else if (t.maintenance_status === 'Inspection Required') maintBadge = 'badge-inspection-required';

        return `
            <tr>
                <td><strong class="text-success">${t.tree_code}</strong></td>
                <td>
                    <div class="fw-bold text-dark">${t.common_name}</div>
                    <small class="text-muted fst-italic">${t.species}</small>
                </td>
                <td>
                    <span class="badge bg-light text-dark border">
                        <i class="fa-solid fa-tree-city me-1 text-success"></i>${t.park_name || 'Roadside / Urban Area'}
                    </span>
                </td>
                <td>${t.age_years ? t.age_years + ' yrs' : 'N/A'}</td>
                <td>${t.height_m ? t.height_m + ' m' : 'N/A'}</td>
                <td><span class="badge-custom ${healthBadge}">${t.health_status}</span></td>
                <td><span class="badge-custom ${maintBadge}">${t.maintenance_status}</span></td>
                <td><span class="fw-semibold text-emerald">${t.carbon_offset_kg || 22} kg/yr</span></td>
                <td class="text-end">
                    <button class="action-btn" title="View Details" onclick="viewTree(${t.id})">
                        <i class="fa-solid fa-eye text-primary"></i>
                    </button>
                    <button class="action-btn" title="Edit Tree" onclick="editTree(${t.id})">
                        <i class="fa-solid fa-pen-to-square text-success"></i>
                    </button>
                    <button class="action-btn delete" title="Delete Tree" onclick="deleteTree(${t.id}, '${t.tree_code}')">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function openAddTreeModal() {
    document.getElementById('treeForm').reset();
    document.getElementById('treeId').value = '';
    // Auto-generate code
    const rand = Math.floor(100 + Math.random() * 900);
    document.getElementById('treeCode').value = `TR-2026-${rand}`;
    document.getElementById('treeModalTitle').innerHTML = '<i class="fa-solid fa-plus-circle me-2 text-success"></i>Register New Tree';

    if (!treeModalInstance) {
        treeModalInstance = new bootstrap.Modal(document.getElementById('treeModal'));
    }
    treeModalInstance.show();
}

function editTree(id) {
    const tree = currentTrees.find(t => t.id === id);
    if (!tree) return;

    document.getElementById('treeId').value = tree.id;
    document.getElementById('treeCode').value = tree.tree_code;
    document.getElementById('treeSpecies').value = tree.species;
    document.getElementById('treeCommonName').value = tree.common_name;
    document.getElementById('treeParkId').value = tree.park_id || '';
    document.getElementById('treeLocationDetails').value = tree.location_details;
    document.getElementById('treeAge').value = tree.age_years || '';
    document.getElementById('treeHeight').value = tree.height_m || '';
    document.getElementById('treeCanopy').value = tree.canopy_diameter_m || '';
    document.getElementById('treeHealth').value = tree.health_status;
    document.getElementById('treeMaintenance').value = tree.maintenance_status;
    document.getElementById('treeCarbon').value = tree.carbon_offset_kg || '';
    document.getElementById('treePlantedDate').value = tree.planted_date || '';

    document.getElementById('treeModalTitle').innerHTML = '<i class="fa-solid fa-pen-to-square me-2 text-success"></i>Edit Tree Record';

    if (!treeModalInstance) {
        treeModalInstance = new bootstrap.Modal(document.getElementById('treeModal'));
    }
    treeModalInstance.show();
}

async function handleTreeSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('treeId').value;
    const isEdit = Boolean(id);

    const payload = {
        tree_code: document.getElementById('treeCode').value.trim(),
        species: document.getElementById('treeSpecies').value.trim(),
        common_name: document.getElementById('treeCommonName').value.trim(),
        park_id: document.getElementById('treeParkId').value || null,
        location_details: document.getElementById('treeLocationDetails').value.trim(),
        age_years: document.getElementById('treeAge').value ? parseInt(document.getElementById('treeAge').value) : null,
        height_m: document.getElementById('treeHeight').value ? parseFloat(document.getElementById('treeHeight').value) : null,
        canopy_diameter_m: document.getElementById('treeCanopy').value ? parseFloat(document.getElementById('treeCanopy').value) : null,
        health_status: document.getElementById('treeHealth').value,
        maintenance_status: document.getElementById('treeMaintenance').value,
        carbon_offset_kg: document.getElementById('treeCarbon').value ? parseFloat(document.getElementById('treeCarbon').value) : null,
        planted_date: document.getElementById('treePlantedDate').value || null
    };

    try {
        if (isEdit) {
            await apiPut(`/trees/${id}`, payload);
            showToast('Tree record updated successfully!');
        } else {
            await apiPost('/trees', payload);
            showToast('New tree registered successfully!');
        }

        if (treeModalInstance) treeModalInstance.hide();
        loadTrees();
        loadFilterOptions();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function viewTree(id) {
    try {
        const res = await apiGet(`/trees/${id}`);
        const t = res.data;

        document.getElementById('viewTreeCode').textContent = t.tree_code;
        document.getElementById('viewTreeCommon').textContent = t.common_name;
        document.getElementById('viewTreeSpecies').textContent = t.species;
        document.getElementById('viewTreePark').textContent = t.park_name || 'Stand-alone / Roadside Greenery';
        document.getElementById('viewTreeLocation').textContent = t.location_details;
        document.getElementById('viewTreeAge').textContent = t.age_years ? `${t.age_years} years` : 'N/A';
        document.getElementById('viewTreeHeight').textContent = t.height_m ? `${t.height_m} meters` : 'N/A';
        document.getElementById('viewTreeCanopy').textContent = t.canopy_diameter_m ? `${t.canopy_diameter_m} meters` : 'N/A';
        document.getElementById('viewTreeHealth').textContent = t.health_status;
        document.getElementById('viewTreeMaint').textContent = t.maintenance_status;
        document.getElementById('viewTreeCarbon').textContent = `${t.carbon_offset_kg || 22} kg CO2 / year`;
        document.getElementById('viewTreePlanted').textContent = t.planted_date || 'Historical / Self-sown';

        if (!viewTreeModalInstance) {
            viewTreeModalInstance = new bootstrap.Modal(document.getElementById('viewTreeModal'));
        }
        viewTreeModalInstance.show();
    } catch (err) {
        showToast('Failed to view tree: ' + err.message, 'error');
    }
}

async function deleteTree(id, treeCode) {
    if (!confirm(`Are you sure you want to delete tree record "${treeCode}"?`)) {
        return;
    }

    try {
        await apiDelete(`/trees/${id}`);
        showToast(`Tree record "${treeCode}" deleted successfully.`);
        loadTrees();
    } catch (err) {
        showToast('Error deleting tree: ' + err.message, 'error');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadFilterOptions();
    loadTrees();

    const searchInput = document.getElementById('searchTreeInput');
    if (searchInput) {
        let debounce;
        searchInput.addEventListener('input', () => {
            clearTimeout(debounce);
            debounce = setTimeout(loadTrees, 300);
        });
    }

    const speciesFilter = document.getElementById('filterSpecies');
    if (speciesFilter) speciesFilter.addEventListener('change', loadTrees);

    const healthFilter = document.getElementById('filterHealth');
    if (healthFilter) healthFilter.addEventListener('change', loadTrees);

    const parkFilter = document.getElementById('filterPark');
    if (parkFilter) parkFilter.addEventListener('change', loadTrees);

    const form = document.getElementById('treeForm');
    if (form) form.addEventListener('submit', handleTreeSubmit);
});
