// Status → color mapping
export const getStatusColor = (status) => {
  const colorMap = {
    // Success (green)
    QUALIFIED: 'green',
    VISIT_DONE: 'green',
    DEAL_WON: 'green',
    FEEDBACK_CAPTURED: 'green',
    
    // Info (blue)
    VISIT_SCHEDULED: 'blue',
    MEETING_SCHEDULED: 'blue',
    NEGOTIATION: 'blue',
    
    // Warning (yellow/orange)
    FOLLOWUP_REQUIRED: 'yellow',
    RESCHEDULE: 'orange',
    MEETING_RESCHEDULE: 'orange',
    
    // Danger (red)
    NOT_INTERESTED: 'red',
    NOT_QUALIFIED: 'red',
    DEAL_LOST: 'red',
    NEGOTIATION_FAILED: 'red',
    
    // Neutral / Cold
    NO_CONNECTION: 'gray',
    NO_RESPONSE: 'gray',
    COLD: 'cyan',
  };
  
  return colorMap[status] || 'gray';
};

// Get Tailwind classes for status badge
export const getStatusBadgeClass = (status) => {
  const color = getStatusColor(status);
  
  const classes = {
    green:  'bg-green-100 text-green-800 border-green-200',
    blue:   'bg-blue-100 text-blue-800 border-blue-200',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    orange: 'bg-orange-100 text-orange-800 border-orange-200',
    red:    'bg-red-100 text-red-800 border-red-200',
    gray:   'bg-gray-100 text-gray-800 border-gray-200',
    cyan:   'bg-cyan-100 text-cyan-800 border-cyan-200',
  };
  
  return classes[color] || classes.gray;
};

// Stage → gradient color
export const getStageGradient = (stage) => {
  const gradients = {
    QUALIFICATION:          'from-emerald-500 to-teal-600',
    SITE_VISIT_SCHEDULING:  'from-violet-500 to-purple-600',
    SITE_VISIT_EXECUTION:   'from-pink-500 to-rose-600',
    POST_VISIT_FOLLOWUP:    'from-orange-500 to-amber-600',
    DEAL:                   'from-blue-500 to-indigo-600',
  };
  
  return gradients[stage] || 'from-gray-500 to-gray-600';
};

// Row highlight (overdue etc)
export const getRowHighlight = (lead) => {
  if (lead.is_closed) return 'bg-gray-50 opacity-70';
  if (lead.is_cold) return 'bg-cyan-50';
  if (lead.is_overdue) return 'bg-red-50';
  return 'bg-white';
};