// frontend/src/components/common/Layout.jsx
import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children, pageTitle, pageSubtitle, stats }) => {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar stats={stats} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header pageTitle={pageTitle} pageSubtitle={pageSubtitle} />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;