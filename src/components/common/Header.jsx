// frontend/src/components/common/Header.jsx
import React from 'react';
import { LogOut, Bell, ExternalLink, PlusCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Header = ({ pageTitle, pageSubtitle }) => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-gray-100 px-8 py-4 flex-shrink-0 shadow-sm">
      <div className="flex items-center justify-between">

        {/* Page Title */}
        <div>
          {pageTitle && (
            <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
          )}
          {pageSubtitle && (
            <p className="text-sm text-gray-500 mt-1">{pageSubtitle}</p>
          )}
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-3">

          {/* 🆕 Public Enquiry Form Link */}
          <a
            href="/enquiry"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 border border-purple-200 hover:border-purple-300 text-purple-700 hover:text-purple-800 rounded-xl transition-all text-sm font-semibold group"
            title="Open public enquiry form in new tab"
          >
            <PlusCircle size={16} />
            <span className="hidden lg:inline">Enquiry Form</span>
            <ExternalLink size={13} className="opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
          </a>

          {/* Notifications */}
          <button className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors relative">
            <Bell size={20} className="text-gray-600" />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white"></span>
          </button>

          {/* User Info */}
          <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-md">
              <span className="text-sm font-bold text-white">
                {user?.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-semibold text-gray-800 leading-tight">{user?.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{user?.role}</p>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className="p-2.5 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors text-gray-600 border border-gray-200 hover:border-red-200"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;