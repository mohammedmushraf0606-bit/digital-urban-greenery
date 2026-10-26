import React from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose }) => {
  if (!message) return null;

  const isSuccess = type === 'success';

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 200,
        backgroundColor: isSuccess ? '#ecfdf5' : '#fef2f2',
        color: isSuccess ? '#065f46' : '#991b1b',
        border: `1px solid ${isSuccess ? '#a7f3d0' : '#fecaca'}`,
        borderRadius: '10px',
        padding: '14px 20px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        maxWidth: '420px',
        animation: 'slideUp 0.2s ease-out'
      }}
    >
      {isSuccess ? <CheckCircle2 size={20} color="#059669" /> : <AlertCircle size={20} color="#dc2626" />}
      <span style={{ fontSize: '0.9rem', fontWeight: 500, flex: 1 }}>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'inherit',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default Toast;
