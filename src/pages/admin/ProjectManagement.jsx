// frontend/src/pages/admin/ProjectManagement.jsx
import React from 'react';
import Layout from '../../components/common/Layout';
import { Building2 } from 'lucide-react';

const ProjectManagement = () => {
  return (
    <Layout pageTitle="Project Management" pageSubtitle="Manage real estate projects">
      <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
        <Building2 size={48} className="text-purple-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Project Management</h3>
        <p className="text-gray-500">Coming soon... 🚧</p>
      </div>
    </Layout>
  );
};

export default ProjectManagement;