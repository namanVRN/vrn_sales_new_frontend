// frontend/src/components/common/FilterPanel.jsx
import React, { useState } from 'react';
import { Filter, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { LEAD_SOURCES, INTERESTED_IN } from '../../utils/constants';

const FilterPanel = ({ 
  filters, 
  onFilterChange, 
  onReset,
  showStatusFilter = false,
  statusOptions = [],
  showOwnerFilter = false,
  owners = [],
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const activeFilterCount = Object.values(filters).filter(v => v !== '' && v !== null).length;

  const handleChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filters</span>
          {activeFilterCount > 0 && (
            <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); onReset(); }}
              className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
            >
              <RotateCcw size={12} />
              Reset
            </button>
          )}
          {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </div>
      </button>

      {isExpanded && (
        <div className="p-4 pt-0 border-t border-gray-50">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {/* Quick filter */}
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Quick Filter</label>
              <select
                value={filters.quick || ''}
                onChange={(e) => handleChange('quick', e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Leads</option>
                <option value="today">Today's Followups</option>
                <option value="overdue">Overdue</option>
                <option value="cold">Cold Leads</option>
              </select>
            </div>

            {/* Status */}
            {showStatusFilter && statusOptions.length > 0 && (
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Status</label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">All Statuses</option>
                  {statusOptions.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Lead Source */}
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Lead Source</label>
              <select
                value={filters.lead_source || ''}
                onChange={(e) => handleChange('lead_source', e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Sources</option>
                {LEAD_SOURCES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Interested In */}
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Interested In</label>
              <select
                value={filters.interested_in || ''}
                onChange={(e) => handleChange('interested_in', e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Types</option>
                {INTERESTED_IN.map(i => (
                  <option key={i.value} value={i.value}>{i.label}</option>
                ))}
              </select>
            </div>

            {/* Owner (Admin only) */}
            {showOwnerFilter && owners.length > 0 && (
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Assigned To</label>
                <select
                  value={filters.owner || ''}
                  onChange={(e) => handleChange('owner', e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">All Users</option>
                  {owners.map(o => (
                    <option key={o._id} value={o._id}>{o.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Date Range */}
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">From Date</label>
              <input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => handleChange('dateFrom', e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">To Date</label>
              <input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => handleChange('dateTo', e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;