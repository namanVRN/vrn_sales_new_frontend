import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/common/Header';
import { 
  ClipboardCheck, PhoneOutgoing, MapPin, PhoneOff, 
  MessageSquare, Rocket, Users, Building2, Calendar, BarChart3
} from 'lucide-react';
import { ROLE_MODULES } from '../utils/constants';

const MODULES = {
  QUALIFICATION: {
    title: 'Lead Qualified Form',
    subtitle: 'View and manage lead qualification dashboard',
    icon: ClipboardCheck,
    gradient: 'from-emerald-500 to-teal-600',
    badge: null,
    path: '/qualification',
  },
  SITE_VISIT_SCHEDULING: {
    title: 'Step 1: Follow-ups',
    subtitle: 'Initial follow-up with qualified leads',
    icon: PhoneOutgoing,
    gradient: 'from-violet-500 to-purple-600',
    badge: 'STEP 1',
    path: '/site-visit-scheduling',
  },
  FIELD_VISIT: {
    title: 'Field Visit',
    subtitle: 'Schedule & track visits',
    icon: MapPin,
    gradient: 'from-pink-500 to-rose-600',
    badge: 'STEP 2',
    path: '/field-visit',
  },
  CNP: {
    title: 'Call Not Picked',
    subtitle: 'Leads not responding',
    icon: PhoneOff,
    gradient: 'from-cyan-500 to-teal-600',
    badge: 'STEP 2',
    path: '/cnp',
  },
  POST_VISIT: {
    title: 'Step 3: Follow-up',
    subtitle: 'Post field visit follow-up activities',
    icon: MessageSquare,
    gradient: 'from-orange-500 to-amber-600',
    badge: 'STEP 3',
    path: '/post-visit',
  },
  DEAL: {
    title: 'Step 4: Meeting',
    subtitle: 'Schedule and manage meetings with leads',
    icon: Rocket,
    gradient: 'from-blue-500 to-indigo-600',
    badge: 'STEP 4',
    path: '/deal',
  },
  USERS: {
    title: 'User Management',
    subtitle: 'Manage BDMs, FSRs and Admins',
    icon: Users,
    gradient: 'from-slate-500 to-gray-600',
    badge: 'ADMIN',
    path: '/admin/users',
  },
  PROJECTS: {
    title: 'Projects',
    subtitle: 'Manage active projects',
    icon: Building2,
    gradient: 'from-indigo-500 to-purple-600',
    badge: 'ADMIN',
    path: '/admin/projects',
  },
  HOLIDAYS: {
    title: 'Holidays',
    subtitle: 'Manage holiday calendar',
    icon: Calendar,
    gradient: 'from-red-500 to-rose-600',
    badge: 'ADMIN',
    path: '/admin/holidays',
  },
  REPORTS: {
    title: 'Reports',
    subtitle: 'Analytics and reports',
    icon: BarChart3,
    gradient: 'from-teal-500 to-cyan-600',
    badge: 'ADMIN',
    path: '/admin/reports',
  },
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const allowedModules = ROLE_MODULES[user?.role] || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm">
            <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-lg font-medium">
              Home
            </span>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600">Dashboard</span>
          </div>
        </div>

        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">
            Welcome back, {user?.name}!
          </h2>
          <p className="text-gray-500 mt-1">
            Manage your leads and track progress across all stages.
          </p>
        </div>

        {/* Module cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allowedModules.map((moduleKey) => {
            const module = MODULES[moduleKey];
            if (!module) return null;

            const Icon = module.icon;

            return (
              <div
                key={moduleKey}
                className="relative bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-xl transition-all cursor-pointer group animate-fade-in"
                onClick={() => navigate(module.path)}
              >
                {/* Badge */}
                {module.badge && (
                  <span className="absolute top-4 right-4 px-2 py-1 text-xs font-semibold rounded-full bg-primary-100 text-primary-700">
                    {module.badge}
                  </span>
                )}

                {/* Icon */}
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${module.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  {module.title}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {module.subtitle}
                </p>

                {/* Action button */}
                <button
                  className={`w-full py-2 rounded-lg bg-gradient-to-r ${module.gradient} text-white font-medium hover:opacity-90 transition-opacity`}
                >
                  View →
                </button>
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {allowedModules.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl">
            <p className="text-gray-500">No modules assigned to your role.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;