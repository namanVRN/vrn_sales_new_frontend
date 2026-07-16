// frontend/src/utils/colorHelpers.js

export const getStatusColor = (status) => {
  const colorMap = {
    // Green - Success
    QUALIFIED: 'bg-green-100 text-green-800 border-green-200',
    VISIT_SCHEDULED: 'bg-green-100 text-green-800 border-green-200',
    VISIT_DONE: 'bg-green-100 text-green-800 border-green-200',
    MEETING_SCHEDULED: 'bg-green-100 text-green-800 border-green-200',
    DEAL_WON: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    FEEDBACK_CAPTURED: 'bg-teal-100 text-teal-800 border-teal-200',
    
    // Blue - In Progress
    FOLLOWUP_REQUIRED: 'bg-blue-100 text-blue-800 border-blue-200',
    NEGOTIATION: 'bg-blue-100 text-blue-800 border-blue-200',
    MEETING_RESCHEDULE: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    RESCHEDULE: 'bg-blue-100 text-blue-800 border-blue-200',
    
    // Cyan - Cold
    COLD: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    
    // Yellow - Warning
    NO_CONNECTION: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    NO_RESPONSE: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    
    // Red - Negative
    NOT_QUALIFIED: 'bg-red-100 text-red-800 border-red-200',
    NOT_INTERESTED: 'bg-red-100 text-red-800 border-red-200',
    DEAL_LOST: 'bg-red-100 text-red-800 border-red-200',
    NEGOTIATION_FAILED: 'bg-red-100 text-red-800 border-red-200',
  };
  return colorMap[status] || 'bg-gray-100 text-gray-800 border-gray-200';
};

export const getStageColor = (stage) => {
  const colorMap = {
    QUALIFICATION: 'bg-purple-100 text-purple-800 border-purple-200',
    SITE_VISIT_SCHEDULING: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    SITE_VISIT_EXECUTION: 'bg-blue-100 text-blue-800 border-blue-200',
    POST_VISIT_FOLLOWUP: 'bg-orange-100 text-orange-800 border-orange-200',
    DEAL: 'bg-green-100 text-green-800 border-green-200',
  };
  return colorMap[stage] || 'bg-gray-100 text-gray-800 border-gray-200';
};

export const getSourceColor = (source) => {
  const colorMap = {
    SOCIAL_MEDIA: 'bg-pink-100 text-pink-700',
    WEBSITE: 'bg-blue-100 text-blue-700',
    WALK_IN: 'bg-green-100 text-green-700',
    DIRECT: 'bg-purple-100 text-purple-700',
    REFERENCE: 'bg-orange-100 text-orange-700',
  };
  return colorMap[source] || 'bg-gray-100 text-gray-700';
};

export const getRowHighlight = (lead) => {
  if (lead.is_cold) return 'bg-cyan-50 hover:bg-cyan-100 border-l-4 border-l-cyan-400';
  if (lead.is_overdue) return 'bg-red-50 hover:bg-red-100 border-l-4 border-l-red-400';
  return 'hover:bg-gray-50 border-l-4 border-l-transparent';
};