// frontend/src/components/common/Sidebar.jsx
import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, UserCheck, Calendar, MapPin,
  MessageSquare, Handshake, Users, Building2,
  CalendarDays, BarChart3, ChevronLeft, ChevronRight, TrendingUp, Eye,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['ADMIN', 'BDM', 'ADVISOR', 'PC', 'AUDITOR'] },

  { section: 'LEAD PIPELINE', roles: ['ADMIN', 'BDM', 'ADVISOR'] },
  { label: 'Qualification', icon: UserCheck, path: '/qualification', roles: ['ADMIN', 'BDM'], badge: 'qual' },
  { label: 'Visit Scheduling', icon: Calendar, path: '/site-visit-scheduling', roles: ['ADMIN', 'BDM'], badge: 'scheduling' },
  { label: 'Field Visits', icon: MapPin, path: '/site-visit-execution', roles: ['ADMIN', 'BDM', 'ADVISOR'], badge: 'execution' },
  { label: 'Post Visit', icon: MessageSquare, path: '/post-visit', roles: ['ADMIN', 'ADVISOR'], badge: 'postvisit' },
  { label: 'Deal', icon: Handshake, path: '/deal', roles: ['ADMIN', 'ADVISOR'], badge: 'deal' },

  { section: 'AUDIT', roles: ['ADMIN', 'PC', 'AUDITOR'] },
  { label: 'All Leads', icon: Eye, path: '/audit/leads', roles: ['ADMIN', 'PC', 'AUDITOR'] },
  { label: 'Activity Tracker', icon: BarChart3, path: '/admin/activity-tracker', roles: ['ADMIN', 'PC', 'AUDITOR'] },

  { section: 'ADMIN', roles: ['ADMIN'] },
  { label: 'Users', icon: Users, path: '/admin/users', roles: ['ADMIN'] },
  { label: 'Projects', icon: Building2, path: '/admin/projects', roles: ['ADMIN'] },
  { label: 'Holidays', icon: CalendarDays, path: '/admin/holidays', roles: ['ADMIN'] },
  { label: 'Reports', icon: BarChart3, path: '/admin/reports', roles: ['ADMIN'] },
];

const Sidebar = ({ stats = {} }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const hasAccess = (roles) => roles.includes(user?.role);

  const getBadgeCount = (badge) => {
    if (!stats) return null;
    const map = {
      qual: stats.qualification,
      scheduling: stats.site_visit_scheduling,
      execution: stats.site_visit_execution,
      postvisit: stats.post_visit,
      deal: stats.deal,
    };
    return map[badge] || null;
  };

  return (
    <div
      className={`
        relative flex flex-col bg-gray-900 text-white transition-all duration-300 ease-in-out
        ${collapsed ? 'w-20' : 'w-72'}
        min-h-screen flex-shrink-0
      `}
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-5 border-b border-gray-700">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <TrendingUp size={20} className="text-white" />
            </div>
            <div>
              <p className="text-base font-bold text-white">VRN CRM</p>
              <p className="text-xs text-gray-400">Sales Management</p>
            </div>
          </div>
        )}

        {collapsed && (
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto shadow-lg">
            <TrendingUp size={20} className="text-white" />
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`
            p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors
            ${collapsed ? 'absolute -right-3 top-7 bg-gray-900 border border-gray-700 shadow-lg' : ''}
          `}
          type="button"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto scrollbar-thin">
        {NAV_ITEMS.map((item, index) => {
          if (item.section) {
            if (!hasAccess(item.roles)) return null;
            if (collapsed) return <div key={index} className="my-3 mx-4 border-t border-gray-700" />;
            return (
              <div key={index} className="px-5 pt-5 pb-2">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  {item.section}
                </p>
              </div>
            );
          }

          if (!hasAccess(item.roles)) return null;

          const Icon = item.icon;
          const badgeCount = item.badge ? getBadgeCount(item.badge) : null;
          const isActive =
            location.pathname === item.path || location.pathname.startsWith(item.path + '/');

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-3 px-4 py-3 mx-3 my-0.5 rounded-xl
                transition-all duration-150 group relative
                ${isActive
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }
                ${collapsed ? 'justify-center px-3' : ''}
              `}
              title={collapsed ? item.label : ''}
            >
              <Icon size={20} className="flex-shrink-0" />
              {!collapsed && (
                <>
                  <span className="text-[15px] font-medium flex-1">{item.label}</span>
                  {badgeCount > 0 && (
                    <span
                      className={`
                        text-xs font-bold px-2 py-0.5 rounded-full min-w-[24px] text-center
                        ${isActive ? 'bg-white/20 text-white' : 'bg-purple-500 text-white'}
                      `}
                    >
                      {badgeCount > 99 ? '99+' : badgeCount}
                    </span>
                  )}
                </>
              )}

              {collapsed && (
                <div
                  className="absolute left-full ml-3 px-3 py-1.5 bg-gray-800 text-white text-sm rounded-lg
                             opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-lg"
                >
                  {item.label}
                  {badgeCount > 0 && ` (${badgeCount})`}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Info Bottom */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-800 transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md">
              <span className="text-sm font-bold text-white">
                {user?.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-400">
                {user?.role} · {user?.display_code}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;