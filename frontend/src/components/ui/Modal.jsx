import React from 'react';

export default function Modal({ open, onClose, children, className = '' }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className={`relative bg-surface rounded-lg shadow-smsoft max-w-4xl w-full mx-4 ${className}`}>
        {children}
      </div>
    </div>
  );
}
