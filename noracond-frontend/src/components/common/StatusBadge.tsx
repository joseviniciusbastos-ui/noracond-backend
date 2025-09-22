import React from 'react';
import { ProcessStatusColors } from '../../types/process';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const colorClasses = ProcessStatusColors[status];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses} ${className}`}
    >
      {status}
    </span>
  );
};

export default StatusBadge;