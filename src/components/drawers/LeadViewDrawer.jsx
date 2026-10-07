import { useEffect, useState } from 'react';
import { X, Hash, User, Phone, Layers, CalendarClock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios.js';

const LeadViewDrawer = ({ isOpen, leadId, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [lead, setLead] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!isOpen || !leadId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [leadRes, histRes] = await Promise.all([
          api.get(`/leads/${leadId}`),
          api.get(`/leads/${leadId}/history`),
        ]);

        const leadData = leadRes?.data?.data ?? leadRes?.data ?? null;
        setLead(leadData);

        const hist = histRes?.data?.data?.history ?? histRes?.data?.history ?? [];
        setHistory(Array.isArray(hist) ? hist : []);
      } catch (e) {
        toast.error(e?.response?.data?.message || 'Failed to load lead details');
        setLead(null);
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOpen, leadId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl flex flex-col">
        <div className="px-5 py-4 border-b flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Lead Details (Read Only)</h2>
            <p className="text-xs text-gray-500">PC/AUDITOR can view only</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600" type="button">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {loading ? (
            <div className="text-sm text-gray-600">Loading...</div>
          ) : !lead ? (
            <div className="text-sm text-gray-600">No data</div>
          ) : (
            <>
              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="border rounded-xl p-3">
                  <div className="flex items-center gap-2 text-xs text-gray-500"><Hash size={14} /> Unique ID</div>
                  <div className="text-sm font-semibold text-gray-900 mt-1">{lead.unique_id || '—'}</div>
                </div>

                <div className="border rounded-xl p-3">
                  <div className="flex items-center gap-2 text-xs text-gray-500"><User size={14} /> Customer</div>
                  <div className="text-sm font-semibold text-gray-900 mt-1">{lead.customer_name || '—'}</div>
                </div>

                <div className="border rounded-xl p-3">
                  <div className="flex items-center gap-2 text-xs text-gray-500"><Phone size={14} /> Contact</div>
                  <div className="text-sm font-semibold text-gray-900 mt-1">{lead.customer_contact || '—'}</div>
                </div>

                <div className="border rounded-xl p-3">
                  <div className="flex items-center gap-2 text-xs text-gray-500"><Layers size={14} /> Stage / Status</div>
                  <div className="text-sm font-semibold text-gray-900 mt-1">
                    {lead.current_stage || '—'} / {lead.current_status || '—'}
                  </div>
                </div>

                <div className="border rounded-xl p-3">
                  <div className="flex items-center gap-2 text-xs text-gray-500"><User size={14} /> Owner</div>
                  <div className="text-sm font-semibold text-gray-900 mt-1">
                    {lead.current_owner?.name ? `${lead.current_owner.name} (${lead.current_owner.role})` : '—'}
                  </div>
                </div>

                <div className="border rounded-xl p-3">
                  <div className="flex items-center gap-2 text-xs text-gray-500"><CalendarClock size={14} /> Next Follow-up</div>
                  <div className="text-sm font-semibold text-gray-900 mt-1">
                    {lead.next_followup_date ? new Date(lead.next_followup_date).toLocaleString() : '—'}
                  </div>
                </div>
              </div>

              {/* History / Remarks */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-2">Activity / Remarks</h3>

                {history.length === 0 ? (
                  <div className="text-sm text-gray-500 border rounded-xl p-4 bg-gray-50">No activity found.</div>
                ) : (
                  <div className="space-y-2">
                    {history.map((h) => (
                      <div key={h._id} className="border rounded-xl p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-xs text-gray-600">
                            <span className="font-semibold text-gray-800">
                              {h.performed_by_name || h.performed_by?.name || '—'}
                            </span>
                            {h.performed_by_role ? <span className="text-gray-500"> ({h.performed_by_role})</span> : null}
                            <span className="text-gray-400"> • {h.action_type || '—'}</span>
                          </div>
                          <div className="text-[11px] text-gray-500">
                            {h.createdAt ? new Date(h.createdAt).toLocaleString() : ''}
                          </div>
                        </div>

                        <div className="text-[12px] text-gray-600 mt-1">
                          Stage: {h.stage_before || '—'} → {h.stage_after || '—'} | Status: {h.status_before || '—'} → {h.status_after || '—'}
                        </div>

                        <div className="text-sm text-gray-800 mt-2 whitespace-pre-wrap">
                          {h.remark || <span className="text-gray-400">No remark</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="border-t p-4 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border border-gray-200 text-sm hover:bg-gray-50" type="button">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeadViewDrawer;