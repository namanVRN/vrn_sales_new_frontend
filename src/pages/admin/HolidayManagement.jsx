// frontend/src/pages/admin/HolidayManagement.jsx
import React from 'react';
import Layout from '../../components/common/Layout';
import { CalendarDays } from 'lucide-react';

const HolidayManagement = () => {
  return (
    <Layout pageTitle="Holiday Management" pageSubtitle="Manage working days and holidays">
      <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
        <CalendarDays size={48} className="text-purple-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Holiday Management</h3>
        <p className="text-gray-500">Coming soon... 🚧</p>
      </div>
    </Layout>
  );
};

export default HolidayManagement;