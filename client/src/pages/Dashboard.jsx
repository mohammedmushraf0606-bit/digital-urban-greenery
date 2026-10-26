import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  TreePine,
  Trees,
  Sprout,
  Wind,
  CloudSun,
  PlusCircle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { dashboardAPI } from '../services/api';
import StatCard from '../components/StatCard';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await dashboardAPI.getStats();
      setData(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Failed to load dashboard metrics. Ensure backend server is running.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
        <div style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '8px' }}>
          Loading Urban Greenery Dashboard...
        </div>
        <p>Connecting to Smart City environmental telemetry...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px', borderColor: '#fecaca' }}>
        <AlertCircle size={40} color="#dc2626" style={{ margin: '0 auto 16px' }} />
        <h3 style={{ color: '#991b1b', marginBottom: '8px' }}>Dashboard Connection Error</h3>
        <p style={{ color: '#64748b', marginBottom: '16px' }}>{error}</p>
        <button className="btn btn-primary" onClick={fetchStats}>
          Retry Connection
        </button>
      </div>
    );
  }

  const { summary, charts, recentActivities } = data;

  // Chart 1: Trees by Species (Bar Chart)
  const speciesBarData = {
    labels: charts.speciesBreakdown.map((s) => s.species),
    datasets: [
      {
        label: 'Census Count',
        data: charts.speciesBreakdown.map((s) => s.count),
        backgroundColor: [
          '#059669',
          '#10b981',
          '#34d399',
          '#0d9488',
          '#14b8a6',
          '#2dd4bf',
          '#0284c7'
        ],
        borderRadius: 6
      }
    ]
  };

  const speciesBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { padding: 10, cornerRadius: 8 }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { precision: 0 }
      }
    }
  };

  // Chart 2: Tree Health Status (Doughnut Chart)
  const healthLabels = Object.keys(charts.healthBreakdown);
  const healthValues = Object.values(charts.healthBreakdown);
  const healthDoughnutData = {
    labels: healthLabels,
    datasets: [
      {
        data: healthValues,
        backgroundColor: ['#10b981', '#f59e0b', '#f97316', '#ef4444'],
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    ]
  };

  const healthDoughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 12, padding: 16 } }
    },
    cutout: '68%'
  };

  // Chart 3: Environmental Performance & AQI (Line Chart)
  const envTimeline = charts.environmentalTimeline || [];
  const envLineData = {
    labels: envTimeline.map((item) => item.date),
    datasets: [
      {
        label: 'Air Quality Index (AQI)',
        data: envTimeline.map((item) => item.aqi),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.35,
        fill: true,
        yAxisID: 'y'
      },
      {
        label: 'Green Coverage %',
        data: envTimeline.map((item) => item.greenCoverage),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.35,
        fill: true,
        yAxisID: 'y1'
      }
    ]
  };

  const envLineOptions = {
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
        title: { display: true, text: 'AQI (Lower is better)' },
        beginAtZero: false
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

  return (
    <div>
      {/* Top Banner / Header */}
      <div className="page-header">
        <div>
          <h2>Urban Greenery Overview</h2>
          <p className="page-desc">
            Real-time telemetry and management metrics across city parks, forests, and green buffers.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/maintenance')}>
            <Clock size={16} /> Maintenance Hub
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/trees')}>
            <PlusCircle size={16} /> Tree Inventory
          </button>
        </div>
      </div>

      {/* 6 Key Stat Cards */}
      <div className="stats-grid">
        <StatCard
          title="Total Municipal Parks"
          value={summary.totalParks}
          subtitle="Botanical & public spaces"
          icon={Compass}
          color="emerald"
        />
        <StatCard
          title="Inventoried Trees"
          value={summary.totalTrees}
          subtitle="Active geo-tagged census"
          icon={TreePine}
          color="teal"
        />
        <StatCard
          title="Urban Forest Area"
          value={`${summary.totalForestHectares} Ha`}
          subtitle={`${summary.totalForestTrees.toLocaleString()} reserve trees`}
          icon={Trees}
          color="purple"
        />
        <StatCard
          title="Green Belts Coverage"
          value={`${summary.totalGreenBeltKm} Km`}
          subtitle="Highway & perimeter shields"
          icon={Sprout}
          color="amber"
        />
        <StatCard
          title="Est. Carbon Absorption"
          value={`${summary.totalEstCarbonAbsorptionTonnes.toLocaleString()} T`}
          subtitle="Tonnes CO₂ captured / year"
          icon={CloudSun}
          color="emerald"
        />
        <StatCard
          title="Air Quality & Score"
          value={`AQI ${summary.avgAqi}`}
          subtitle={`Eco Health Index: ${summary.environmentalScore}/100`}
          icon={Wind}
          color="blue"
        />
      </div>

      {/* Visualizations Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '24px',
          marginBottom: '28px'
        }}
      >
        {/* Chart 1: Tree Species */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <div>
              <h3 className="card-title">Tree Census by Species</h3>
              <p style={{ fontSize: '0.82rem', color: '#64748b' }}>Top dominant urban flora species</p>
            </div>
            <span className="badge badge-success">Inventory</span>
          </div>
          <div style={{ height: '260px' }}>
            <Bar data={speciesBarData} options={speciesBarOptions} />
          </div>
        </div>

        {/* Chart 2: Tree Health Distribution */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <div>
              <h3 className="card-title">Tree Health Status</h3>
              <p style={{ fontSize: '0.82rem', color: '#64748b' }}>Vitality & treatment requirements</p>
            </div>
            <span className="badge badge-info">Condition</span>
          </div>
          <div style={{ height: '260px', position: 'relative' }}>
            <Doughnut data={healthDoughnutData} options={healthDoughnutOptions} />
          </div>
        </div>
      </div>

      {/* Chart 3: Environmental Performance Line Chart */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Environmental Performance & AQI Dynamics</h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
              Historical correlation between urban green coverage expansion and ambient air quality
            </p>
          </div>
          <span className="badge badge-secondary">Telemetry</span>
        </div>
        <div style={{ height: '280px' }}>
          <Line data={envLineData} options={envLineOptions} />
        </div>
      </div>

      {/* Recent Activities & Quick Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Recent Maintenance & Field Operations</h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b' }}>Live municipal task execution tracker</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/maintenance')}>
            View All Tasks <ArrowUpRight size={14} />
          </button>
        </div>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Target Entity</th>
                <th>Category</th>
                <th>Activity</th>
                <th>Scheduled Date</th>
                <th>Assigned Team</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentActivities && recentActivities.length > 0 ? (
                recentActivities.map((act) => (
                  <tr key={act._id}>
                    <td style={{ fontWeight: 600 }}>{act.targetName}</td>
                    <td>
                      <span className="badge badge-secondary">{act.targetType}</span>
                    </td>
                    <td>{act.activityType}</td>
                    <td>{new Date(act.scheduledDate).toLocaleDateString()}</td>
                    <td style={{ color: '#475569' }}>{act.responsibleTeam}</td>
                    <td>
                      <span
                        className={`badge ${
                          act.status === 'Completed'
                            ? 'badge-success'
                            : act.status === 'In Progress'
                            ? 'badge-warning'
                            : act.status === 'Cancelled'
                            ? 'badge-danger'
                            : 'badge-info'
                        }`}
                      >
                        {act.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                    No recent maintenance records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
