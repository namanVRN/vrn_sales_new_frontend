// frontend/src/pages/qualification/QualificationList.jsx
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Users, RefreshCw, Plus, TrendingUp,
  AlertTriangle, Snowflake, Clock, CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';
import { qualificationApi } from '../../api/qualificationApi.js';
import LeadTable from '../../components/common/LeadTable.jsx';
import SearchBar from '../../components/common/SearchBar.jsx';
import AdvancedFilterPanel from '../../components/common/AdvancedFilterPanel.jsx';
import UpdateQualificationModal from '../../components/modals/UpdateQualificationModal.jsx';
import ReassignModal from '../../components/modals/ReassignModal.jsx';
import { PageLoader } from '../../components/common/LoadingSpinner.jsx';

const QUALIFICATION_STATUSES = [
  { value: 'FOLLOWUP_REQUIRED', label: '📞 Followup Required' },
  { value: 'NO_CONNECTION', label: '📵 No Connection' },
  { value: 'COLD', label: '🥶 Cold' },
  { value: 'NOT_QUALIFIED', label: '❌ Not Qualified' },
  { value: 'NOT_INTERESTED', label: '🚫 Not Interested' },
];

const QualificationList = () => {
  const { isAdmin } = useAuth();
  const [searchParams] = useSearchParams();

  // Data state
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Search
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // Modal state
  const [updateModal, setUpdateModal] = useState({ open: false, lead: null });
  const [reassignModal, setReassignModal] = useState({ open: false, lead: null });

  // Build query params from URL + search
  const buildQueryParams = useCallback(() => {
    const params = {
      page,
      limit: 50,
    };

    // Pass through all URL params
    for (const [key, val] of searchParams.entries()) {
      if (val) params[key] = val;
    }

    // Search override
    if (search) params.search = search;

    return params;
  }, [searchParams, search, page]);

  // Fetch leads
  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = buildQueryParams();
      const res = await qualificationApi.getLeads(params);

      const d = res?.data;
      const leadsData = d?.data?.leads || d?.data || d?.leads || [];
      setLeads(Array.isArray(leadsData) ? leadsData : []);
      setTotal(d?.data?.total || d?.total || 0);
      setTotalPages(d?.data?.totalPages || d?.totalPages || 1);
    } catch (err) {
      console.error('Fetch qualification leads error:', err);
      toast.error('Failed to fetch leads');
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, [buildQueryParams]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const params = {};
      // Pass owner filter to stats too
      const ownerParam = searchParams.get('owner');
      if (ownerParam) params.owner = ownerParam;

      const res = await qualificationApi.getStats(params);
      const d = res?.data?.data || res?.data;
      setStats(d);
    } catch (err) {
      console.error('Fetch stats error:', err);
    } finally {
      setStatsLoading(false);
    }
  }, [searchParams]);

  // Fetch on mount + param changes
  useEffect(() => {
    setPage(1);
    fetchLeads();
    fetchStats();
  }, [searchParams, search]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Handle update success
  const handleUpdateSuccess = (updatedLead) => {
    setLeads(prev => prev.map(l =>
      l._id === updatedLead._id ? updatedLead : l
    ).filter(l => l.current_stage === 'QUALIFICATION'));
    fetchStats();
    toast.success('Lead updated successfully');
  };

  // Handle reassign success
  const handleReassignSuccess = (updatedLead) => {
    setLeads(prev => prev.map(l =>
      l._id === updatedLead._id ? updatedLead : l
    ));
    fetchStats();
  };

  const handleFiltersChange = () => {
    setPage(1);
    // URL already updated by AdvancedFilterPanel
    // fetchLeads will re-run via searchParams useEffect
  };

  return (
    <div className="flex flex-col h-full gap-4 p-4 md:p-6">

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <div className="bg-purple-100 p-2 rounded-xl">
              <Users size={22} className="text-purple-600" />
            </div>
            Qualification
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage and qualify incoming leads
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { fetchLeads(); fetchStats(); }}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
          >
            <RefreshCw size={15} />
            Refresh
          </button>
          {isAdmin && (
            <button className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors">
              <Plus size={15} />
              Add Lead
            </button>
          )}
        </div>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: 'Total Leads',
            value: stats?.total ?? '—',
            icon: TrendingUp,
            color: 'purple',
            bg: 'bg-purple-50',
            text: 'text-purple-600',
            iconBg: 'bg-purple-100',
          },
          {
            label: "Today's",
            value: stats?.today ?? '—',
            icon: Clock,
            color: 'blue',
            bg: 'bg-blue-50',
            text: 'text-blue-600',
            iconBg: 'bg-blue-100',
          },
          {
            label: 'Overdue',
            value: stats?.overdue ?? '—',
            icon: AlertTriangle,
            color: 'red',
            bg: 'bg-red-50',
            text: 'text-red-600',
            iconBg: 'bg-red-100',
          },
          {
            label: 'Cold Leads',
            value: stats?.cold ?? '—',
            icon: Snowflake,
            color: 'cyan',
            bg: 'bg-cyan-50',
            text: 'text-cyan-600',
            iconBg: 'bg-cyan-100',
          },
        ].map(({ label, value, icon: Icon, bg, text, iconBg }) => (
          <div key={label} className={`${bg} rounded-xl p-4 border border-white`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">{label}</p>
                <p className={`text-2xl font-bold ${text} mt-1`}>
                  {statsLoading ? '...' : value}
                </p>
              </div>
              <div className={`${iconBg} p-2.5 rounded-xl`}>
                <Icon size={18} className={text} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Search ── */}
      <SearchBar
        value={searchInput}
        onChange={setSearchInput}
        placeholder="Search by name, phone, or ID..."
      />

      {/* ── Advanced Filter Panel ── */}
      <AdvancedFilterPanel
        stageStatuses={QUALIFICATION_STATUSES}
        showOwnerFilter={isAdmin}
        onFiltersChange={handleFiltersChange}
      />

      {/* ── Lead Table ── */}
      <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Table header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700">
              Leads
            </span>
            <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-0.5 rounded-full">
              {total}
            </span>
          </div>

          {/* Pagination info */}
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
              <span className="text-xs text-gray-500">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <PageLoader />
          </div>
        ) : leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <CheckCircle size={40} className="mb-3 opacity-30" />
            <p className="font-medium">No leads found</p>
            <p className="text-sm">Try adjusting your filters</p>
          </div>
        ) : (
          <LeadTable
            leads={leads}
            stage="QUALIFICATION"
            onUpdate={(lead) => setUpdateModal({ open: true, lead })}
            onReassign={isAdmin ? (lead) => setReassignModal({ open: true, lead }) : null}
            showAssigned={isAdmin}
          />
        )}
      </div>

      {/* ── Modals ── */}
      {updateModal.open && (
        <UpdateQualificationModal
          lead={updateModal.lead}
          isOpen={updateModal.open}
          onClose={() => setUpdateModal({ open: false, lead: null })}
          onSuccess={handleUpdateSuccess}
        />
      )}

      {reassignModal.open && (
        <ReassignModal
          lead={reassignModal.lead}
          isOpen={reassignModal.open}
          onClose={() => setReassignModal({ open: false, lead: null })}
          onSuccess={handleReassignSuccess}
        />
      )}
    </div>
  );
};

export default QualificationList;