/**
 * Parks Management Controller
 */

let currentParks = [];
let parkModalInstance = null;
let viewModalInstance = null;

async function loadParks() {
    const search = document.getElementById('searchParkInput')?.value.trim() || '';
    const type = document.getElementById('filterParkType')?.value || '';
    const status = document.getElementById('filterParkStatus')?.value || '';

    try {
        const queryParams = new URLSearchParams();
        if (search) queryParams.append('search', search);
        if (type) queryParams.append('type', type);
        if (status) queryParams.append('status', status);

        const res = await apiGet(`/parks?${queryParams.toString()}`);
        currentParks = res.data || [];
        renderParksTable(currentParks);

        // Update total counter
        const countBadge = document.getElementById('totalParksCount');
        if (countBadge) countBadge.textContent = `${currentParks.length} Parks`;

    } catch (err) {
        console.error('Error loading parks:', err);
        showToast('Failed to load parks: ' + err.message, 'error');
    }
}

function renderParksTable(parks) {
    const tbody = document.getElementById('parksTableBody');
    if (!tbody) return;

    if (parks.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-5 text-muted">
                    <i class="fa-solid fa-tree-city fa-3x mb-3 text-secondary" style="opacity: 0.4;"></i>
                    <p class="mb-0 fw-medium">No parks match the current criteria.</p>
                </td>
            </tr>`;
        return;
    }

    tbody.innerHTML = parks.map(p => {
        let statusBadge = 'badge-active';
        if (p.status === 'Under Renovation') statusBadge = 'badge-fair';
        else if (p.status === 'Proposed') statusBadge = 'badge-secondary-custom';

        let maintBadge = 'badge-good';
        if (p.maintenance_status === 'Moderate') maintBadge = 'badge-moderate';
        else if (p.maintenance_status === 'Needs Attention') maintBadge = 'badge-needs-attention';

        return `
            <tr>
                <td><strong>#${p.id}</strong></td>
                <td>
                    <div class="fw-bold text-dark">${p.name}</div>
                    <small class="text-muted"><i class="fa-solid fa-location-dot me-1 text-danger"></i>${p.location}</small>
                </td>
                <td><span class="badge bg-light text-dark border">${p.park_type}</span></td>
                <td>${Number(p.area_sq_m).toLocaleString()} m²</td>
                <td>
                    <span class="badge bg-success-subtle text-success fw-semibold">
                        <i class="fa-solid fa-tree me-1"></i>${p.tree_count || 0}
                    </span>
                </td>
                <td><span class="badge-custom ${statusBadge}">${p.status}</span></td>
                <td><span class="badge-custom ${maintBadge}">${p.maintenance_status}</span></td>
                <td class="text-end">
                    <button class="action-btn" title="View Details" onclick="viewPark(${p.id})">
                        <i class="fa-solid fa-eye text-primary"></i>
                    </button>
                    <button class="action-btn" title="Edit Park" onclick="editPark(${p.id})">
                        <i class="fa-solid fa-pen-to-square text-success"></i>
                    </button>
                    <button class="action-btn delete" title="Delete Park" onclick="deletePark(${p.id}, '${p.name.replace(/'/g, "\\'")}')">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Open modal for Adding new park
function openAddParkModal() {
    document.getElementById('parkForm').reset();
    document.getElementById('parkId').value = '';
    document.getElementById('parkModalTitle').innerHTML = '<i class="fa-solid fa-plus-circle me-2 text-success"></i>Add New Park';
    
    if (!parkModalInstance) {
        parkModalInstance = new bootstrap.Modal(document.getElementById('parkModal'));
    }
    parkModalInstance.show();
}

// Edit existing park
function editPark(id) {
    const park = currentParks.find(p => p.id === id);
    if (!park) return;

    document.getElementById('parkId').value = park.id;
    document.getElementById('parkName').value = park.name;
    document.getElementById('parkLocation').value = park.location;
    document.getElementById('parkWard').value = park.ward_no || '';
    document.getElementById('parkArea').value = park.area_sq_m;
    document.getElementById('parkType').value = park.park_type;
    document.getElementById('parkYear').value = park.established_year || '';
    document.getElementById('parkOfficer').value = park.contact_officer || '';
    document.getElementById('parkPhone').value = park.contact_phone || '';
    document.getElementById('parkFacilities').value = park.facilities || '';
    document.getElementById('parkStatus').value = park.status;
    document.getElementById('parkMaintenance').value = park.maintenance_status;

    document.getElementById('parkModalTitle').innerHTML = '<i class="fa-solid fa-pen-to-square me-2 text-success"></i>Edit Park Details';

    if (!parkModalInstance) {
        parkModalInstance = new bootstrap.Modal(document.getElementById('parkModal'));
    }
    parkModalInstance.show();
}

// Save Park (Add or Update)
async function handleParkSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('parkId').value;
    const isEdit = Boolean(id);

    const payload = {
        name: document.getElementById('parkName').value.trim(),
        location: document.getElementById('parkLocation').value.trim(),
        ward_no: document.getElementById('parkWard').value.trim(),
        area_sq_m: parseFloat(document.getElementById('parkArea').value),
        park_type: document.getElementById('parkType').value,
        established_year: document.getElementById('parkYear').value ? parseInt(document.getElementById('parkYear').value) : null,
        contact_officer: document.getElementById('parkOfficer').value.trim(),
        contact_phone: document.getElementById('parkPhone').value.trim(),
        facilities: document.getElementById('parkFacilities').value.trim(),
        status: document.getElementById('parkStatus').value,
        maintenance_status: document.getElementById('parkMaintenance').value
    };

    try {
        if (isEdit) {
            await apiPut(`/parks/${id}`, payload);
            showToast('Park updated successfully!');
        } else {
            await apiPost('/parks', payload);
            showToast('New park created successfully!');
        }

        if (parkModalInstance) parkModalInstance.hide();
        loadParks();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

// View details modal
async function viewPark(id) {
    try {
        const res = await apiGet(`/parks/${id}`);
        const p = res.data;

        document.getElementById('viewParkName').textContent = p.name;
        document.getElementById('viewParkLocation').textContent = p.location;
        document.getElementById('viewParkWard').textContent = p.ward_no || 'N/A';
        document.getElementById('viewParkArea').textContent = `${Number(p.area_sq_m).toLocaleString()} m² (${(p.area_sq_m / 10000).toFixed(2)} ha)`;
        document.getElementById('viewParkType').textContent = p.park_type;
        document.getElementById('viewParkYear').textContent = p.established_year || 'Unknown';
        document.getElementById('viewParkOfficer').textContent = `${p.contact_officer || 'N/A'} (${p.contact_phone || 'No phone'})`;
        document.getElementById('viewParkFacilities').textContent = p.facilities || 'Standard greenery facilities';
        document.getElementById('viewParkStatus').textContent = p.status;
        document.getElementById('viewParkMaint').textContent = p.maintenance_status;

        // Trees inside this park
        const treeListEl = document.getElementById('viewParkTrees');
        if (p.trees && p.trees.length > 0) {
            treeListEl.innerHTML = p.trees.map(t => `
                <li class="list-group-item d-flex justify-content-between align-items-center py-2">
                    <div>
                        <strong class="text-success">${t.tree_code}</strong>: ${t.common_name} 
                        <span class="text-muted small fst-italic">(${t.species})</span>
                    </div>
                    <span class="badge ${t.health_status === 'Healthy' ? 'bg-success' : 'bg-warning'}">${t.health_status}</span>
                </li>
            `).join('');
        } else {
            treeListEl.innerHTML = '<li class="list-group-item text-muted text-center py-2">No trees assigned to this park yet.</li>';
        }

        if (!viewModalInstance) {
            viewModalInstance = new bootstrap.Modal(document.getElementById('viewParkModal'));
        }
        viewModalInstance.show();

    } catch (err) {
        showToast('Failed to view park: ' + err.message, 'error');
    }
}

// Delete park
async function deletePark(id, name) {
    if (!confirm(`Are you sure you want to delete "${name}"? Any trees in this park will become unassigned.`)) {
        return;
    }

    try {
        await apiDelete(`/parks/${id}`);
        showToast(`Park "${name}" has been deleted.`);
        loadParks();
    } catch (err) {
        showToast('Error deleting park: ' + err.message, 'error');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadParks();

    const searchInput = document.getElementById('searchParkInput');
    if (searchInput) {
        let debounce;
        searchInput.addEventListener('input', () => {
            clearTimeout(debounce);
            debounce = setTimeout(loadParks, 300);
        });
    }

    const typeFilter = document.getElementById('filterParkType');
    if (typeFilter) typeFilter.addEventListener('change', loadParks);

    const statusFilter = document.getElementById('filterParkStatus');
    if (statusFilter) statusFilter.addEventListener('change', loadParks);

    const form = document.getElementById('parkForm');
    if (form) form.addEventListener('submit', handleParkSubmit);
});
