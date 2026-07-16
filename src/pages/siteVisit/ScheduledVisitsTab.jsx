// frontend/src/pages/siteVisit/ScheduledVisitsTab.jsx
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';           // 🆕
import { RefreshCw, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';
import { getScheduledVisits } from '../../api/siteVisitApi.js';
import LeadTable from '../../components/common/LeadTable.jsx';
import SearchBar from '../../components/common/SearchBar.jsx';
import AdvancedFilterPanel from '../../components/common/AdvancedFilterPanel.jsx'; // 🆕
import UpdateSiteVisitExecutionModal from '../../components/modals/UpdateSiteVisitExecutionModal.jsx';
import ReassignModal from '../../components/modals/ReassignModal.jsx';             // 🆕
import { PageLoader } from '../../components/common/LoadingSpinner.jsx';

// 🆕 Statuses for this tab
const EXECUTION_STATUSES = [
  { value: 'VISIT_SCHEDULED', label: '📅 Visit Scheduled' },
  { value: 'RESCHEDULE', label: '🔄 Reschedule' },
  { value: 'VISIT_DONE', label: '✅ Visit Done' },
  { value: 'COLD', label: '🥶 Cold' },
  { value: 'NOT_INTERESTED', label: '🚫 Not Interested' },
];

const ScheduledVisitsTab = () => {
  const { isAdmin } = useAuth();
  const [searchParams] = useSearchParams();                   // 🆕

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
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
      const res = await getScheduledVisits(buildParams());    // 🆕 pass params
      const d = res?.data;
      const leadsData = d?.data?.leads || d?.data || d?.leads || [];
      setLeads(Array.isArray(leadsData) ? leadsData : []);
      setTotal(d?.data?.total || d?.total || 0);
      setTotalPages(d?.data?.totalPages || d?.totalPages || 1);
    } catch (err) {
      toast.error('Failed to fetch scheduled visits');
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, [buildParams]);

  useEffect(() => {
    setPage(1);
    fetchLeads();
  }, [searchParams, search]);                                 // 🆕

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleUpdateSuccess = (updatedLead) => {
    setLeads(prev =>
      prev.map(l => l._id === updatedLead._id ? updatedLead : l)
          .filter(l =>
            l.current_stage === 'SITE_VISIT_EXECUTION' &&
            l.current_status === 'VISIT_SCHEDULED'
          )
    );
  };

  const handleReassignSuccess = (updatedLead) => {           // 🆕
    setLeads(prev => prev.map(l => l._id === updatedLead._id ? updatedLead : l));
  };

  return (
    <div className="flex flex-col gap-4">

      {/* Search */}
      <SearchBar
        value={searchInput}
        onChange={setSearchInput}
        placeholder="Search scheduled visits..."
      />

      {/* 🆕 Advanced Filter Panel */}
      <AdvancedFilterPanel
        stageStatuses={EXECUTION_STATUSES}
        showOwnerFilter={isAdmin}
        onFiltersChange={() => setPage(1)}
      />

      {/* Table Container */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Calendar size={15} className="text-blue-500" />
            <span className="text-sm font-semibold text-gray-700">Scheduled Visits</span>
            <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">
              {total}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchLeads}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <RefreshCw size={14} />
            </button>
            {totalPages > 1 && (
              <>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-3 py-1 text-xs border rounded-lg disabled:opacity-40 hover:bg-gray-50">
                  Prev
                </button>
                <span className="text-xs text-gray-500">{page}/{totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="px-3 py-1 text-xs border rounded-lg disabled:opacity-40 hover:bg-gray-50">
                  Next
                </button>
              </>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16"><PageLoader /></div>
        ) : (
          <LeadTable
            leads={leads}
            stage="SITE_VISIT_EXECUTION"
            onUpdate={(lead) => setUpdateModal({ open: true, lead })}
            onReassign={isAdmin ? (lead) => setReassignModal({ open: true, lead }) : null} // 🆕
            showAssigned={isAdmin}
          />
        )}
      </div>

      {/* Modals */}
      {updateModal.open && (
        <UpdateSiteVisitExecutionModal
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

export default ScheduledVisitsTab;