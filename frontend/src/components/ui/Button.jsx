import React from 'react';

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-3 text-base'
};

export default function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  const base = 'inline-flex items-center gap-2 rounded-md font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1';
  const variants = {
    primary: `bg-primary text-white hover:bg-primary-600 focus:ring-primary/50`,
    secondary: `bg-white border border-border text-body hover:bg-gray-50`,
    ghost: `bg-transparent text-body hover:bg-gray-50`
  };

  return (
    <button {...props} className={`${base} ${sizes[size] || sizes.md} ${variants[variant] || variants.primary} ${className}`}>
      {children}
    </button>
  );
}
