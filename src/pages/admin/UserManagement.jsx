// frontend/src/pages/admin/UserManagement.jsx
import { useState, useEffect, useCallback } from 'react';
import {
  Users, Plus, Search, Edit3, Key, Power, Trash2,
  RefreshCw, Shield, User as UserIcon, Phone, Mail,
  CheckCircle, XCircle, Filter
} from 'lucide-react';
import toast from 'react-hot-toast';
import { userApi } from '../../api/userApi.js';
import { ROLES, ROLE_LABELS, ROLE_COLORS } from '../../utils/constants.js';
import { PageLoader } from '../../components/common/LoadingSpinner.jsx';
import UserFormModal from '../../components/modals/UserFormModal.jsx';
import ResetPasswordModal from '../../components/modals/ResetPasswordModal.jsx';
import ConfirmModal from '../../components/modals/ConfirmModal.jsx';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [formModal, setFormModal] = useState({ open: false, user: null });
  const [passwordModal, setPasswordModal] = useState({ open: false, user: null });
  const [confirmModal, setConfirmModal] = useState({
    open: false, user: null, action: null, title: '', message: ''
  });

  // ── Fetch Users ──────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.is_active = statusFilter;

      const res = await userApi.getAll(params);
      const list = res?.data?.data?.users || res?.data?.users || [];
      setUsers(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Fetch users error:', err);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, roleFilter, statusFilter]);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ── Handlers ──────────────────────────
  const handleRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const handleCreate = () => {
    setFormModal({ open: true, user: null });
  };

  const handleEdit = (user) => {
    setFormModal({ open: true, user });
  };

  const handleResetPassword = (user) => {
    setPasswordModal({ open: true, user });
  };

  const handleToggleStatus = (user) => {
    setConfirmModal({
      open: true,
      user,
      action: 'toggle',
      title: user.is_active ? 'Deactivate User?' : 'Activate User?',
      message: user.is_active
        ? `${user.name} will no longer be able to log in.`
        : `${user.name} will regain access to the system.`,
    });
  };

  const handleDelete = (user) => {
    setConfirmModal({
      open: true,
      user,
      action: 'delete',
      title: 'Delete User?',
      message: `Are you sure you want to permanently delete ${user.name}? This cannot be undone.`,
    });
  };

  const executeConfirm = async () => {
    const { user, action } = confirmModal;
    try {
      if (action === 'toggle') {
        await userApi.toggleStatus(user._id);
        toast.success(`User ${user.is_active ? 'deactivated' : 'activated'}`);
      } else if (action === 'delete') {
        await userApi.delete(user._id);
        toast.success('User deleted successfully');
      }
      setConfirmModal({ open: false, user: null, action: null, title: '', message: '' });
      fetchUsers();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Operation failed';
      toast.error(msg);
    }
  };

  const handleFormSuccess = () => {
    setFormModal({ open: false, user: null });
    fetchUsers();
  };

  const handlePasswordSuccess = () => {
    setPasswordModal({ open: false, user: null });
  };

  // ── Stats ──────────────────────────
  const stats = {
    total: users.length,
    active: users.filter(u => u.is_active).length,
    inactive: users.filter(u => !u.is_active).length,
    byRole: users.reduce((acc, u) => {
      acc[u.role] = (acc[u.role] || 0) + 1;
      return acc;
    }, {}),
  };

  return (
    <div className="flex flex-col gap-5">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="bg-purple-100 p-2.5 rounded-xl">
              <Users size={24} className="text-purple-600" />
            </div>
            User Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage system users, roles, and permissions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-colors border border-gray-200 hover:border-purple-200"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-semibold rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md"
          >
            <Plus size={18} />
            Add User
          </button>
        </div>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Users size={18} className="text-purple-600" />
            </div>
            <span className="text-2xl font-bold text-purple-600">{stats.total}</span>
          </div>
          <p className="text-sm text-gray-600 font-medium">Total Users</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-green-100 p-2 rounded-lg">
              <CheckCircle size={18} className="text-green-600" />
            </div>
            <span className="text-2xl font-bold text-green-600">{stats.active}</span>
          </div>
          <p className="text-sm text-gray-600 font-medium">Active</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-red-100 p-2 rounded-lg">
              <XCircle size={18} className="text-red-600" />
            </div>
            <span className="text-2xl font-bold text-red-600">{stats.inactive}</span>
          </div>
          <p className="text-sm text-gray-600 font-medium">Inactive</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Shield size={18} className="text-blue-600" />
            </div>
            <div className="flex flex-wrap gap-1 justify-end">
              {Object.entries(stats.byRole).slice(0, 3).map(([role, count]) => (
                <span key={role} className="text-xs bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded font-semibold">
                  {role}: {count}
                </span>
              ))}
            </div>
          </div>
          <p className="text-sm text-gray-600 font-medium">By Role</p>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search by name, email, or display code..."
              className="w-full pl-11 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-gray-50"
            />
          </div>

          {/* Role filter */}
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white min-w-[160px]"
          >
            <option value="">All Roles</option>
            {Object.entries(ROLES).map(([key]) => (
              <option key={key} value={key}>{ROLE_LABELS[key]}</option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white min-w-[140px]"
          >
            <option value="">All Status</option>
            <option value="true">Active Only</option>
            <option value="false">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* ── Users Table ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700">Users</span>
            <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {users.length}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <PageLoader />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-20">
            <Users size={56} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No users found</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your filters or add a new user</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left py-4 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                  <th className="text-left py-4 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="text-left py-4 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="text-left py-4 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Assignment %</th>
                  <th className="text-left py-4 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left py-4 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Last Login</th>
                  <th className="text-center py-4 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map(user => (
                  <tr key={user._id} className={`hover:bg-gray-50 transition-colors ${!user.is_active ? 'opacity-60' : ''}`}>

                    {/* User */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-sm">
                          <span className="text-sm font-bold text-white">
                            {user.name?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500 font-mono">{user.display_code || '—'}</p>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="py-4 px-5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-sm text-gray-700">
                          <Mail size={12} className="text-gray-400" />
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <Phone size={11} className="text-gray-400" />
                            {user.phone}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-4 px-5">
                      <span className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full border ${ROLE_COLORS[user.role] || 'bg-gray-100 text-gray-700'}`}>
                        <Shield size={11} />
                        {user.role}
                      </span>
                    </td>

                    {/* Assignment % (BDM only) */}
                    <td className="py-4 px-5">
                      {user.role === 'BDM' ? (
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-purple-500 h-2 rounded-full"
                              style={{ width: `${user.assignment_percentage || 0}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-gray-700 min-w-[35px]">
                            {user.assignment_percentage || 0}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">N/A</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-5">
                      {user.is_active ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-3 py-1 rounded-full">
                          <CheckCircle size={11} />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-100 px-3 py-1 rounded-full">
                          <XCircle size={11} />
                          Inactive
                        </span>
                      )}
                    </td>

                    {/* Last Login */}
                    <td className="py-4 px-5">
                      <span className="text-sm text-gray-600">
                        {user.last_login
                          ? new Date(user.last_login).toLocaleDateString('en-GB', {
                              day: '2-digit', month: 'short', year: 'numeric'
                            })
                          : <span className="text-gray-400">Never</span>
                        }
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-1 justify-center">
                        <button
                          onClick={() => handleEdit(user)}
                          title="Edit user"
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => handleResetPassword(user)}
                          title="Reset password"
                          className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        >
                          <Key size={15} />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user)}
                          title={user.is_active ? 'Deactivate' : 'Activate'}
                          className={`p-2 rounded-lg transition-colors ${
                            user.is_active
                              ? 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                              : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
                          }`}
                        >
                          <Power size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          title="Delete user"
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {formModal.open && (
        <UserFormModal
          user={formModal.user}
          isOpen={formModal.open}
          onClose={() => setFormModal({ open: false, user: null })}
          onSuccess={handleFormSuccess}
        />
      )}

      {passwordModal.open && (
        <ResetPasswordModal
          user={passwordModal.user}
          isOpen={passwordModal.open}
          onClose={() => setPasswordModal({ open: false, user: null })}
          onSuccess={handlePasswordSuccess}
        />
      )}

      {confirmModal.open && (
        <ConfirmModal
          isOpen={confirmModal.open}
          title={confirmModal.title}
          message={confirmModal.message}
          onConfirm={executeConfirm}
          onCancel={() => setConfirmModal({ open: false, user: null, action: null, title: '', message: '' })}
          confirmText={confirmModal.action === 'delete' ? 'Delete' : 'Confirm'}
          confirmColor={confirmModal.action === 'delete' ? 'red' : 'purple'}
        />
      )}
    </div>
  );
};

export default UserManagement;