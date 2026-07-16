// frontend/src/components/drawers/LeadHistoryDrawer.jsx
import React, { useState, useEffect } from 'react';
import { X, ArrowRight, MessageSquare } from 'lucide-react';
import { leadApi } from '../../api/leadApi';
import StatusBadge from '../common/StatusBadge';
import LoadingSpinner from '../common/LoadingSpinner';
import { formatDateTime } from '../../utils/dateHelpers';

const ACTION_ICONS = {
  CREATED: '🆕',
  STATUS_CHANGE: '🔄',
  STAGE_CHANGE: '⬆️',
  REASSIGN: '👤',
  AUTO_ASSIGN: '🤖',
  COLD_MARKED: '❄️',
  VISIT_CLAIMED: '📍',
  WHATSAPP_SENT: '💬',
  IMPORTANT_NOTE_UPDATED: '📝',
};

const ActivityItem = ({ activity }) => {
  const icon = ACTION_ICONS[activity.action_type] || '📋';
  const isStageChange = activity.action_type === 'STAGE_CHANGE';

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
          isStageChange ? 'bg-purple-100' : 'bg-gray-100'
        }`}>
          {icon}
        </div>
        <div className="w-px bg-gray-200 flex-1 my-1" />
      </div>

      <div className="flex-1 pb-4">
        <div className="bg-white border border-gray-100 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-semibold uppercase tracking-wide ${
              isStageChange ? 'text-purple-600' : 'text-gray-500'
            }`}>
              {activity.action_type?.replace(/_/g, ' ')}
            </span>
            <span className="text-xs text-gray-400">
              {formatDateTime(activity.createdAt)}
            </span>
          </div>

          {(activity.stage_before || activity.stage_after) && (
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {activity.stage_before && (
                <StatusBadge status={activity.stage_before} type="stage" size="sm" />
              )}
              {activity.stage_after && activity.stage_before !== activity.stage_after && (
                <>
                  <ArrowRight size={12} className="text-gray-400" />
                  <StatusBadge status={activity.stage_after} type="stage" size="sm" />
                </>
              )}
            </div>
          )}

          {(activity.status_before || activity.status_after) && (
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {activity.status_before && (
                <StatusBadge status={activity.status_before} size="sm" />
              )}
              {activity.status_after && activity.status_before !== activity.status_after && (
                <>
                  <ArrowRight size={12} className="text-gray-400" />
                  <StatusBadge status={activity.status_after} size="sm" />
                </>
              )}
            </div>
          )}

          {activity.remark && (
            <div className="mt-2 p-2 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 italic">"{activity.remark}"</p>
            </div>
          )}

          <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-gray-50">
            <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="text-xs font-bold text-purple-600">
                {activity.performed_by_name?.charAt(0) || '?'}
              </span>
            </div>
            <span className="text-xs text-gray-500">
              {activity.performed_by_name} 
              <span className="text-gray-400 ml-1">({activity.performed_by_role})</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const LeadHistoryDrawer = ({ lead, onClose }) => {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    leadApi.getHistory(lead._id)
      .then(res => setActivities(res.data?.data || []))
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  }, [lead._id]);

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-30 z-40" onClick={onClose} />
      
      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-gray-50 z-50 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-6 py-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                  {lead.unique_id}
                </span>
                <StatusBadge status={lead.current_stage} type="stage" size="sm" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">{lead.customer_name}</h2>
              <p className="text-sm text-gray-500">{lead.customer_contact}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <StatusBadge status={lead.current_status} />
            {lead.is_cold && (
              <span className="text-xs text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded-full">
                ❄️ Cold
              </span>
            )}
            {lead.is_closed && (
              <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                🔒 Closed
              </span>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Activity Timeline ({activities.length})
          </h3>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="md" text="Loading history..." />
            </div>
          ) : activities.length === 0 ? (
            <p className="text-center text-gray-400 py-12">No activity recorded yet</p>
          ) : (
            activities.map((activity) => (
              <ActivityItem key={activity._id} activity={activity} />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-gray-100 px-6 py-3">
          <a
            href={`https://wa.me/91${lead.customer_contact}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <MessageSquare size={16} />
            Open WhatsApp
          </a>
        </div>
      </div>
    </>
  );
};

export default LeadHistoryDrawer;