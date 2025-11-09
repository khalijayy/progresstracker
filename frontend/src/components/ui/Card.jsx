import React from 'react';

export default function Card({ children, className = '', padding = 'p-4', ...props }) {
  return (
    <div {...props} className={`bg-surface rounded-lg border border-border shadow-smsoft ${padding} ${className}`}>
      {children}
    </div>
  );
}
