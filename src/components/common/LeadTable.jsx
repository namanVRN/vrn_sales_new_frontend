// frontend/src/components/common/LeadTable.jsx
import React from 'react';
import {
  Phone, Calendar, MessageCircle, ChevronRight,
  Snowflake, AlertCircle, Inbox, PhoneOff, UserCheck
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import { getFollowupLabel, timeAgo, formatDate } from '../../utils/dateHelpers';
import { getSourceColor, getRowHighlight } from '../../utils/colorHelpers';

const FollowupCountCircle = ({ count = 0 }) => {
  const getColor = () => {
    if (count === 0) return 'bg-gray-100 text-gray-500 border-gray-200';
    if (count <= 2) return 'bg-green-100 text-green-700 border-green-200';
    if (count <= 5) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    if (count <= 8) return 'bg-orange-100 text-orange-700 border-orange-200';
    return 'bg-red-100 text-red-700 border-red-200';
  };
  return (
    <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-bold ${getColor()}`}>
      {count}
    </div>
  );
};

const CustomerAvatar = ({ name, uniqueId }) => {
  const initials = name?.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() || '?';
  const colors = ['bg-purple-500', 'bg-blue-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500', 'bg-indigo-500'];
  const colorIndex = (uniqueId?.charCodeAt(0) || 0) % colors.length;
  return (
    <div className={`w-11 h-11 rounded-full ${colors[colorIndex]} flex items-center justify-center flex-shrink-0 shadow-sm`}>
      <span className="text-sm font-bold text-white">{initials}</span>
    </div>
  );
};

const OwnerAvatar = ({ owner }) => {
  if (!owner) return <span className="text-sm text-gray-400">—</span>;
  const initials = owner.display_code?.slice(0, 2) || owner.name?.slice(0, 2) || '?';
  const roleColors = {
    BDM: 'bg-purple-100 text-purple-700',
    ADVISOR: 'bg-blue-100 text-blue-700',
    ADMIN: 'bg-gray-100 text-gray-700',
  };
  const colorClass = roleColors[owner.role] || 'bg-gray-100 text-gray-700';
  return (
    <div className="flex items-center gap-2">
      <div className={`w-8 h-8 rounded-full ${colorClass} flex items-center justify-center flex-shrink-0`}>
        <span className="text-xs font-bold">{initials}</span>
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-700 truncate max-w-[100px]">
          {owner.name?.split(' ')[0] || '—'}
        </p>
        <p className="text-xs text-gray-400">{owner.display_code}</p>
      </div>
    </div>
  );
};

const LeadTable = ({
  leads,
  onUpdate,
  onViewHistory,
  onReassign,
  showAssigned = false,
  isLoading = false,
}) => {

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="p-6 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!leads?.length) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-16 text-center">
        <Inbox size={56} className="text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 font-medium text-base">No leads found</p>
        <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-[15px]">

          {/* Header */}
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left py-4 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Customer</th>
              <th className="text-left py-4 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Contact</th>
              <th className="text-left py-4 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Interested In</th>
              <th className="text-left py-4 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Lead Remark</th>
              <th className="text-left py-4 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Lead Gen By</th>
              <th className="text-left py-4 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Source</th>
              <th className="text-center py-4 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Followups</th>
              <th className="text-left py-4 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Planned</th>
              <th className="text-left py-4 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Last Call</th>
              <th className="text-left py-4 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
              {showAssigned && (
                <th className="text-left py-4 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Assigned</th>
              )}
              <th className="py-4 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap text-center">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
            {leads.map((lead) => {
              const followup = getFollowupLabel(lead.next_followup_date);

              return (
                <tr
                  key={lead._id}
                  className={`transition-colors hover:brightness-95 ${getRowHighlight(lead)}`}
                >

                  {/* Customer */}
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <CustomerAvatar name={lead.customer_name} uniqueId={lead.unique_id} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <p className="font-semibold text-gray-900 truncate max-w-[140px]">
                            {lead.customer_name}
                          </p>
                          {lead.is_cold && <Snowflake size={14} className="text-cyan-500 flex-shrink-0" />}
                          {!lead.is_cold && followup?.isOverdue && <AlertCircle size={14} className="text-red-500 flex-shrink-0" />}
                        </div>
                        <p className="text-xs font-mono font-semibold text-purple-600">
                          {lead.unique_id}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <Phone size={14} className="text-gray-400" />
                        <span className="text-gray-700 text-sm whitespace-nowrap">
                          {lead.customer_contact}
                        </span>
                      </div>
                      <a
                        href={`https://wa.me/91${lead.customer_contact}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-7 h-7 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center transition-colors flex-shrink-0 shadow-sm"
                        title="Open WhatsApp"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MessageCircle size={13} className="text-white" />
                      </a>
                    </div>
                  </td>

                  {/* Interested In */}
                  <td className="py-4 px-5">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm text-gray-700 font-medium">
                        {lead.interested_in || '—'}
                      </span>
                      {lead.project?.name && (
                        <span className="text-xs text-purple-600 font-medium truncate max-w-[140px]">
                          {lead.project.name}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Lead Remark */}
                  <td className="py-4 px-5 max-w-[200px]">
                    {lead.qualification_remark || lead.important_note ? (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {lead.qualification_remark || lead.important_note}
                      </p>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </td>

                  {/* Lead Gen By */}
                  <td className="py-4 px-5 max-w-[200px]">
                    {lead.lead_gen_name || lead.lead_source_detail ? (
                      <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                        {lead.lead_source_detail && (
                          <p className="text-xs text-blue-700 font-semibold line-clamp-2">
                            {lead.lead_source_detail}
                          </p>
                        )}
                        {lead.lead_gen_name && (
                          <p className="text-xs text-blue-600 mt-0.5">
                            👤 {lead.lead_gen_name}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </td>

                  {/* Source */}
                  <td className="py-4 px-5">
                    {lead.lead_source ? (
                      <div className="flex flex-col gap-1">
                        <span className={`text-xs px-2.5 py-1 rounded font-semibold whitespace-nowrap ${getSourceColor(lead.lead_source)}`}>
                          {lead.lead_source?.replace(/_/g, ' ')}
                        </span>
                        {lead.campaign_name && (
                          <p className="text-xs text-gray-500 uppercase font-medium truncate max-w-[100px]">
                            {lead.campaign_name}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </td>

                  {/* Followup Count */}
                  <td className="py-4 px-5">
                    <div className="flex justify-center">
                      <FollowupCountCircle count={lead.followup_count || 0} />
                    </div>
                  </td>

                  {/* Planned Date */}
                  <td className="py-4 px-5 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-gray-400 flex-shrink-0" />
                      <span className={`text-sm font-medium ${followup?.color || 'text-gray-500'}`}>
                        {followup?.label || '—'}
                      </span>
                    </div>
                  </td>

                  {/* Last Call */}
                  <td className="py-4 px-5">
                    {lead.last_action_date ? (
                      <div className="flex items-center gap-1.5">
                        <Phone size={14} className="text-green-500 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-700 whitespace-nowrap">{formatDate(lead.last_action_date)}</p>
                          <p className="text-xs text-gray-400">{timeAgo(lead.last_action_date)}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <PhoneOff size={14} className="text-gray-300 flex-shrink-0" />
                        <span className="text-sm text-gray-400">No call yet</span>
                      </div>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-4 px-5">
                    <StatusBadge status={lead.current_status} />
                  </td>

                  {/* Assigned */}
                  {showAssigned && (
                    <td className="py-4 px-5">
                      <OwnerAvatar owner={lead.current_owner} />
                    </td>
                  )}

                  {/* Action */}
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-1.5 justify-center">

                      {/* Update */}
                      <button
                        onClick={() => onUpdate?.(lead)}
                        className="text-sm px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold whitespace-nowrap shadow-sm"
                      >
                        ✏️ Update
                      </button>

                      {/* Reassign */}
                      {onReassign && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onReassign(lead);
                          }}
                          title="Reassign lead"
                          className="p-2 text-gray-500 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors border border-gray-200 hover:border-violet-200"
                        >
                          <UserCheck size={16} />
                        </button>
                      )}

                      {/* History */}
                      {onViewHistory && (
                        <button
                          onClick={() => onViewHistory?.(lead)}
                          className="p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 rounded-lg transition-colors border border-gray-200"
                          title="View History"
                        >
                          <ChevronRight size={16} />
                        </button>
                      )}

                    </div>
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeadTable;