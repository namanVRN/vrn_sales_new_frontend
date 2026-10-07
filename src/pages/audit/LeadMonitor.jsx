import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Search,
  RefreshCw,
  Eye,
  ChevronDown,
  ChevronUp,
  Users,
  Clock,
  AlertCircle,
  Snowflake,
  Download,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../api/axios.js';
import { projectApi } from '../../api/projectApi.js';
import { PageLoader } from '../../components/common/LoadingSpinner.jsx';
import LeadViewDrawer from '../../components/drawers/LeadViewDrawer.jsx';

const STAGES = [
  'QUALIFICATION',
  'SITE_VISIT_SCHEDULING',
  'SITE_VISIT_EXECUTION',
  'POST_VISIT_FOLLOWUP',
  'DEAL',
];

const SOURCES = ['SOCIAL_MEDIA', 'WEBSITE', 'WALK_IN', 'DIRECT', 'REFERENCE'];

// ─────────────────────────────────────────────
// Due helpers for row highlighting
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

const getDueType = (nextFollowupDate) => {
  if (!nextFollowupDate) return 'NONE';
  const dt = new Date(nextFollowupDate);
  if (Number.isNaN(dt.getTime())) return 'NONE';

  const todayStart = startOfDay(new Date());
  const todayEnd = endOfDay(new Date());

  if (dt < todayStart) return 'OVERDUE';
  if (dt >= todayStart && dt <= todayEnd) return 'TODAY';
  return 'UPCOMING';
};

const LeadMonitor = () => {
  const { user } = useAuth();

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // CSV download (Admin only)
  const [downloading, setDownloading] = useState(false);

  // Overview stats (FILTERED)
  const [statsLoading, setStatsLoading] = useState(true);
  const [overview, setOverview] = useState({ total: 0, today: 0, overdue: 0, cold: 0 });

  // filters UI
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  const [stage, setStage] = useState('');
  const [status, setStatus] = useState('');
  const [project, setProject] = useState('');
  const [source, setSource] = useState('');
  const [isCold, setIsCold] = useState('');
  const [isClosed, setIsClosed] = useState('');

  // owner filter
  const [owner, setOwner] = useState('');
  const [owners, setOwners] = useState([]);

  // Card-click filter
  const [quickDue, setQuickDue] = useState(''); // '' | 'TODAY' | 'OVERDUE'

  // dropdown data
  const [projects, setProjects] = useState([]);

  // pagination (filtered list)
  const [page, setPage] = useState(1);
  const limit = 50;
  const [totalPages, setTotalPages] = useState(1);
  const [filteredTotal, setFilteredTotal] = useState(0);

  // drawer
  const [drawer, setDrawer] = useState({ open: false, leadId: null });

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Build params for /api/leads (includes page/limit)
  const buildLeadParams = useCallback(() => {
    const params = { page, limit };

    if (stage) params.stage = stage;
    if (status) params.status = status;
    if (project) params.project = project;
    if (source) params.source = source;
    if (owner) params.owner = owner;
    if (isCold !== '') params.is_cold = isCold;
    if (isClosed !== '') params.is_closed = isClosed;
    if (search) params.search = search;

    if (quickDue === 'TODAY') params.today = 'true';
    if (quickDue === 'OVERDUE') params.overdue = 'true';

    return params;
  }, [page, limit, stage, status, project, source, owner, isCold, isClosed, search, quickDue]);

  // Build params for /api/leads/stats/monitor and /api/leads/export/csv (NO page/limit)
  const buildStatsParams = useCallback(() => {
    const params = {};

    if (stage) params.stage = stage;
    if (status) params.status = status;
    if (project) params.project = project;
    if (source) params.source = source;
    if (owner) params.owner = owner;
    if (isCold !== '') params.is_cold = isCold;
    if (isClosed !== '') params.is_closed = isClosed;
    if (search) params.search = search;

    if (quickDue === 'TODAY') params.today = 'true';
    if (quickDue === 'OVERDUE') params.overdue = 'true';

    return params;
  }, [stage, status, project, source, owner, isCold, isClosed, search, quickDue]);

  const fetchProjects = useCallback(async () => {
    try {
      if (projectApi?.getActive) {
        const res = await projectApi.getActive();
        const list = res?.data?.data?.projects ?? res?.data?.projects ?? res?.data?.data ?? [];
        setProjects(Array.isArray(list) ? list : []);
        return;
      }
      const res = await api.get('/projects/active');
      const list = res?.data?.data?.projects ?? res?.data?.projects ?? res?.data?.data ?? [];
      setProjects(Array.isArray(list) ? list : []);
    } catch {
      setProjects([]);
    }
  }, []);

  const fetchOwners = useCallback(async () => {
    try {
      const res = await api.get('/leads/owners');
      const list = res?.data?.data?.owners ?? res?.data?.owners ?? [];
      setOwners(Array.isArray(list) ? list : []);
    } catch {
      setOwners([]);
    }
  }, []);

  const fetchMonitorStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await api.get('/leads/stats/monitor', { params: buildStatsParams() });
      const d = res?.data?.data ?? {};
      setOverview({
        total: d.total ?? 0,
        today: d.today ?? 0,
        overdue: d.overdue ?? 0,
        cold: d.cold ?? 0,
      });
    } catch {
      // ignore stats failure
    } finally {
      setStatsLoading(false);
    }
  }, [buildStatsParams]);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/leads', { params: buildLeadParams() });

      const list = res?.data?.data?.leads ?? res?.data?.leads ?? [];
      setLeads(Array.isArray(list) ? list : []);

      setFilteredTotal(res?.data?.data?.total ?? 0);
      setTotalPages(res?.data?.data?.totalPages ?? 1);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load leads');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [buildLeadParams]);

  // load dropdown data
  useEffect(() => {
    fetchProjects();
    fetchOwners();
  }, [fetchProjects, fetchOwners]);

  // stats refresh whenever filters change
  useEffect(() => {
    fetchMonitorStats();
  }, [fetchMonitorStats]);

  // list refresh whenever filters OR page change
  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMonitorStats();
    fetchLeads();
  };

  const resetFilters = () => {
    setSearchInput('');
    setSearch('');
    setStage('');
    setStatus('');
    setProject('');
    setSource('');
    setOwner('');
    setIsCold('');
    setIsClosed('');
    setQuickDue('');
    setPage(1);
  };

  const handleDownloadCsv = async () => {
    setDownloading(true);
    try {
      const res = await api.get('/leads/export/csv', {
        params: buildStatsParams(),
        responseType: 'blob',
      });

      const cd = res?.headers?.['content-disposition'] || '';
      const match = cd.match(/filename="([^"]+)"/);
      const filename = match?.[1] || 'leads_export.csv';

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

  const projectOptions = useMemo(
    () =>
      projects.map((p) => ({
        id: p._id,
        label: `${p.name}${p.code ? ` (${p.code})` : ''}`,
      })),
    [projects]
  );

  // Card active rings
  const isTodayActive = quickDue === 'TODAY';
  const isOverdueActive = quickDue === 'OVERDUE';
  const isColdActive = isCold === 'true';

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="bg-purple-100 p-2.5 rounded-xl">
              <Users size={22} className="text-purple-600" />
            </div>
            All Leads (Read Only)
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            PC/AUDITOR can view leads and remarks but cannot update anything
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Filtered leads: <span className="font-semibold">{filteredTotal}</span>
          </p>
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

      {/* Overview cards (clickable) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => {
            setQuickDue('');
            setIsCold('');
            setPage(1);
          }}
          className="text-left bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Users size={18} className="text-purple-600" />
            </div>
            <span className="text-2xl font-bold text-purple-600">{statsLoading ? '—' : overview.total}</span>
          </div>
          <p className="text-sm text-gray-600 font-medium">Total Leads</p>
          <p className="text-[11px] text-gray-400 mt-1">Click to clear quick filters</p>
        </button>

        <button
          type="button"
          onClick={() => {
            setQuickDue((p) => (p === 'TODAY' ? '' : 'TODAY'));
            setPage(1);
          }}
          className={[
            'text-left bg-white rounded-xl p-4 border shadow-sm hover:shadow-md transition',
            isTodayActive ? 'ring-2 ring-blue-300 border-blue-200' : 'border-gray-100',
          ].join(' ')}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Clock size={18} className="text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-blue-600">{statsLoading ? '—' : overview.today}</span>
          </div>
          <p className="text-sm text-gray-600 font-medium">Today&apos;s Followups</p>
        </button>

        <button
          type="button"
          onClick={() => {
            setQuickDue((p) => (p === 'OVERDUE' ? '' : 'OVERDUE'));
            setPage(1);
          }}
          className={[
            'text-left bg-white rounded-xl p-4 border shadow-sm hover:shadow-md transition',
            isOverdueActive ? 'ring-2 ring-red-300 border-red-200' : 'border-gray-100',
          ].join(' ')}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="bg-red-100 p-2 rounded-lg">
              <AlertCircle size={18} className="text-red-600" />
            </div>
            <span className="text-2xl font-bold text-red-600">{statsLoading ? '—' : overview.overdue}</span>
          </div>
          <p className="text-sm text-gray-600 font-medium">Overdue</p>
        </button>

        <button
          type="button"
          onClick={() => {
            setIsCold((p) => (p === 'true' ? '' : 'true'));
            setQuickDue('');
            setPage(1);
          }}
          className={[
            'text-left bg-white rounded-xl p-4 border shadow-sm hover:shadow-md transition',
            isColdActive ? 'ring-2 ring-cyan-300 border-cyan-200' : 'border-gray-100',
          ].join(' ')}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="bg-cyan-100 p-2 rounded-lg">
              <Snowflake size={18} className="text-cyan-700" />
            </div>
            <span className="text-2xl font-bold text-cyan-700">{statsLoading ? '—' : overview.cold}</span>
          </div>
          <p className="text-sm text-gray-600 font-medium">Cold Leads</p>
        </button>
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
            {/* Search */}
            <div className="md:col-span-2 relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                name="lead_monitor_search"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by unique id / name / contact..."
                className="w-full pl-11 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-gray-50"
              />
            </div>

            {/* Stage */}
            <select
              value={stage}
              onChange={(e) => {
                setStage(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
            >
              <option value="">All Stages</option>
              {STAGES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            {/* Status */}
            <input
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              placeholder="Status (text)"
              className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
            />

            {/* Owner */}
            <select
              value={owner}
              onChange={(e) => {
                setOwner(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
            >
              <option value="">All Owners</option>
              {owners.map((o) => (
                <option key={o._id} value={o._id}>
                  {o.name} ({o.role}
                  {o.display_code ? ` · ${o.display_code}` : ''})
                </option>
              ))}
            </select>

            {/* Project */}
            <select
              value={project}
              onChange={(e) => {
                setProject(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
            >
              <option value="">All Projects</option>
              {projectOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>

            {/* Source */}
            <select
              value={source}
              onChange={(e) => {
                setSource(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
            >
              <option value="">All Sources</option>
              {SOURCES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            {/* Cold */}
            <select
              value={isCold}
              onChange={(e) => {
                setIsCold(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
            >
              <option value="">Cold (All)</option>
              <option value="true">Cold Only</option>
              <option value="false">Not Cold</option>
            </select>

            {/* Closed */}
            <select
              value={isClosed}
              onChange={(e) => {
                setIsClosed(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
            >
              <option value="">Closed (All)</option>
              <option value="false">Active Only</option>
              <option value="true">Closed Only</option>
            </select>

            <div className="md:col-span-3 flex items-center justify-end gap-2">
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
            Leads <span className="text-xs text-gray-500">({filteredTotal})</span>
          </div>
          <div className="text-xs text-gray-500">
            Page {page} / {totalPages || 1}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <PageLoader />
          </div>
        ) : leads.length === 0 ? (
          <div className="text-center py-16 text-sm text-gray-500">No leads found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left py-3 px-5 text-xs font-bold text-gray-500 uppercase">Lead</th>
                  <th className="text-left py-3 px-5 text-xs font-bold text-gray-500 uppercase">Stage / Status</th>
                  <th className="text-left py-3 px-5 text-xs font-bold text-gray-500 uppercase">Owner</th>
                  <th className="text-left py-3 px-5 text-xs font-bold text-gray-500 uppercase">Next Follow-up</th>
                  <th className="text-left py-3 px-5 text-xs font-bold text-gray-500 uppercase">Project</th>
                  <th className="text-center py-3 px-5 text-xs font-bold text-gray-500 uppercase">View</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {leads.map((l) => {
                  const dueType = getDueType(l.next_followup_date);
                  const rowClass = [
                    'transition-colors',
                    dueType === 'OVERDUE' ? 'bg-red-50 hover:bg-red-100' : '',
                    dueType === 'TODAY' ? 'bg-amber-50 hover:bg-amber-100' : '',
                    (dueType === 'UPCOMING' || dueType === 'NONE') ? 'hover:bg-gray-50' : '',
                  ].join(' ');

                  return (
                    <tr key={l._id} className={rowClass}>
                      <td className="py-3 px-5">
                        <div className="text-sm font-semibold text-gray-900">{l.customer_name || '—'}</div>
                        <div className="text-xs text-gray-500">
                          {l.unique_id} • {l.customer_contact}
                        </div>
                      </td>

                      <td className="py-3 px-5 text-xs text-gray-700">
                        <div>
                          Stage: <span className="font-semibold">{l.current_stage || '—'}</span>
                        </div>
                        <div>
                          Status: <span className="font-semibold">{l.current_status || '—'}</span>
                        </div>
                      </td>

                      <td className="py-3 px-5 text-sm text-gray-700">
                        {l.current_owner?.name ? `${l.current_owner.name} (${l.current_owner.role})` : '—'}
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
                            {l.next_followup_date ? new Date(l.next_followup_date).toLocaleString() : '—'}
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

                      <td className="py-3 px-5 text-sm text-gray-700">{l.project?.name || '—'}</td>

                      <td className="py-3 px-5">
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => setDrawer({ open: true, leadId: l._id })}
                            className="p-3 text-gray-500 hover:text-purple-700 hover:bg-purple-50 rounded-xl transition-colors"
                            title="View (Read Only)"
                            type="button"
                          >
                            <Eye size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

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
            disabled={page >= (totalPages || 1)}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-2 text-sm rounded-lg border border-gray-200 disabled:opacity-50"
            type="button"
          >
            Next
          </button>
        </div>
      </div>

      {drawer.open && (
        <LeadViewDrawer
          isOpen={drawer.open}
          leadId={drawer.leadId}
          onClose={() => setDrawer({ open: false, leadId: null })}
        />
      )}
    </div>
  );
};

export default LeadMonitor;