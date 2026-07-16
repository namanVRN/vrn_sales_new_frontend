// frontend/src/components/common/StatusBadge.jsx
import React from 'react';
import { getStatusColor, getStageColor } from '../../utils/colorHelpers';

const StatusBadge = ({ status, type = 'status', size = 'md' }) => {
  const colors = type === 'stage' ? getStageColor(status) : getStatusColor(status);
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-medium',
    lg: 'px-3 py-1.5 text-sm font-medium',
  };

  const displayText = status
    ?.replace(/_/g, ' ')
    ?.replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown';

  return (
    <span className={`inline-flex items-center rounded-full border ${sizes[size]} ${colors}`}>
      {displayText}
    </span>
  );
};

export default StatusBadge;