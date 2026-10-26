import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  User,
  DollarSign
} from 'lucide-react';
import { maintenanceAPI } from '../services/api';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import Toast from '../components/Toast';

const activityTypes = [
  'Pruning & Trimming',
  'Irrigation & Watering',
  'Pest Control',
  'Fertilizer Application',
  'Tree Planting',
  'Health Inspection',
  'Soil Aeration',
  'Trash Cleanup'
];

const targetTypes = ['All', 'Park', 'Tree', 'Urban Forest', 'Green Belt', 'General Facility'];
const statuses = ['All', 'Scheduled', 'In Progress', 'Completed', 'Cancelled'];

const defaultForm = {
  targetType: 'Park',
  targetName: '',
  activityType: 'Irrigation & Watering',
  scheduledDate: new Date().toISOString().split('T')[0],
  responsibleTeam: 'Horticulture Team Alpha',
  priority: 'Medium',
  cost: 2500,
  status: 'Scheduled',
  remarks: ''
};

const Maintenance = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedTarget, setSelectedTarget] = useState('All');

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Delete modal state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Toast
  const [toast, setToast] = useState({ message: '', type: 'success' });

  useEffect(() => {
    fetchTasks();
  }, [selectedStatus, selectedTarget]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (selectedStatus !== 'All') params.status = selectedStatus;
      if (selectedTarget !== 'All') params.targetType = selectedTarget;

      const res = await maintenanceAPI.getAll(params);
      setTasks(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching maintenance:', err);
      setToast({ message: 'Failed to fetch maintenance tasks', type: 'error' });
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTasks();
  };

  const handleOpenAdd = () => {
    setFormData(defaultForm);
    setEditingId(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (task) => {
    setFormData({
      targetType: task.targetType,
      targetName: task.targetName,
      activityType: task.activityType,
      scheduledDate: new Date(task.scheduledDate).toISOString().split('T')[0],
      responsibleTeam: task.responsibleTeam,
      priority: task.priority || 'Medium',
      cost: task.cost || 0,
      status: task.status,
      remarks: task.remarks || ''
    });
    setEditingId(task._id);
    setIsFormOpen(true);
  };

  const handleQuickComplete = async (task) => {
    try {
      await maintenanceAPI.update(task._id, {
        status: 'Completed',
        completedDate: new Date()
      });
      setToast({ message: `Task for "${task.targetName}" marked as Completed!`, type: 'success' });
      fetchTasks();
    } catch (err) {
      console.error('Error completing task:', err);
      setToast({ message: 'Failed to update task status', type: 'error' });
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await maintenanceAPI.update(editingId, formData);
        setToast({ message: 'Maintenance task updated!', type: 'success' });
      } else {
        await maintenanceAPI.create(formData);
        setToast({ message: 'New maintenance task scheduled!', type: 'success' });
      }
      setIsFormOpen(false);
      fetchTasks();
    } catch (err) {
      console.error('Error saving maintenance task:', err);
      setToast({ message: err.response?.data?.message || 'Error saving task', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setDeleting(true);
    try {
      await maintenanceAPI.delete(deletingId);
      setToast({ message: 'Maintenance task removed!', type: 'success' });
      setIsDeleteOpen(false);
      fetchTasks();
    } catch (err) {
      console.error('Error deleting task:', err);
      setToast({ message: 'Error deleting task', type: 'error' });
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
          <h2>Municipal Maintenance & Operations</h2>
          <p className="page-desc">
            Schedule pruning, irrigation, fertilization, pest control, and sapling replacements across all city greenery.
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={18} /> Schedule Maintenance
        </button>
      </div>

      {/* Toolbar */}
      <div className="toolbar-card">
        <form onSubmit={handleSearchSubmit} className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by target name, team, activity..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        <div className="filter-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Target:</span>
            <select
              className="select-control"
              value={selectedTarget}
              onChange={(e) => setSelectedTarget(e.target.value)}
            >
              {targetTypes.map((t) => (
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
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Wrench size={20} color="#059669" />
            <h3 className="card-title">Maintenance Work Orders ({tasks.length})</h3>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            Loading maintenance tasks...
          </div>
        ) : tasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
            No maintenance records found. Click "Schedule Maintenance" to assign one!
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Target Entity</th>
                  <th>Category</th>
                  <th>Activity Type</th>
                  <th>Date Scheduled</th>
                  <th>Responsible Team</th>
                  <th>Priority</th>
                  <th>Est. Cost</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task._id}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{task.targetName}</div>
                      {task.remarks && (
                        <div style={{ fontSize: '0.75rem', color: '#64748b', maxWidth: '240px' }}>
                          {task.remarks}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="badge badge-secondary">{task.targetType}</span>
                    </td>
                    <td style={{ fontWeight: 500 }}>{task.activityType}</td>
                    <td>
                      {new Date(task.scheduledDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td>{task.responsibleTeam}</td>
                    <td>
                      <span
                        className={`badge ${
                          task.priority === 'Urgent'
                            ? 'badge-danger'
                            : task.priority === 'High'
                            ? 'badge-warning'
                            : 'badge-secondary'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>₹{Number(task.cost).toLocaleString()}</td>
                    <td>
                      <span
                        className={`badge ${
                          task.status === 'Completed'
                            ? 'badge-success'
                            : task.status === 'In Progress'
                            ? 'badge-warning'
                            : task.status === 'Cancelled'
                            ? 'badge-danger'
                            : 'badge-info'
                        }`}
                      >
                        {task.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        {task.status !== 'Completed' && (
                          <button
                            className="btn-icon"
                            title="Mark as Completed"
                            style={{ color: '#059669' }}
                            onClick={() => handleQuickComplete(task)}
                          >
                            <CheckCircle size={15} />
                          </button>
                        )}
                        <button
                          className="btn-icon"
                          title="Edit Task"
                          onClick={() => handleOpenEdit(task)}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          className="btn-icon"
                          title="Delete Task"
                          style={{ color: '#dc2626' }}
                          onClick={() => {
                            setDeletingId(task._id);
                            setIsDeleteOpen(true);
                          }}
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

      {/* Add / Edit Task Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingId ? 'Edit Maintenance Task' : 'Schedule New Maintenance Task'}
      >
        <form onSubmit={handleFormSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Greenery Category *</label>
                <select
                  className="form-control"
                  value={formData.targetType}
                  onChange={(e) => setFormData({ ...formData, targetType: e.target.value })}
                >
                  <option value="Park">Park</option>
                  <option value="Tree">Tree</option>
                  <option value="Urban Forest">Urban Forest</option>
                  <option value="Green Belt">Green Belt</option>
                  <option value="General Facility">General Facility</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Target Name / Identifier *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Central Eco Botanical Park or TR-006"
                  value={formData.targetName}
                  onChange={(e) => setFormData({ ...formData, targetName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Activity Type *</label>
                <select
                  className="form-control"
                  value={formData.activityType}
                  onChange={(e) => setFormData({ ...formData, activityType: e.target.value })}
                >
                  {activityTypes.map((act) => (
                    <option key={act} value={act}>
                      {act}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Scheduled Date *</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Responsible Team / Officer *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Horticulture Alpha Squad"
                  value={formData.responsibleTeam}
                  onChange={(e) => setFormData({ ...formData, responsibleTeam: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Priority</label>
                <select
                  className="form-control"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Estimated Cost (₹)</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Work Order Status</label>
                <select
                  className="form-control"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="form-group full-width">
                <label className="form-label">Remarks & Work Instructions</label>
                <textarea
                  className="form-control"
                  rows={2}
                  placeholder="e.g. Inspect for borer infestation after deep root irrigation."
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
              {submitting ? 'Saving...' : editingId ? 'Update Work Order' : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Maintenance Task"
        message="Are you sure you want to delete this maintenance task?"
        loading={deleting}
      />
    </div>
  );
};

export default Maintenance;
