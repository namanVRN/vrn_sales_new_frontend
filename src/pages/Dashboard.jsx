// frontend/src/pages/Dashboard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  UserCheck, Calendar, MapPin, MessageSquare,
  Handshake, Users, Building2, CalendarDays, BarChart3,
  TrendingUp, AlertCircle, Snowflake, Clock, ArrowRight
} from 'lucide-react';

// ═══════════════════════════════════════════
// ROLE-BASED MODULES
// ═══════════════════════════════════════════
const ROLE_MODULES = {
  ADMIN: [
    { key: 'qualification', label: 'Qualification', description: 'Manage lead qualification', path: '/qualification', icon: UserCheck, color: 'from-purple-500 to-purple-600' },
    { key: 'site_visit_scheduling', label: 'Visit Scheduling', description: 'Schedule site visits', path: '/site-visit-scheduling', icon: Calendar, color: 'from-indigo-500 to-indigo-600' },
    { key: 'site_visit_execution', label: 'Field Visits', description: 'Site visits & unreached calls', path: '/site-visit-execution', icon: MapPin, color: 'from-blue-500 to-blue-600' },
    { key: 'post_visit', label: 'Post Visit', description: 'Post-visit follow-up', path: '/post-visit', icon: MessageSquare, color: 'from-orange-500 to-orange-600' },
    { key: 'deal', label: 'Deals', description: 'Manage deal closure', path: '/deal', icon: Handshake, color: 'from-green-500 to-green-600' },
    { key: 'users', label: 'Users', description: 'Manage system users', path: '/admin/users', icon: Users, color: 'from-red-500 to-red-600' },
    { key: 'projects', label: 'Projects', description: 'Manage projects', path: '/admin/projects', icon: Building2, color: 'from-pink-500 to-pink-600' },
    { key: 'holidays', label: 'Holidays', description: 'Manage working days', path: '/admin/holidays', icon: CalendarDays, color: 'from-cyan-500 to-cyan-600' },
    { key: 'reports', label: 'Reports', description: 'View analytics', path: '/admin/reports', icon: BarChart3, color: 'from-teal-500 to-teal-600' },
  ],
  BDM: [
    { key: 'qualification', label: 'Qualification', description: 'Qualify new leads', path: '/qualification', icon: UserCheck, color: 'from-purple-500 to-purple-600' },
    { key: 'site_visit_scheduling', label: 'Visit Scheduling', description: 'Schedule site visits', path: '/site-visit-scheduling', icon: Calendar, color: 'from-indigo-500 to-indigo-600' },
    { key: 'site_visit_execution', label: 'Field Visits', description: 'Scheduled visits & missed calls', path: '/site-visit-execution', icon: MapPin, color: 'from-blue-500 to-blue-600' },
  ],
  ADVISOR: [
    { key: 'site_visit_execution', label: 'Field Visits', description: 'Claim & complete visits', path: '/site-visit-execution', icon: MapPin, color: 'from-blue-500 to-blue-600' },
    { key: 'post_visit', label: 'Post Visit', description: 'Post-visit follow-up', path: '/post-visit', icon: MessageSquare, color: 'from-orange-500 to-orange-600' },
    { key: 'deal', label: 'Deals', description: 'Close deals', path: '/deal', icon: Handshake, color: 'from-green-500 to-green-600' },
  ],
};

const ROLE_LABELS = {
  ADMIN: 'Administrator',
  BDM: 'Business Development Manager',
  ADVISOR: 'Field Sales Representative',
};

// ═══════════════════════════════════════════
// STAT CARD
// ═══════════════════════════════════════════
const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all">
    <div className="flex items-center justify-between mb-2">
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon size={18} className="text-white" />
      </div>
      <span className="text-2xl font-bold text-gray-900">{value ?? 0}</span>
    </div>
    <p className="text-sm text-gray-600">{label}</p>
  </div>
);

// ═══════════════════════════════════════════
// MODULE CARD
// ═══════════════════════════════════════════
const ModuleCard = ({ module, onClick }) => {
  const Icon = module.icon;
  return (
    <button
      onClick={onClick}
      className="group bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-200 text-left hover:-translate-y-0.5 w-full"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${module.color} text-white shadow-md`}>
          <Icon size={22} />
        </div>
        <ArrowRight
          size={18}
          className="text-gray-300 group-hover:text-gray-500 group-hover:translate-x-1 transition-all"
        />
      </div>
      <h3 className="text-base font-semibold text-gray-900 mb-1">{module.label}</h3>
      <p className="text-xs text-gray-500">{module.description}</p>
    </button>
  );
};

// ═══════════════════════════════════════════
// MAIN DASHBOARD COMPONENT
// ═══════════════════════════════════════════
const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const modules = ROLE_MODULES[user?.role] || [];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    // 🆕 No <Layout> wrapper here — AppRoutes handles it
    <div className="space-y-6">

      {/* ── Welcome Card ── */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-100 text-sm">{getGreeting()},</p>
            <h1 className="text-2xl font-bold mt-1">{user?.name} 👋</h1>
            <p className="text-purple-100 text-sm mt-1">
              {ROLE_LABELS[user?.role]} · {user?.display_code || user?.email}
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-20 h-20 rounded-full bg-white bg-opacity-20 flex items-center justify-center backdrop-blur-sm">
              <TrendingUp size={40} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick Stats ── */}
      <div>
        <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">
          Overview
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Leads" value={0} icon={Users} color="bg-purple-500" />
          <StatCard label="Today's Followups" value={0} icon={Clock} color="bg-blue-500" />
          <StatCard label="Overdue" value={0} icon={AlertCircle} color="bg-red-500" />
          <StatCard label="Cold Leads" value={0} icon={Snowflake} color="bg-cyan-500" />
        </div>
      </div>

      {/* ── Modules ── */}
      <div>
        <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">
          Your Modules
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {modules.map((module) => (
            <ModuleCard
              key={module.key}
              module={module}
              onClick={() => navigate(module.path)}
            />
          ))}
        </div>
      </div>

      {/* Empty state */}
      {modules.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <p className="text-gray-500">No modules assigned to your role.</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;