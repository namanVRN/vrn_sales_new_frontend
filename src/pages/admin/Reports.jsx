// frontend/src/pages/admin/Reports.jsx
import React from 'react';
import Layout from '../../components/common/Layout';
import { BarChart3 } from 'lucide-react';

const Reports = () => {
  return (
    <Layout 
      pageTitle="Reports & Analytics" 
      pageSubtitle="View sales performance and lead insights"
    >
      <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
        <BarChart3 size={48} className="text-purple-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Reports & Analytics
        </h3>
        <p className="text-gray-500">Coming soon... 🚧</p>
      </div>
    </Layout>
  );
};

export default Reports;