import React, { useState, useEffect } from 'react';
import {
  Trees,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  MapPin,
  ShieldCheck,
  Globe,
  Leaf
} from 'lucide-react';
import { urbanForestsAPI } from '../services/api';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import Toast from '../components/Toast';

const forestStatuses = [
  'All',
  'Protected Reserve',
  'Developing Woodland',
  'Restoration Area',
  'Miyawaki Forest'
];

const defaultForm = {
  forestName: '',
  location: '',
  areaHectares: '',
  treeCount: '',
  canopyCoverPercentage: 70,
  biodiversityIndex: 3.8,
  establishedYear: 2018,
  supervisor: '',
  status: 'Protected Reserve',
  maintenanceStatus: 'Well Managed',
  dominantFlora: 'Teak, Neem, Sal, Bamboo'
};

const UrbanForests = () => {
  const [forests, setForests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
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
  const [viewingForest, setViewingForest] = useState(null);

  // Toast
  const [toast, setToast] = useState({ message: '', type: 'success' });

  useEffect(() => {
    fetchForests();
  }, [selectedStatus]);

  const fetchForests = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (selectedStatus !== 'All') params.status = selectedStatus;

      const res = await urbanForestsAPI.getAll(params);
      setForests(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching urban forests:', err);
      setToast({ message: 'Failed to fetch urban forest records', type: 'error' });
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchForests();
  };

  const handleOpenAdd = () => {
    setFormData(defaultForm);
    setEditingId(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (forest) => {
    setFormData({
      forestName: forest.forestName,
      location: forest.location,
      areaHectares: forest.areaHectares,
      treeCount: forest.treeCount,
      canopyCoverPercentage: forest.canopyCoverPercentage,
      biodiversityIndex: forest.biodiversityIndex,
      establishedYear: forest.establishedYear || 2018,
      supervisor: forest.supervisor || '',
      status: forest.status,
      maintenanceStatus: forest.maintenanceStatus,
      dominantFlora: Array.isArray(forest.dominantFlora)
        ? forest.dominantFlora.join(', ')
        : forest.dominantFlora
    });
    setEditingId(forest._id);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (forest) => {
    setDeletingId(forest._id);
    setDeletingName(forest.forestName);
    setIsDeleteOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await urbanForestsAPI.update(editingId, formData);
        setToast({ message: `Urban Forest "${formData.forestName}" updated!`, type: 'success' });
      } else {
        await urbanForestsAPI.create(formData);
        setToast({ message: `Urban Forest "${formData.forestName}" added!`, type: 'success' });
      }
      setIsFormOpen(false);
      fetchForests();
    } catch (err) {
      console.error('Error saving urban forest:', err);
      setToast({ message: err.response?.data?.message || 'Error saving forest', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setDeleting(true);
    try {
      await urbanForestsAPI.delete(deletingId);
      setToast({ message: `Urban Forest "${deletingName}" deleted!`, type: 'success' });
      setIsDeleteOpen(false);
      fetchForests();
    } catch (err) {
      console.error('Error deleting forest:', err);
      setToast({ message: 'Error deleting forest', type: 'error' });
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
          <h2>Urban Forest Reserves</h2>
          <p className="page-desc">
            Manage high-density urban woodland reserves, Miyawaki forests, and ecological biodiversity sanctuaries.
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={18} /> Register Urban Forest
        </button>
      </div>

      {/* Toolbar */}
      <div className="toolbar-card">
        <form onSubmit={handleSearchSubmit} className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by forest name, supervisor, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        <div className="filter-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Status:</span>
            <select
              className="select-control"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              {forestStatuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Forest Table */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Trees size={20} color="#059669" />
            <h3 className="card-title">Forest Reserves Directory ({forests.length})</h3>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            Loading forest reserves...
          </div>
        ) : forests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
            No urban forests found. Click "Register Urban Forest" to create one!
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Forest Reserve Name</th>
                  <th>Location & Zone</th>
                  <th>Area (Hectares)</th>
                  <th>Est. Tree Count</th>
                  <th>Canopy Cover</th>
                  <th>Biodiversity Score</th>
                  <th>Category</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {forests.map((forest) => (
                  <tr key={forest._id}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{forest.forestName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Supervisor: {forest.supervisor || 'District Forestry Unit'}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#475569' }}>
                        <MapPin size={14} color="#94a3b8" />
                        <span>{forest.location}</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{forest.areaHectares} Ha</td>
                    <td style={{ fontWeight: 500, color: '#059669' }}>
                      {Number(forest.treeCount).toLocaleString()} trees
                    </td>
                    <td>
                      <span className="badge badge-success">{forest.canopyCoverPercentage}%</span>
                    </td>
                    <td>
                      <span className="badge badge-info">{forest.biodiversityIndex} / 5.0</span>
                    </td>
                    <td>
                      <span className="badge badge-secondary">{forest.status}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        <button
                          className="btn-icon"
                          title="View Details"
                          onClick={() => setViewingForest(forest)}
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          className="btn-icon"
                          title="Edit Forest"
                          onClick={() => handleOpenEdit(forest)}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          className="btn-icon"
                          title="Delete Forest"
                          style={{ color: '#dc2626' }}
                          onClick={() => handleOpenDelete(forest)}
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

      {/* Add / Edit Forest Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingId ? 'Edit Urban Forest Reserve' : 'Register New Urban Forest Reserve'}
      >
        <form onSubmit={handleFormSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-group full-width">
                <label className="form-label">Urban Forest Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Northern Ridge Forest Reserve"
                  value={formData.forestName}
                  onChange={(e) => setFormData({ ...formData, forestName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group full-width">
                <label className="form-label">Location / Geographic Zone *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Ridge Zone, North Corridor"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Total Area (Hectares) *</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-control"
                  placeholder="e.g. 142.5"
                  value={formData.areaHectares}
                  onChange={(e) => setFormData({ ...formData, areaHectares: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Estimated Tree Count *</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="e.g. 45000"
                  value={formData.treeCount}
                  onChange={(e) => setFormData({ ...formData, treeCount: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Canopy Cover (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="form-control"
                  value={formData.canopyCoverPercentage}
                  onChange={(e) => setFormData({ ...formData, canopyCoverPercentage: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Biodiversity Index (0.0 to 5.0)</label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  className="form-control"
                  value={formData.biodiversityIndex}
                  onChange={(e) => setFormData({ ...formData, biodiversityIndex: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Supervising Officer</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Officer Name"
                  value={formData.supervisor}
                  onChange={(e) => setFormData({ ...formData, supervisor: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Classification Status</label>
                <select
                  className="form-control"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Protected Reserve">Protected Reserve</option>
                  <option value="Developing Woodland">Developing Woodland</option>
                  <option value="Restoration Area">Restoration Area</option>
                  <option value="Miyawaki Forest">Miyawaki Forest</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Maintenance Condition</label>
                <select
                  className="form-control"
                  value={formData.maintenanceStatus}
                  onChange={(e) => setFormData({ ...formData, maintenanceStatus: e.target.value })}
                >
                  <option value="Well Managed">Well Managed</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Needs Attention">Needs Attention</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Year Established</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.establishedYear}
                  onChange={(e) => setFormData({ ...formData, establishedYear: e.target.value })}
                />
              </div>

              <div className="form-group full-width">
                <label className="form-label">Dominant Flora & Species (Comma Separated)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Teak, Neem, Sal, Bamboo, Ber, Babool"
                  value={formData.dominantFlora}
                  onChange={(e) => setFormData({ ...formData, dominantFlora: e.target.value })}
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
              {submitting ? 'Saving...' : editingId ? 'Update Forest' : 'Save Forest'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Details Modal */}
      {viewingForest && (
        <Modal
          isOpen={!!viewingForest}
          onClose={() => setViewingForest(null)}
          title={`Forest Reserve: ${viewingForest.forestName}`}
        >
          <div className="modal-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-success">{viewingForest.status}</span>
                <span className="badge badge-info">
                  {viewingForest.canopyCoverPercentage}% Canopy Cover
                </span>
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
                  <div style={{ fontWeight: 600 }}>{viewingForest.location}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Total Area</div>
                  <div style={{ fontWeight: 600 }}>{viewingForest.areaHectares} Hectares</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Estimated Trees</div>
                  <div style={{ fontWeight: 600, color: '#059669' }}>
                    {Number(viewingForest.treeCount).toLocaleString()} Trees
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Biodiversity Index</div>
                  <div style={{ fontWeight: 600 }}>{viewingForest.biodiversityIndex} / 5.0</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Supervisor</div>
                  <div style={{ fontWeight: 600 }}>{viewingForest.supervisor}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Maintenance Status</div>
                  <div style={{ fontWeight: 600 }}>{viewingForest.maintenanceStatus}</div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
                  Dominant Tree Species & Flora:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {(Array.isArray(viewingForest.dominantFlora)
                    ? viewingForest.dominantFlora
                    : viewingForest.dominantFlora?.split(',') || []
                  ).map((f, i) => (
                    <span key={i} className="badge badge-info">
                      {f.trim()}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setViewingForest(null)}>
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
        title="Delete Forest Record"
        message={`Are you sure you want to delete ${deletingName}?`}
        loading={deleting}
      />
    </div>
  );
};

export default UrbanForests;
