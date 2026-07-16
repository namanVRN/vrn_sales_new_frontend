// frontend/src/components/modals/UpdateSiteVisitExecutionModal.jsx
import React, { useState, useEffect } from 'react';
import { 
  X, MapPin, CheckCircle, RefreshCw, PhoneOff, Snowflake, 
  ThumbsDown, Calendar, Clock, AlertCircle, ArrowRight, 
  ChevronDown, ChevronUp, User, Phone, Mail, Building2, 
  Star, Info, MessageSquare, History, Briefcase, FileText, 
  Copy, Check, Award, Lock
} from 'lucide-react';
import toast from 'react-hot-toast';
import { siteVisitExecutionApi } from '../../api/siteVisitApi';
import { leadApi } from '../../api/leadApi';
import { getTodayString, formatDate, timeAgo } from '../../utils/dateHelpers';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../common/StatusBadge';

// Different statuses based on which tab (Scheduled vs CNP)
const SCHEDULED_STATUSES = [
  { value: 'VISIT_DONE', label: 'Visit Done', description: 'Mark visit as completed (FSR claims lead)', fsr_only: true },
  { value: 'RESCHEDULE', label: 'Reschedule', description: 'Reschedule the site visit' },
  { value: 'NO_RESPONSE', label: 'Call Not Picked', description: 'Move to CNP screen' },
  { value: 'COLD', label: 'Cold', description: 'Lead has gone cold' },
  { value: 'NOT_INTERESTED', label: 'Not Interested', description: 'Customer not interested' },
];

const CNP_STATUSES = [
  { value: 'RESCHEDULE', label: 'Reschedule', description: 'Customer responded, reschedule visit' },
  { value: 'NO_RESPONSE', label: 'Still No Response', description: 'Continue trying' },
  { value: 'COLD', label: 'Cold', description: 'Lead has gone cold' },
  { value: 'NOT_INTERESTED', label: 'Not Interested', description: 'Customer not interested' },
];

const STATUS_ICONS = {
  VISIT_DONE: CheckCircle,
  RESCHEDULE: RefreshCw,
  NO_RESPONSE: PhoneOff,
  COLD: Snowflake,
  NOT_INTERESTED: ThumbsDown,
};

const STATUS_COLORS = {
  VISIT_DONE: 'green',
  RESCHEDULE: 'blue',
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
        {activity.action_type === 'VISIT_CLAIMED' && (
          <span className="text-blue-600 font-semibold text-xs">🏆 Visit Claimed</span>
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

const UpdateSiteVisitExecutionModal = ({ lead: initialLead, tab = 'scheduled', onClose, onSuccess }) => {
  const { user, isAdmin, isBDM, isAdvisor } = useAuth();
  const [lead, setLead] = useState(initialLead);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [remark, setRemark] = useState('');
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [siteVisitFeedback, setSiteVisitFeedback] = useState('');
  const [importantNote, setImportantNote] = useState(initialLead?.important_note || '');
  const [activities, setActivities] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [showAllDetails, setShowAllDetails] = useState(false);
  const [remarksExpanded, setRemarksExpanded] = useState(true);
  const [copied, setCopied] = useState(false);

  // Determine which statuses to show based on tab
  const availableStatuses = tab === 'cnp' ? CNP_STATUSES : SCHEDULED_STATUSES;
  
  // FSR can mark VISIT_DONE, Admin also allowed by backend
  const canMarkVisitDone = isAdvisor || isAdmin;

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
    setRescheduleDate('');
    setSiteVisitFeedback('');
    setErrors({});
  }, [selectedStatus]);

  const isClosingStatus = selectedStatus === 'NOT_INTERESTED';
  const isVisitDone = selectedStatus === 'VISIT_DONE';
  const isReschedule = selectedStatus === 'RESCHEDULE';
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
    if (isReschedule && !rescheduleDate) {
      errs.rescheduleDate = 'New visit date is required for reschedule';
    }
    if (isVisitDone && !canMarkVisitDone) {
      errs.status = 'Only FSR/Advisor can mark visit as done';
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

      if (isReschedule) {
        payload.planned_site_visit_date = rescheduleDate;
      }

      if (isVisitDone && siteVisitFeedback) {
        payload.site_visit_feedback = siteVisitFeedback;
      }

      if (importantNote !== lead.important_note) {
        payload.important_note = importantNote;
      }

      console.log('📤 Submitting payload:', payload);
      
      const res = await siteVisitExecutionApi.updateStatus(lead._id, payload);
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
          {/* Header — Different colors for FSR vs BDM/Admin */}
          <div className={`sticky top-0 text-white px-6 py-4 rounded-t-2xl z-10 ${
            isAdvisor 
              ? 'bg-gradient-to-r from-blue-600 to-cyan-600' 
              : 'bg-gradient-to-r from-blue-600 to-indigo-600'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <MapPin size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">
                    {isAdvisor ? 'Complete Site Visit' : 'Manage Site Visit'}
                  </h2>
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
            {/* FSR Info Banner */}
            {isAdvisor && tab === 'scheduled' && (
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <Award size={16} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-blue-900">
                      🏆 Claim This Lead
                    </p>
                    <p className="text-xs text-blue-800 mt-1">
                      Mark this visit as <strong>Visit Done</strong> to claim ownership. 
                      Lead will move to <strong>Post Visit</strong> stage under your name for follow-up and deal closure.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Planned Visit Date Banner */}
            {lead.planned_site_visit_date && (
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-3">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-green-600" />
                  <span className="text-sm font-semibold text-green-900">
                    Planned Visit Date: {formatDate(lead.planned_site_visit_date)}
                  </span>
                </div>
              </div>
            )}

            {/* ═══ SECTION 1: LEAD DETAILS ═══ */}
            <div className="bg-gray-50 border border-gray-100 rounded-xl overflow-hidden">
              <button
                onClick={() => setShowAllDetails(!showAllDetails)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Info size={14} className="text-blue-600" />
                  <span className="text-sm font-semibold text-gray-800">Lead Details</span>
                  <StatusBadge status={lead.current_status} size="sm" />
                </div>
                {showAllDetails ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
              </button>

              <div className="px-4 pb-3 grid grid-cols-2 md:grid-cols-4 gap-3 border-t border-gray-100 pt-3">
                <InfoRow icon={Phone} label="Contact" value={lead.customer_contact} />
                <InfoRow icon={Building2} label="Project" value={lead.project?.name} />
                <InfoRow icon={MapPin} label="Interested In" value={lead.interested_in} />
                <InfoRow icon={User} label="Owner" value={lead.current_owner?.name} color="text-purple-700" />
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
                    <InfoRow icon={Clock} label="Followup #" value={`#${lead.followup_count || 0}`} />
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
                <History size={14} className="text-blue-600" />
                {tab === 'cnp' ? 'Update CNP Status' : 'Update Visit Status'}
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
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  {availableStatuses.map((status) => {
                    const Icon = STATUS_ICONS[status.value] || CheckCircle;
                    const color = STATUS_COLORS[status.value] || 'gray';
                    const isSelected = selectedStatus === status.value;
                    const isDisabled = status.fsr_only && !canMarkVisitDone;
                    
                    const bgClass = isDisabled 
                      ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                      : {
                        green: isSelected ? 'border-green-500 bg-green-50 ring-2 ring-green-200' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
                        blue: isSelected ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
                        yellow: isSelected ? 'border-yellow-500 bg-yellow-50 ring-2 ring-yellow-200' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
                        cyan: isSelected ? 'border-cyan-500 bg-cyan-50 ring-2 ring-cyan-200' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
                        red: isSelected ? 'border-red-500 bg-red-50 ring-2 ring-red-200' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
                      }[color];

                    const iconClass = isDisabled ? 'text-gray-300' : {
                      green: isSelected ? 'text-green-600' : 'text-gray-400',
                      blue: isSelected ? 'text-blue-600' : 'text-gray-400',
                      yellow: isSelected ? 'text-yellow-600' : 'text-gray-400',
                      cyan: isSelected ? 'text-cyan-600' : 'text-gray-400',
                      red: isSelected ? 'text-red-600' : 'text-gray-400',
                    }[color];

                    const textClass = isDisabled ? 'text-gray-400' : {
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
                        disabled={isDisabled}
                        onClick={() => !isDisabled && setSelectedStatus(status.value)}
                        className={`flex flex-col items-start gap-1 p-3 border-2 rounded-xl transition-all duration-150 text-left relative ${bgClass}`}
                        title={isDisabled ? 'Only FSR/Advisor can mark visit as done' : ''}
                      >
                        <div className="flex items-center gap-2">
                          <Icon size={16} className={iconClass} />
                          <span className={`text-xs font-semibold ${textClass}`}>
                            {status.label}
                          </span>
                          {status.fsr_only && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-1 py-0.5 rounded font-bold ml-auto">
                              FSR
                            </span>
                          )}
                        </div>
                        <p className={`text-xs ${isDisabled ? 'text-gray-400' : 'text-gray-500'}`}>
                          {status.description}
                        </p>
                        {isDisabled && (
                          <div className="absolute top-2 right-2">
                            <Lock size={10} className="text-gray-400" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* VISIT_DONE — Special Section */}
              {isVisitDone && (
                <div className="mt-4 space-y-3">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-3xl">🏆</div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-green-800 mb-1">
                          You are claiming this lead!
                        </p>
                        <p className="text-xs text-green-700">
                          After this, <strong>{user?.name}</strong> ({user?.role}) will be the owner. 
                          Lead will move to <strong>Post Visit Follow-up</strong> stage.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">
                      Site Visit Feedback <span className="text-gray-400">(optional)</span>
                    </label>
                    <textarea
                      value={siteVisitFeedback}
                      onChange={(e) => setSiteVisitFeedback(e.target.value)}
                      placeholder="What did customer say during visit? Their interest level, concerns, next action..."
                      rows={3}
                      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      This feedback will be saved with the lead
                    </p>
                  </div>
                </div>
              )}

              {/* RESCHEDULE — New Date Required */}
              {isReschedule && (
                <div className="mt-4">
                  <label className="text-xs font-medium text-gray-700 block mb-1">
                    <Calendar size={12} className="inline mr-1" />
                    New Site Visit Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={rescheduleDate}
                    onChange={(e) => {
                      setRescheduleDate(e.target.value);
                      if (errors.rescheduleDate) setErrors({...errors, rescheduleDate: ''});
                    }}
                    min={getTodayString()}
                    className={`w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.rescheduleDate ? 'border-red-300' : 'border-gray-200'
                    }`}
                  />
                  {errors.rescheduleDate && (
                    <p className="text-xs text-red-500 mt-1">{errors.rescheduleDate}</p>
                  )}
                  <p className="text-xs text-blue-600 mt-1">
                    📅 Visit will be rescheduled to the new date
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
                      : <>⏱️ No Response uses <strong>progressive gap</strong> (count × 2 days). Lead moves to CNP screen.</>
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
                  placeholder={isVisitDone ? 'Describe how the visit went...' : 'Write about the update...'}
                  rows={4}
                  maxLength={500}
                  className={`w-full text-sm border rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.remark ? 'border-red-300' : 'border-gray-200'}`}
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
                  : isVisitDone
                    ? 'bg-green-600 hover:bg-green-700 shadow-lg'
                    : isClosingStatus
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Updating...
                </span>
              ) : isVisitDone ? (
                <span className="flex items-center gap-2">
                  🏆 Complete Visit & Claim Lead
                </span>
              ) : isClosingStatus ? (
                'Close Lead'
              ) : (
                'Submit Update'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateSiteVisitExecutionModal;