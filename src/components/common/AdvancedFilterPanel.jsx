// frontend/src/components/common/AdvancedFilterPanel.jsx
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Filter, X, ChevronDown, ChevronUp,
  User, Building2, Home, Megaphone,
  Calendar, AlertTriangle, Snowflake, Clock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { userApi } from '../../api/userApi.js';           // ✅ Use object-style
import { projectApi } from '../../api/projectApi.js';     // ✅ Use object-style

// ── Static options ──────────────────────────────────────────
const INTERESTED_IN_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'Flat', label: '🏢 Flat' },
  { value: 'Plot', label: '🏗️ Plot' },
  { value: 'Villa', label: '🏡 Villa' },
  { value: 'Commercial', label: '🏬 Commercial' },
  { value: 'Shop', label: '🛍️ Shop' },
];

const LEAD_SOURCE_OPTIONS = [
  { value: '', label: 'All Sources' },
  { value: 'SOCIAL_MEDIA', label: '📱 Social Media' },
  { value: 'WEBSITE', label: '🌐 Website' },
  { value: 'WALK_IN', label: '🚶 Walk-in' },
  { value: 'DIRECT', label: '📞 Direct' },
  { value: 'REFERENCE', label: '👥 Reference' },
];

const QUICK_FILTERS = [
  { key: 'today', label: "Today's", icon: Clock, color: 'blue' },
  { key: 'overdue', label: 'Overdue', icon: AlertTriangle, color: 'red' },
  { key: 'is_cold', label: 'Cold', icon: Snowflake, color: 'cyan' },
];

const QUICK_FILTER_STYLES = {
  blue: {
    active: 'bg-blue-100 text-blue-700 border-blue-300',
    inactive: 'bg-white text-gray-600 border-gray-200 hover:bg-blue-50',
    icon: 'text-blue-500',
  },
  red: {
    active: 'bg-red-100 text-red-700 border-red-300',
    inactive: 'bg-white text-gray-600 border-gray-200 hover:bg-red-50',
    icon: 'text-red-500',
  },
  cyan: {
    active: 'bg-cyan-100 text-cyan-700 border-cyan-300',
    inactive: 'bg-white text-gray-600 border-gray-200 hover:bg-cyan-50',
    icon: 'text-cyan-500',
  },
};

// ── Main Component ───────────────────────────────────────────
const AdvancedFilterPanel = ({
  stageStatuses = [],
  showOwnerFilter = false,
  onFiltersChange,
  className = '',
}) => {
  const { isAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isExpanded, setIsExpanded] = useState(false);

  const [owners, setOwners] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);

  const [filters, setFilters] = useState({
    owner: searchParams.get('owner') || '',
    project: searchParams.get('project') || '',
    interested_in: searchParams.get('interested_in') || '',
    lead_source: searchParams.get('lead_source') || '',
    status: searchParams.get('status') || '',
    date_from: searchParams.get('date_from') || '',
    date_to: searchParams.get('date_to') || '',
    overdue: searchParams.get('overdue') || '',
    today: searchParams.get('today') || '',
    is_cold: searchParams.get('is_cold') || '',
  });

  useEffect(() => {
    if (isExpanded) {
      if (isAdmin && showOwnerFilter && owners.length === 0) {
        loadOwners();
      }
      if (projects.length === 0) {
        loadProjects();
      }
    }
  }, [isExpanded]);

  const loadOwners = async () => {
    setLoadingDropdowns(true);
    try {
      const res = await userApi.getAll();
      const allUsers = res?.data?.data || res?.data || [];
      const list = Array.isArray(allUsers) ? allUsers : (allUsers?.users || []);
      const filtered = list.filter(u =>
        (u.role === 'BDM' || u.role === 'ADVISOR') && u.is_active !== false
      );
      setOwners(filtered);
    } catch (err) {
      console.error('Owner load error:', err);
    } finally {
      setLoadingDropdowns(false);
    }
  };

  const loadProjects = async () => {
    try {
      const res = await projectApi.getActive();
      const projList = res?.data?.data || res?.data || [];
      setProjects(Array.isArray(projList) ? projList : []);
    } catch (err) {
      console.error('Projects load error:', err);
    }
  };

  const applyFilters = useCallback((newFilters) => {
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, val]) => {
      if (val && val !== '') params.set(key, val);
    });
    setSearchParams(params, { replace: true });
    onFiltersChange?.(newFilters);
  }, [setSearchParams, onFiltersChange]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };

    // Mutual exclusion
    if (key === 'overdue' && value === 'true') {
      newFilters.today = '';
      newFilters.date_from = '';
      newFilters.date_to = '';
    }
    if (key === 'today' && value === 'true') {
      newFilters.overdue = '';
      newFilters.date_from = '';
      newFilters.date_to = '';
    }
    if (key === 'date_from' || key === 'date_to') {
      newFilters.overdue = '';
      newFilters.today = '';
    }

    setFilters(newFilters);
    applyFilters(newFilters);
  };

  const toggleQuickFilter = (key) => {
    const current = filters[key];
    // For is_cold, value is 'true'/'false', else 'true'/''
    const newVal = current === 'true' ? '' : 'true';
    handleFilterChange(key, newVal);
  };

  const clearAllFilters = () => {
    const cleared = {
      owner: '', project: '', interested_in: '', lead_source: '',
      status: '', date_from: '', date_to: '', overdue: '', today: '', is_cold: '',
    };
    setFilters(cleared);
    setSearchParams({}, { replace: true });
    onFiltersChange?.(cleared);
  };

  const activeFilterCount = Object.entries(filters).filter(([, v]) => v !== '').length;

  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}>

      {/* ── Header Row ── */}
      <div className="flex items-center justify-between px-4 py-3 flex-wrap gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Quick Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {QUICK_FILTERS.map(({ key, label, icon: Icon, color }) => {
              const isActive = filters[key] === 'true';
              const styles = QUICK_FILTER_STYLES[color];
              return (
                <button
                  key={key}
                  onClick={() => toggleQuickFilter(key)}
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium
                    transition-all duration-150
                    ${isActive ? styles.active : styles.inactive}
                  `}
                >
                  <Icon size={12} className={isActive ? '' : styles.icon} />
                  {label}
                </button>
              );
            })}
          </div>

          {activeFilterCount > 0 && (
            <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-0.5 rounded-full">
              {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
            >
              <X size={12} />
              Clear all
            </button>
          )}

          <button
            onClick={() => setIsExpanded(prev => !prev)}
            className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-purple-600 font-medium transition-colors px-2 py-1.5 rounded-lg hover:bg-purple-50"
          >
            <Filter size={13} />
            Advanced
            {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>
      </div>

      {/* ── Expanded Panel ── */}
      {isExpanded && (
        <div className="border-t border-gray-100 px-4 py-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">

            {/* Status Filter */}
            {stageStatuses.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={e => handleFilterChange('status', e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
                >
                  <option value="">All Statuses</option>
                  {stageStatuses.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Owner Filter — Admin only */}
            {showOwnerFilter && isAdmin && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  <User size={10} className="inline mr-1" />
                  Owner
                </label>
                <select
                  value={filters.owner}
                  onChange={e => handleFilterChange('owner', e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
                  disabled={loadingDropdowns}
                >
                  <option value="">All Owners</option>
                  {owners.map(u => (
                    <option key={u._id} value={u._id}>
                      {u.display_code} — {u.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Project Filter */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                <Building2 size={10} className="inline mr-1" />
                Project
              </label>
              <select
                value={filters.project}
                onChange={e => handleFilterChange('project', e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
              >
                <option value="">All Projects</option>
                {projects.map(p => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Interested In */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                <Home size={10} className="inline mr-1" />
                Interested In
              </label>
              <select
                value={filters.interested_in}
                onChange={e => handleFilterChange('interested_in', e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
              >
                {INTERESTED_IN_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Lead Source */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                <Megaphone size={10} className="inline mr-1" />
                Lead Source
              </label>
              <select
                value={filters.lead_source}
                onChange={e => handleFilterChange('lead_source', e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
              >
                {LEAD_SOURCE_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Date From */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                <Calendar size={10} className="inline mr-1" />
                From Date
              </label>
              <input
                type="date"
                value={filters.date_from}
                onChange={e => handleFilterChange('date_from', e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                <Calendar size={10} className="inline mr-1" />
                To Date
              </label>
              <input
                type="date"
                value={filters.date_to}
                onChange={e => handleFilterChange('date_to', e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
              />
            </div>

            {/* Cold Filter Explicit */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                <Snowflake size={10} className="inline mr-1" />
                Cold Filter
              </label>
              <select
                value={filters.is_cold}
                onChange={e => handleFilterChange('is_cold', e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
              >
                <option value="">All</option>
                <option value="true">Cold Only</option>
                <option value="false">Non-Cold Only</option>
              </select>
            </div>
          </div>

          {/* Active Filter Chips */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
              {Object.entries(filters).map(([key, val]) => {
                if (!val) return null;

                const labelMap = {
                  owner: `Owner: ${owners.find(u => u._id === val)?.display_code || val}`,
                  project: `Project: ${projects.find(p => p._id === val)?.name || val}`,
                  interested_in: `Type: ${val}`,
                  lead_source: `Source: ${val.replace(/_/g, ' ')}`,
                  status: `Status: ${val.replace(/_/g, ' ')}`,
                  date_from: `From: ${val}`,
                  date_to: `To: ${val}`,
                  overdue: 'Overdue only',
                  today: "Today's only",
                  is_cold: val === 'true' ? 'Cold only' : 'Non-cold only',
                };

                return (
                  <span
                    key={key}
                    className="flex items-center gap-1 bg-purple-50 text-purple-700 text-xs font-medium px-2.5 py-1 rounded-full border border-purple-200"
                  >
                    {labelMap[key] || `${key}: ${val}`}
                    <button
                      onClick={() => handleFilterChange(key, '')}
                      className="hover:text-purple-900 transition-colors ml-0.5"
                    >
                      <X size={10} />
                    </button>
                  </span>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedFilterPanel;