// frontend/src/components/modals/UpdateDealModal.jsx
import React, { useState, useEffect } from 'react';
import { 
  X, Calendar, Handshake, Trophy, Heart, Swords, PhoneOff, 
  Snowflake, ThumbsDown, Clock, AlertCircle, ArrowRight, 
  ChevronDown, ChevronUp, User, Phone, Mail, Building2, 
  Star, MapPin, Info, MessageSquare, History, Briefcase, 
  Copy, Check, DollarSign, PartyPopper, TrendingDown,
  RefreshCw, CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { dealApi } from '../../api/dealApi';
import { leadApi } from '../../api/leadApi';
import { getTodayString, formatDate, formatDateTime, timeAgo } from '../../utils/dateHelpers';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../common/StatusBadge';

const DEAL_STATUSES = [
  { value: 'NEGOTIATION', label: 'Negotiation', description: 'In active negotiation with customer' },
  { value: 'MEETING_RESCHEDULE', label: 'Reschedule Meeting', description: 'Need to reschedule office meeting' },
  { value: 'FOLLOWUP_REQUIRED', label: 'Followup Required', description: 'Need more follow-up' },
  { value: 'NO_RESPONSE', label: 'No Response', description: 'Customer not responding' },
  { value: 'DEAL_WON', label: 'Deal Won! 🎉', description: 'Successfully closed the deal', celebration: true },
  { value: 'DEAL_LOST', label: 'Deal Lost', description: 'Deal could not be closed', closing: true },
  { value: 'NEGOTIATION_FAILED', label: 'Negotiation Failed', description: 'Negotiation broke down', closing: true },
  { value: 'COLD', label: 'Cold', description: 'Lead has gone cold' },
  { value: 'NOT_INTERESTED', label: 'Not Interested', description: 'Customer not interested', closing: true },
];

const STATUS_ICONS = {
  NEGOTIATION: Handshake,
  MEETING_RESCHEDULE: RefreshCw,
  FOLLOWUP_REQUIRED: Clock,
  NO_RESPONSE: PhoneOff,
  DEAL_WON: Trophy,
  DEAL_LOST: Heart,
  NEGOTIATION_FAILED: Swords,
  COLD: Snowflake,
  NOT_INTERESTED: ThumbsDown,
};

const STATUS_COLORS = {
  NEGOTIATION: 'blue',
  MEETING_RESCHEDULE: 'indigo',
  FOLLOWUP_REQUIRED: 'purple',
  NO_RESPONSE: 'yellow',
  DEAL_WON: 'emerald',
  DEAL_LOST: 'red',
  NEGOTIATION_FAILED: 'red',
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

const LOST_REASONS = [
  'Budget too high',
  'Chose competitor',
  'Location issue',
  'Timing issue - not ready to buy',
  'Loan/Finance rejected',
  'Property size/type mismatch',
  'Poor customer service experience',
  'Changed mind',
  'Other',
];

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

const UpdateDealModal = ({ lead: initialLead, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [lead, setLead] = useState(initialLead);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [remark, setRemark] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [followupDate, setFollowupDate] = useState('');
  const [closeReason, setCloseReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [importantNote, setImportantNote] = useState(initialLead?.important_note || '');
  const [activities, setActivities] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [showAllDetails, setShowAllDetails] = useState(false);
  const [remarksExpanded, setRemarksExpanded] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showConfirmWon, setShowConfirmWon] = useState(false);

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
    setMeetingDate('');
    setFollowupDate('');
    setCloseReason('');
    setCustomReason('');
    setErrors({});
  }, [selectedStatus]);

  const isDealWon = selectedStatus === 'DEAL_WON';
  const isDealLost = selectedStatus === 'DEAL_LOST';
  const isNegotiationFailed = selectedStatus === 'NEGOTIATION_FAILED';
  const isNotInterested = selectedStatus === 'NOT_INTERESTED';
  const isMeetingReschedule = selectedStatus === 'MEETING_RESCHEDULE';
  const isNegotiation = selectedStatus === 'NEGOTIATION';
  const isFollowupRequired = selectedStatus === 'FOLLOWUP_REQUIRED';
  const isAutoDate = ['NO_RESPONSE', 'COLD'].includes(selectedStatus);
  const isLostStatus = isDealLost || isNegotiationFailed || isNotInterested;
  const isClosingStatus = isDealWon || isLostStatus;
  const canSetFollowupDate = isNegotiation || isFollowupRequired;

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
    if (isMeetingReschedule && !meetingDate) {
      errs.meetingDate = 'New meeting date is required';
    }
    if (isLostStatus && !closeReason) {
      errs.closeReason = 'Please select a reason';
    }
    if (closeReason === 'Other' && !customReason.trim()) {
      errs.customReason = 'Please specify the reason';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      toast.error('Please fill all required fields');
      return;
    }

    // Extra confirmation for DEAL_WON
    if (isDealWon && !showConfirmWon) {
      setShowConfirmWon(true);
      return;
    }
    
    setIsSubmitting(true);
    try {
      const payload = {
        status: selectedStatus,
        remark: remark.trim(),
      };

      if (isMeetingReschedule) {
        payload.meeting_scheduled_date = meetingDate;
      }

      if (canSetFollowupDate && followupDate) {
        payload.next_followup_date = followupDate;
      }

      // Close reason for lost/won
      if (isLostStatus) {
        payload.close_reason = closeReason === 'Other' ? customReason.trim() : closeReason;
      }

      if (isDealWon) {
        payload.close_reason = closeReason || 'Deal successfully closed';
      }

      if (importantNote !== (lead.important_note || '')) {
        payload.important_note = importantNote;
      }

      console.log('📤 Submitting payload:', payload);
      
      const res = await dealApi.updateStatus(lead._id, payload);
      
      if (isDealWon) {
        toast.success('🎉 Congratulations! Deal Won! 🎊', { duration: 5000 });
      } else {
        toast.success(res.data?.message || `Lead updated to ${selectedStatus.replace(/_/g, ' ')}`);
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('❌ Update error:', error.response?.data);
      const msg = error.response?.data?.message || 'Failed to update lead';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
      setShowConfirmWon(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="flex min-h-full items-end justify-center p-4 sm:items-center sm:p-0">
        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          {/* Header — Emerald/Green gradient for Deal */}
          <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-green-600 text-white px-6 py-4 rounded-t-2xl z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <Handshake size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Deal Negotiation</h2>
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
            {/* Meeting Scheduled Banner (from Stage 4) */}
            {lead.meeting_scheduled_date && (
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-indigo-500 rounded-lg">
                    <Handshake size={16} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-indigo-900 mb-1">
                      Office Meeting Scheduled
                    </p>
                    <div className="text-xs text-indigo-800">
                      <span className="opacity-75">Date:</span>{' '}
                      <strong>{formatDate(lead.meeting_scheduled_date)}</strong>
                    </div>
                    {lead.site_visit_feedback && (
                      <div className="mt-2 p-2 bg-white bg-opacity-70 rounded-lg">
                        <p className="text-xs font-semibold text-indigo-800 mb-1">Site Visit Feedback:</p>
                        <p className="text-xs text-indigo-900 italic">"{lead.site_visit_feedback}"</p>
                      </div>
                    )}
                  </div>
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
                  <Info size={14} className="text-emerald-600" />
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
                <History size={14} className="text-emerald-600" />
                Update Deal Status
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
                  placeholder="Any special notes about this deal..."
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                  {DEAL_STATUSES.map((status) => {
                    const Icon = STATUS_ICONS[status.value] || Handshake;
                    const color = STATUS_COLORS[status.value] || 'gray';
                    const isSelected = selectedStatus === status.value;
                    const isSpecialWon = status.value === 'DEAL_WON';
                    
                    const bgClass = isSpecialWon && isSelected
                      ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-green-100 ring-2 ring-emerald-300 shadow-lg'
                      : {
                        blue: isSelected ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
                        indigo: isSelected ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
                        purple: isSelected ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
                        yellow: isSelected ? 'border-yellow-500 bg-yellow-50 ring-2 ring-yellow-200' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
                        emerald: isSelected ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200' : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50',
                        red: isSelected ? 'border-red-500 bg-red-50 ring-2 ring-red-200' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
                        cyan: isSelected ? 'border-cyan-500 bg-cyan-50 ring-2 ring-cyan-200' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
                      }[color];

                    const iconClass = {
                      blue: isSelected ? 'text-blue-600' : 'text-gray-400',
                      indigo: isSelected ? 'text-indigo-600' : 'text-gray-400',
                      purple: isSelected ? 'text-purple-600' : 'text-gray-400',
                      yellow: isSelected ? 'text-yellow-600' : 'text-gray-400',
                      emerald: isSelected ? 'text-emerald-600' : 'text-emerald-400',
                      red: isSelected ? 'text-red-600' : 'text-gray-400',
                      cyan: isSelected ? 'text-cyan-600' : 'text-gray-400',
                    }[color];

                    const textClass = {
                      blue: isSelected ? 'text-blue-700' : 'text-gray-700',
                      indigo: isSelected ? 'text-indigo-700' : 'text-gray-700',
                      purple: isSelected ? 'text-purple-700' : 'text-gray-700',
                      yellow: isSelected ? 'text-yellow-700' : 'text-gray-700',
                      emerald: isSelected ? 'text-emerald-800 font-bold' : 'text-emerald-700 font-semibold',
                      red: isSelected ? 'text-red-700' : 'text-gray-700',
                      cyan: isSelected ? 'text-cyan-700' : 'text-gray-700',
                    }[color];

                    return (
                      <button
                        key={status.value}
                        type="button"
                        onClick={() => setSelectedStatus(status.value)}
                        className={`flex flex-col items-start gap-1 p-3 border-2 rounded-xl transition-all duration-150 text-left relative ${bgClass}`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon size={16} className={iconClass} />
                          <span className={`text-xs font-semibold ${textClass}`}>
                            {status.label}
                          </span>
                          {isSpecialWon && (
                            <PartyPopper size={12} className="text-yellow-500 ml-auto" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          {status.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ═══ DEAL_WON — Celebration Section ═══ */}
              {isDealWon && (
                <div className="mt-4 space-y-3">
                  <div className="relative bg-gradient-to-br from-emerald-100 via-green-50 to-emerald-100 border-2 border-emerald-300 rounded-2xl p-6 overflow-hidden">
                    {/* Decorative confetti */}
                    <div className="absolute top-2 right-2 text-2xl opacity-50">🎊</div>
                    <div className="absolute top-4 left-4 text-2xl opacity-50">🎉</div>
                    <div className="absolute bottom-2 right-8 text-xl opacity-50">✨</div>
                    <div className="absolute bottom-4 left-8 text-xl opacity-50">🏆</div>
                    
                    <div className="relative">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                          <Trophy size={24} className="text-white" />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-emerald-900">
                            Congratulations, {user?.name}! 🎉
                          </h4>
                          <p className="text-xs text-emerald-700">
                            You're about to close this deal as WON!
                          </p>
                        </div>
                      </div>

                      <div className="bg-white bg-opacity-70 rounded-lg p-3 mb-3">
                        <p className="text-xs text-emerald-800 mb-2">
                          <strong>What happens next:</strong>
                        </p>
                        <ul className="text-xs text-emerald-700 space-y-1">
                          <li>✅ Lead will be marked as <strong>WON</strong> permanently</li>
                          <li>✅ Meeting done date will be recorded</li>
                          <li>✅ Lead will be closed (no further updates possible)</li>
                          <li>✅ Your success will be tracked in reports</li>
                        </ul>
                      </div>

                      {/* Optional close reason */}
                      <div>
                        <label className="text-xs font-medium text-emerald-800 block mb-1">
                          Success Note (optional)
                        </label>
                        <input
                          type="text"
                          value={closeReason}
                          onChange={(e) => setCloseReason(e.target.value)}
                          placeholder="e.g., 2BHK Flat No. 402 booked, Token amount received..."
                          className="w-full text-sm border border-emerald-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        />
                        <p className="text-xs text-emerald-600 mt-1">
                          Add details like unit number, amount, payment terms
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ═══ DEAL_LOST / NEGOTIATION_FAILED / NOT_INTERESTED — Reason ═══ */}
              {isLostStatus && (
                <div className="mt-4 space-y-3">
                  <div className={`p-4 rounded-xl border-2 ${
                    isNegotiationFailed 
                      ? 'bg-red-50 border-red-300' 
                      : 'bg-orange-50 border-orange-300'
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        isNegotiationFailed ? 'bg-red-500' : 'bg-orange-500'
                      }`}>
                        {isNegotiationFailed ? (
                          <Swords size={16} className="text-white" />
                        ) : (
                          <TrendingDown size={16} className="text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-semibold ${
                          isNegotiationFailed ? 'text-red-900' : 'text-orange-900'
                        }`}>
                          {isNegotiationFailed ? 'Negotiation Failed' : isDealLost ? 'Deal Lost' : 'Not Interested'}
                        </p>
                        <p className={`text-xs mt-1 ${
                          isNegotiationFailed ? 'text-red-700' : 'text-orange-700'
                        }`}>
                          Please tell us why so we can learn and improve.
                        </p>
                      </div>
                    </div>

                    <div className="mt-3">
                      <label className="text-xs font-medium text-gray-700 block mb-1">
                        Reason <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={closeReason}
                        onChange={(e) => {
                          setCloseReason(e.target.value);
                          if (errors.closeReason) setErrors({...errors, closeReason: ''});
                        }}
                        className={`w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 ${
                          errors.closeReason ? 'border-red-300' : 'border-gray-200'
                        }`}
                      >
                        <option value="">Select a reason...</option>
                        {LOST_REASONS.map(reason => (
                          <option key={reason} value={reason}>{reason}</option>
                        ))}
                      </select>
                      {errors.closeReason && (
                        <p className="text-xs text-red-500 mt-1">{errors.closeReason}</p>
                      )}

                      {closeReason === 'Other' && (
                        <div className="mt-2">
                          <input
                            type="text"
                            value={customReason}
                            onChange={(e) => {
                              setCustomReason(e.target.value);
                              if (errors.customReason) setErrors({...errors, customReason: ''});
                            }}
                            placeholder="Please specify the reason..."
                            className={`w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 ${
                              errors.customReason ? 'border-red-300' : 'border-gray-200'
                            }`}
                          />
                          {errors.customReason && (
                            <p className="text-xs text-red-500 mt-1">{errors.customReason}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* MEETING_RESCHEDULE */}
              {isMeetingReschedule && (
                <div className="mt-4">
                  <label className="text-xs font-medium text-gray-700 block mb-1">
                    <Calendar size={12} className="inline mr-1" />
                    New Meeting Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={meetingDate}
                    onChange={(e) => {
                      setMeetingDate(e.target.value);
                      if (errors.meetingDate) setErrors({...errors, meetingDate: ''});
                    }}
                    min={getTodayString()}
                    className={`w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      errors.meetingDate ? 'border-red-300' : 'border-gray-200'
                    }`}
                  />
                  {errors.meetingDate && (
                    <p className="text-xs text-red-500 mt-1">{errors.meetingDate}</p>
                  )}
                  <p className="text-xs text-indigo-600 mt-1">
                    🔄 Meeting will be rescheduled to the new date
                  </p>
                </div>
              )}

              {/* Followup Date */}
              {canSetFollowupDate && (
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
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                  placeholder={
                    isDealWon 
                      ? 'Share the exciting details of how you closed this deal! 🎉' 
                      : isLostStatus
                        ? 'Why did we lose this deal? What can we learn?'
                        : 'Write about today\'s negotiation...'
                  }
                  rows={4}
                  maxLength={500}
                  className={`w-full text-sm border rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.remark ? 'border-red-300' : 'border-gray-200'}`}
                />
                {errors.remark && (
                  <p className="text-xs text-red-500 mt-1">{errors.remark}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">{remark.length}/500 characters</p>
              </div>

              {/* Confirmation for DEAL_WON */}
              {showConfirmWon && isDealWon && (
                <div className="mt-4 bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-yellow-900 mb-1">
                        Are you absolutely sure?
                      </p>
                      <p className="text-xs text-yellow-800">
                        This action will permanently mark this lead as <strong>WON</strong> and cannot be undone. 
                        Click <strong>"Confirm & Close as Won"</strong> below to proceed.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Closing Warning */}
              {isClosingStatus && !isDealWon && (
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
              onClick={() => {
                if (showConfirmWon) {
                  setShowConfirmWon(false);
                } else {
                  onClose();
                }
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              {showConfirmWon ? 'Go Back' : 'Cancel'}
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedStatus}
              className={`px-6 py-2 text-sm font-semibold text-white rounded-lg transition-all ${
                isSubmitting || !selectedStatus
                  ? 'bg-gray-300 cursor-not-allowed'
                  : isDealWon
                    ? 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg'
                    : isLostStatus
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Updating...
                </span>
              ) : isDealWon ? (
                showConfirmWon ? (
                  <span className="flex items-center gap-2">
                    🎉 Confirm & Close as Won!
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    🏆 Close Deal as WON
                  </span>
                )
              ) : isLostStatus ? (
                <span className="flex items-center gap-2">
                  Close as {isDealLost ? 'Lost' : isNegotiationFailed ? 'Failed' : 'Not Interested'}
                </span>
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

export default UpdateDealModal;