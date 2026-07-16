// frontend/src/components/modals/UserFormModal.jsx
import { useState, useEffect } from 'react';
import {
  X, User, Mail, Phone, Lock, Shield, Hash, Percent,
  Loader2, Save, UserPlus, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { userApi } from '../../api/userApi.js';
import { ROLES, ROLE_LABELS } from '../../utils/constants.js';

const UserFormModal = ({ user, isOpen, onClose, onSuccess }) => {
  const isEdit = !!user;

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '',
    role: 'BDM', display_code: '',
    assignment_percentage: 0, is_active: true,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (user) {
        setFormData({
          name: user.name || '',
          email: user.email || '',
          password: '',
          phone: user.phone || '',
          role: user.role || 'BDM',
          display_code: user.display_code || '',
          assignment_percentage: user.assignment_percentage || 0,
          // 🆕 Force to boolean explicitly
          is_active: user.is_active === true,
        });
      } else {
        setFormData({
          name: '', email: '', password: '', phone: '',
          role: 'BDM', display_code: '', assignment_percentage: 0, is_active: true,
        });
      }
      setErrors({});
    }
  }, [isOpen, user]);

  const validate = () => {
    const err = {};
    if (!formData.name.trim()) err.name = 'Name is required';
    if (!formData.email.trim()) err.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) err.email = 'Invalid email';
    if (!isEdit && !formData.password) err.password = 'Password is required';
    if (!isEdit && formData.password && formData.password.length < 6)
      err.password = 'Password must be at least 6 characters';
    if (!formData.role) err.role = 'Role is required';
    if (!formData.display_code.trim()) err.display_code = 'Display code is required';
    if (formData.role === 'BDM') {
      const pct = Number(formData.assignment_percentage);
      if (pct < 0 || pct > 100) err.assignment_percentage = 'Must be 0-100';
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  // 🆕 Explicit toggle handler
  const handleToggleActive = () => {
    setFormData(prev => ({ ...prev, is_active: !prev.is_active }));
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = { ...formData };
      if (isEdit && !payload.password) delete payload.password;
      if (payload.role !== 'BDM') payload.assignment_percentage = 0;

      if (isEdit) {
        await userApi.update(user._id, payload);
        toast.success('User updated successfully');
      } else {
        await userApi.create(payload);
        toast.success('User created successfully');
      }
      onSuccess?.();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Operation failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      {/* Backdrop */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
        }}
        onClick={onClose}
      />

      {/* Modal Box — with INLINE MAX-WIDTH (force override) */}
      <div
        style={{
          position: 'relative',
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          width: '100%',
          maxWidth: '680px',           // ✅ HARD FORCE
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >

        {/* ── Header ── */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-5 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-xl p-2.5">
                {isEdit ? <User size={22} className="text-white" /> : <UserPlus size={22} className="text-white" />}
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">
                  {isEdit ? 'Edit User' : 'Create New User'}
                </h2>
                <p className="text-purple-100 text-sm">
                  {isEdit ? `Update details for ${user.name}` : 'Add a new user to the system'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">

          {/* Name & Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <User size={13} className="inline mr-1" />
                Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={e => handleChange('name', e.target.value)}
                placeholder="John Doe"
                className={`w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 ${
                  errors.name ? 'border-red-300 focus:ring-red-400' : 'border-gray-200 focus:ring-purple-400'
                }`}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Mail size={13} className="inline mr-1" />
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={e => handleChange('email', e.target.value)}
                placeholder="user@vrn.com"
                className={`w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 ${
                  errors.email ? 'border-red-300 focus:ring-red-400' : 'border-gray-200 focus:ring-purple-400'
                }`}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>
          </div>

          {/* Password & Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Lock size={13} className="inline mr-1" />
                Password {!isEdit && '*'}
                {isEdit && <span className="text-xs font-normal text-gray-500 ml-1">(blank to keep)</span>}
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={e => handleChange('password', e.target.value)}
                placeholder={isEdit ? 'Leave blank to keep' : 'Min 6 characters'}
                className={`w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 ${
                  errors.password ? 'border-red-300 focus:ring-red-400' : 'border-gray-200 focus:ring-purple-400'
                }`}
              />
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Phone size={13} className="inline mr-1" />
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={e => handleChange('phone', e.target.value)}
                placeholder="9999999999"
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Shield size={13} className="inline mr-1" />
              Role *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Object.entries(ROLES).map(([key]) => {
                const isSelected = formData.role === key;
                return (
                  <label
                    key={key}
                    className={`
                      flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all
                      ${isSelected
                        ? 'border-purple-400 bg-purple-50 ring-1 ring-purple-300'
                        : 'border-gray-200 hover:border-purple-200 hover:bg-purple-50/50'
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={key}
                      checked={isSelected}
                      onChange={() => handleChange('role', key)}
                      className="accent-purple-600 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800">{key}</p>
                      <p className="text-xs text-gray-500 truncate">{ROLE_LABELS[key]}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Display Code & Assignment % */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Hash size={13} className="inline mr-1" />
                Display Code *
              </label>
              <input
                type="text"
                value={formData.display_code}
                onChange={e => handleChange('display_code', e.target.value.toUpperCase())}
                placeholder={
                  formData.role === 'BDM' ? 'BDM1' :
                  formData.role === 'ADVISOR' ? 'FSR1' :
                  formData.role === 'AUDITOR' ? 'AUD1' :
                  formData.role === 'PC' ? 'PC1' : 'ADMIN1'
                }
                className={`w-full px-4 py-2.5 text-sm font-mono uppercase border rounded-xl focus:outline-none focus:ring-2 ${
                  errors.display_code ? 'border-red-300 focus:ring-red-400' : 'border-gray-200 focus:ring-purple-400'
                }`}
              />
              {errors.display_code && <p className="text-xs text-red-500 mt-1">{errors.display_code}</p>}
            </div>

            {formData.role === 'BDM' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Percent size={13} className="inline mr-1" />
                  Assignment %
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.assignment_percentage}
                  onChange={e => handleChange('assignment_percentage', Number(e.target.value))}
                  className={`w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 ${
                    errors.assignment_percentage ? 'border-red-300 focus:ring-red-400' : 'border-gray-200 focus:ring-purple-400'
                  }`}
                />
                <p className="text-xs text-gray-400 mt-1">% of leads to auto-assign</p>
              </div>
            )}
          </div>

          {/* Role Info Banner */}
          {(formData.role === 'AUDITOR' || formData.role === 'PC') && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
              <AlertCircle size={14} className="text-amber-600 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700">
                <strong>{ROLE_LABELS[formData.role]}</strong> has <strong>read-only access</strong>.
                They can view all leads but cannot update, create, or reassign.
              </p>
            </div>
          )}

          {/* 🆕 ACTIVE TOGGLE — Fixed with inline styles */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex-1 min-w-0 pr-4">
              <p className="text-sm font-semibold text-gray-800">Active Status</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {formData.is_active
                  ? '✅ User can log in and use the system'
                  : '🚫 User is blocked from logging in'}
              </p>
            </div>

            <button
              type="button"
              onClick={handleToggleActive}
              style={{
                position: 'relative',
                display: 'inline-flex',
                height: '28px',
                width: '52px',
                alignItems: 'center',
                borderRadius: '9999px',
                transition: 'background-color 0.2s',
                backgroundColor: formData.is_active ? '#10b981' : '#d1d5db',
                cursor: 'pointer',
                border: 'none',
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  height: '22px',
                  width: '22px',
                  borderRadius: '9999px',
                  backgroundColor: 'white',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                  transition: 'transform 0.2s',
                  transform: formData.is_active ? 'translateX(27px)' : 'translateX(3px)',
                }}
              />
            </button>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 flex-shrink-0 bg-white">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-semibold hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-md"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                {isEdit ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <Save size={16} />
                {isEdit ? 'Update User' : 'Create User'}
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default UserFormModal;