import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  Edit3,
  Power,
  Trash2,
  RefreshCw,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { projectApi } from '../../api/projectApi.js';
import { PageLoader } from '../../components/common/LoadingSpinner.jsx';
import ConfirmModal from '../../components/modals/ConfirmModal.jsx';
import ProjectFormModal from '../../components/modals/ProjectFormModal.jsx';

const ProjectManagement = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // '', 'true', 'false'

  // Modals
  const [formModal, setFormModal] = useState({ open: false, project: null });
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    project: null,
    action: null,
    title: '',
    message: '',
  });

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter !== '') params.is_active = statusFilter;

      const res = await projectApi.getAll(params);

      // backend may return {data:{projects}} or {projects}
      const list = res?.data?.data?.projects ?? res?.data?.projects ?? res?.data?.data ?? [];
      setProjects(Array.isArray(list) ? list : []);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load projects');
      setProjects([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProjects();
  };

  const handleCreate = () => setFormModal({ open: true, project: null });
  const handleEdit = (project) => setFormModal({ open: true, project });

  const handleToggle = (project) => {
    setConfirmModal({
      open: true,
      project,
      action: 'toggle',
      title: project.is_active ? 'Deactivate Project?' : 'Activate Project?',
      message: project.is_active
        ? `${project.name} will be hidden from dropdowns.`
        : `${project.name} will be available in dropdowns.`,
    });
  };

  const handleDelete = (project) => {
    setConfirmModal({
      open: true,
      project,
      action: 'delete',
      title: 'Delete Project?',
      message: `Are you sure you want to permanently delete ${project.name}? This cannot be undone.`,
    });
  };

  const executeConfirm = async () => {
    const { project, action } = confirmModal;
    if (!project?._id) return;

    try {
      if (action === 'toggle') {
        await projectApi.toggle(project._id);
        toast.success(`Project ${project.is_active ? 'deactivated' : 'activated'}`);
      }

      if (action === 'delete') {
        await projectApi.delete(project._id);
        toast.success('Project deleted');
      }

      setConfirmModal({ open: false, project: null, action: null, title: '', message: '' });
      fetchProjects();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Operation failed');
    }
  };

  const handleFormSuccess = () => {
    setFormModal({ open: false, project: null });
    fetchProjects();
  };

  // Stats
  const stats = useMemo(() => {
    const total = projects.length;
    const active = projects.filter(p => p.is_active).length;
    const inactive = total - active;

    return { total, active, inactive };
  }, [projects]);

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="bg-purple-100 p-2.5 rounded-xl">
              <Building2 size={24} className="text-purple-600" />
            </div>
            Project Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage real estate projects (shown in lead dropdowns)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-colors border border-gray-200 hover:border-purple-200"
            type="button"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>

          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-semibold rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md"
            type="button"
          >
            <Plus size={18} />
            Add Project
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Building2 size={18} className="text-purple-600" />
            </div>
            <span className="text-2xl font-bold text-purple-600">{stats.total}</span>
          </div>
          <p className="text-sm text-gray-600 font-medium">Total Projects</p>
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
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              name="project_search"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by project name or code..."
              className="w-full pl-11 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-gray-50"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white min-w-[180px]"
          >
            <option value="">All Status</option>
            <option value="true">Active Only</option>
            <option value="false">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700">Projects</span>
            <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {projects.length}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <PageLoader />
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20">
            <Building2 size={56} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No projects found</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting filters or add a new project</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left py-4 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Project</th>
                  <th className="text-left py-4 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Code</th>
                  <th className="text-left py-4 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="text-left py-4 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="text-left py-4 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-center py-4 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {projects.map((p) => (
                  <tr key={p._id} className={`hover:bg-gray-50 transition-colors ${!p.is_active ? 'opacity-60' : ''}`}>
                    <td className="py-4 px-5">
                      <div className="font-semibold text-gray-900">{p.name}</div>
                      {p.description ? (
                        <div className="text-xs text-gray-500 line-clamp-1">{p.description}</div>
                      ) : (
                        <div className="text-xs text-gray-400">—</div>
                      )}
                    </td>

                    <td className="py-4 px-5">
                      <span className="text-sm font-mono text-gray-700">{p.code || '—'}</span>
                    </td>

                    <td className="py-4 px-5">
                      <span className="text-sm text-gray-700">{p.project_type || '—'}</span>
                    </td>

                    <td className="py-4 px-5">
                      <span className="text-sm text-gray-700">{p.location || '—'}</span>
                    </td>

                    <td className="py-4 px-5">
                      {p.is_active ? (
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

                    <td className="py-4 px-5">
                      <div className="flex items-center gap-1 justify-center">
                        <button
                          onClick={() => handleEdit(p)}
                          title="Edit project"
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          type="button"
                        >
                          <Edit3 size={15} />
                        </button>

                        <button
                          onClick={() => handleToggle(p)}
                          title={p.is_active ? 'Deactivate' : 'Activate'}
                          className={`p-2 rounded-lg transition-colors ${
                            p.is_active
                              ? 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                              : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
                          }`}
                          type="button"
                        >
                          <Power size={15} />
                        </button>

                        <button
                          onClick={() => handleDelete(p)}
                          title="Delete project"
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          type="button"
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

      {/* Modals */}
      {formModal.open && (
        <ProjectFormModal
          isOpen={formModal.open}
          project={formModal.project}
          onClose={() => setFormModal({ open: false, project: null })}
          onSuccess={handleFormSuccess}
        />
      )}

      {confirmModal.open && (
        <ConfirmModal
          isOpen={confirmModal.open}
          title={confirmModal.title}
          message={confirmModal.message}
          onConfirm={executeConfirm}
          onCancel={() => setConfirmModal({ open: false, project: null, action: null, title: '', message: '' })}
          confirmText={confirmModal.action === 'delete' ? 'Delete' : 'Confirm'}
          confirmColor={confirmModal.action === 'delete' ? 'red' : 'purple'}
        />
      )}
    </div>
  );
};

export default ProjectManagement;