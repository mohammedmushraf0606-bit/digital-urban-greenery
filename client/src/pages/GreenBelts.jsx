import React, { useState, useEffect } from 'react';
import {
  Sprout,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  MapPin,
  Ruler,
  Droplets,
  Layers
} from 'lucide-react';
import { greenBeltsAPI } from '../services/api';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import Toast from '../components/Toast';

const vegetationTypes = [
  'All',
  'Dense Tree Line',
  'Shrub & Hedge Buffer',
  'Mixed Canopy',
  'Grass & Perennial Strip',
  'Acoustic Barrier'
];

const beltStatuses = ['All', 'Optimal', 'Under Maintenance', 'Encroachment Risk', 'Expansion Phase'];

const defaultForm = {
  beltName: '',
  location: '',
  lengthKm: '',
  widthMeters: '',
  vegetationType: 'Mixed Canopy',
  status: 'Optimal',
  maintenanceInfo: 'Automated solar drip irrigation, periodic trimming of roadside branches',
  soilType: 'Loamy Soil',
  irrigationType: 'Drip Irrigation'
};

const GreenBelts = () => {
  const [belts, setBelts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedVeg, setSelectedVeg] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Delete modal state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deletingName, setDeletingName] = useState('');
  const [deleting, setDeleting] = useState(false);

  // View modal state
  const [viewingBelt, setViewingBelt] = useState(null);

  // Toast
  const [toast, setToast] = useState({ message: '', type: 'success' });

  useEffect(() => {
    fetchBelts();
  }, [selectedVeg, selectedStatus]);

  const fetchBelts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (selectedVeg !== 'All') params.vegetationType = selectedVeg;
      if (selectedStatus !== 'All') params.status = selectedStatus;

      const res = await greenBeltsAPI.getAll(params);
      setBelts(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching green belts:', err);
      setToast({ message: 'Failed to fetch green belts', type: 'error' });
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBelts();
  };

  const handleOpenAdd = () => {
    setFormData(defaultForm);
    setEditingId(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (belt) => {
    setFormData({
      beltName: belt.beltName,
      location: belt.location,
      lengthKm: belt.lengthKm,
      widthMeters: belt.widthMeters,
      vegetationType: belt.vegetationType,
      status: belt.status,
      maintenanceInfo: belt.maintenanceInfo || '',
      soilType: belt.soilType || 'Loamy Soil',
      irrigationType: belt.irrigationType || 'Drip Irrigation'
    });
    setEditingId(belt._id);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (belt) => {
    setDeletingId(belt._id);
    setDeletingName(belt.beltName);
    setIsDeleteOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await greenBeltsAPI.update(editingId, formData);
        setToast({ message: `Green Belt "${formData.beltName}" updated!`, type: 'success' });
      } else {
        await greenBeltsAPI.create(formData);
        setToast({ message: `Green Belt "${formData.beltName}" registered!`, type: 'success' });
      }
      setIsFormOpen(false);
      fetchBelts();
    } catch (err) {
      console.error('Error saving green belt:', err);
      setToast({ message: err.response?.data?.message || 'Error saving green belt', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setDeleting(true);
    try {
      await greenBeltsAPI.delete(deletingId);
      setToast({ message: `Green belt "${deletingName}" deleted!`, type: 'success' });
      setIsDeleteOpen(false);
      fetchBelts();
    } catch (err) {
      console.error('Error deleting green belt:', err);
      setToast({ message: 'Error deleting green belt', type: 'error' });
    } finally {
      setDeleting(false);
    }
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
          <h2>Green Belt Buffer Management</h2>
          <p className="page-desc">
            Monitor arterial road buffers, highway tree screens, industrial eco-barriers, and noise abatement corridors.
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={18} /> Register Green Belt
        </button>
      </div>

      {/* Toolbar */}
      <div className="toolbar-card">
        <form onSubmit={handleSearchSubmit} className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by belt name, location, soil type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        <div className="filter-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Vegetation:</span>
            <select
              className="select-control"
              value={selectedVeg}
              onChange={(e) => setSelectedVeg(e.target.value)}
            >
              {vegetationTypes.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Status:</span>
            <select
              className="select-control"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              {beltStatuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sprout size={20} color="#059669" />
            <h3 className="card-title">Registered Green Belts ({belts.length})</h3>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            Loading green belt records...
          </div>
        ) : belts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
            No green belts found. Click "Register Green Belt" to log one!
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Green Belt Name</th>
                  <th>Location</th>
                  <th>Length & Width</th>
                  <th>Total Area</th>
                  <th>Vegetation Type</th>
                  <th>Irrigation</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {belts.map((belt) => (
                  <tr key={belt._id}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{belt.beltName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Soil: {belt.soilType}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#475569' }}>
                        <MapPin size={14} color="#94a3b8" />
                        <span>{belt.location}</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      {belt.lengthKm} km × {belt.widthMeters} m
                    </td>
                    <td style={{ fontWeight: 500 }}>
                      {Number(belt.areaSqM || belt.lengthKm * 1000 * belt.widthMeters).toLocaleString()} m²
                    </td>
                    <td>
                      <span className="badge badge-secondary">{belt.vegetationType}</span>
                    </td>
                    <td>
                      <span className="badge badge-info">{belt.irrigationType}</span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          belt.status === 'Optimal'
                            ? 'badge-success'
                            : belt.status === 'Under Maintenance'
                            ? 'badge-warning'
                            : 'badge-danger'
                        }`}
                      >
                        {belt.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        <button
                          className="btn-icon"
                          title="View Details"
                          onClick={() => setViewingBelt(belt)}
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          className="btn-icon"
                          title="Edit Belt"
                          onClick={() => handleOpenEdit(belt)}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          className="btn-icon"
                          title="Delete Belt"
                          style={{ color: '#dc2626' }}
                          onClick={() => handleOpenDelete(belt)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Belt Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingId ? 'Edit Green Belt Record' : 'Register New Green Belt'}
      >
        <form onSubmit={handleFormSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-group full-width">
                <label className="form-label">Green Belt Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Outer Ring Expressway Green Buffer"
                  value={formData.beltName}
                  onChange={(e) => setFormData({ ...formData, beltName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group full-width">
                <label className="form-label">Location / Road Corridor *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. NH-48 Ring Corridor, KM 12 to 26"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Length (Kilometers) *</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-control"
                  placeholder="e.g. 14.5"
                  value={formData.lengthKm}
                  onChange={(e) => setFormData({ ...formData, lengthKm: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Width (Meters) *</label>
                <input
                  type="number"
                  step="0.5"
                  className="form-control"
                  placeholder="e.g. 30"
                  value={formData.widthMeters}
                  onChange={(e) => setFormData({ ...formData, widthMeters: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Vegetation Configuration</label>
                <select
                  className="form-control"
                  value={formData.vegetationType}
                  onChange={(e) => setFormData({ ...formData, vegetationType: e.target.value })}
                >
                  <option value="Dense Tree Line">Dense Tree Line</option>
                  <option value="Shrub & Hedge Buffer">Shrub & Hedge Buffer</option>
                  <option value="Mixed Canopy">Mixed Canopy</option>
                  <option value="Grass & Perennial Strip">Grass & Perennial Strip</option>
                  <option value="Acoustic Barrier">Acoustic Barrier</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Irrigation System</label>
                <select
                  className="form-control"
                  value={formData.irrigationType}
                  onChange={(e) => setFormData({ ...formData, irrigationType: e.target.value })}
                >
                  <option value="Drip Irrigation">Drip Irrigation</option>
                  <option value="Sprinkler">Sprinkler</option>
                  <option value="Treated Water Tanker">Treated Water Tanker</option>
                  <option value="Rain-fed">Rain-fed</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Soil Classification</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Alluvial Loam"
                  value={formData.soilType}
                  onChange={(e) => setFormData({ ...formData, soilType: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Operational Status</label>
                <select
                  className="form-control"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Optimal">Optimal</option>
                  <option value="Under Maintenance">Under Maintenance</option>
                  <option value="Encroachment Risk">Encroachment Risk</option>
                  <option value="Expansion Phase">Expansion Phase</option>
                </select>
              </div>

              <div className="form-group full-width">
                <label className="form-label">Maintenance & Care Instructions</label>
                <textarea
                  className="form-control"
                  rows={2}
                  placeholder="e.g. Bi-weekly trimming of lower canopy, drip nozzle flush every Monday."
                  value={formData.maintenanceInfo}
                  onChange={(e) => setFormData({ ...formData, maintenanceInfo: e.target.value })}
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
              {submitting ? 'Saving...' : editingId ? 'Update Belt' : 'Save Green Belt'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      {viewingBelt && (
        <Modal
          isOpen={!!viewingBelt}
          onClose={() => setViewingBelt(null)}
          title={`Green Belt Profile: ${viewingBelt.beltName}`}
        >
          <div className="modal-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-success">{viewingBelt.status}</span>
                <span className="badge badge-secondary">{viewingBelt.vegetationType}</span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '12px',
                  background: '#f8fafc',
                  padding: '16px',
                  borderRadius: '10px'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Location</div>
                  <div style={{ fontWeight: 600 }}>{viewingBelt.location}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Dimensions</div>
                  <div style={{ fontWeight: 600 }}>
                    {viewingBelt.lengthKm} km × {viewingBelt.widthMeters} m
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Total Surface Area</div>
                  <div style={{ fontWeight: 600 }}>
                    {Number(viewingBelt.areaSqM || viewingBelt.lengthKm * 1000 * viewingBelt.widthMeters).toLocaleString()} m²
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Irrigation Type</div>
                  <div style={{ fontWeight: 600 }}>{viewingBelt.irrigationType}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Soil Composition</div>
                  <div style={{ fontWeight: 600 }}>{viewingBelt.soilType}</div>
                </div>
              </div>

              {viewingBelt.maintenanceInfo && (
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                    Scheduled Maintenance Protocol:
                  </div>
                  <p style={{ fontSize: '0.9rem', color: '#334155', background: '#ecfdf5', padding: '12px', borderRadius: '8px' }}>
                    {viewingBelt.maintenanceInfo}
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setViewingBelt(null)}>
              Close
            </button>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Green Belt"
        message={`Are you sure you want to delete ${deletingName}?`}
        loading={deleting}
      />
    </div>
  );
};

export default GreenBelts;
