// frontend/src/pages/postVisit/PostVisitFollowup.jsx
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';           // 🆕
import {
  MessageSquare, RefreshCw,
  AlertTriangle, Snowflake, Clock, TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';
import { getPostVisitLeads, getPostVisitStats } from '../../api/postVisitApi.js';
import LeadTable from '../../components/common/LeadTable.jsx';
import SearchBar from '../../components/common/SearchBar.jsx';
import AdvancedFilterPanel from '../../components/common/AdvancedFilterPanel.jsx'; // 🆕
import UpdatePostVisitModal from '../../components/modals/UpdatePostVisitModal.jsx';
import ReassignModal from '../../components/modals/ReassignModal.jsx';             // 🆕
import { PageLoader } from '../../components/common/LoadingSpinner.jsx';

// 🆕 Post Visit statuses
const POST_VISIT_STATUSES = [
  { value: 'MEETING_SCHEDULED', label: '📅 Meeting Scheduled' },
  { value: 'FEEDBACK_CAPTURED', label: '📝 Feedback Captured' },
  { value: 'FOLLOWUP_REQUIRED', label: '📞 Followup Required' },
  { value: 'NO_RESPONSE', label: '📵 No Response' },
  { value: 'COLD', label: '🥶 Cold' },
  { value: 'NOT_INTERESTED', label: '🚫 Not Interested' },
];

const PostVisitFollowup = () => {
  const { isAdmin } = useAuth();
  const [searchParams] = useSearchParams();                   // 🆕

  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  const [updateModal, setUpdateModal] = useState({ open: false, lead: null });
  const [reassignModal, setReassignModal] = useState({ open: false, lead: null }); // 🆕

  // 🆕 Build params
  const buildParams = useCallback(() => ({
    page,
    limit: 50,
    ...Object.fromEntries(searchParams.entries()),
    ...(search ? { search } : {}),
  }), [searchParams, search, page]);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getPostVisitLeads(buildParams());     // 🆕 pass params
      const d = res?.data;
      const leadsData = d?.data?.leads || d?.data || d?.leads || [];
      setLeads(Array.isArray(leadsData) ? leadsData : []);
      setTotal(d?.data?.total || d?.total || 0);
      setTotalPages(d?.data?.totalPages || d?.totalPages || 1);
    } catch (err) {
      toast.error('Failed to fetch post visit leads');
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, [buildParams]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const params = {};
      const ownerParam = searchParams.get('owner');
      if (ownerParam) params.owner = ownerParam;
      const res = await getPostVisitStats(params);
      setStats(res?.data?.data || res?.data);
    } catch (err) {
      console.error(err);
    } finally {
      setStatsLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    setPage(1);
    fetchLeads();
    fetchStats();
  }, [searchParams, search]);                                 // 🆕

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleUpdateSuccess = (updatedLead) => {
    setLeads(prev =>
      prev.map(l => l._id === updatedLead._id ? updatedLead : l)
          .filter(l => l.current_stage === 'POST_VISIT_FOLLOWUP')
    );
    fetchStats();
  };

  const handleReassignSuccess = (updatedLead) => {           // 🆕
    setLeads(prev => prev.map(l => l._id === updatedLead._id ? updatedLead : l));
  };

  return (
    <div className="flex flex-col h-full gap-4 p-4 md:p-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <div className="bg-orange-100 p-2 rounded-xl">
              <MessageSquare size={22} className="text-orange-600" />
            </div>
            Post Visit Followup
          </h1>
          <p className="text-gray-500 text-sm mt-1">Follow up with customers after site visit</p>
        </div>
        <button
          onClick={() => { fetchLeads(); fetchStats(); }}
          className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats?.total, icon: TrendingUp, bg: 'bg-orange-50', text: 'text-orange-600', iconBg: 'bg-orange-100' },
          { label: "Today's", value: stats?.today, icon: Clock, bg: 'bg-blue-50', text: 'text-blue-600', iconBg: 'bg-blue-100' },
          { label: 'Overdue', value: stats?.overdue, icon: AlertTriangle, bg: 'bg-red-50', text: 'text-red-600', iconBg: 'bg-red-100' },
          { label: 'Cold', value: stats?.cold, icon: Snowflake, bg: 'bg-cyan-50', text: 'text-cyan-600', iconBg: 'bg-cyan-100' },
        ].map(({ label, value, icon: Icon, bg, text, iconBg }) => (
          <div key={label} className={`${bg} rounded-xl p-4 border border-white`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">{label}</p>
                <p className={`text-2xl font-bold ${text} mt-1`}>
                  {statsLoading ? '...' : (value ?? '—')}
                </p>
              </div>
              <div className={`${iconBg} p-2.5 rounded-xl`}>
                <Icon size={18} className={text} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <SearchBar
        value={searchInput}
        onChange={setSearchInput}
        placeholder="Search by name, phone, or ID..."
      />

      {/* 🆕 Advanced Filter Panel */}
      <AdvancedFilterPanel
        stageStatuses={POST_VISIT_STATUSES}
        showOwnerFilter={isAdmin}
        onFiltersChange={() => setPage(1)}
      />

      {/* Table Container */}
      <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700">Leads</span>
            <span className="bg-orange-100 text-orange-700 text-xs font-semibold px-2 py-0.5 rounded-full">
              {total}
            </span>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1 text-xs border rounded-lg disabled:opacity-40 hover:bg-gray-50">
                Previous
              </button>
              <span className="text-xs text-gray-500">{page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-3 py-1 text-xs border rounded-lg disabled:opacity-40 hover:bg-gray-50">
                Next
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><PageLoader /></div>
        ) : (
          <LeadTable
            leads={leads}
            stage="POST_VISIT_FOLLOWUP"
            onUpdate={(lead) => setUpdateModal({ open: true, lead })}
            onReassign={isAdmin ? (lead) => setReassignModal({ open: true, lead }) : null} // 🆕
            showAssigned={isAdmin}
          />
        )}
      </div>

      {/* Modals */}
      {updateModal.open && (
        <UpdatePostVisitModal
          lead={updateModal.lead}
          isOpen={updateModal.open}
          onClose={() => setUpdateModal({ open: false, lead: null })}
          onSuccess={handleUpdateSuccess}
        />
      )}

      {/* 🆕 Reassign Modal */}
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

export default PostVisitFollowup;