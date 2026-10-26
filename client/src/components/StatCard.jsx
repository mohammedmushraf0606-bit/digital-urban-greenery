import React from 'react';

const StatCard = ({ title, value, subtitle, icon: Icon, color = 'emerald' }) => {
  const colorMap = {
    emerald: { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' },
    blue: { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' },
    amber: { bg: '#fffbeb', text: '#d97706', border: '#fde68a' },
    purple: { bg: '#faf5ff', text: '#9333ea', border: '#e9d5ff' },
    teal: { bg: '#f0fdfa', text: '#0d9488', border: '#99f6e4' }
  };

  const scheme = colorMap[color] || colorMap.emerald;

  return (
    <div className="stat-card">
      <div className="stat-info">
        <span className="stat-title">{title}</span>
        <span className="stat-value">{value}</span>
        {subtitle && <span className="stat-subtitle">{subtitle}</span>}
      </div>
      {Icon && (
        <div
          className="stat-icon-wrapper"
          style={{
            backgroundColor: scheme.bg,
            color: scheme.text,
            border: `1px solid ${scheme.border}`
          }}
        >
          <Icon size={24} />
        </div>
      )}
    </div>
  );
};

export default StatCard;
