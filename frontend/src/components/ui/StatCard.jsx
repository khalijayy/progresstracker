import React from 'react';

export default function StatCard({ label, value, icon, trend, className = '' }) {
  return (
    <div className={`bg-surface rounded-lg border border-border p-4 shadow-smsoft ${className}`}>
      <div className="flex items-center justify-between mb-1">
        <div className="text-sm text-muted">{label}</div>
        {icon && <div>{icon}</div>}
      </div>
      <div className="text-2xl font-semibold text-body mb-1">{value}</div>
      {trend && (
        <div className="text-xs text-muted">{trend}</div>
      )}
    </div>
  );
}
