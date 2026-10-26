import React, { useState, useEffect } from 'react';
import {
  Activity,
  Plus,
  Wind,
  Droplets,
  CloudSun,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Calendar,
  Layers
} from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';
import { environmentalAPI } from '../services/api';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import StatCard from '../components/StatCard';

const defaultForm = {
  recordDate: new Date().toISOString().split('T')[0],
  zoneLocation: 'Metropolitan Core (Central & East)',
  aqi: 95,
  pm25: 35.0,
  pm10: 70.0,
  greenCoveragePercentage: 29.5,
  carbonAbsorptionTonnesYear: 1550,
  treeSurvivalRate: 92,
  waterUsageKLMonth: 3400,
  recordedBy: '',
  remarks: 'Field telemetry reading'
};

const Environmental = () => {
  const [indicators, setIndicators] = useState([]);
  const [latest, setLatest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await environmentalAPI.getAll();
      setIndicators(res.data.data);
      if (res.data.data.length > 0) {
        setLatest(res.data.data[0]);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching environmental indicators:', err);
      setToast({ message: 'Failed to fetch environmental data', type: 'error' });
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await environmentalAPI.create(formData);
      setToast({ message: 'Environmental observation logged successfully!', type: 'success' });
      setIsFormOpen(false);
      fetchData();
    } catch (err) {
      console.error('Error logging environmental data:', err);
      setToast({ message: err.response?.data?.message || 'Error logging data', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  // Chronological copy for charts
  const chronological = [...indicators].reverse();

  // Multi-axis line chart for AQI vs Green Coverage
  const lineChartData = {
    labels: chronological.map((i) => new Date(i.recordDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Air Quality Index (AQI)',
        data: chronological.map((i) => i.aqi),
        borderColor: '#dc2626',
        backgroundColor: 'rgba(220, 38, 38, 0.1)',
        tension: 0.35,
        fill: true,
        yAxisID: 'y'
      },
      {
        label: 'Green Coverage %',
        data: chronological.map((i) => i.greenCoveragePercentage),
        borderColor: '#059669',
        backgroundColor: 'rgba(5, 150, 105, 0.1)',
        tension: 0.35,
        fill: true,
        yAxisID: 'y1'
      }
    ]
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: { mode: 'index', intersect: false }
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: { display: true, text: 'AQI Level' }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: { drawOnChartArea: false },
        title: { display: true, text: 'Green Coverage %' },
        min: 0,
        max: 50
      }
    }
  };

  // Bar chart for Carbon & Water Usage
  const resourceBarData = {
    labels: chronological.map((i) => new Date(i.recordDate).toLocaleDateString('en-US', { month: 'short' })),
    datasets: [
      {
        label: 'Carbon Absorption (Tonnes/yr)',
        data: chronological.map((i) => i.carbonAbsorptionTonnesYear),
        backgroundColor: '#10b981',
        borderRadius: 6
      },
      {
        label: 'Water Usage (kL/month)',
        data: chronological.map((i) => i.waterUsageKLMonth),
        backgroundColor: '#0284c7',
        borderRadius: 6
      }
    ]
  };

  const resourceBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' } }
  };

  return (
    <div>
      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: '', type: 'success' })}
        />
      )}

      {/* Header */}
      <div className="page-header">
        <div>
          <h2>Environmental Performance & Quality Indicators</h2>
          <p className="page-desc">
            Monitor air quality trends, carbon sequestration estimates, tree survival rates, and municipal irrigation efficiency.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsFormOpen(true)}>
          <Plus size={18} /> Log Environmental Reading
        </button>
      </div>

      {/* Top Telemetry Stat Cards */}
      {latest && (
        <div className="stats-grid">
          <StatCard
            title="City Eco Health Score"
            value={`${latest.environmentalScore}/100`}
            subtitle="Composite sustainability index"
            icon={ShieldCheck}
            color="emerald"
          />
          <StatCard
            title="Ambient AQI Index"
            value={latest.aqi}
            subtitle={`PM2.5: ${latest.pm25} µg/m³`}
            icon={Wind}
            color={latest.aqi <= 100 ? 'emerald' : latest.aqi <= 200 ? 'amber' : 'purple'}
          />
          <StatCard
            title="Urban Green Coverage"
            value={`${latest.greenCoveragePercentage}%`}
            subtitle="Municipal spatial canopy density"
            icon={Activity}
            color="teal"
          />
          <StatCard
            title="Tree Survival Rate"
            value={`${latest.treeSurvivalRate}%`}
            subtitle="Sapling establishment index"
            icon={TrendingUp}
            color="blue"
          />
          <StatCard
            title="Annual Carbon Capture"
            value={`${latest.carbonAbsorptionTonnesYear.toLocaleString()} T`}
            subtitle="Metric tonnes CO₂ / year"
            icon={CloudSun}
            color="emerald"
          />
          <StatCard
            title="Monthly Water Usage"
            value={`${latest.waterUsageKLMonth.toLocaleString()} kL`}
            subtitle="Treated STP water irrigation"
            icon={Droplets}
            color="blue"
          />
        </div>
      )}

      {/* Charts Section */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '24px',
          marginBottom: '28px'
        }}
      >
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <div>
              <h3 className="card-title">Air Quality Index vs. Green Canopy Growth</h3>
              <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
                Longitudinal correlation showing AQI reduction with higher greenery
              </p>
            </div>
            <span className="badge badge-success">Telemetry</span>
          </div>
          <div style={{ height: '280px' }}>
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </div>

        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <div>
              <h3 className="card-title">Carbon Absorption vs. Water Consumption</h3>
              <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
                Ecological efficiency and resource conservation balance
              </p>
            </div>
            <span className="badge badge-info">Eco Index</span>
          </div>
          <div style={{ height: '280px' }}>
            <Bar data={resourceBarData} options={resourceBarOptions} />
          </div>
        </div>
      </div>

      {/* Historical Telemetry Readings Table */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={20} color="#059669" />
            <h3 className="card-title">Environmental Telemetry History ({indicators.length} Logs)</h3>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            Loading environmental telemetry records...
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Observation Date</th>
                  <th>Zone / Station Location</th>
                  <th>AQI Level</th>
                  <th>PM2.5 / PM10</th>
                  <th>Green Cover %</th>
                  <th>Survival Rate</th>
                  <th>CO₂ Captured</th>
                  <th>Eco Score</th>
                </tr>
              </thead>
              <tbody>
                {indicators.map((ind) => (
                  <tr key={ind._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>
                        {new Date(ind.recordDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, color: '#0f172a' }}>{ind.zoneLocation}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{ind.recordedBy}</div>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          ind.aqi <= 100
                            ? 'badge-success'
                            : ind.aqi <= 150
                            ? 'badge-warning'
                            : 'badge-danger'
                        }`}
                      >
                        AQI {ind.aqi}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>
                      {ind.pm25} / {ind.pm10} µg/m³
                    </td>
                    <td style={{ fontWeight: 600, color: '#059669' }}>
                      {ind.greenCoveragePercentage}%
                    </td>
                    <td style={{ fontWeight: 600 }}>{ind.treeSurvivalRate}%</td>
                    <td>{ind.carbonAbsorptionTonnesYear.toLocaleString()} Tonnes</td>
                    <td>
                      <span className="badge badge-success" style={{ fontWeight: 700 }}>
                        {ind.environmentalScore} / 100
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Log Reading Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title="Log Field Environmental Observation"
      >
        <form onSubmit={handleFormSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Observation Date *</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.recordDate}
                  onChange={(e) => setFormData({ ...formData, recordDate: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">City Zone / Monitoring Station *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. North Ridge & University Enclave"
                  value={formData.zoneLocation}
                  onChange={(e) => setFormData({ ...formData, zoneLocation: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Air Quality Index (AQI 0-500) *</label>
                <input
                  type="number"
                  min="0"
                  max="500"
                  className="form-control"
                  value={formData.aqi}
                  onChange={(e) => setFormData({ ...formData, aqi: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Green Coverage Percentage (0-100%) *</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  className="form-control"
                  value={formData.greenCoveragePercentage}
                  onChange={(e) => setFormData({ ...formData, greenCoveragePercentage: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">PM2.5 (µg/m³)</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-control"
                  value={formData.pm25}
                  onChange={(e) => setFormData({ ...formData, pm25: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">PM10 (µg/m³)</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-control"
                  value={formData.pm10}
                  onChange={(e) => setFormData({ ...formData, pm10: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tree Survival Rate (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="form-control"
                  value={formData.treeSurvivalRate}
                  onChange={(e) => setFormData({ ...formData, treeSurvivalRate: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Estimated Carbon Sequestration (Tonnes/yr)</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.carbonAbsorptionTonnesYear}
                  onChange={(e) => setFormData({ ...formData, carbonAbsorptionTonnesYear: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Monthly Water Usage (kL)</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.waterUsageKLMonth}
                  onChange={(e) => setFormData({ ...formData, waterUsageKLMonth: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Logged By / Station</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Automated Telemetry Sensor"
                  value={formData.recordedBy}
                  onChange={(e) => setFormData({ ...formData, recordedBy: e.target.value })}
                />
              </div>

              <div className="form-group full-width">
                <label className="form-label">Sensor Observations & Remarks</label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsFormOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving Reading...' : 'Save Observation'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Environmental;
