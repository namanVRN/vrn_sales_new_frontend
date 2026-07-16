// frontend/src/components/modals/UpdateSiteVisitSchedulingModal.jsx
import React, { useState, useEffect } from 'react';
import { 
  X, Calendar, PhoneCall, Snowflake, ThumbsDown, 
  Clock, AlertCircle, ArrowRight, ChevronDown, ChevronUp, 
  User, Phone, Mail, Building2, Star, MapPin, Info, 
  MessageSquare, History, Briefcase, FileText, Copy, Check, MapPinned
} from 'lucide-react';
import toast from 'react-hot-toast';
import { siteVisitSchedulingApi } from '../../api/siteVisitApi';
import { leadApi } from '../../api/leadApi';
import { SITE_VISIT_SCHEDULING_STATUSES } from '../../utils/constants';
import { getTodayString, formatDate, timeAgo } from '../../utils/dateHelpers';
import StatusBadge from '../common/StatusBadge';

const STATUS_ICONS = {
  VISIT_SCHEDULED: MapPinned,
  FOLLOWUP_REQUIRED: PhoneCall,
  NO_RESPONSE: PhoneCall,
  COLD: Snowflake,
  NOT_INTERESTED: ThumbsDown,
};

const STATUS_COLORS = {
  VISIT_SCHEDULED: 'green',
  FOLLOWUP_REQUIRED: 'blue',
  NO_RESPONSE: 'yellow',
  COLD: 'cyan',
  NOT_INTERESTED: 'red',
};

const STAGE_LABELS = {
  QUALIFICATION: 'Qualification',
  SITE_VISIT_SCHEDULING: 'Visit Scheduling',
  SITE_VISIT_EXECUTION: 'Field Visit',
  POST_VISIT_FOLLOWUP: 'Post Visit',
  DEAL: 'Deal',
};

const formatRemarkDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `[${day}/${month}/${year} ${hours}:${minutes}]`;
};

const InfoRow = ({ icon: Icon, label, value, color = 'text-gray-700' }) => (
  <div className="flex items-start gap-2">
    <Icon size={12} className="text-gray-400 mt-0.5 flex-shrink-0" />
    <div className="flex-1 min-w-0">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-sm font-medium ${color} truncate`}>{value || '—'}</p>
    </div>
  </div>
);

const RemarkItem = ({ activity, isLast }) => {
  const dateLabel = formatRemarkDate(activity.createdAt);
  const stageLabel = STAGE_LABELS[activity.stage_after || activity.stage_before] || '';
  const isStageChange = activity.stage_after && activity.stage_before && 
                        activity.stage_after !== activity.stage_before &&
                        activity.stage_before !== '';
  
  return (
    <div className={`px-4 py-3 ${!isLast ? 'border-b border-purple-100' : ''}`}>
      <div className="flex items-center gap-2 flex-wrap mb-2 text-xs">
        <span className="font-mono font-semibold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
          {dateLabel}
        </span>
        {stageLabel && (
          <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-medium">
            📌 {stageLabel}
          </span>
        )}
        {activity.status_after && (
          <StatusBadge status={activity.status_after} size="sm" />
        )}
        {isStageChange && (
          <span className="text-orange-600 font-semibold text-xs">⬆️ Stage Changed</span>
        )}
        {activity.action_type === 'CREATED' && (
          <span className="text-green-600 font-semibold text-xs">🆕 Lead Created</span>
        )}
      </div>
      <p className="text-sm text-gray-800 leading-relaxed pl-1">
        {activity.remark || '(No remark)'}
      </p>
      <div className="flex items-center gap-1.5 mt-2">
        <div className="w-5 h-5 rounded-full bg-purple-200 flex items-center justify-center">
          <span className="text-xs font-bold text-purple-700">
            {activity.performed_by_name?.charAt(0)?.toUpperCase() || '?'}
          </span>
        </div>
        <span className="text-xs text-gray-600">
          <strong>{activity.performed_by_name || 'System'}</strong>
          <span className="text-gray-400 ml-1">({activity.performed_by_role || 'SYSTEM'})</span>
        </span>
      </div>
    </div>
  );
};

const UpdateSiteVisitSchedulingModal = ({ lead: initialLead, onClose, onSuccess }) => {
  const [lead, setLead] = useState(initialLead);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [remark, setRemark] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [followupDate, setFollowupDate] = useState('');
  const [importantNote, setImportantNote] = useState(initialLead?.important_note || '');
  const [activities, setActivities] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [showAllDetails, setShowAllDetails] = useState(false);
  const [remarksExpanded, setRemarksExpanded] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    leadApi.getById(initialLead._id)
      .then(res => {
        const fullLead = res.data?.data || res.data;
        if (fullLead && fullLead._id) {
          setLead(fullLead);
          setImportantNote(fullLead.important_note || '');
        }
      })
      .catch(err => console.error('❌ Lead fetch error:', err.response?.data));
    
    setIsLoadingHistory(true);
    leadApi.getHistory(initialLead._id)
      .then(res => {
        let acts = [];
        if (Array.isArray(res.data?.data)) acts = res.data.data;
        else if (Array.isArray(res.data?.data?.activities)) acts = res.data.data.activities;
        else if (Array.isArray(res.data?.data?.history)) acts = res.data.data.history;
        else if (Array.isArray(res.data?.activities)) acts = res.data.activities;
        else if (Array.isArray(res.data)) acts = res.data;
        
        const sorted = [...acts].sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        setActivities(sorted);
      })
      .catch(err => console.error('❌ History error:', err.response?.data))
      .finally(() => setIsLoadingHistory(false));
  }, [initialLead._id]);

  useEffect(() => {
    setVisitDate('');
    setFollowupDate('');
    setErrors({});
  }, [selectedStatus]);

  const isClosingStatus = selectedStatus === 'NOT_INTERESTED';
  const isVisitScheduled = selectedStatus === 'VISIT_SCHEDULED';
  const isFollowupRequired = selectedStatus === 'FOLLOWUP_REQUIRED';
  const isAutoDate = ['NO_RESPONSE', 'COLD'].includes(selectedStatus);

  const remarksActivities = activities.filter(a => a.remark && a.remark.trim());

  const handleCopyRemarks = () => {
    const text = remarksActivities.map(a => {
      const date = formatRemarkDate(a.createdAt);
      const stage = STAGE_LABELS[a.stage_after || a.stage_before] || '';
      const status = a.status_after?.replace(/_/g, ' ') || '';
      const by = a.performed_by_name || 'System';
      return `${date} [${stage}] [${status}] by ${by}\n${a.remark}\n`;
    }).join('\n');
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('All remarks copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const validate = () => {
    const errs = {};
    if (!selectedStatus) errs.status = 'Please select a status';
    if (!remark.trim()) errs.remark = 'Remark is required';
    if (isVisitScheduled && !visitDate) {
      errs.visitDate = 'Site visit date is required to schedule visit';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      toast.error('Please fill all required fields');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const payload = {
        status: selectedStatus,
        remark: remark.trim(),
      };

      if (isVisitScheduled) {
        payload.planned_site_visit_date = visitDate;
      }
      
      if (isFollowupRequired && followupDate) {
        payload.next_followup_date = followupDate;
      }

      if (importantNote !== lead.important_note) {
        payload.important_note = importantNote;
      }

      console.log('📤 Submitting payload:', payload);
      
      const res = await siteVisitSchedulingApi.updateStatus(lead._id, payload);
      toast.success(res.data?.message || `Lead updated to ${selectedStatus.replace(/_/g, ' ')}`);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('❌ Update error:', error.response?.data);
      const msg = error.response?.data?.message || 'Failed to update lead';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="flex min-h-full items-end justify-center p-4 sm:items-center sm:p-0">
        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 rounded-t-2xl z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <Calendar size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Schedule Site Visit</h2>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <div className="flex items-center gap-1 text-xs bg-white bg-opacity-20 px-2 py-0.5 rounded-full">
                      <User size={11} />
                      {lead.customer_name}
                    </div>
                    <div className="flex items-center gap-1 text-xs bg-white bg-opacity-20 px-2 py-0.5 rounded-full">
                      <Phone size={11} />
                      {lead.customer_contact}
                    </div>
                    <div className="text-xs font-mono font-bold bg-white bg-opacity-20 px-2 py-0.5 rounded-full">
                      {lead.unique_id}
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {/* ═══ SECTION 1: LEAD DETAILS ═══ */}
            <div className="bg-gray-50 border border-gray-100 rounded-xl overflow-hidden">
              <button
                onClick={() => setShowAllDetails(!showAllDetails)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Info size={14} className="text-indigo-600" />
                  <span className="text-sm font-semibold text-gray-800">Lead Details</span>
                  <StatusBadge status={lead.current_status} size="sm" />
                </div>
                {showAllDetails ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
              </button>

              <div className="px-4 pb-3 grid grid-cols-2 md:grid-cols-4 gap-3 border-t border-gray-100 pt-3">
                <InfoRow icon={Phone} label="Contact" value={lead.customer_contact} />
                <InfoRow icon={Building2} label="Project" value={lead.project?.name} />
                <InfoRow icon={MapPin} label="Interested In" value={lead.interested_in} />
                <InfoRow icon={Clock} label="Followup #" value={`#${lead.followup_count || 0}`} />
              </div>

              {showAllDetails && (
                <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-3">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <InfoRow icon={Mail} label="Email" value={lead.customer_email} />
                    <InfoRow icon={Briefcase} label="Purpose" value={lead.purpose} />
                    <InfoRow icon={Star} label="Lead Source" value={lead.lead_source?.replace(/_/g, ' ')} />
                    <InfoRow icon={Info} label="Source Detail" value={lead.lead_source_detail} />
                    <InfoRow icon={Briefcase} label="Campaign" value={lead.campaign_name} />
                    <InfoRow icon={User} label="Lead Gen By" value={lead.lead_gen_name} />
                    <InfoRow icon={User} label="Current Owner" value={lead.current_owner?.name} color="text-purple-700" />
                    <InfoRow icon={Calendar} label="Created At" value={formatDate(lead.createdAt)} />
                    <InfoRow icon={Calendar} label="Last Action" value={timeAgo(lead.last_action_date)} />
                  </div>

                  {lead.important_note && (
                    <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3 mt-2">
                      <div className="flex items-start gap-2">
                        <Info size={14} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-yellow-800">Important Note</p>
                          <p className="text-sm text-yellow-900 mt-1">{lead.important_note}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ═══ SECTION 2: UPDATE FORM ═══ */}
            <div className="border-t-2 border-gray-100 pt-4">
              <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                <History size={14} className="text-indigo-600" />
                Update Status & Schedule Visit
              </h3>

              {/* Important Note */}
              <div className="mb-4">
                <label className="text-xs font-medium text-gray-600 block mb-1">
                  Important Note (optional)
                </label>
                <input
                  type="text"
                  value={importantNote}
                  onChange={(e) => setImportantNote(e.target.value)}
                  placeholder="Any special notes about this lead..."
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Status Selection Cards */}
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-3">
                  Select Status *
                </label>
                {errors.status && (
                  <p className="text-xs text-red-500 mb-2">{errors.status}</p>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SITE_VISIT_SCHEDULING_STATUSES.map((status) => {
                    const Icon = STATUS_ICONS[status.value] || Calendar;
                    const color = STATUS_COLORS[status.value] || 'gray';
                    const isSelected = selectedStatus === status.value;
                    
                    const bgClass = {
                      green: isSelected ? 'border-green-500 bg-green-50 ring-2 ring-green-200' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
                      blue: isSelected ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
                      yellow: isSelected ? 'border-yellow-500 bg-yellow-50 ring-2 ring-yellow-200' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
                      cyan: isSelected ? 'border-cyan-500 bg-cyan-50 ring-2 ring-cyan-200' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
                      red: isSelected ? 'border-red-500 bg-red-50 ring-2 ring-red-200' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
                    }[color];

                    const iconClass = {
                      green: isSelected ? 'text-green-600' : 'text-gray-400',
                      blue: isSelected ? 'text-blue-600' : 'text-gray-400',
                      yellow: isSelected ? 'text-yellow-600' : 'text-gray-400',
                      cyan: isSelected ? 'text-cyan-600' : 'text-gray-400',
                      red: isSelected ? 'text-red-600' : 'text-gray-400',
                    }[color];

                    const textClass = {
                      green: isSelected ? 'text-green-700' : 'text-gray-700',
                      blue: isSelected ? 'text-blue-700' : 'text-gray-700',
                      yellow: isSelected ? 'text-yellow-700' : 'text-gray-700',
                      cyan: isSelected ? 'text-cyan-700' : 'text-gray-700',
                      red: isSelected ? 'text-red-700' : 'text-gray-700',
                    }[color];

                    return (
                      <button
                        key={status.value}
                        type="button"
                        onClick={() => setSelectedStatus(status.value)}
                        className={`flex flex-col items-start gap-1 p-3 border-2 rounded-xl transition-all duration-150 text-left ${bgClass}`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon size={16} className={iconClass} />
                          <span className={`text-xs font-semibold ${textClass}`}>
                            {status.label}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {status.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Site Visit Date — REQUIRED for VISIT_SCHEDULED */}
              {isVisitScheduled && (
                <div className="mt-4">
                  <label className="text-xs font-medium text-gray-700 block mb-1">
                    <Calendar size={12} className="inline mr-1" />
                    Site Visit Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={visitDate}
                    onChange={(e) => {
                      setVisitDate(e.target.value);
                      if (errors.visitDate) setErrors({...errors, visitDate: ''});
                    }}
                    min={getTodayString()}
                    className={`w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.visitDate ? 'border-red-300' : 'border-gray-200'
                    }`}
                  />
                  {errors.visitDate && (
                    <p className="text-xs text-red-500 mt-1">{errors.visitDate}</p>
                  )}
                  
                  {/* Flow Indicator */}
                  <div className="mt-3 flex items-start gap-3 p-4 rounded-xl border-2 bg-green-50 border-green-200">
                    <div className="text-2xl">📍</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold uppercase tracking-wide text-green-700">
                          Next Step: Stage 3
                        </span>
                        <ArrowRight size={12} className="text-green-600" />
                      </div>
                      <p className="text-xs text-green-800">
                        Lead will move to <strong>Field Visit Execution</strong> stage. 
                        {visitDate && ` Visit scheduled for ${visitDate}.`}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Followup Date for FOLLOWUP_REQUIRED */}
              {isFollowupRequired && (
                <div className="mt-4">
                  <label className="text-xs font-medium text-gray-700 block mb-1">
                    <Clock size={12} className="inline mr-1" />
                    Next Followup Date <span className="text-gray-400">(optional)</span>
                  </label>
                  <input
                    type="date"
                    value={followupDate}
                    onChange={(e) => setFollowupDate(e.target.value)}
                    min={getTodayString()}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {followupDate 
                      ? `📅 Followup scheduled for ${followupDate}` 
                      : '⏱️ Auto: +2 working days if not provided'
                    }
                  </p>
                </div>
              )}

              {/* Auto Date Info */}
              {isAutoDate && (
                <div className="mt-4 flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                  <AlertCircle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800">
                    {selectedStatus === 'COLD' 
                      ? <>❄️ Cold leads are auto-scheduled <strong>+15 working days</strong>. Date cannot be overridden.</>
                      : <>⏱️ No Response uses <strong>progressive gap</strong> (count × 2 days). Auto-calculated.</>
                    }
                  </p>
                </div>
              )}

              {/* ═══ PREVIOUS REMARKS ═══ */}
              <div className="mt-6 bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-100 rounded-xl overflow-hidden">
                <div className="px-4 py-3 flex items-center justify-between border-b border-purple-100 bg-white bg-opacity-50">
                  <button
                    onClick={() => setRemarksExpanded(!remarksExpanded)}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                  >
                    <MessageSquare size={16} className="text-purple-600" />
                    <span className="text-sm font-bold text-purple-900">
                      Previous Remarks
                    </span>
                    <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full font-bold">
                      {isLoadingHistory ? '...' : remarksActivities.length}
                    </span>
                    <span className="text-xs bg-white bg-opacity-70 text-purple-700 px-2 py-0.5 rounded font-medium">
                      Read-Only
                    </span>
                  </button>
                  
                  {remarksActivities.length > 0 && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCopyRemarks}
                        className="flex items-center gap-1 text-xs text-purple-700 hover:text-purple-900 bg-white px-2 py-1 rounded transition-colors border border-purple-200"
                      >
                        {copied ? (<><Check size={11} /> Copied!</>) : (<><Copy size={11} /> Copy All</>)}
                      </button>
                      <button
                        onClick={() => setRemarksExpanded(!remarksExpanded)}
                        className="p-1 hover:bg-white hover:bg-opacity-70 rounded transition-colors"
                      >
                        {remarksExpanded ? <ChevronUp size={16} className="text-purple-600" /> : <ChevronDown size={16} className="text-purple-600" />}
                      </button>
                    </div>
                  )}
                </div>

                {remarksExpanded && (
                  <>
                    {isLoadingHistory ? (
                      <div className="px-4 py-8 text-center">
                        <div className="inline-block h-6 w-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-2" />
                        <p className="text-xs text-purple-600">Loading history...</p>
                      </div>
                    ) : remarksActivities.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <MessageSquare size={32} className="text-purple-300 mx-auto mb-2" />
                        <p className="text-sm text-purple-600 font-medium">No previous remarks yet</p>
                      </div>
                    ) : (
                      <div className="max-h-64 overflow-y-auto scrollbar-thin bg-white">
                        {remarksActivities.map((activity, index) => (
                          <RemarkItem
                            key={activity._id || index}
                            activity={activity}
                            isLast={index === remarksActivities.length - 1}
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}

                {remarksActivities.length > 0 && (
                  <div className="px-4 py-2 bg-purple-100 bg-opacity-50 border-t border-purple-100">
                    <p className="text-xs text-purple-700">
                      💡 <strong>Tip:</strong> Read all previous conversations before adding your update.
                    </p>
                  </div>
                )}
              </div>

              {/* New Remark */}
              <div className="mt-4">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1">
                  🆕 New Remark *
                </label>
                <textarea
                  value={remark}
                  onChange={(e) => {
                    setRemark(e.target.value);
                    if (errors.remark) setErrors({...errors, remark: ''});
                  }}
                  placeholder="Write about today's conversation..."
                  rows={4}
                  maxLength={500}
                  className={`w-full text-sm border rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.remark ? 'border-red-300' : 'border-gray-200'}`}
                />
                {errors.remark && (
                  <p className="text-xs text-red-500 mt-1">{errors.remark}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">{remark.length}/500 characters</p>
              </div>

              {/* Closing Warning */}
              {isClosingStatus && (
                <div className="mt-4 flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
                  <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700">
                    <strong>Warning:</strong> This will permanently close the lead. Action cannot be undone.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 rounded-b-2xl flex items-center justify-between gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedStatus}
              className={`px-6 py-2 text-sm font-semibold text-white rounded-lg transition-all ${
                isSubmitting || !selectedStatus
                  ? 'bg-gray-300 cursor-not-allowed'
                  : isClosingStatus
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Updating...
                </span>
              ) : (
                isClosingStatus ? 'Close Lead' : 'Submit Update'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateSiteVisitSchedulingModal;