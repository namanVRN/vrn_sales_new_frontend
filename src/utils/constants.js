// ═══════════════════════════════════════════
// USER ROLES
// ═══════════════════════════════════════════
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  BDM: 'BDM',
  ADVISOR: 'ADVISOR',
};

export const ROLE_LABELS = {
  ADMIN: 'Admin',
  BDM: 'BDM',
  ADVISOR: 'FSR',
};

// ═══════════════════════════════════════════
// LEAD STAGES
// ═══════════════════════════════════════════
export const LEAD_STAGES = {
  QUALIFICATION: 'QUALIFICATION',
  SITE_VISIT_SCHEDULING: 'SITE_VISIT_SCHEDULING',
  SITE_VISIT_EXECUTION: 'SITE_VISIT_EXECUTION',
  POST_VISIT_FOLLOWUP: 'POST_VISIT_FOLLOWUP',
  DEAL: 'DEAL',
};

export const STAGE_LABELS = {
  QUALIFICATION: 'Qualification',
  SITE_VISIT_SCHEDULING: 'Site Visit Scheduling',
  SITE_VISIT_EXECUTION: 'Site Visit Execution',
  POST_VISIT_FOLLOWUP: 'Post Visit Follow-up',
  DEAL: 'Deal',
};

// ═══════════════════════════════════════════
// LEAD STATUSES PER STAGE
// ═══════════════════════════════════════════
export const LEAD_STATUSES = {
  QUALIFICATION: [
    'QUALIFIED',
    'FOLLOWUP_REQUIRED',
    'NO_CONNECTION',
    'COLD',
    'NOT_QUALIFIED',
    'NOT_INTERESTED',
  ],
  SITE_VISIT_SCHEDULING: [
    'VISIT_SCHEDULED',
    'NO_RESPONSE',
    'FOLLOWUP_REQUIRED',
    'COLD',
    'NOT_INTERESTED',
  ],
  SITE_VISIT_EXECUTION: [
    'VISIT_DONE',
    'RESCHEDULE',
    'NO_RESPONSE',
    'COLD',
    'NOT_INTERESTED',
  ],
  POST_VISIT_FOLLOWUP: [
    'FEEDBACK_CAPTURED',
    'MEETING_SCHEDULED',
    'FOLLOWUP_REQUIRED',
    'NO_RESPONSE',
    'COLD',
    'NOT_INTERESTED',
  ],
  DEAL: [
    'NEGOTIATION',
    'MEETING_RESCHEDULE',
    'FOLLOWUP_REQUIRED',
    'NO_RESPONSE',
    'DEAL_WON',
    'DEAL_LOST',
    'NEGOTIATION_FAILED',
    'COLD',
    'NOT_INTERESTED',
  ],
};

// Status labels for UI
export const STATUS_LABELS = {
  QUALIFIED: 'Qualified',
  FOLLOWUP_REQUIRED: 'Follow-up Required',
  NO_CONNECTION: 'No Connection',
  NO_RESPONSE: 'No Response',
  COLD: 'Cold (15+ Days)',
  NOT_QUALIFIED: 'Not Qualified',
  NOT_INTERESTED: 'Not Interested',
  VISIT_SCHEDULED: 'Visit Scheduled',
  VISIT_DONE: 'Visit Done',
  RESCHEDULE: 'Reschedule',
  FEEDBACK_CAPTURED: 'Feedback Captured',
  MEETING_SCHEDULED: 'Meeting Scheduled',
  MEETING_RESCHEDULE: 'Meeting Reschedule',
  NEGOTIATION: 'Negotiation',
  DEAL_WON: 'Deal Won 🎉',
  DEAL_LOST: 'Deal Lost',
  NEGOTIATION_FAILED: 'Negotiation Failed',
};

// ═══════════════════════════════════════════
// LEAD SOURCES
// ═══════════════════════════════════════════
export const LEAD_SOURCES = [
  { value: 'SOCIAL_MEDIA', label: 'Social Media' },
  { value: 'WEBSITE', label: 'Website' },
  { value: 'WALK_IN', label: 'Walk-in' },
  { value: 'DIRECT', label: 'Direct' },
  { value: 'REFERENCE', label: 'Reference' },
];

// ═══════════════════════════════════════════
// PURPOSES
// ═══════════════════════════════════════════
export const PURPOSES = [
  'Residential',
  'Rental',
  'Commercial',
  'Investment',
  'Plot',
];

// ═══════════════════════════════════════════
// MODULE ACCESS PER ROLE (Dashboard cards)
// ═══════════════════════════════════════════
export const ROLE_MODULES = {
  ADMIN: [
    'QUALIFICATION',
    'SITE_VISIT_SCHEDULING',
    'FIELD_VISIT',
    'CNP',
    'POST_VISIT',
    'DEAL',
    'USERS',
    'PROJECTS',
    'HOLIDAYS',
    'REPORTS',
  ],
  BDM: [
    'QUALIFICATION',
    'SITE_VISIT_SCHEDULING',
    'FIELD_VISIT',
    'CNP',
  ],
  ADVISOR: [
    'FIELD_VISIT',
    'POST_VISIT',
    'DEAL',
  ],
};