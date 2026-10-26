/**
 * Dashboard Controller - Digital Urban Greenery Management System
 */

let speciesChartInstance = null;
let healthChartInstance = null;
let envTrendChartInstance = null;
let parksTypeChartInstance = null;

async function loadDashboard() {
    try {
        const res = await apiGet('/dashboard/stats');
        if (!res.success) throw new Error(res.message);

        const summary = res.summary;
        const charts = res.charts;

        // 1. Populate KPI Cards
        document.getElementById('statTotalParks').textContent = Number(summary.total_parks).toLocaleString();
        document.getElementById('statTotalTrees').textContent = Number(summary.total_all_trees).toLocaleString();
        document.getElementById('statUrbanForests').textContent = Number(summary.total_forests).toLocaleString();
        document.getElementById('statGreenBelts').textContent = Number(summary.total_green_belts).toLocaleString();
        document.getElementById('statGreenArea').textContent = `${Number(summary.total_green_area_hectares).toLocaleString()} ha`;
        document.getElementById('statCarbonOffset').textContent = `${Number(summary.total_carbon_tonnes).toLocaleString()} t`;
        document.getElementById('statLatestAqi').textContent = summary.latest_aqi;
        document.getElementById('statEcoScore').textContent = `${summary.avg_environmental_score}/100`;

        // 2. Render Charts
        renderSpeciesChart(charts.species || []);
        renderHealthChart(charts.health || []);
        renderEnvTrendChart(charts.env_trends || []);
        renderParksTypeChart(charts.parks_by_type || []);

        // 3. Populate Recent Maintenance
        renderRecentMaintenance(res.recent_maintenance || []);

        // 4. Populate Recent Trees
        renderRecentTrees(res.recent_trees || []);

    } catch (err) {
        console.error('Failed to load dashboard:', err);
        showToast('Error loading dashboard statistics: ' + err.message, 'error');
    }
}

// Chart 1: Trees by Species (Bar Chart)
function renderSpeciesChart(speciesData) {
    const ctx = document.getElementById('speciesChart');
    if (!ctx) return;

    if (speciesChartInstance) speciesChartInstance.destroy();

    const labels = speciesData.map(s => s.common_name || s.species);
    const data = speciesData.map(s => s.count);

    speciesChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Tree Count',
                data: data,
                backgroundColor: [
                    '#10b981', '#059669', '#34d399', '#0d9488',
                    '#0284c7', '#38bdf8', '#8b5cf6', '#a78bfa'
                ],
                borderRadius: 6,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        afterLabel: function(context) {
                            const item = speciesData[context.dataIndex];
                            return item ? `Botanical: ${item.species}` : '';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { precision: 0, font: { size: 11 } },
                    grid: { color: '#f1f5f9' }
                },
                x: {
                    ticks: {
                        font: { size: 11 },
                        maxRotation: 45,
                        minRotation: 25
                    },
                    grid: { display: false }
                }
            }
        }
    });
}

// Chart 2: Tree Health Status (Doughnut Chart)
function renderHealthChart(healthData) {
    const ctx = document.getElementById('healthChart');
    if (!ctx) return;

    if (healthChartInstance) healthChartInstance.destroy();

    const labels = healthData.map(h => h.health_status);
    const data = healthData.map(h => h.count);

    const colorMap = {
        'Healthy': '#10b981',
        'Fair': '#f59e0b',
        'Poor': '#f97316',
        'Critical': '#e11d48'
    };

    const backgroundColors = labels.map(l => colorMap[l] || '#64748b');

    healthChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColors,
                borderWidth: 3,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { boxWidth: 12, padding: 14, font: { size: 12 } }
                }
            },
            cutout: '68%'
        }
    });
}

// Chart 3: Environmental Performance (Line Chart)
function renderEnvTrendChart(trendData) {
    const ctx = document.getElementById('envTrendChart');
    if (!ctx) return;

    if (envTrendChartInstance) envTrendChartInstance.destroy();

    const labels = trendData.map(t => `${t.record_date.substring(5)} (${t.zone_name.split('-')[0].trim()})`);
    const aqiData = trendData.map(t => t.air_quality_index);
    const ecoScoreData = trendData.map(t => t.environmental_score);
    const greenCoverageData = trendData.map(t => t.green_coverage_percentage);

    envTrendChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Environmental Score (0-100)',
                    data: ecoScoreData,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.35,
                    fill: true,
                    yAxisID: 'y'
                },
                {
                    label: 'Air Quality Index (AQI)',
                    data: aqiData,
                    borderColor: '#f59e0b',
                    borderDash: [5, 5],
                    tension: 0.35,
                    yAxisID: 'y'
                },
                {
                    label: 'Green Coverage %',
                    data: greenCoverageData,
                    borderColor: '#0284c7',
                    tension: 0.35,
                    yAxisID: 'y'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: { boxWidth: 12, font: { size: 11 } }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: { color: '#f1f5f9' },
                    ticks: { font: { size: 11 } }
                },
                x: {
                    grid: { display: false },
                    ticks: { font: { size: 11 } }
                }
            }
        }
    });
}

// Chart 4: Parks by Type
function renderParksTypeChart(parksTypeData) {
    const ctx = document.getElementById('parksTypeChart');
    if (!ctx) return;

    if (parksTypeChartInstance) parksTypeChartInstance.destroy();

    const labels = parksTypeData.map(p => p.park_type);
    const data = parksTypeData.map(p => p.count);

    parksTypeChartInstance = new Chart(ctx, {
        type: 'polarArea',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    'rgba(16, 185, 129, 0.7)',
                    'rgba(2, 132, 199, 0.7)',
                    'rgba(139, 92, 246, 0.7)',
                    'rgba(245, 158, 11, 0.7)',
                    'rgba(20, 184, 166, 0.7)'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: { boxWidth: 12, font: { size: 11 } }
                }
            }
        }
    });
}

// Render Recent Maintenance tasks
function renderRecentMaintenance(tasks) {
    const tbody = document.getElementById('recentMaintenanceTableBody');
    if (!tbody) return;

    if (tasks.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-3">No maintenance activities recorded.</td></tr>';
        return;
    }

    tbody.innerHTML = tasks.map(t => {
        let badgeClass = 'badge-scheduled';
        if (t.status === 'Completed') badgeClass = 'badge-completed';
        else if (t.status === 'In Progress') badgeClass = 'badge-in-progress';
        else if (t.status === 'Overdue') badgeClass = 'badge-overdue';

        return `
            <tr>
                <td>
                    <div class="fw-semibold text-dark">${t.activity_title}</div>
                    <small class="text-muted">${t.target_name} (${t.target_type})</small>
                </td>
                <td><span class="badge bg-light text-dark border">${t.activity_type}</span></td>
                <td><span class="badge-custom ${badgeClass}">${t.status}</span></td>
                <td class="text-end text-muted small">${t.scheduled_date}</td>
            </tr>
        `;
    }).join('');
}

// Render Recent Trees added
function renderRecentTrees(trees) {
    const tbody = document.getElementById('recentTreesTableBody');
    if (!tbody) return;

    if (trees.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-3">No tree records found.</td></tr>';
        return;
    }

    tbody.innerHTML = trees.map(t => {
        let badgeClass = 'badge-healthy';
        if (t.health_status === 'Fair') badgeClass = 'badge-fair';
        else if (t.health_status === 'Poor') badgeClass = 'badge-poor';
        else if (t.health_status === 'Critical') badgeClass = 'badge-critical';

        return `
            <tr>
                <td>
                    <span class="fw-bold text-success">${t.tree_code}</span>
                </td>
                <td>
                    <div class="fw-semibold">${t.common_name}</div>
                    <small class="text-muted fst-italic">${t.species}</small>
                </td>
                <td><span class="badge-custom ${badgeClass}">${t.health_status}</span></td>
                <td class="text-muted small">${t.park_name || t.location_details}</td>
            </tr>
        `;
    }).join('');
}

document.addEventListener('DOMContentLoaded', loadDashboard);
