import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title = 'Confirm Deletion', message, confirmText = 'Delete', loading = false }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="450px">
      <div className="modal-body" style={{ textAlign: 'center', padding: '24px 20px' }}>
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}
        >
          <AlertTriangle size={30} />
        </div>
        <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.5' }}>
          {message || 'Are you sure you want to delete this record? This action cannot be undone.'}
        </p>
      </div>
      <div className="modal-footer">
        <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
          Cancel
        </button>
        <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
          {loading ? 'Deleting...' : confirmText}
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
