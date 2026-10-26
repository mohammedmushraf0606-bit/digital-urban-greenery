/**
 * Green Belt Management Controller
 */

let currentBelts = [];
let beltModalInstance = null;

async function loadBelts() {
    const search = document.getElementById('searchBeltInput')?.value.trim() || '';
    const status = document.getElementById('filterBeltStatus')?.value || '';

    try {
        const queryParams = new URLSearchParams();
        if (search) queryParams.append('search', search);
        if (status) queryParams.append('status', status);

        const res = await apiGet(`/green-belts?${queryParams.toString()}`);
        currentBelts = res.data || [];
        renderBeltsTable(currentBelts);

        const countBadge = document.getElementById('totalBeltsCount');
        if (countBadge) countBadge.textContent = `${currentBelts.length} Green Belts`;

    } catch (err) {
        console.error('Error loading green belts:', err);
        showToast('Failed to load green belts: ' + err.message, 'error');
    }
}

function renderBeltsTable(belts) {
    const tbody = document.getElementById('beltsTableBody');
    if (!tbody) return;

    if (belts.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-5 text-muted">
                    <i class="fa-solid fa-road fa-3x mb-3 text-secondary" style="opacity: 0.4;"></i>
                    <p class="mb-0 fw-medium">No green belts found matching search criteria.</p>
                </td>
            </tr>`;
        return;
    }

    tbody.innerHTML = belts.map(b => {
        let statusBadge = 'badge-healthy';
        if (b.status === 'Moderate') statusBadge = 'badge-moderate';
        else if (b.status === 'Degraded') statusBadge = 'badge-critical';

        return `
            <tr>
                <td><strong>#${b.id}</strong></td>
                <td>
                    <div class="fw-bold text-dark">${b.belt_name}</div>
                    <small class="text-muted"><i class="fa-solid fa-location-dot me-1 text-danger"></i>${b.location}</small>
                </td>
                <td><span class="badge bg-light text-dark border">${b.buffer_type}</span></td>
                <td>${b.length_km} km × ${b.width_m} m</td>
                <td>${Number(b.area_sq_m).toLocaleString()} m²</td>
                <td><span class="text-muted small">${b.vegetation_type}</span></td>
                <td><span class="badge-custom ${statusBadge}">${b.status}</span></td>
                <td class="text-end">
                    <button class="action-btn" title="Edit Green Belt" onclick="editBelt(${b.id})">
                        <i class="fa-solid fa-pen-to-square text-success"></i>
                    </button>
                    <button class="action-btn delete" title="Delete Green Belt" onclick="deleteBelt(${b.id}, '${b.belt_name.replace(/'/g, "\\'")}')">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function openAddBeltModal() {
    document.getElementById('beltForm').reset();
    document.getElementById('beltId').value = '';
    document.getElementById('beltModalTitle').innerHTML = '<i class="fa-solid fa-plus-circle me-2 text-success"></i>Register New Green Belt';

    if (!beltModalInstance) {
        beltModalInstance = new bootstrap.Modal(document.getElementById('beltModal'));
    }
    beltModalInstance.show();
}

function editBelt(id) {
    const b = currentBelts.find(item => item.id === id);
    if (!b) return;

    document.getElementById('beltId').value = b.id;
    document.getElementById('beltName').value = b.belt_name;
    document.getElementById('beltLocation').value = b.location;
    document.getElementById('beltLength').value = b.length_km;
    document.getElementById('beltWidth').value = b.width_m;
    document.getElementById('beltVegetation').value = b.vegetation_type;
    document.getElementById('beltBufferType').value = b.buffer_type;
    document.getElementById('beltStatus').value = b.status;
    document.getElementById('beltFrequency').value = b.maintenance_frequency;
    document.getElementById('beltRemarks').value = b.remarks || '';

    document.getElementById('beltModalTitle').innerHTML = '<i class="fa-solid fa-pen-to-square me-2 text-success"></i>Edit Green Belt Details';

    if (!beltModalInstance) {
        beltModalInstance = new bootstrap.Modal(document.getElementById('beltModal'));
    }
    beltModalInstance.show();
}

async function handleBeltSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('beltId').value;
    const isEdit = Boolean(id);

    const length_km = parseFloat(document.getElementById('beltLength').value);
    const width_m = parseFloat(document.getElementById('beltWidth').value);
    const area_sq_m = length_km * 1000.0 * width_m;

    const payload = {
        belt_name: document.getElementById('beltName').value.trim(),
        location: document.getElementById('beltLocation').value.trim(),
        length_km: length_km,
        width_m: width_m,
        area_sq_m: area_sq_m,
        vegetation_type: document.getElementById('beltVegetation').value.trim(),
        buffer_type: document.getElementById('beltBufferType').value,
        status: document.getElementById('beltStatus').value,
        maintenance_frequency: document.getElementById('beltFrequency').value,
        remarks: document.getElementById('beltRemarks').value.trim()
    };

    try {
        if (isEdit) {
            await apiPut(`/green-belts/${id}`, payload);
            showToast('Green belt updated successfully!');
        } else {
            await apiPost('/green-belts', payload);
            showToast('New green belt registered successfully!');
        }

        if (beltModalInstance) beltModalInstance.hide();
        loadBelts();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function deleteBelt(id, name) {
    if (!confirm(`Are you sure you want to delete green belt "${name}"?`)) {
        return;
    }

    try {
        await apiDelete(`/green-belts/${id}`);
        showToast(`Green belt "${name}" deleted successfully.`);
        loadBelts();
    } catch (err) {
        showToast('Error deleting green belt: ' + err.message, 'error');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadBelts();

    const searchInput = document.getElementById('searchBeltInput');
    if (searchInput) {
        let debounce;
        searchInput.addEventListener('input', () => {
            clearTimeout(debounce);
            debounce = setTimeout(loadBelts, 300);
        });
    }

    const statusFilter = document.getElementById('filterBeltStatus');
    if (statusFilter) statusFilter.addEventListener('change', loadBelts);

    const form = document.getElementById('beltForm');
    if (form) form.addEventListener('submit', handleBeltSubmit);
});
