import React, { useState, useEffect } from 'react';
import {
  TreePine,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  Activity,
  MapPin,
  Leaf,
  CloudSun,
  ShieldAlert
} from 'lucide-react';
import { treesAPI, parksAPI } from '../services/api';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import Toast from '../components/Toast';

const healthStatuses = ['All', 'Healthy', 'Needs Care', 'Diseased', 'Critical'];
const maintenanceStatuses = ['All', 'Regular', 'Scheduled', 'Urgent', 'Under Treatment'];

const commonSpeciesList = [
  'Neem (Azadirachta indica)',
  'Banyan (Ficus benghalensis)',
  'Peepal (Ficus religiosa)',
  'Gulmohar (Delonix regia)',
  'Amaltas (Cassia fistula)',
  'Arjun (Terminalia arjuna)',
  'Jacaranda (Jacaranda mimosifolia)',
  'Rain Tree (Samanea saman)',
  'Jamun (Syzygium cumini)',
  'Teak (Tectona grandis)',
  'Sissoo / Shisham (Dalbergia sissoo)'
];

const defaultForm = {
  treeCode: '',
  species: 'Neem',
  scientificName: 'Azadirachta indica',
  location: '',
  park: '',
  ageYears: 5,
  heightMeters: 6.5,
  canopyDiameterMeters: 4.0,
  healthStatus: 'Healthy',
  maintenanceStatus: 'Regular',
  carbonAbsorptionKgPerYear: 28.5,
  notes: ''
};

const Trees = () => {
  const [trees, setTrees] = useState([]);
  const [parks, setParks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedHealth, setSelectedHealth] = useState('All');
  const [selectedPark, setSelectedPark] = useState('All');

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Delete modal state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deletingCode, setDeletingCode] = useState('');
  const [deleting, setDeleting] = useState(false);

  // View details modal
  const [viewingTree, setViewingTree] = useState(null);

  // Toast
  const [toast, setToast] = useState({ message: '', type: 'success' });

  useEffect(() => {
    loadParks();
  }, []);

  useEffect(() => {
    fetchTrees();
  }, [selectedHealth, selectedPark]);

  const loadParks = async () => {
    try {
      const res = await parksAPI.getAll();
      setParks(res.data.data);
    } catch (err) {
      console.error('Error fetching parks for tree dropdown:', err);
    }
  };

  const fetchTrees = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (selectedHealth !== 'All') params.healthStatus = selectedHealth;
      if (selectedPark !== 'All') params.parkId = selectedPark;

      const res = await treesAPI.getAll(params);
      setTrees(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching trees:', err);
      setToast({ message: 'Failed to fetch tree census', type: 'error' });
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTrees();
  };

  const handleOpenAdd = () => {
    const randomCode = `TR-${Math.floor(1000 + Math.random() * 9000)}`;
    setFormData({
      ...defaultForm,
      treeCode: randomCode,
      park: parks.length > 0 ? parks[0]._id : ''
    });
    setEditingId(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (tree) => {
    setFormData({
      treeCode: tree.treeCode,
      species: tree.species,
      scientificName: tree.scientificName || '',
      location: tree.location,
      park: tree.park || '',
      ageYears: tree.ageYears,
      heightMeters: tree.heightMeters,
      canopyDiameterMeters: tree.canopyDiameterMeters || 2.0,
      healthStatus: tree.healthStatus,
      maintenanceStatus: tree.maintenanceStatus,
      carbonAbsorptionKgPerYear: tree.carbonAbsorptionKgPerYear || 22.0,
      notes: tree.notes || ''
    });
    setEditingId(tree._id);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (tree) => {
    setDeletingId(tree._id);
    setDeletingCode(tree.treeCode);
    setIsDeleteOpen(true);
  };

  const handleSpeciesChange = (e) => {
    const full = e.target.value;
    if (full.includes('(')) {
      const parts = full.split('(');
      const common = parts[0].trim();
      const scientific = parts[1].replace(')', '').trim();
      setFormData({
        ...formData,
        species: common,
        scientificName: scientific
      });
    } else {
      setFormData({
        ...formData,
        species: full
      });
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await treesAPI.update(editingId, formData);
        setToast({ message: `Tree ${formData.treeCode} updated successfully!`, type: 'success' });
      } else {
        await treesAPI.create(formData);
        setToast({ message: `Tree ${formData.treeCode} registered in census!`, type: 'success' });
      }
      setIsFormOpen(false);
      fetchTrees();
    } catch (err) {
      console.error('Error saving tree:', err);
      setToast({ message: err.response?.data?.message || 'Error saving tree', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setDeleting(true);
    try {
      await treesAPI.delete(deletingId);
      setToast({ message: `Tree ${deletingCode} deleted from census.`, type: 'success' });
      setIsDeleteOpen(false);
      fetchTrees();
    } catch (err) {
      console.error('Error deleting tree:', err);
      setToast({ message: 'Error deleting tree', type: 'error' });
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
          <h2>Urban Tree Inventory & Census</h2>
          <p className="page-desc">
            Digital RFID census tracking species, biometric growth parameters, and carbon absorption.
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={18} /> Register New Tree
        </button>
      </div>

      {/* Toolbar / Search & Filter */}
      <div className="toolbar-card">
        <form onSubmit={handleSearchSubmit} className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by Tree Code, Species, Scientific name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        <div className="filter-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Health:</span>
            <select
              className="select-control"
              value={selectedHealth}
              onChange={(e) => setSelectedHealth(e.target.value)}
            >
              {healthStatuses.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Park:</span>
            <select
              className="select-control"
              value={selectedPark}
              onChange={(e) => setSelectedPark(e.target.value)}
            >
              <option value="All">All Parks</option>
              {parks.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tree Census Table */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TreePine size={20} color="#059669" />
            <h3 className="card-title">Inventoried Census Records ({trees.length})</h3>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            Loading tree census records...
          </div>
        ) : trees.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
            No tree records found matching filter. Click "Register New Tree" to log one!
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Tree Code & Species</th>
                  <th>Park / Location</th>
                  <th>Age & Height</th>
                  <th>Canopy Ø</th>
                  <th>Est. CO₂ / Year</th>
                  <th>Health Status</th>
                  <th>Maintenance</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {trees.map((tree) => (
                  <tr key={tree._id}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{tree.treeCode}</div>
                      <div style={{ fontSize: '0.85rem', color: '#059669', fontWeight: 600 }}>
                        {tree.species}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', fontStyle: 'italic' }}>
                        {tree.scientificName}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{tree.parkName || 'City Green Zone'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{tree.location}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{tree.ageYears} yrs</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{tree.heightMeters} m tall</div>
                    </td>
                    <td style={{ fontWeight: 500 }}>{tree.canopyDiameterMeters || 2.0} m</td>
                    <td style={{ fontWeight: 600, color: '#047857' }}>
                      {tree.carbonAbsorptionKgPerYear || 22} kg
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          tree.healthStatus === 'Healthy'
                            ? 'badge-success'
                            : tree.healthStatus === 'Needs Care'
                            ? 'badge-warning'
                            : tree.healthStatus === 'Diseased'
                            ? 'badge-danger'
                            : 'badge-danger'
                        }`}
                      >
                        {tree.healthStatus}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          tree.maintenanceStatus === 'Regular'
                            ? 'badge-info'
                            : tree.maintenanceStatus === 'Urgent'
                            ? 'badge-danger'
                            : 'badge-warning'
                        }`}
                      >
                        {tree.maintenanceStatus}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        <button
                          className="btn-icon"
                          title="View Details"
                          onClick={() => setViewingTree(tree)}
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          className="btn-icon"
                          title="Edit Tree"
                          onClick={() => handleOpenEdit(tree)}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          className="btn-icon"
                          title="Delete Tree"
                          style={{ color: '#dc2626' }}
                          onClick={() => handleOpenDelete(tree)}
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

      {/* Add / Edit Tree Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingId ? 'Edit Tree Census Record' : 'Register New Census Tree'}
      >
        <form onSubmit={handleFormSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Tree Census Code / RFID *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. TR-2045"
                  value={formData.treeCode}
                  onChange={(e) => setFormData({ ...formData, treeCode: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Common Species *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Neem"
                  list="species-list"
                  value={formData.species}
                  onChange={handleSpeciesChange}
                  required
                />
                <datalist id="species-list">
                  {commonSpeciesList.map((sp) => (
                    <option key={sp} value={sp} />
                  ))}
                </datalist>
              </div>

              <div className="form-group">
                <label className="form-label">Scientific Botanical Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Azadirachta indica"
                  value={formData.scientificName}
                  onChange={(e) => setFormData({ ...formData, scientificName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Assigned Municipal Park</label>
                <select
                  className="form-control"
                  value={formData.park}
                  onChange={(e) => setFormData({ ...formData, park: e.target.value })}
                >
                  <option value="">-- No Specific Park (General Zone) --</option>
                  {parks.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.wardNo})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group full-width">
                <label className="form-label">Specific Location within Park/Street *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. North Gate Promenade, Near Gazebo 2"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Age (Years) *</label>
                <input
                  type="number"
                  className="form-control"
                  min="0"
                  step="0.5"
                  value={formData.ageYears}
                  onChange={(e) => setFormData({ ...formData, ageYears: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Height (Meters) *</label>
                <input
                  type="number"
                  className="form-control"
                  min="0"
                  step="0.1"
                  value={formData.heightMeters}
                  onChange={(e) => setFormData({ ...formData, heightMeters: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Canopy Spread (Meters)</label>
                <input
                  type="number"
                  className="form-control"
                  min="0"
                  step="0.1"
                  value={formData.canopyDiameterMeters}
                  onChange={(e) => setFormData({ ...formData, canopyDiameterMeters: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Carbon Absorption (kg/year)</label>
                <input
                  type="number"
                  className="form-control"
                  min="0"
                  step="0.5"
                  value={formData.carbonAbsorptionKgPerYear}
                  onChange={(e) => setFormData({ ...formData, carbonAbsorptionKgPerYear: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Health Vitality Status</label>
                <select
                  className="form-control"
                  value={formData.healthStatus}
                  onChange={(e) => setFormData({ ...formData, healthStatus: e.target.value })}
                >
                  <option value="Healthy">Healthy</option>
                  <option value="Needs Care">Needs Care</option>
                  <option value="Diseased">Diseased</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Maintenance Schedule</label>
                <select
                  className="form-control"
                  value={formData.maintenanceStatus}
                  onChange={(e) => setFormData({ ...formData, maintenanceStatus: e.target.value })}
                >
                  <option value="Regular">Regular</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Under Treatment">Under Treatment</option>
                </select>
              </div>

              <div className="form-group full-width">
                <label className="form-label">Field Botanist Notes</label>
                <textarea
                  className="form-control"
                  rows={2}
                  placeholder="e.g. Robust foliage, no termite activity observed."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
              {submitting ? 'Saving...' : editingId ? 'Update Record' : 'Add to Census'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Tree Details Modal */}
      {viewingTree && (
        <Modal
          isOpen={!!viewingTree}
          onClose={() => setViewingTree(null)}
          title={`Census Passport: ${viewingTree.treeCode}`}
        >
          <div className="modal-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontSize: '1.25rem', color: '#0f172a', margin: 0 }}>
                    {viewingTree.species}
                  </h4>
                  <div style={{ fontStyle: 'italic', color: '#059669', fontSize: '0.85rem' }}>
                    {viewingTree.scientificName}
                  </div>
                </div>
                <span
                  className={`badge ${
                    viewingTree.healthStatus === 'Healthy'
                      ? 'badge-success'
                      : viewingTree.healthStatus === 'Needs Care'
                      ? 'badge-warning'
                      : 'badge-danger'
                  }`}
                >
                  {viewingTree.healthStatus}
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
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Assigned Park</div>
                  <div style={{ fontWeight: 600 }}>{viewingTree.parkName || 'General Green Zone'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Location Spec</div>
                  <div style={{ fontWeight: 600 }}>{viewingTree.location}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Estimated Age</div>
                  <div style={{ fontWeight: 600 }}>{viewingTree.ageYears} Years</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Tree Height</div>
                  <div style={{ fontWeight: 600 }}>{viewingTree.heightMeters} Meters</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Canopy Spread</div>
                  <div style={{ fontWeight: 600 }}>{viewingTree.canopyDiameterMeters || 2.0} Meters</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Annual CO₂ Sequestered</div>
                  <div style={{ fontWeight: 600, color: '#059669' }}>
                    {viewingTree.carbonAbsorptionKgPerYear || 22} kg/year
                  </div>
                </div>
              </div>

              {viewingTree.notes && (
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                    Botanist Inspection Notes:
                  </div>
                  <p style={{ fontSize: '0.9rem', color: '#334155', background: '#ecfdf5', padding: '12px', borderRadius: '8px' }}>
                    {viewingTree.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setViewingTree(null)}>
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
        title="Delete Tree Record"
        message={`Are you sure you want to remove ${deletingCode} from the municipal tree inventory?`}
        loading={deleting}
      />
    </div>
  );
};

export default Trees;
