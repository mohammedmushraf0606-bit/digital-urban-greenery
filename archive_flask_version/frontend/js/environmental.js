/**
 * Environmental Performance Controller
 */

let currentRecords = [];
let envModalInstance = null;
let envComparisonChartInstance = null;
let zoneCarbonChartInstance = null;

async function loadEnvironmentalData() {
    const zone = document.getElementById('filterZone')?.value || '';
    const startDate = document.getElementById('filterStartDate')?.value || '';
    const endDate = document.getElementById('filterEndDate')?.value || '';

    try {
        const queryParams = new URLSearchParams();
        if (zone) queryParams.append('zone', zone);
        if (startDate) queryParams.append('start_date', startDate);
        if (endDate) queryParams.append('end_date', endDate);

        // Fetch records
        const res = await apiGet(`/environmental?${queryParams.toString()}`);
        currentRecords = res.data || [];
        renderRecordsTable(currentRecords);

        // Fetch analytics
        const analyticsRes = await apiGet('/environmental/analytics');
        const overall = analyticsRes.overall || {};
        const trends = analyticsRes.trends || [];
        const zoneStats = analyticsRes.zone_stats || [];

        // Update indicators
        if (document.getElementById('envAvgAqi')) document.getElementById('envAvgAqi').textContent = overall.avg_aqi || '--';
        if (document.getElementById('envAvgCoverage')) document.getElementById('envAvgCoverage').textContent = `${overall.avg_coverage || '--'}%`;
        if (document.getElementById('envTotalCarbon')) document.getElementById('envTotalCarbon').textContent = `${overall.total_carbon || '--'} t`;
        if (document.getElementById('envAvgSurvival')) document.getElementById('envAvgSurvival').textContent = `${overall.avg_survival || '--'}%`;
        if (document.getElementById('envTotalWater')) document.getElementById('envTotalWater').textContent = `${overall.total_water || '--'} m³`;
        if (document.getElementById('envAvgScore')) document.getElementById('envAvgScore').textContent = `${overall.avg_score || '--'}/100`;

        // Render analytics charts
        renderEnvComparisonChart(trends);
        renderZoneCarbonChart(zoneStats);

    } catch (err) {
        console.error('Error loading environmental data:', err);
        showToast('Failed to load environmental indicators: ' + err.message, 'error');
    }
}

function renderRecordsTable(records) {
    const tbody = document.getElementById('envTableBody');
    if (!tbody) return;

    if (records.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center py-5 text-muted">
                    <i class="fa-solid fa-seedling fa-3x mb-3 text-secondary" style="opacity: 0.4;"></i>
                    <p class="mb-0 fw-medium">No environmental monitoring records match criteria.</p>
                </td>
            </tr>`;
        return;
    }

    tbody.innerHTML = records.map(r => {
        let aqiColor = 'text-success';
        if (r.air_quality_index > 50 && r.air_quality_index <= 100) aqiColor = 'text-warning';
        else if (r.air_quality_index > 100) aqiColor = 'text-danger';

        return `
            <tr>
                <td><strong>${r.record_date}</strong></td>
                <td>
                    <div class="fw-bold text-dark">${r.zone_name}</div>
                    <small class="text-muted">${r.notes || 'Normal routine observation'}</small>
                </td>
                <td><strong class="${aqiColor} fs-6">${r.air_quality_index}</strong></td>
                <td>${r.green_coverage_percentage}%</td>
                <td><span class="fw-semibold text-emerald">${r.carbon_absorbed_tonnes} t</span></td>
                <td>${r.tree_survival_rate}%</td>
                <td>${r.water_usage_cubic_m} m³</td>
                <td>
                    <span class="badge bg-success-subtle text-success fs-6 fw-bold px-2 py-1">
                        ${r.environmental_score}/100
                    </span>
                </td>
                <td class="text-end">
                    <button class="action-btn" title="Edit Observation" onclick="editRecord(${r.id})">
                        <i class="fa-solid fa-pen-to-square text-success"></i>
                    </button>
                    <button class="action-btn delete" title="Delete Record" onclick="deleteRecord(${r.id})">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function renderEnvComparisonChart(trends) {
    const ctx = document.getElementById('envComparisonChart');
    if (!ctx) return;

    if (envComparisonChartInstance) envComparisonChartInstance.destroy();

    const labels = trends.map(t => t.record_date);
    const aqi = trends.map(t => t.aqi);
    const score = trends.map(t => t.eco_score);
    const coverage = trends.map(t => t.green_coverage);

    envComparisonChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Eco Score',
                    data: score,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true,
                    tension: 0.3
                },
                {
                    label: 'Green Coverage %',
                    data: coverage,
                    borderColor: '#0284c7',
                    tension: 0.3
                },
                {
                    label: 'AQI (Lower is better)',
                    data: aqi,
                    borderColor: '#f59e0b',
                    borderDash: [4, 4],
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top', labels: { boxWidth: 12, font: { size: 11 } } }
            },
            scales: {
                y: { grid: { color: '#f1f5f9' }, ticks: { font: { size: 11 } } },
                x: { grid: { display: false }, ticks: { font: { size: 11 } } }
            }
        }
    });
}

function renderZoneCarbonChart(zoneStats) {
    const ctx = document.getElementById('zoneCarbonChart');
    if (!ctx) return;

    if (zoneCarbonChartInstance) zoneCarbonChartInstance.destroy();

    const labels = zoneStats.map(z => z.zone_name.split('-')[0].trim());
    const carbonData = zoneStats.map(z => z.avg_carbon);

    zoneCarbonChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Avg Carbon Absorbed (Tonnes)',
                data: carbonData,
                backgroundColor: ['#10b981', '#0284c7', '#8b5cf6', '#f59e0b'],
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { font: { size: 11 } } },
                x: { grid: { display: false }, ticks: { font: { size: 11 } } }
            }
        }
    });
}

function openAddRecordModal() {
    document.getElementById('envForm').reset();
    document.getElementById('envId').value = '';
    // Default today date
    document.getElementById('envRecordDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('envModalTitle').innerHTML = '<i class="fa-solid fa-plus-circle me-2 text-success"></i>Log Environmental Indicator';

    if (!envModalInstance) {
        envModalInstance = new bootstrap.Modal(document.getElementById('envModal'));
    }
    envModalInstance.show();
}

function editRecord(id) {
    const r = currentRecords.find(item => item.id === id);
    if (!r) return;

    document.getElementById('envId').value = r.id;
    document.getElementById('envRecordDate').value = r.record_date;
    document.getElementById('envZoneName').value = r.zone_name;
    document.getElementById('envAqi').value = r.air_quality_index;
    document.getElementById('envPm25').value = r.pm25 || '';
    document.getElementById('envPm10').value = r.pm10 || '';
    document.getElementById('envCoverage').value = r.green_coverage_percentage;
    document.getElementById('envCarbon').value = r.carbon_absorbed_tonnes;
    document.getElementById('envSurvival').value = r.tree_survival_rate;
    document.getElementById('envWater').value = r.water_usage_cubic_m;
    document.getElementById('envScore').value = r.environmental_score || '';
    document.getElementById('envNotes').value = r.notes || '';

    document.getElementById('envModalTitle').innerHTML = '<i class="fa-solid fa-pen-to-square me-2 text-success"></i>Edit Indicator Record';

    if (!envModalInstance) {
        envModalInstance = new bootstrap.Modal(document.getElementById('envModal'));
    }
    envModalInstance.show();
}

async function handleEnvSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('envId').value;
    const isEdit = Boolean(id);

    const payload = {
        record_date: document.getElementById('envRecordDate').value.trim(),
        zone_name: document.getElementById('envZoneName').value.trim(),
        air_quality_index: parseInt(document.getElementById('envAqi').value),
        pm25: document.getElementById('envPm25').value ? parseFloat(document.getElementById('envPm25').value) : null,
        pm10: document.getElementById('envPm10').value ? parseFloat(document.getElementById('envPm10').value) : null,
        green_coverage_percentage: parseFloat(document.getElementById('envCoverage').value),
        carbon_absorbed_tonnes: parseFloat(document.getElementById('envCarbon').value),
        tree_survival_rate: parseFloat(document.getElementById('envSurvival').value),
        water_usage_cubic_m: parseFloat(document.getElementById('envWater').value),
        environmental_score: document.getElementById('envScore').value ? parseInt(document.getElementById('envScore').value) : null,
        notes: document.getElementById('envNotes').value.trim()
    };

    try {
        if (isEdit) {
            await apiPut(`/environmental/${id}`, payload);
            showToast('Environmental indicator updated successfully!');
        } else {
            await apiPost('/environmental', payload);
            showToast('New environmental measurement recorded!');
        }

        if (envModalInstance) envModalInstance.hide();
        loadEnvironmentalData();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function deleteRecord(id) {
    if (!confirm('Are you sure you want to delete this environmental observation record?')) {
        return;
    }

    try {
        await apiDelete(`/environmental/${id}`);
        showToast('Record deleted successfully.');
        loadEnvironmentalData();
    } catch (err) {
        showToast('Error deleting record: ' + err.message, 'error');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadEnvironmentalData();

    const zoneFilter = document.getElementById('filterZone');
    if (zoneFilter) zoneFilter.addEventListener('change', loadEnvironmentalData);

    const startDate = document.getElementById('filterStartDate');
    if (startDate) startDate.addEventListener('change', loadEnvironmentalData);

    const endDate = document.getElementById('filterEndDate');
    if (endDate) endDate.addEventListener('change', loadEnvironmentalData);

    const form = document.getElementById('envForm');
    if (form) form.addEventListener('submit', handleEnvSubmit);
});
