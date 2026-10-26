/**
 * Maintenance Management Controller
 */

let currentActivities = [];
let maintModalInstance = null;

async function loadMaintenance() {
    const search = document.getElementById('searchMaintInput')?.value.trim() || '';
    const status = document.getElementById('filterStatus')?.value || '';
    const targetType = document.getElementById('filterTargetType')?.value || '';
    const activityType = document.getElementById('filterActivityType')?.value || '';

    try {
        const queryParams = new URLSearchParams();
        if (search) queryParams.append('search', search);
        if (status) queryParams.append('status', status);
        if (targetType) queryParams.append('target_type', targetType);
        if (activityType) queryParams.append('activity_type', activityType);

        const res = await apiGet(`/maintenance?${queryParams.toString()}`);
        currentActivities = res.data || [];
        renderMaintenanceTable(currentActivities);

        const countBadge = document.getElementById('totalMaintCount');
        if (countBadge) countBadge.textContent = `${currentActivities.length} Tasks`;

    } catch (err) {
        console.error('Error loading maintenance:', err);
        showToast('Failed to load maintenance records: ' + err.message, 'error');
    }
}

function renderMaintenanceTable(activities) {
    const tbody = document.getElementById('maintTableBody');
    if (!tbody) return;

    if (activities.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center py-5 text-muted">
                    <i class="fa-solid fa-screwdriver-wrench fa-3x mb-3 text-secondary" style="opacity: 0.4;"></i>
                    <p class="mb-0 fw-medium">No maintenance activities match the current filters.</p>
                </td>
            </tr>`;
        return;
    }

    tbody.innerHTML = activities.map(a => {
        let statusBadge = 'badge-scheduled';
        if (a.status === 'Completed') statusBadge = 'badge-completed';
        else if (a.status === 'In Progress') statusBadge = 'badge-in-progress';
        else if (a.status === 'Overdue') statusBadge = 'badge-overdue';

        return `
            <tr>
                <td><strong>#${a.id}</strong></td>
                <td>
                    <div class="fw-bold text-dark">${a.activity_title}</div>
                    <small class="text-muted"><i class="fa-solid fa-tag me-1"></i>${a.activity_type}</small>
                </td>
                <td>
                    <span class="badge bg-light text-dark border">
                        <i class="fa-solid fa-location-crosshairs me-1 text-primary"></i>${a.target_type}: ${a.target_name}
                    </span>
                </td>
                <td><i class="fa-regular fa-calendar me-1 text-muted"></i>${a.scheduled_date}</td>
                <td>${a.completion_date ? `<i class="fa-solid fa-circle-check text-success me-1"></i>${a.completion_date}` : '<span class="text-muted fst-italic">Pending</span>'}</td>
                <td><i class="fa-solid fa-user-gear me-1 text-secondary"></i>${a.responsible_person}</td>
                <td><span class="badge-custom ${statusBadge}">${a.status}</span></td>
                <td><strong>$${Number(a.cost || 0).toLocaleString()}</strong></td>
                <td class="text-end">
                    ${a.status !== 'Completed' ? `
                        <button class="action-btn text-success" title="Mark as Completed" onclick="quickComplete(${a.id})">
                            <i class="fa-solid fa-check"></i>
                        </button>` : ''}
                    <button class="action-btn" title="Edit Task" onclick="editMaintenance(${a.id})">
                        <i class="fa-solid fa-pen-to-square text-success"></i>
                    </button>
                    <button class="action-btn delete" title="Delete Task" onclick="deleteMaintenance(${a.id}, '${a.activity_title.replace(/'/g, "\\'")}')">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function openAddMaintenanceModal() {
    document.getElementById('maintForm').reset();
    document.getElementById('maintId').value = '';
    // default today
    document.getElementById('maintScheduledDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('maintModalTitle').innerHTML = '<i class="fa-solid fa-plus-circle me-2 text-success"></i>Schedule Maintenance Task';

    if (!maintModalInstance) {
        maintModalInstance = new bootstrap.Modal(document.getElementById('maintModal'));
    }
    maintModalInstance.show();
}

function editMaintenance(id) {
    const a = currentActivities.find(item => item.id === id);
    if (!a) return;

    document.getElementById('maintId').value = a.id;
    document.getElementById('maintTitle').value = a.activity_title;
    document.getElementById('maintTargetType').value = a.target_type;
    document.getElementById('maintTargetName').value = a.target_name;
    document.getElementById('maintActivityType').value = a.activity_type;
    document.getElementById('maintScheduledDate').value = a.scheduled_date;
    document.getElementById('maintCompletionDate').value = a.completion_date || '';
    document.getElementById('maintResponsible').value = a.responsible_person;
    document.getElementById('maintStatus').value = a.status;
    document.getElementById('maintCost').value = a.cost || 0;
    document.getElementById('maintRemarks').value = a.remarks || '';

    document.getElementById('maintModalTitle').innerHTML = '<i class="fa-solid fa-pen-to-square me-2 text-success"></i>Edit Maintenance Task';

    if (!maintModalInstance) {
        maintModalInstance = new bootstrap.Modal(document.getElementById('maintModal'));
    }
    maintModalInstance.show();
}

async function quickComplete(id) {
    try {
        const today = new Date().toISOString().split('T')[0];
        await apiPatch(`/maintenance/${id}/status`, {
            status: 'Completed',
            completion_date: today
        });
        showToast('Task marked as completed!');
        loadMaintenance();
    } catch (err) {
        showToast('Failed to update status: ' + err.message, 'error');
    }
}

async function handleMaintSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('maintId').value;
    const isEdit = Boolean(id);

    const payload = {
        activity_title: document.getElementById('maintTitle').value.trim(),
        target_type: document.getElementById('maintTargetType').value,
        target_name: document.getElementById('maintTargetName').value.trim(),
        activity_type: document.getElementById('maintActivityType').value,
        scheduled_date: document.getElementById('maintScheduledDate').value.trim(),
        completion_date: document.getElementById('maintCompletionDate').value.trim() || null,
        responsible_person: document.getElementById('maintResponsible').value.trim(),
        status: document.getElementById('maintStatus').value,
        cost: parseFloat(document.getElementById('maintCost').value || 0.0),
        remarks: document.getElementById('maintRemarks').value.trim()
    };

    try {
        if (isEdit) {
            await apiPut(`/maintenance/${id}`, payload);
            showToast('Maintenance task updated successfully!');
        } else {
            await apiPost('/maintenance', payload);
            showToast('Maintenance task scheduled successfully!');
        }

        if (maintModalInstance) maintModalInstance.hide();
        loadMaintenance();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function deleteMaintenance(id, title) {
    if (!confirm(`Are you sure you want to delete maintenance task "${title}"?`)) {
        return;
    }

    try {
        await apiDelete(`/maintenance/${id}`);
        showToast('Maintenance task removed.');
        loadMaintenance();
    } catch (err) {
        showToast('Error deleting task: ' + err.message, 'error');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadMaintenance();

    const searchInput = document.getElementById('searchMaintInput');
    if (searchInput) {
        let debounce;
        searchInput.addEventListener('input', () => {
            clearTimeout(debounce);
            debounce = setTimeout(loadMaintenance, 300);
        });
    }

    const statusFilter = document.getElementById('filterStatus');
    if (statusFilter) statusFilter.addEventListener('change', loadMaintenance);

    const targetTypeFilter = document.getElementById('filterTargetType');
    if (targetTypeFilter) targetTypeFilter.addEventListener('change', loadMaintenance);

    const activityTypeFilter = document.getElementById('filterActivityType');
    if (activityTypeFilter) activityTypeFilter.addEventListener('change', loadMaintenance);

    const form = document.getElementById('maintForm');
    if (form) form.addEventListener('submit', handleMaintSubmit);
});
