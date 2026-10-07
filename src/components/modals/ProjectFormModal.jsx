import { useEffect, useState } from 'react';
import { X, Building2, Save, Loader2, MapPin, Hash, Tag, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { projectApi } from '../../api/projectApi.js';

const PROJECT_TYPES = [
  { label: 'Residential', value: 'RESIDENTIAL' },
  { label: 'Commercial', value: 'COMMERCIAL' },
  { label: 'Plot', value: 'PLOT' },
  { label: 'Villa', value: 'VILLA' },
  { label: 'Other', value: 'OTHER' },
];

const ProjectFormModal = ({ isOpen, project = null, onClose, onSuccess }) => {
  const isEdit = Boolean(project?._id);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [projectType, setProjectType] = useState('RESIDENTIAL');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setName(project?.name || '');
    setCode(project?.code || '');
    setProjectType(project?.project_type || 'RESIDENTIAL');
    setLocation(project?.location || '');
    setDescription(project?.description || '');
    setIsActive(project?.is_active ?? true);
  }, [isOpen, project]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) return toast.error('Project name is required');
    if (!code.trim()) return toast.error('Project code is required');

    const payload = {
      name: name.trim(),
      code: code.trim(),
      project_type: projectType,
      location: location.trim(),
      description: description.trim(),
      is_active: isActive,
    };

    setLoading(true);
    try {
      if (isEdit) {
        await projectApi.update(project._id, payload);
        toast.success('Project updated');
      } else {
        await projectApi.create(payload);
        toast.success('Project created');
      }
      onSuccess?.();
      onClose?.();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/15 rounded-xl p-2.5">
                  <Building2 size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg">
                    {isEdit ? 'Edit Project' : 'Create New Project'}
                  </h2>
                  <p className="text-indigo-100 text-sm">
                    {isEdit ? `Update ${project?.name}` : 'Add a new project to the system'}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
                type="button"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Body */}
          <form autoComplete="off" onSubmit={handleSubmit}>
            <div className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Project Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="project_name"
                    autoComplete="off"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ultimate Heights"
                    className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
                  />
                </div>
              </div>

              {/* Code */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Project Code <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="project_code"
                    autoComplete="off"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. UH"
                    className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
                  />
                </div>
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Project Type
                </label>
                <div className="relative">
                  <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
                  >
                    {PROJECT_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Location
                </label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="project_location"
                    autoComplete="off"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Bhopal"
                    className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <div className="relative">
                  <FileText size={16} className="absolute left-3 top-3 text-gray-400" />
                  <textarea
                    name="project_description"
                    autoComplete="off"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="Optional notes..."
                    className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
                  />
                </div>
              </div>

              {/* Active */}
              <div className="flex items-center justify-between border border-gray-200 rounded-xl p-3">
                <div>
                  <p className="text-sm font-semibold text-gray-800">Active Status</p>
                  <p className="text-xs text-gray-500">Inactive projects won’t appear in dropdowns.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsActive((v) => !v)}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                    isActive ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                  aria-label="toggle active"
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                      isActive ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
                type="button"
              >
                Cancel
              </button>

              <button
                disabled={loading}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-semibold hover:from-purple-700 hover:to-indigo-700 disabled:opacity-60 transition-all flex items-center justify-center gap-2 shadow-md"
                type="submit"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    {isEdit ? 'Update Project' : 'Create Project'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProjectFormModal;