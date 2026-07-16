// frontend/src/components/common/LeadCard.jsx
import React from 'react';
import {
  Phone, Mail, MapPin, Calendar, Clock,
  User, Building2, MessageCircle, ChevronRight,
  AlertCircle, Snowflake, Star
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import { formatDate, getFollowupLabel, timeAgo } from '../../utils/dateHelpers';
import { getSourceColor, getOverdueColor } from '../../utils/colorHelpers';

const LeadCard = ({ lead, onUpdate, onViewHistory, showAssigned = false }) => {
  const followup = getFollowupLabel(lead.next_followup_date);
  const overdueStyle = getOverdueColor(lead.is_overdue, lead.is_cold);

  return (
    <div className={`
      bg-white rounded-xl shadow-sm border border-gray-100
      hover:shadow-md transition-all duration-200 overflow-hidden
      ${overdueStyle}
    `}>
      <div className="p-4">
        {/* Top Row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {/* Unique ID */}
              <span className="text-xs font-mono font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                {lead.unique_id}
              </span>
              {/* Cold indicator */}
              {lead.is_cold && (
                <span className="flex items-center gap-1 text-xs text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded">
                  <Snowflake size={10} />
                  Cold
                </span>
              )}
              {/* Overdue indicator */}
              {lead.is_overdue && !lead.is_cold && (
                <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded">
                  <AlertCircle size={10} />
                  Overdue
                </span>
              )}
            </div>
            {/* Customer Name */}
            <h3 className="font-semibold text-gray-900 truncate text-sm">
              {lead.customer_name}
            </h3>
            {/* Contact */}
            <div className="flex items-center gap-1 mt-0.5">
              <Phone size={12} className="text-gray-400" />
              <span className="text-xs text-gray-600">{lead.customer_contact}</span>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex flex-col items-end gap-1">
            <StatusBadge status={lead.current_status} />
            <StatusBadge status={lead.current_stage} type="stage" size="sm" />
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {/* Project */}
          {lead.project && (
            <div className="flex items-center gap-1.5">
              <Building2 size={12} className="text-gray-400 flex-shrink-0" />
              <span className="text-xs text-gray-600 truncate">
                {lead.project?.name || lead.project}
              </span>
            </div>
          )}

          {/* Interested In */}
          {lead.interested_in && (
            <div className="flex items-center gap-1.5">
              <MapPin size={12} className="text-gray-400 flex-shrink-0" />
              <span className="text-xs text-gray-600 truncate">{lead.interested_in}</span>
            </div>
          )}

          {/* Lead Source */}
          {lead.lead_source && (
            <div className="flex items-center gap-1.5">
              <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${getSourceColor(lead.lead_source)}`}>
                {lead.lead_source?.replace(/_/g, ' ')}
              </span>
            </div>
          )}

          {/* Campaign */}
          {lead.campaign_name && (
            <div className="flex items-center gap-1.5">
              <Star size={12} className="text-gray-400 flex-shrink-0" />
              <span className="text-xs text-gray-500 truncate">{lead.campaign_name}</span>
            </div>
          )}
        </div>

        {/* Followup Date */}
        <div className="flex items-center justify-between py-2 border-t border-b border-gray-50 mb-3">
          <div className="flex items-center gap-1.5">
            <Calendar size={12} className="text-gray-400" />
            <span className="text-xs text-gray-500">Next Followup:</span>
            <span className={`text-xs font-medium ${followup.color}`}>
              {followup.label}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={12} className="text-gray-400" />
            <span className="text-xs text-gray-400">{timeAgo(lead.last_action_date)}</span>
          </div>
        </div>

        {/* Assigned To (Admin view) */}
        {showAssigned && lead.current_owner && (
          <div className="flex items-center gap-1.5 mb-3">
            <User size={12} className="text-gray-400" />
            <span className="text-xs text-gray-500">Assigned:</span>
            <span className="text-xs font-medium text-gray-700">
              {lead.current_owner?.name || lead.current_owner}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onUpdate(lead)}
            className="
              flex-1 py-1.5 text-xs font-medium text-white
              bg-purple-600 hover:bg-purple-700 rounded-lg
              transition-colors duration-150
            "
          >
            Update Status
          </button>
          
          {/* WhatsApp Button */}
          <a
            href={`https://wa.me/91${lead.customer_contact}`}
            target="_blank"
            rel="noopener noreferrer"
            className="
              p-1.5 text-green-600 bg-green-50 hover:bg-green-100
              rounded-lg transition-colors duration-150
            "
            title="WhatsApp"
          >
            <MessageCircle size={16} />
          </a>

          {/* History Button */}
          <button
            onClick={() => onViewHistory(lead)}
            className="
              p-1.5 text-gray-500 bg-gray-50 hover:bg-gray-100
              rounded-lg transition-colors duration-150
            "
            title="View History"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Important Note */}
        {lead.important_note && (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-100 rounded-lg">
            <p className="text-xs text-yellow-800">
              <span className="font-semibold">Note: </span>
              {lead.important_note}
            </p>
          </div>
        )}

        {/* Followup Count */}
        <div className="mt-2 flex items-center gap-1">
          <span className="text-xs text-gray-400">
            #{lead.followup_count || 0} followup
          </span>
        </div>
      </div>
    </div>
  );
};

export default LeadCard;