// frontend/src/utils/constants.js

// ═══════════════════════════════════════════
// 🆕 ROLES (5 total)
// ═══════════════════════════════════════════
export const ROLES = {
  ADMIN: 'ADMIN',
  BDM: 'BDM',
  ADVISOR: 'ADVISOR',
  AUDITOR: 'AUDITOR',   // 🆕
  PC: 'PC',             // 🆕
};

// 🆕 Read-only roles
export const READ_ONLY_ROLES = ['AUDITOR', 'PC'];

// 🆕 Roles that see ALL leads globally
export const GLOBAL_VIEW_ROLES = ['ADMIN', 'AUDITOR', 'PC'];

// ═══════════════════════════════════════════
// ROLE LABELS
// ═══════════════════════════════════════════
export const ROLE_LABELS = {
  ADMIN: 'Administrator',
  BDM: 'Business Development Manager',
  ADVISOR: 'Field Sales Representative',
  AUDITOR: 'Auditor',                          // 🆕
  PC: 'Process Coordinator',                    // 🆕
};

// ═══════════════════════════════════════════
// ROLE COLORS (for badges)
// ═══════════════════════════════════════════
export const ROLE_COLORS = {
  ADMIN: 'bg-red-100 text-red-700 border-red-200',
  BDM: 'bg-purple-100 text-purple-700 border-purple-200',
  ADVISOR: 'bg-blue-100 text-blue-700 border-blue-200',
  AUDITOR: 'bg-amber-100 text-amber-700 border-amber-200',  // 🆕
  PC: 'bg-teal-100 text-teal-700 border-teal-200',           // 🆕
};

// ═══════════════════════════════════════════
// ROLE-BASED MODULES (Dashboard cards)
// ═══════════════════════════════════════════
export const ROLE_MODULES = {
  ADMIN: [
    { key: 'qualification', label: 'Qualification', description: 'Manage lead qualification', path: '/qualification', icon: 'UserCheck', color: 'purple' },
    { key: 'site_visit_scheduling', label: 'Visit Scheduling', description: 'Schedule site visits', path: '/site-visit-scheduling', icon: 'Calendar', color: 'indigo' },
    { key: 'site_visit_execution', label: 'Field Visits', description: 'Manage site visit execution', path: '/site-visit-execution', icon: 'MapPin', color: 'blue' },
    { key: 'post_visit', label: 'Post Visit', description: 'Post-visit follow-up', path: '/post-visit', icon: 'MessageSquare', color: 'orange' },
    { key: 'deal', label: 'Deals', description: 'Manage deal closure', path: '/deal', icon: 'Handshake', color: 'green' },
    { key: 'users', label: 'Users', description: 'Manage system users', path: '/admin/users', icon: 'Users', color: 'red' },
    { key: 'projects', label: 'Projects', description: 'Manage real estate projects', path: '/admin/projects', icon: 'Building2', color: 'pink' },
    { key: 'holidays', label: 'Holidays', description: 'Manage working days', path: '/admin/holidays', icon: 'CalendarDays', color: 'cyan' },
    { key: 'reports', label: 'Reports', description: 'View analytics & reports', path: '/admin/reports', icon: 'BarChart3', color: 'teal' },
  ],
  BDM: [
    { key: 'qualification', label: 'Qualification', description: 'Qualify new leads', path: '/qualification', icon: 'UserCheck', color: 'purple' },
    { key: 'site_visit_scheduling', label: 'Visit Scheduling', description: 'Schedule site visits', path: '/site-visit-scheduling', icon: 'Calendar', color: 'indigo' },
    { key: 'site_visit_execution', label: 'Field Visits', description: 'View scheduled visits', path: '/site-visit-execution', icon: 'MapPin', color: 'blue' },
  ],
  ADVISOR: [
    { key: 'site_visit_execution', label: 'Field Visits', description: 'Claim & complete visits', path: '/site-visit-execution', icon: 'MapPin', color: 'blue' },
    { key: 'post_visit', label: 'Post Visit', description: 'Post-visit follow-up', path: '/post-visit', icon: 'MessageSquare', color: 'orange' },
    { key: 'deal', label: 'Deals', description: 'Close deals', path: '/deal', icon: 'Handshake', color: 'green' },
  ],
  // 🆕 AUDITOR — sees ALL stages + audit log
  AUDITOR: [
    { key: 'qualification', label: 'Qualification', description: 'View qualification (read-only)', path: '/qualification', icon: 'UserCheck', color: 'purple' },
    { key: 'site_visit_scheduling', label: 'Visit Scheduling', description: 'View scheduling (read-only)', path: '/site-visit-scheduling', icon: 'Calendar', color: 'indigo' },
    { key: 'site_visit_execution', label: 'Field Visits', description: 'View field visits (read-only)', path: '/site-visit-execution', icon: 'MapPin', color: 'blue' },
    { key: 'post_visit', label: 'Post Visit', description: 'View post-visit (read-only)', path: '/post-visit', icon: 'MessageSquare', color: 'orange' },
    { key: 'deal', label: 'Deals', description: 'View deals (read-only)', path: '/deal', icon: 'Handshake', color: 'green' },
    { key: 'audit_log', label: 'Audit Log', description: 'View all activity trail', path: '/audit-log', icon: 'FileText', color: 'amber' },
  ],
  // 🆕 PC — sees ALL leads + followup tracking
  PC: [
    { key: 'qualification', label: 'Qualification', description: 'Monitor qualification', path: '/qualification', icon: 'UserCheck', color: 'purple' },
    { key: 'site_visit_scheduling', label: 'Visit Scheduling', description: 'Monitor scheduling', path: '/site-visit-scheduling', icon: 'Calendar', color: 'indigo' },
    { key: 'site_visit_execution', label: 'Field Visits', description: 'Monitor field visits', path: '/site-visit-execution', icon: 'MapPin', color: 'blue' },
    { key: 'post_visit', label: 'Post Visit', description: 'Monitor post-visit', path: '/post-visit', icon: 'MessageSquare', color: 'orange' },
    { key: 'deal', label: 'Deals', description: 'Monitor deals', path: '/deal', icon: 'Handshake', color: 'green' },
    { key: 'todays_followups', label: "Today's Followups", description: 'Track today\'s calls', path: '/todays-followups', icon: 'Clock', color: 'blue' },
    { key: 'overdue', label: 'Overdue Leads', description: 'Track overdue followups', path: '/overdue-leads', icon: 'AlertTriangle', color: 'red' },
  ],
};

// ═══════════════════════════════════════════
// STAGES
// ═══════════════════════════════════════════
export const STAGES = {
  QUALIFICATION: 'QUALIFICATION',
  SITE_VISIT_SCHEDULING: 'SITE_VISIT_SCHEDULING',
  SITE_VISIT_EXECUTION: 'SITE_VISIT_EXECUTION',
  POST_VISIT_FOLLOWUP: 'POST_VISIT_FOLLOWUP',
  DEAL: 'DEAL',
};

export const STAGE_LABELS = {
  QUALIFICATION: 'Qualification',
  SITE_VISIT_SCHEDULING: 'Visit Scheduling',
  SITE_VISIT_EXECUTION: 'Site Visit',
  POST_VISIT_FOLLOWUP: 'Post Visit',
  DEAL: 'Deal',
};

export const STAGE_ORDER = [
  'QUALIFICATION',
  'SITE_VISIT_SCHEDULING',
  'SITE_VISIT_EXECUTION',
  'POST_VISIT_FOLLOWUP',
  'DEAL',
];

// ═══════════════════════════════════════════
// STAGE STATUSES
// ═══════════════════════════════════════════
export const QUALIFICATION_STATUSES = [
  { value: 'QUALIFIED', label: 'Qualified', description: 'Lead is qualified for site visit' },
  { value: 'FOLLOWUP_REQUIRED', label: 'Followup Required', description: 'Needs another followup call' },
  { value: 'NO_CONNECTION', label: 'No Connection', description: 'Call did not connect' },
  { value: 'COLD', label: 'Cold', description: 'Lead has gone cold' },
  { value: 'NOT_QUALIFIED', label: 'Not Qualified', description: 'Lead does not meet criteria' },
  { value: 'NOT_INTERESTED', label: 'Not Interested', description: 'Customer not interested' },
];

export const SITE_VISIT_SCHEDULING_STATUSES = [
  { value: 'VISIT_SCHEDULED', label: 'Visit Scheduled', description: 'Site visit date confirmed' },
  { value: 'FOLLOWUP_REQUIRED', label: 'Followup Required', description: 'Need to follow up again' },
  { value: 'NO_RESPONSE', label: 'No Response', description: 'Not responding to calls' },
  { value: 'COLD', label: 'Cold', description: 'Lead has gone cold' },
  { value: 'NOT_INTERESTED', label: 'Not Interested', description: 'Customer not interested' },
];

export const SITE_VISIT_EXECUTION_STATUSES = [
  { value: 'VISIT_DONE', label: 'Visit Done', description: 'Site visit completed', fsr_only: true },
  { value: 'RESCHEDULE', label: 'Reschedule', description: 'Need to reschedule visit' },
  { value: 'NO_RESPONSE', label: 'No Response', description: 'Not responding', cnp: true },
  { value: 'COLD', label: 'Cold', description: 'Lead has gone cold' },
  { value: 'NOT_INTERESTED', label: 'Not Interested', description: 'Customer not interested' },
];

export const POST_VISIT_STATUSES = [
  { value: 'MEETING_SCHEDULED', label: 'Meeting Scheduled', description: 'Office meeting confirmed' },
  { value: 'FEEDBACK_CAPTURED', label: 'Feedback Captured', description: 'Visit feedback recorded' },
  { value: 'FOLLOWUP_REQUIRED', label: 'Followup Required', description: 'Needs more followup' },
  { value: 'NO_RESPONSE', label: 'No Response', description: 'Not responding' },
  { value: 'COLD', label: 'Cold', description: 'Lead has gone cold' },
  { value: 'NOT_INTERESTED', label: 'Not Interested', description: 'Customer not interested' },
];

export const DEAL_STATUSES = [
  { value: 'NEGOTIATION', label: 'Negotiation', description: 'In negotiation phase' },
  { value: 'MEETING_RESCHEDULE', label: 'Meeting Rescheduled', description: 'Meeting needs rescheduling' },
  { value: 'FOLLOWUP_REQUIRED', label: 'Followup Required', description: 'Needs followup' },
  { value: 'NO_RESPONSE', label: 'No Response', description: 'Not responding' },
  { value: 'DEAL_WON', label: 'Deal Won! 🎉', description: 'Successfully closed deal' },
  { value: 'DEAL_LOST', label: 'Deal Lost', description: 'Deal could not be closed' },
  { value: 'NEGOTIATION_FAILED', label: 'Negotiation Failed', description: 'Negotiation broke down' },
  { value: 'COLD', label: 'Cold', description: 'Lead has gone cold' },
  { value: 'NOT_INTERESTED', label: 'Not Interested', description: 'Customer not interested' },
];

// ═══════════════════════════════════════════
// LEAD SOURCES
// ═══════════════════════════════════════════
export const LEAD_SOURCES = [
  { value: 'SOCIAL_MEDIA', label: 'Social Media' },
  { value: 'WEBSITE', label: 'Website' },
  { value: 'WALK_IN', label: 'Walk In' },
  { value: 'DIRECT', label: 'Direct' },
  { value: 'REFERENCE', label: 'Reference' },
];

// ═══════════════════════════════════════════
// INTERESTED IN
// ═══════════════════════════════════════════
export const INTERESTED_IN = [
  { value: 'FLAT', label: 'Flat' },
  { value: 'PLOT', label: 'Plot' },
  { value: 'VILLA', label: 'Villa' },
  { value: 'COMMERCIAL', label: 'Commercial' },
  { value: 'PENTHOUSE', label: 'Penthouse' },
  { value: 'DUPLEX', label: 'Duplex' },
];

// ═══════════════════════════════════════════
// PURPOSE
// ═══════════════════════════════════════════
export const PURPOSE_OPTIONS = [
  { value: 'INVESTMENT', label: 'Investment' },
  { value: 'SELF_USE', label: 'Self Use' },
  { value: 'RENTAL', label: 'Rental' },
];

// ═══════════════════════════════════════════
// CLOSE STATUSES
// ═══════════════════════════════════════════
export const CLOSED_STATUSES = [
  'NOT_QUALIFIED', 'NOT_INTERESTED', 'DEAL_WON', 'DEAL_LOST', 'NEGOTIATION_FAILED'
];

export const AUTO_DATE_STATUSES = ['NO_CONNECTION', 'NO_RESPONSE', 'COLD'];

export const DATE_REQUIRED_STATUSES = {
  VISIT_SCHEDULED: 'planned_site_visit_date',
  RESCHEDULE: 'planned_site_visit_date',
  VISIT_DONE: null,
  MEETING_SCHEDULED: 'meeting_scheduled_date',
  MEETING_RESCHEDULE: 'meeting_scheduled_date',
};