/**
 * Reports & Analytics Controller
 */

let reportsHistory = [];

async function loadReports() {
    try {
        const res = await apiGet('/reports');
        reportsHistory = res.data || [];
        renderReportsTable(reportsHistory);
        updateLiveSummaryCards();
    } catch (err) {
        console.error('Error loading reports:', err);
        showToast('Failed to load reports: ' + err.message, 'error');
    }
}

async function updateLiveSummaryCards() {
    try {
        const dashRes = await apiGet('/dashboard/stats');
        const s = dashRes.summary;

        if (document.getElementById('repTotalParks')) document.getElementById('repTotalParks').textContent = s.total_parks;
        if (document.getElementById('repTotalTrees')) document.getElementById('repTotalTrees').textContent = s.total_all_trees.toLocaleString();
        if (document.getElementById('repGreenArea')) document.getElementById('repGreenArea').textContent = `${s.total_green_area_hectares} ha`;
        if (document.getElementById('repCarbonOffset')) document.getElementById('repCarbonOffset').textContent = `${s.total_carbon_tonnes} t`;
        if (document.getElementById('repEcoScore')) document.getElementById('repEcoScore').textContent = `${s.avg_environmental_score}/100`;
        if (document.getElementById('repSurvivalRate')) document.getElementById('repSurvivalRate').textContent = `${s.avg_tree_survival_rate}%`;
    } catch (e) {
        console.error('Error loading live summary:', e);
    }
}

function renderReportsTable(reports) {
    const tbody = document.getElementById('reportsTableBody');
    if (!tbody) return;

    if (reports.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-muted">No historical reports generated yet.</td></tr>';
        return;
    }

    tbody.innerHTML = reports.map(r => `
        <tr>
            <td><strong>#${r.id}</strong></td>
            <td>
                <div class="fw-bold text-dark">${r.report_title}</div>
                <small class="text-muted">${r.filter_criteria || 'General'}</small>
            </td>
            <td><span class="badge bg-light text-dark border">${r.report_type}</span></td>
            <td><i class="fa-solid fa-user-circle me-1 text-muted"></i>${r.generated_by}</td>
            <td>${r.created_at ? r.created_at.substring(0, 16) : 'Recent'}</td>
            <td class="text-end">
                <button class="action-btn" title="View Report Content" onclick="viewReportDetails(${r.id})">
                    <i class="fa-solid fa-file-lines text-primary"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

async function handleGenerateReport(e) {
    if (e) e.preventDefault();
    const reportType = document.getElementById('reportTypeSelect').value;
    const zoneFilter = document.getElementById('reportZoneSelect').value;

    const user = JSON.parse(localStorage.getItem('urban_greenery_user') || '{}');
    const generatedBy = user.username || 'admin';

    try {
        const res = await apiPost('/reports/generate', {
            report_type: reportType,
            zone: zoneFilter,
            generated_by: generatedBy
        });

        showToast('Report generated successfully!');
        loadReports();

        if (res.data) {
            viewReportDetails(res.data.id, res.data);
        }
    } catch (err) {
        showToast('Error generating report: ' + err.message, 'error');
    }
}

function viewReportDetails(reportId, reportObj = null) {
    const report = reportObj || reportsHistory.find(r => r.id === reportId);
    if (!report) return;

    document.getElementById('modalReportTitle').textContent = report.report_title;
    document.getElementById('modalReportType').textContent = report.report_type;
    document.getElementById('modalReportAuthor').textContent = report.generated_by;
    document.getElementById('modalReportDate').textContent = report.created_at;
    document.getElementById('modalReportFilters').textContent = report.filter_criteria;

    let parsed = {};
    try {
        parsed = JSON.parse(report.summary_data);
    } catch (e) {
        parsed = { raw: report.summary_data };
    }

    const contentDiv = document.getElementById('modalReportContent');
    contentDiv.innerHTML = `
        <div class="p-3 bg-light rounded border mb-3">
            <h6 class="fw-bold text-success mb-2"><i class="fa-solid fa-circle-check me-2"></i>Executive Summary Findings</h6>
            <pre class="mb-0 text-dark" style="white-space: pre-wrap; font-family: inherit; font-size: 0.9rem;">${JSON.stringify(parsed, null, 2)}</pre>
        </div>
    `;

    const modal = new bootstrap.Modal(document.getElementById('reportDetailsModal'));
    modal.show();
}

function exportCsv(entity) {
    const url = `${API_BASE}/reports/export-csv?entity=${entity}`;
    window.open(url, '_blank');
    showToast(`Downloading ${entity} CSV export...`);
}

function printCurrentReport() {
    window.print();
}

document.addEventListener('DOMContentLoaded', () => {
    loadReports();

    const generateBtn = document.getElementById('generateReportBtn');
    if (generateBtn) generateBtn.addEventListener('click', handleGenerateReport);
});
