// frontend/src/components/common/QuickDateFilter.jsx
import React from 'react';
import { Calendar, RotateCw, Filter, X } from 'lucide-react';

const QuickDateFilter = ({ 
  dateFrom, 
  dateTo, 
  quickFilter,
  onDateFromChange, 
  onDateToChange, 
  onQuickFilterChange,
  onApply,
  onClear,
  onToday,
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
      <div className="flex flex-wrap items-center gap-3">
        {/* From Date */}
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-purple-600" />
          <span className="text-xs font-medium text-gray-600">From Date</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* To Date */}
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-purple-600" />
          <span className="text-xs font-medium text-gray-600">To Date</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Follow-ups Filter */}
        <div className="flex items-center gap-2">
          <RotateCw size={14} className="text-purple-600" />
          <span className="text-xs font-medium text-gray-600">Follow-ups</span>
          <select
            value={quickFilter}
            onChange={(e) => onQuickFilterChange(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500 min-w-[120px]"
          >
            <option value="">All</option>
            <option value="today">Today</option>
            <option value="overdue">Overdue</option>
            <option value="cold">Cold Leads</option>
            <option value="upcoming">Upcoming</option>
          </select>
        </div>

        <div className="flex-1" />

        {/* Today Button */}
        <button
          onClick={onToday}
          className="flex items-center gap-1.5 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Calendar size={14} />
          Today
        </button>

        {/* Apply Filter Button */}
        <button
          onClick={onApply}
          className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Filter size={14} />
          Apply Filter
        </button>

        {/* Clear Button */}
        <button
          onClick={onClear}
          className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
        >
          <X size={14} />
          Clear
        </button>
      </div>
    </div>
  );
};

export default QuickDateFilter;