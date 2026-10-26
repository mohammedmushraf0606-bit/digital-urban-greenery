import React, { useState, useEffect } from 'react';
import {
  Compass,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  CheckCircle,
  AlertTriangle,
  MapPin,
  Calendar,
  Layers
} from 'lucide-react';
import { parksAPI } from '../services/api';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import Toast from '../components/Toast';

const parkTypes = [
  'All',
  'Public Park',
  'Botanical Garden',
  'Children Park',
  'Ecological Park',
  'Neighborhood Park',
  'Heritage Garden'
];

const parkStatuses = ['All', 'Active', 'Under Renovation', 'Planned', 'Temporarily Closed'];

const defaultForm = {
  name: '',
  location: '',
  wardNo: 'Ward 01',
  areaSqM: '',
  parkType: 'Public Park',
  establishedYear: new Date().getFullYear(),
  contactOfficer: '',
  contactPhone: '',
  facilities: 'Walking Track, Benches, Solar Lights',
  status: 'Active',
  maintenanceStatus: 'Good'
};

const Parks = () => {
  const [parks, setParks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Delete modal state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deletingParkName, setDeletingParkName] = useState('');
  const [deleting, setDeleting] = useState(false);

  // View details modal
  const [viewingPark, setViewingPark] = useState(null);

  // Toast
  const [toast, setToast] = useState({ message: '', type: 'success' });

  useEffect(() => {
    fetchParks();
  }, [selectedType, selectedStatus]);

  const fetchParks = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (selectedType !== 'All') params.type = selectedType;
      if (selectedStatus !== 'All') params.status = selectedStatus;

      const res = await parksAPI.getAll(params);
      setParks(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching parks:', err);
      setToast({ message: 'Failed to fetch parks', type: 'error' });
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchParks();
  };

  const handleOpenAdd = () => {
    setFormData(defaultForm);
    setEditingId(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (park) => {
    setFormData({
      name: park.name,
      location: park.location,
      wardNo: park.wardNo || 'Ward 01',
      areaSqM: park.areaSqM,
      parkType: park.parkType,
      establishedYear: park.establishedYear || 2020,
      contactOfficer: park.contactOfficer || '',
      contactPhone: park.contactPhone || '',
      facilities: Array.isArray(park.facilities) ? park.facilities.join(', ') : park.facilities,
      status: park.status,
      maintenanceStatus: park.maintenanceStatus || 'Good'
    });
    setEditingId(park._id);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (park) => {
    setDeletingId(park._id);
    setDeletingParkName(park.name);
    setIsDeleteOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await parksAPI.update(editingId, formData);
        setToast({ message: `Park "${formData.name}" updated successfully!`, type: 'success' });
      } else {
        await parksAPI.create(formData);
        setToast({ message: `New park "${formData.name}" added successfully!`, type: 'success' });
      }
      setIsFormOpen(false);
      fetchParks();
    } catch (err) {
      console.error('Error saving park:', err);
      setToast({ message: err.response?.data?.message || 'Error saving park', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setDeleting(true);
    try {
      await parksAPI.delete(deletingId);
      setToast({ message: `Park "${deletingParkName}" deleted successfully!`, type: 'success' });
      setIsDeleteOpen(false);
      fetchParks();
    } catch (err) {
      console.error('Error deleting park:', err);
      setToast({ message: 'Error deleting park', type: 'error' });
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
          <h2>Municipal Park Management</h2>
          <p className="page-desc">
            Register, monitor, and maintain city parks, botanical gardens, and community green spaces.
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={18} /> Add New Park
        </button>
      </div>

      {/* Toolbar / Search & Filter */}
      <div className="toolbar-card">
        <form onSubmit={handleSearchSubmit} className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by park name, ward, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        <div className="filter-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Type:</span>
            <select
              className="select-control"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              {parkTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
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
              {parkStatuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Parks Table */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Compass size={20} color="#059669" />
            <h3 className="card-title">Registered Parks Directory ({parks.length})</h3>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            Loading parks data...
          </div>
        ) : parks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
            No parks found matching the criteria. Click "Add New Park" to register one!
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Park Name & Ward</th>
                  <th>Location</th>
                  <th>Type</th>
                  <th>Area (sq.m)</th>
                  <th>Trees Count</th>
                  <th>Condition</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {parks.map((park) => (
                  <tr key={park._id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{park.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{park.wardNo}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#475569' }}>
                        <MapPin size={14} color="#94a3b8" />
                        <span>{park.location}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-secondary">{park.parkType}</span>
                    </td>
                    <td style={{ fontWeight: 500 }}>{Number(park.areaSqM).toLocaleString()} m²</td>
                    <td>
                      <span className="badge badge-info">{park.treeCount || 0} Trees</span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          park.maintenanceStatus === 'Excellent'
                            ? 'badge-success'
                            : park.maintenanceStatus === 'Good'
                            ? 'badge-info'
                            : 'badge-warning'
                        }`}
                      >
                        {park.maintenanceStatus}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          park.status === 'Active'
                            ? 'badge-success'
                            : park.status === 'Under Renovation'
                            ? 'badge-warning'
                            : 'badge-danger'
                        }`}
                      >
                        {park.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        <button
                          className="btn-icon"
                          title="View Details"
                          onClick={() => setViewingPark(park)}
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          className="btn-icon"
                          title="Edit Park"
                          onClick={() => handleOpenEdit(park)}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          className="btn-icon"
                          title="Delete Park"
                          style={{ color: '#dc2626' }}
                          onClick={() => handleOpenDelete(park)}
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

      {/* Add / Edit Park Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingId ? 'Edit Park Details' : 'Add New Municipal Park'}
      >
        <form onSubmit={handleFormSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-group full-width">
                <label className="form-label">Park Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Maharana Pratap Botanical Garden"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Location / Address *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Sector 12, Civil Lines"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Ward / Zone No.</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Ward 08"
                  value={formData.wardNo}
                  onChange={(e) => setFormData({ ...formData, wardNo: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Area (Square Meters) *</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="e.g. 45000"
                  value={formData.areaSqM}
                  onChange={(e) => setFormData({ ...formData, areaSqM: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Park Type</label>
                <select
                  className="form-control"
                  value={formData.parkType}
                  onChange={(e) => setFormData({ ...formData, parkType: e.target.value })}
                >
                  <option value="Public Park">Public Park</option>
                  <option value="Botanical Garden">Botanical Garden</option>
                  <option value="Children Park">Children Park</option>
                  <option value="Ecological Park">Ecological Park</option>
                  <option value="Neighborhood Park">Neighborhood Park</option>
                  <option value="Heritage Garden">Heritage Garden</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Established Year</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.establishedYear}
                  onChange={(e) => setFormData({ ...formData, establishedYear: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Contact Officer</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Officer Name"
                  value={formData.contactOfficer}
                  onChange={(e) => setFormData({ ...formData, contactOfficer: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Contact Phone</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="+91 98765 43210"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Current Operational Status</label>
                <select
                  className="form-control"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="Under Renovation">Under Renovation</option>
                  <option value="Planned">Planned</option>
                  <option value="Temporarily Closed">Temporarily Closed</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Maintenance Condition</label>
                <select
                  className="form-control"
                  value={formData.maintenanceStatus}
                  onChange={(e) => setFormData({ ...formData, maintenanceStatus: e.target.value })}
                >
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Needs Maintenance">Needs Maintenance</option>
                </select>
              </div>

              <div className="form-group full-width">
                <label className="form-label">Facilities Available (Comma Separated)</label>
                <textarea
                  className="form-control"
                  rows={2}
                  placeholder="Walking Track, Benches, Solar Lights, Butterfly House, Compost Unit"
                  value={formData.facilities}
                  onChange={(e) => setFormData({ ...formData, facilities: e.target.value })}
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
              {submitting ? 'Saving...' : editingId ? 'Update Park' : 'Create Park'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Park Details Modal */}
      {viewingPark && (
        <Modal
          isOpen={!!viewingPark}
          onClose={() => setViewingPark(null)}
          title={`Park Overview: ${viewingPark.name}`}
        >
          <div className="modal-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-secondary">{viewingPark.parkType}</span>
                <span
                  className={`badge ${
                    viewingPark.status === 'Active' ? 'badge-success' : 'badge-warning'
                  }`}
                >
                  {viewingPark.status}
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
                  <div style={{ fontWeight: 600 }}>{viewingPark.location}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Ward No</div>
                  <div style={{ fontWeight: 600 }}>{viewingPark.wardNo}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Total Area</div>
                  <div style={{ fontWeight: 600 }}>{Number(viewingPark.areaSqM).toLocaleString()} m²</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Census Trees</div>
                  <div style={{ fontWeight: 600 }}>{viewingPark.treeCount || 0} Trees</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Established</div>
                  <div style={{ fontWeight: 600 }}>{viewingPark.establishedYear}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Maintenance</div>
                  <div style={{ fontWeight: 600 }}>{viewingPark.maintenanceStatus}</div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Horticulture & Security Officers:
                </div>
                <div style={{ fontSize: '0.9rem', color: '#0f172a' }}>
                  {viewingPark.contactOfficer || 'Designated Greenery Officer'} ({viewingPark.contactPhone || '+91 98765 43210'})
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
                  Key Facilities & Green Infrastructure:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {(Array.isArray(viewingPark.facilities)
                    ? viewingPark.facilities
                    : viewingPark.facilities?.split(',') || []
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
            <button className="btn btn-secondary" onClick={() => setViewingPark(null)}>
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
        title="Delete Park Record"
        message={`Are you sure you want to delete "${deletingParkName}"? All associated tree censuses and maintenance schedules will be affected.`}
        loading={deleting}
      />
    </div>
  );
};

export default Parks;
