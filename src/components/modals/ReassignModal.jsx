// frontend/src/components/modals/ReassignModal.jsx
import { useState, useEffect } from 'react';
import { X, UserCheck, AlertTriangle, ChevronRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { userApi } from '../../api/userApi.js';        // ✅ Use object-style
import { leadApi } from '../../api/leadApi.js';        // ✅ Use object-style

// Stage → valid role for reassignment
const getValidRoleForStage = (stage) => {
  if (!stage) return 'BDM';
  if (
    stage === 'QUALIFICATION' ||
    stage === 'SITE_VISIT_SCHEDULING' ||
    stage === 'SITE_VISIT_EXECUTION'
  ) {
    return 'BDM';
  }
  return 'ADVISOR';
};

const STAGE_LABELS = {
  QUALIFICATION: 'Qualification',
  SITE_VISIT_SCHEDULING: 'Site Visit Scheduling',
  SITE_VISIT_EXECUTION: 'Site Visit Execution',
  POST_VISIT_FOLLOWUP: 'Post Visit Followup',
  DEAL: 'Deal',
};

const ReassignModal = ({ lead, isOpen, onClose, onSuccess }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [remark, setRemark] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const validRole = getValidRoleForStage(lead?.current_stage);
  const roleLabel = validRole === 'BDM' ? 'BDM' : 'FSR/Advisor';

  useEffect(() => {
    if (isOpen && lead) {
      loadUsers();
      setSelectedUser('');
      setRemark('');
    }
  }, [isOpen, lead]);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await userApi.getAll();
      const allUsers = res?.data?.data || res?.data || [];
      const list = Array.isArray(allUsers) ? allUsers : (allUsers?.users || []);
      const filtered = list.filter(u =>
        u.role === validRole &&
        u.is_active !== false &&
        u._id !== lead?.current_owner?._id
      );
      setUsers(filtered);
    } catch (err) {
      console.error('Load users error:', err);
      toast.error('Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedUser) {
      toast.error('Please select a user to assign');
      return;
    }
    if (!remark.trim()) {
      toast.error('Remark is required');
      return;
    }

    setLoading(true);
    try {
      const res = await leadApi.reassign(lead._id, {
        new_owner_id: selectedUser,
        remark: remark.trim(),
      });

      const updatedLead = res?.data?.data || res?.data;
      toast.success('Lead reassigned successfully');
      onSuccess?.(updatedLead);
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Reassignment failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !lead) return null;

  const currentOwnerName = lead.current_owner?.name || 'Unassigned';
  const currentOwnerCode = lead.current_owner?.display_code || '—';
  const selectedUserObj = users.find(u => u._id === selectedUser);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-xl p-2.5">
                <UserCheck size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">Reassign Lead</h2>
                <p className="text-purple-200 text-sm">Change lead owner</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full font-medium">
              {lead.customer_name}
            </span>
            <span className="bg-white/15 text-white/80 text-xs px-3 py-1 rounded-full">
              {lead.unique_id}
            </span>
            <span className="bg-white/15 text-white/80 text-xs px-3 py-1 rounded-full">
              {STAGE_LABELS[lead.current_stage] || lead.current_stage}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">

          {/* Current Owner */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">
              Current Owner
            </p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="text-purple-700 font-bold text-sm">
                  {currentOwnerCode.slice(0, 2)}
                </span>
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">{currentOwnerName}</p>
                <p className="text-xs text-gray-500">{currentOwnerCode}</p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
            <AlertTriangle size={14} className="text-amber-600 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-700">
              This lead is in <strong>{STAGE_LABELS[lead.current_stage]}</strong> stage.
              You can only reassign to a <strong>{roleLabel}</strong>.
            </p>
          </div>

          {/* Select New Owner */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Assign To ({roleLabel}) *
            </label>

            {loadingUsers ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 size={20} className="animate-spin text-purple-500" />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-4 text-gray-500 text-sm bg-gray-50 rounded-xl">
                No active {roleLabel}s available
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {users.map(u => (
                  <label
                    key={u._id}
                    className={`
                      flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all
                      ${selectedUser === u._id
                        ? 'border-purple-400 bg-purple-50 ring-1 ring-purple-300'
                        : 'border-gray-200 hover:border-purple-200 hover:bg-purple-50/50'
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name="reassign_user"
                      value={u._id}
                      checked={selectedUser === u._id}
                      onChange={() => setSelectedUser(u._id)}
                      className="accent-purple-600"
                    />
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center shrink-0">
                      <span className="text-white font-bold text-xs">
                        {u.display_code?.slice(0, 2) || u.name?.slice(0, 2)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm truncate">{u.name}</p>
                      <p className="text-xs text-gray-500">{u.display_code} · {u.role}</p>
                    </div>
                    {selectedUser === u._id && (
                      <ChevronRight size={16} className="text-purple-500 shrink-0" />
                    )}
                  </label>
                ))}
              </div>
            )}
          </div>

          {selectedUser && selectedUserObj && (
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-3">
              <span className="text-xs text-green-700 font-medium">
                {currentOwnerCode}
              </span>
              <ChevronRight size={14} className="text-green-500" />
              <span className="text-xs text-green-700 font-bold">
                {selectedUserObj.display_code} — {selectedUserObj.name}
              </span>
            </div>
          )}

          {/* Remark */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Reason / Remark *
            </label>
            <textarea
              value={remark}
              onChange={e => setRemark(e.target.value)}
              placeholder="Why is this lead being reassigned? (e.g., BDM on leave, territory change)"
              rows={3}
              maxLength={300}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{remark.length}/300</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !selectedUser || !remark.trim()}
            className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Reassigning...
              </>
            ) : (
              <>
                <UserCheck size={16} />
                Confirm Reassign
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReassignModal;