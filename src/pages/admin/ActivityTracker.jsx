import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Search,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Clock,
  AlertCircle,
  Snowflake,
  Download,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../api/axios.js';
import activityApi from '../../api/activityApi.js';
import { userApi } from '../../api/userApi.js';
import { projectApi } from '../../api/projectApi.js';
import { PageLoader } from '../../components/common/LoadingSpinner.jsx';

const ACTION_TYPES = [
  'CREATED',
  'STATUS_CHANGE',
  'STAGE_CHANGE',
  'REASSIGN',
  'AUTO_ASSIGN',
  'COLD_MARKED',
  'VISIT_CLAIMED',
  'WHATSAPP_SENT',
  'IMPORTANT_NOTE_UPDATED',
];

const STAGES = [
  'QUALIFICATION',
  'SITE_VISIT_SCHEDULING',
  'SITE_VISIT_EXECUTION',
  'POST_VISIT_FOLLOWUP',
  'DEAL',
];

// ─────────────────────────────────────────────
// Due helpers (use planned_date_after from activity)
// ─────────────────────────────────────────────
const startOfDay = (d = new Date()) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const endOfDay = (d = new Date()) => {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
};

const getDueType = (plannedDateAfter) => {
  if (!plannedDateAfter) return 'NONE';
  const dt = new Date(plannedDateAfter);
  if (Number.isNaN(dt.getTime())) return 'NONE';

  const todayStart = startOfDay(new Date());
  const todayEnd = endOfDay(new Date());

  if (dt < todayStart) return 'OVERDUE';
  if (dt >= todayStart && dt <= todayEnd) return 'TODAY';
  return 'UPCOMING';
};

const actionBadgeClass = (type) => {
  switch (type) {
    case 'CREATED':
      return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'STAGE_CHANGE':
      return 'bg-indigo-100 text-indigo-700 border-indigo-200';
    case 'STATUS_CHANGE':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'REASSIGN':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'AUTO_ASSIGN':
      return 'bg-slate-100 text-slate-700 border-slate-200';
    case 'COLD_MARKED':
      return 'bg-cyan-100 text-cyan-800 border-cyan-200';
    case 'VISIT_CLAIMED':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'WHATSAPP_SENT':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'IMPORTANT_NOTE_UPDATED':
      return 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const ActivityTracker = () => {
  const { user } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // CSV download (Admin only)
  const [downloading, setDownloading] = useState(false);

  // filter ui
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  // filters
  const [actionType, setActionType] = useState('');
  const [stageBefore, setStageBefore] = useState('');
  const [stageAfter, setStageAfter] = useState('');
  const [statusBefore, setStatusBefore] = useState('');
  const [statusAfter, setStatusAfter] = useState('');
  const [performedBy, setPerformedBy] = useState('');
  const [performedByRole, setPerformedByRole] = useState('');
  const [ownerBefore, setOwnerBefore] = useState('');
  const [ownerAfter, setOwnerAfter] = useState('');
  const [project, setProject] = useState('');
  const [dateFrom, setDateFrom] = useState(''); // yyyy-mm-dd
  const [dateTo, setDateTo] = useState(''); // yyyy-mm-dd

  // dropdown data
  const [users, setUsers] = useState([]);     // ADMIN only
  const [owners, setOwners] = useState([]);   // ADMIN/PC/AUDITOR (BDM+ADVISOR)
  const [projects, setProjects] = useState([]);

  // pagination
  const [page, setPage] = useState(1);
  const limit = 50;
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  // expanded row
  const [expandedId, setExpandedId] = useState(null);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchUsers = useCallback(async () => {
    // /api/users is ADMIN-only in your backend
    if (user?.role !== 'ADMIN') {
      setUsers([]);
      return;
    }

    try {
      const res = await userApi.getAll({ limit: 200 });
      const list = res?.data?.data?.users ?? res?.data?.users ?? [];
      setUsers(Array.isArray(list) ? list : []);
    } catch {
      setUsers([]);
    }
  }, [user?.role]);

  const fetchOwners = useCallback(async () => {
    try {
      const res = await api.get('/leads/owners');
      const list = res?.data?.data?.owners ?? res?.data?.owners ?? [];
      setOwners(Array.isArray(list) ? list : []);
    } catch {
      setOwners([]);
    }
  }, []);

  const fetchProjects = useCallback(async () => {
    try {
      if (projectApi?.getActive) {
        const res = await projectApi.getActive();
        const list = res?.data?.data?.projects ?? res?.data?.projects ?? res?.data?.data ?? [];
        setProjects(Array.isArray(list) ? list : []);
        return;
      }

      // fallback if your projectApi doesn't have getActive
      if (projectApi?.getAll) {
        const res = await projectApi.getAll();
        const list = res?.data?.data?.projects ?? res?.data?.projects ?? res?.data?.data ?? [];
        setProjects(Array.isArray(list) ? list : []);
        return;
      }

      // last fallback (direct API)
      const res = await api.get('/projects/active');
      const list = res?.data?.data?.projects ?? res?.data?.projects ?? res?.data?.data ?? [];
      setProjects(Array.isArray(list) ? list : []);
    } catch {
      setProjects([]);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchOwners();
    fetchProjects();
  }, [fetchUsers, fetchOwners, fetchProjects]);

  const buildParams = useCallback(
    (includePagination = true) => {
      const params = {};
      if (includePagination) {
        params.page = page;
        params.limit = limit;
      }

      if (search) params.search = search;

      if (actionType) params.action_type = actionType;
      if (stageBefore) params.stage_before = stageBefore;
      if (stageAfter) params.stage_after = stageAfter;
      if (statusBefore) params.status_before = statusBefore;
      if (statusAfter) params.status_after = statusAfter;

      if (performedBy) params.performed_by = performedBy;
      if (performedByRole) params.performed_by_role = performedByRole;

      if (ownerBefore) params.owner_before = ownerBefore;
      if (ownerAfter) params.owner_after = ownerAfter;

      if (project) params.project = project;

      if (dateFrom) params.from = new Date(dateFrom).toISOString();
      if (dateTo) params.to = new Date(dateTo + 'T23:59:59.999').toISOString();

      return params;
    },
    [
      page,
      limit,
      search,
      actionType,
      stageBefore,
      stageAfter,
      statusBefore,
      statusAfter,
      performedBy,
      performedByRole,
      ownerBefore,
      ownerAfter,
      project,
      dateFrom,
      dateTo,
    ]
  );

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    try {
      const res = await activityApi.getAll(buildParams(true));

      const list = res?.data?.data?.activities ?? res?.data?.activities ?? [];
      setItems(Array.isArray(list) ? list : []);

      setPagination({
        total: res?.data?.data?.total ?? 0,
        totalPages: res?.data?.data?.totalPages ?? 1,
      });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load activities');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [buildParams]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchActivities();
  };

  const resetFilters = () => {
    setSearchInput('');
    setSearch('');
    setActionType('');
    setStageBefore('');
    setStageAfter('');
    setStatusBefore('');
    setStatusAfter('');
    setPerformedBy('');
    setPerformedByRole('');
    setOwnerBefore('');
    setOwnerAfter('');
    setProject('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  const handleDownloadCsv = async () => {
    setDownloading(true);
    try {
      const res = await activityApi.exportCsv(buildParams(false)); // no page/limit

      const cd = res?.headers?.['content-disposition'] || '';
      const match = cd.match(/filename="([^"]+)"/);
      const filename = match?.[1] || 'activities_export.csv';

      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success('CSV downloaded');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'CSV download failed');
    } finally {
      setDownloading(false);
    }
  };

  const userOptions = useMemo(
    () => users.map((u) => ({ id: u._id, label: `${u.name} (${u.role})` })),
    [users]
  );

  const ownerOptions = useMemo(
    () =>
      owners.map((o) => ({
        id: o._id,
        label: `${o.name} (${o.role}${o.display_code ? ` · ${o.display_code}` : ''})`,
      })),
    [owners]
  );

  // Performed By:
  // - ADMIN: all users
  // - PC/AUDITOR: owners list (BDM/ADVISOR) for useful filtering
  const performedByOptions = useMemo(() => {
    if (user?.role === 'ADMIN') return userOptions;
    return ownerOptions;
  }, [user?.role, userOptions, ownerOptions]);

  const projectOptions = useMemo(
    () =>
      projects.map((p) => ({
        id: p._id,
        label: `${p.name}${p.code ? ` (${p.code})` : ''}`,
      })),
    [projects]
  );

  // Page-level due stats based on planned_date_after (only current page)
  const pageDueStats = useMemo(() => {
    let today = 0;
    let overdue = 0;
    let cold = 0;

    for (const a of items) {
      const dueType = getDueType(a?.planned_date_after);
      if (dueType === 'TODAY') today += 1;
      if (dueType === 'OVERDUE') overdue += 1;
      if (a?.action_type === 'COLD_MARKED' || a?.status_after === 'COLD') cold += 1;
    }
    return { today, overdue, cold };
  }, [items]);

  const fmt = (v) => (v ? new Date(v).toLocaleString() : '—');

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="bg-purple-100 p-2.5 rounded-xl">
              <BarChart3 size={22} className="text-purple-600" />
            </div>
            Lead Activity Tracker
          </h1>
          <p className="text-gray-500 text-sm mt-1">Read-only audit log for all lead movements</p>
        </div>

        <div className="flex items-center gap-2">
          {user?.role === 'ADMIN' && (
            <button
              onClick={handleDownloadCsv}
              disabled={downloading}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-colors border border-gray-200 hover:border-purple-200 disabled:opacity-60"
              type="button"
              title="Download CSV (Admin only)"
            >
              <Download size={16} className={downloading ? 'animate-pulse' : ''} />
              {downloading ? 'Downloading...' : 'Download CSV'}
            </button>
          )}

          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-colors border border-gray-200 hover:border-purple-200"
            type="button"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-purple-100 p-2 rounded-lg">
              <BarChart3 size={18} className="text-purple-600" />
            </div>
            <span className="text-2xl font-bold text-purple-600">{pagination.total}</span>
          </div>
          <p className="text-sm text-gray-600 font-medium">Total Activities</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Clock size={18} className="text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-blue-600">{pageDueStats.today}</span>
          </div>
          <p className="text-sm text-gray-600 font-medium">Today (this page)</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-red-100 p-2 rounded-lg">
              <AlertCircle size={18} className="text-red-600" />
            </div>
            <span className="text-2xl font-bold text-red-600">{pageDueStats.overdue}</span>
          </div>
          <p className="text-sm text-gray-600 font-medium">Overdue (this page)</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-cyan-100 p-2 rounded-lg">
              <Snowflake size={18} className="text-cyan-700" />
            </div>
            <span className="text-2xl font-bold text-cyan-700">{pageDueStats.cold}</span>
          </div>
          <p className="text-sm text-gray-600 font-medium">Cold Marked (this page)</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <button
          type="button"
          onClick={() => setFiltersOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 border-b border-gray-100"
        >
          <span className="text-sm font-semibold text-gray-700">Filters</span>
          {filtersOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {filtersOpen && (
          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2 relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                name="activity_search"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setPage(1);
                }}
                placeholder="Search: lead id / customer / contact / remark / performer..."
                className="w-full pl-11 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-gray-50"
              />
            </div>

            <select
              value={actionType}
              onChange={(e) => {
                setActionType(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
            >
              <option value="">All Action Types</option>
              {ACTION_TYPES.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>

            <select
              value={stageBefore}
              onChange={(e) => {
                setStageBefore(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
            >
              <option value="">Stage Before (All)</option>
              {STAGES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <select
              value={stageAfter}
              onChange={(e) => {
                setStageAfter(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
            >
              <option value="">Stage After (All)</option>
              {STAGES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <input
              value={statusBefore}
              onChange={(e) => {
                setStatusBefore(e.target.value);
                setPage(1);
              }}
              placeholder="Status Before (text)"
              className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
            />

            <input
              value={statusAfter}
              onChange={(e) => {
                setStatusAfter(e.target.value);
                setPage(1);
              }}
              placeholder="Status After (text)"
              className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
            />

            {/* Performed by */}
            <select
              value={performedBy}
              onChange={(e) => {
                setPerformedBy(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
            >
              <option value="">Performed By (All)</option>
              {performedByOptions.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.label}
                </option>
              ))}
            </select>

            <select
              value={performedByRole}
              onChange={(e) => {
                setPerformedByRole(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
            >
              <option value="">Performed By Role (All)</option>
              <option value="ADMIN">ADMIN</option>
              <option value="BDM">BDM</option>
              <option value="ADVISOR">ADVISOR</option>
              <option value="PC">PC</option>
              <option value="AUDITOR">AUDITOR</option>
            </select>

            {/* Owner before/after (now uses owners list so PC/AUDITOR also work) */}
            <select
              value={ownerBefore}
              onChange={(e) => {
                setOwnerBefore(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
            >
              <option value="">Owner Before (All)</option>
              {ownerOptions.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.label}
                </option>
              ))}
            </select>

            <select
              value={ownerAfter}
              onChange={(e) => {
                setOwnerAfter(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
            >
              <option value="">Owner After (All)</option>
              {ownerOptions.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.label}
                </option>
              ))}
            </select>

            <select
              value={project}
              onChange={(e) => {
                setProject(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
            >
              <option value="">Project (All)</option>
              {projectOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
            />

            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
            />

            <div className="md:col-span-3 flex items-center justify-end gap-2 pt-1">
              <button
                onClick={resetFilters}
                className="px-4 py-2.5 text-sm rounded-xl border border-gray-200 hover:bg-gray-50"
                type="button"
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="text-sm font-semibold text-gray-700">
            Activities <span className="text-xs text-gray-500">({pagination.total})</span>
          </div>
          <div className="text-xs text-gray-500">
            Page {page} / {pagination.totalPages || 1}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <PageLoader />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-sm text-gray-500">No activities found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left py-3 px-5 text-xs font-bold text-gray-500 uppercase">Time</th>
                  <th className="text-left py-3 px-5 text-xs font-bold text-gray-500 uppercase">Lead</th>
                  <th className="text-left py-3 px-5 text-xs font-bold text-gray-500 uppercase">Action</th>
                  <th className="text-left py-3 px-5 text-xs font-bold text-gray-500 uppercase">Stage / Status</th>
                  <th className="text-left py-3 px-5 text-xs font-bold text-gray-500 uppercase">Owner</th>
                  <th className="text-left py-3 px-5 text-xs font-bold text-gray-500 uppercase">Next Plan</th>
                  <th className="text-left py-3 px-5 text-xs font-bold text-gray-500 uppercase">Remark</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {items.map((a) => {
                  const expanded = expandedId === a._id;
                  const lead = a.lead;
                  const dueType = getDueType(a?.planned_date_after);

                  const rowClass = [
                    'cursor-pointer transition-colors',
                    dueType === 'OVERDUE' ? 'bg-red-50 hover:bg-red-100' : '',
                    dueType === 'TODAY' ? 'bg-amber-50 hover:bg-amber-100' : '',
                    (dueType === 'UPCOMING' || dueType === 'NONE') ? 'hover:bg-gray-50' : '',
                  ].join(' ');

                  return (
                    <Fragment key={a._id}>
                      <tr
                        className={rowClass}
                        onClick={() => setExpandedId(expanded ? null : a._id)}
                        title="Click to expand details"
                      >
                        <td className="py-3 px-5 text-sm text-gray-700">
                          {a.createdAt ? new Date(a.createdAt).toLocaleString() : '—'}
                        </td>

                        <td className="py-3 px-5">
                          <div className="text-sm font-semibold text-gray-900">
                            {a.lead_unique_id || lead?.unique_id || '—'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {lead?.customer_name || '—'} • {lead?.customer_contact || '—'}
                          </div>
                          {lead?.project?.name && (
                            <div className="text-[11px] text-gray-500">{lead.project.name}</div>
                          )}
                        </td>

                        <td className="py-3 px-5">
                          <span className={`inline-flex items-center border text-xs font-bold px-2.5 py-1 rounded-full ${actionBadgeClass(a.action_type)}`}>
                            {a.action_type || '—'}
                          </span>
                        </td>

                        <td className="py-3 px-5 text-xs text-gray-700">
                          <div>
                            Stage: <span className="font-semibold">{a.stage_before || '—'}</span> →{' '}
                            <span className="font-semibold">{a.stage_after || '—'}</span>
                          </div>
                          <div>
                            Status: <span className="font-semibold">{a.status_before || '—'}</span> →{' '}
                            <span className="font-semibold">{a.status_after || '—'}</span>
                          </div>
                        </td>

                        <td className="py-3 px-5 text-xs text-gray-700">
                          <div>{a.owner_before?.name || '—'} → {a.owner_after?.name || '—'}</div>
                        </td>

                        <td className="py-3 px-5">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-sm ${
                                dueType === 'OVERDUE'
                                  ? 'text-red-700 font-semibold'
                                  : dueType === 'TODAY'
                                  ? 'text-amber-700 font-semibold'
                                  : 'text-gray-700'
                              }`}
                            >
                              {fmt(a.planned_date_after)}
                            </span>

                            {dueType === 'OVERDUE' && (
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-600 text-white">
                                OVERDUE
                              </span>
                            )}
                            {dueType === 'TODAY' && (
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white">
                                TODAY
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-5 text-sm text-gray-700">
                          {a.remark ? <span className="line-clamp-2">{a.remark}</span> : <span className="text-gray-400">—</span>}
                        </td>
                      </tr>

                      {expanded && (
                        <tr className="bg-gray-50">
                          <td colSpan={7} className="px-5 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="bg-white border border-gray-200 rounded-xl p-3">
                                <div className="text-xs font-semibold text-gray-700 mb-2">Performed By</div>
                                <div className="text-sm text-gray-900 font-semibold">
                                  {a.performed_by_name || a.performed_by?.name || '—'}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {a.performed_by_role || a.performed_by?.role || ''}
                                </div>
                              </div>

                              <div className="bg-white border border-gray-200 rounded-xl p-3">
                                <div className="text-xs font-semibold text-gray-700 mb-2">Follow-up</div>
                                <div className="text-xs text-gray-600">
                                  Count: {a.followup_count_before ?? '—'} → {a.followup_count_after ?? '—'}
                                </div>
                                <div className="text-xs text-gray-600 mt-1">
                                  Planned: {fmt(a.planned_date_before)} → {fmt(a.planned_date_after)}
                                </div>
                              </div>

                              <div className="md:col-span-2 bg-white border border-gray-200 rounded-xl p-3">
                                <div className="text-xs font-semibold text-gray-700 mb-2">Remark</div>
                                <div className="text-sm text-gray-800 whitespace-pre-wrap">{a.remark || '—'}</div>
                              </div>

                              <div className="md:col-span-2 bg-white border border-gray-200 rounded-xl p-3">
                                <div className="text-xs font-semibold text-gray-700 mb-2">Changes (field-level)</div>
                                <pre className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-3 overflow-auto">
{JSON.stringify(a.changes || {}, null, 2)}
                                </pre>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-2 text-sm rounded-lg border border-gray-200 disabled:opacity-50"
            type="button"
          >
            Prev
          </button>
          <button
            disabled={page >= (pagination.totalPages || 1)}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-2 text-sm rounded-lg border border-gray-200 disabled:opacity-50"
            type="button"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivityTracker;