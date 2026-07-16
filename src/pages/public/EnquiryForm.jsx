// frontend/src/pages/public/EnquiryForm.jsx
import { useState, useEffect } from 'react';
import {
  User, Phone, Mail, Home, Building2, MessageSquare,
  Loader2, Send, CheckCircle, ArrowRight, TrendingUp,
  AlertTriangle, X, Copy, Check
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { publicLeadApi } from '../../api/publicApi.js';

const INTERESTED_IN_OPTIONS = [
  { value: 'Flat', label: '🏢 Flat / Apartment' },
  { value: 'Plot', label: '🏗️ Plot / Land' },
  { value: 'Villa', label: '🏡 Villa' },
  { value: 'Commercial', label: '🏬 Commercial Space' },
  { value: 'Penthouse', label: '🌆 Penthouse' },
  { value: 'Duplex', label: '🏘️ Duplex' },
];

const EnquiryForm = () => {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_contact: '',
    customer_email: '',
    interested_in: '',
    project_id: '',
    message: '',
  });

  const [projects, setProjects] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Duplicate modal state
  const [duplicateData, setDuplicateData] = useState(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);

  // Success screen state
  const [successData, setSuccessData] = useState(null);
  const [copiedId, setCopiedId] = useState(false);

  // Load projects on mount
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const res = await publicLeadApi.getProjects();
      const list = res?.data?.data || res?.data || [];
      setProjects(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Load projects error:', err);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const err = {};
    if (!formData.customer_name.trim()) err.customer_name = 'Name is required';
    if (!formData.customer_contact) err.customer_contact = 'Phone number is required';
    else {
      const cleaned = formData.customer_contact.replace(/[\s\-+]/g, '').replace(/^91/, '');
      if (!/^\d{10}$/.test(cleaned)) err.customer_contact = 'Enter valid 10-digit number';
    }
    if (formData.customer_email && !/^\S+@\S+\.\S+$/.test(formData.customer_email))
      err.customer_email = 'Invalid email format';
    if (!formData.interested_in) err.interested_in = 'Please select property type';

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (allowDuplicate = false) => {
    if (!validate()) {
      toast.error('Please fix the errors');
      return;
    }

    setLoading(true);

    try {
      // Step 1: Check duplicate first (unless already confirmed)
      if (!allowDuplicate) {
        const dupCheck = await publicLeadApi.checkDuplicate({
          customer_contact: formData.customer_contact,
        });

        const dupResult = dupCheck?.data?.data;
        if (dupResult?.is_duplicate) {
          setDuplicateData(dupResult.existing_lead);
          setShowDuplicateModal(true);
          setLoading(false);
          return;
        }
      }

      // Step 2: Submit lead
      const res = await publicLeadApi.createLead({
        ...formData,
        allow_duplicate: allowDuplicate,
      });

      const result = res?.data?.data;
      setSuccessData(result);
      setShowDuplicateModal(false);
      toast.success('Enquiry submitted successfully!');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Submission failed. Please try again.';
      toast.error(msg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnyway = () => {
    setShowDuplicateModal(false);
    handleSubmit(true);
  };

  const handleCopyId = () => {
    if (successData?.unique_id) {
      navigator.clipboard.writeText(successData.unique_id);
      setCopiedId(true);
      toast.success('Lead ID copied!');
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleNewEnquiry = () => {
    setSuccessData(null);
    setFormData({
      customer_name: '',
      customer_contact: '',
      customer_email: '',
      interested_in: '',
      project_id: '',
      message: '',
    });
    setErrors({});
  };

  // ═══════════════════════════════════════════
  // SUCCESS SCREEN
  // ═══════════════════════════════════════════
  if (successData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <Toaster position="top-center" />

        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden">

          {/* Success Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center">
            <div className="w-20 h-20 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
              <CheckCircle size={48} className="text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Thank You! 🎉</h1>
            <p className="text-green-100 text-sm">
              Your enquiry has been received
            </p>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5">

            {/* Lead ID Card */}
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-2xl p-5">
              <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-2">
                Your Enquiry ID
              </p>
              <div className="flex items-center justify-between gap-3">
                <p className="text-3xl font-black text-purple-700 font-mono">
                  {successData.unique_id}
                </p>
                <button
                  onClick={handleCopyId}
                  className="p-2 bg-white rounded-lg border border-purple-200 hover:border-purple-400 transition-colors"
                  title="Copy ID"
                >
                  {copiedId ? (
                    <Check size={18} className="text-green-600" />
                  ) : (
                    <Copy size={18} className="text-purple-600" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Save this ID for future reference
              </p>
            </div>

            {/* Info Message */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-800 leading-relaxed">
                👋 Hi <strong>{successData.customer_name}</strong>! <br />
                {successData.assigned_to ? (
                  <>
                    Our team member <strong>{successData.assigned_to.name}</strong> will
                    contact you within <strong>24 hours</strong>.
                  </>
                ) : (
                  <>Our team will contact you within <strong>24 hours</strong>.</>
                )}
              </p>
            </div>

            {/* WhatsApp CTA */}
            <a
              href={`https://wa.me/919999999999?text=Hi, I just submitted an enquiry. My ID is ${successData.unique_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-3.5 rounded-xl transition-colors shadow-md"
            >
              <MessageSquare size={18} />
              Chat with us on WhatsApp
            </a>

            {/* New Enquiry Button */}
            <button
              onClick={handleNewEnquiry}
              className="w-full text-sm text-purple-600 hover:text-purple-800 font-medium py-2 transition-colors"
            >
              Submit another enquiry →
            </button>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 py-3 text-center border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Powered by <strong className="text-purple-600">VRN CRM</strong>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // MAIN FORM
  // ═══════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      <Toaster position="top-center" />

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white">
        <div className="max-w-2xl mx-auto px-6 py-8 text-center">
          <div className="w-16 h-16 mx-auto bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm">
            <TrendingUp size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">VRN Real Estate</h1>
          <p className="text-purple-100 text-sm">
            Your dream property is just one enquiry away ✨
          </p>
        </div>
      </div>

      {/* Form Container */}
      <div className="max-w-2xl mx-auto px-4 py-8 -mt-6">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

          {/* Form Header */}
          <div className="border-b border-gray-100 px-6 py-5">
            <h2 className="text-xl font-bold text-gray-900">Get in Touch</h2>
            <p className="text-sm text-gray-500 mt-1">
              Fill the form below and our team will contact you soon
            </p>
          </div>

          {/* Form Body */}
          <div className="p-6 space-y-5">

            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <User size={14} className="inline mr-1.5" />
                Your Name *
              </label>
              <input
                type="text"
                value={formData.customer_name}
                onChange={e => handleChange('customer_name', e.target.value)}
                placeholder="Enter your full name"
                className={`w-full px-4 py-3 text-base border rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                  errors.customer_name
                    ? 'border-red-300 focus:ring-red-400'
                    : 'border-gray-200 focus:ring-purple-400 focus:border-purple-400'
                }`}
              />
              {errors.customer_name && (
                <p className="text-xs text-red-500 mt-1.5">{errors.customer_name}</p>
              )}
            </div>

            {/* Phone & Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Phone size={14} className="inline mr-1.5" />
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.customer_contact}
                  onChange={e => handleChange('customer_contact', e.target.value)}
                  placeholder="10-digit number"
                  maxLength="15"
                  className={`w-full px-4 py-3 text-base border rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                    errors.customer_contact
                      ? 'border-red-300 focus:ring-red-400'
                      : 'border-gray-200 focus:ring-purple-400 focus:border-purple-400'
                  }`}
                />
                {errors.customer_contact && (
                  <p className="text-xs text-red-500 mt-1.5">{errors.customer_contact}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Mail size={14} className="inline mr-1.5" />
                  Email <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="email"
                  value={formData.customer_email}
                  onChange={e => handleChange('customer_email', e.target.value)}
                  placeholder="you@example.com"
                  className={`w-full px-4 py-3 text-base border rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                    errors.customer_email
                      ? 'border-red-300 focus:ring-red-400'
                      : 'border-gray-200 focus:ring-purple-400 focus:border-purple-400'
                  }`}
                />
                {errors.customer_email && (
                  <p className="text-xs text-red-500 mt-1.5">{errors.customer_email}</p>
                )}
              </div>
            </div>

            {/* Interested In */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Home size={14} className="inline mr-1.5" />
                What are you looking for? *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {INTERESTED_IN_OPTIONS.map(opt => {
                  const isSelected = formData.interested_in === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleChange('interested_in', opt.value)}
                      className={`
                        px-3 py-3 rounded-xl border text-sm font-medium transition-all text-left
                        ${isSelected
                          ? 'border-purple-500 bg-purple-50 text-purple-700 ring-1 ring-purple-300'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-purple-200 hover:bg-purple-50/50'
                        }
                      `}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
              {errors.interested_in && (
                <p className="text-xs text-red-500 mt-1.5">{errors.interested_in}</p>
              )}
            </div>

            {/* Project */}
            {projects.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Building2 size={14} className="inline mr-1.5" />
                  Interested Project <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <select
                  value={formData.project_id}
                  onChange={e => handleChange('project_id', e.target.value)}
                  className="w-full px-4 py-3 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 bg-white"
                >
                  <option value="">Any Project</option>
                  {projects.map(p => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Message */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <MessageSquare size={14} className="inline mr-1.5" />
                Message <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                value={formData.message}
                onChange={e => handleChange('message', e.target.value)}
                placeholder="Tell us about your requirements, budget, timeline, etc..."
                rows={4}
                maxLength={500}
                className="w-full px-4 py-3 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 resize-none"
              />
              <p className="text-xs text-gray-400 mt-1 text-right">
                {formData.message.length}/500
              </p>
            </div>

            {/* Submit Button */}
            <button
              onClick={() => handleSubmit(false)}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Submit Enquiry
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            {/* Privacy note */}
            <p className="text-xs text-gray-400 text-center">
              🔒 Your information is safe with us. We'll only contact you regarding your enquiry.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            Powered by <strong className="text-purple-600">VRN CRM</strong>
          </p>
        </div>
      </div>

      {/* DUPLICATE MODAL */}
      {showDuplicateModal && duplicateData && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowDuplicateModal(false)}
          />

          <div className="flex min-h-full items-center justify-center p-4">
            <div
              style={{
                position: 'relative',
                backgroundColor: 'white',
                borderRadius: '20px',
                width: '100%',
                maxWidth: '500px',
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              }}
            >

              {/* Header */}
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 rounded-xl p-2.5">
                      <AlertTriangle size={22} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-white font-bold text-lg">Wait! This Looks Familiar</h2>
                      <p className="text-orange-100 text-xs">Similar enquiry found</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDuplicateModal(false)}
                    className="text-white/70 hover:text-white p-2 rounded-lg"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                <p className="text-sm text-gray-700 leading-relaxed">
                  We already have an enquiry with this phone number. Here are the details:
                </p>

                {/* Existing Lead Details */}
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-4 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-purple-600" />
                    <span className="text-sm font-semibold text-gray-800">
                      {duplicateData.customer_name}
                    </span>
                    <span className="text-xs font-mono text-purple-600 ml-auto">
                      {duplicateData.unique_id}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-purple-600" />
                    <span className="text-sm text-gray-700">{duplicateData.customer_contact}</span>
                  </div>

                  {duplicateData.interested_in && (
                    <div className="flex items-center gap-2">
                      <Home size={14} className="text-purple-600" />
                      <span className="text-sm text-gray-700">
                        Interested in: <strong>{duplicateData.interested_in}</strong>
                      </span>
                    </div>
                  )}

                  {duplicateData.project_name && (
                    <div className="flex items-center gap-2">
                      <Building2 size={14} className="text-purple-600" />
                      <span className="text-sm text-gray-700">{duplicateData.project_name}</span>
                    </div>
                  )}

                  <div className="border-t border-purple-200 pt-2.5 mt-2.5 space-y-1.5">
                    <p className="text-xs text-gray-600">
                      📌 Current Stage: <strong className="text-purple-700">{duplicateData.current_stage?.replace(/_/g, ' ')}</strong>
                    </p>
                    <p className="text-xs text-gray-600">
                      ⏰ Status: <strong className="text-purple-700">{duplicateData.current_status?.replace(/_/g, ' ')}</strong>
                    </p>
                    {duplicateData.assigned_to && (
                      <p className="text-xs text-gray-600">
                        👨‍💼 Assigned to: <strong className="text-purple-700">{duplicateData.assigned_to.name}</strong>
                      </p>
                    )}
                    <p className="text-xs text-gray-600">
                      📅 Created: <strong className="text-purple-700">
                        {duplicateData.created_days_ago === 0
                          ? 'Today'
                          : `${duplicateData.created_days_ago} days ago`
                        }
                      </strong>
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                  <p className="text-xs text-blue-800">
                    💡 Our team is already working on this enquiry. Is this a <strong>new/separate</strong> requirement?
                  </p>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="flex gap-3 px-6 pb-6">
                <button
                  onClick={() => setShowDuplicateModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitAnyway}
                  disabled={loading}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-bold hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-md"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Yes, Submit Anyway'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnquiryForm;