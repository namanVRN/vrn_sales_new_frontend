// frontend/src/pages/siteVisit/SiteVisitExecution.jsx
import React, { useState } from 'react';
import { MapPin, PhoneOff, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ScheduledVisitsTab from './ScheduledVisitsTab';
import CallNotPickedTab from './CallNotPickedTab';

const SiteVisitExecution = () => {
  const { isAdmin, isBDM } = useAuth();
  const [activeTab, setActiveTab] = useState('scheduled');

  // Only BDM and Admin can see CNP tab
  const canViewCNP = isAdmin || isBDM;

  const tabs = [
    {
      key: 'scheduled',
      label: 'Scheduled Visits',
      icon: Calendar,
      visible: true,
    },
    {
      key: 'cnp',
      label: 'Call Not Picked',
      icon: PhoneOff,
      visible: canViewCNP,
    },
  ].filter(tab => tab.visible);

  return (
    // 🆕 No <Layout> wrapper — AppRoutes handles it
    <div className="flex flex-col gap-4 p-4 md:p-6">

      {/* ── Page Header ── */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <div className="bg-blue-100 p-2 rounded-xl">
            <MapPin size={22} className="text-blue-600" />
          </div>
          Field Visits
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Stage 3 — Site Visit Execution
        </p>
      </div>

      {/* ── Tabs ── */}
      {tabs.length > 1 && (
        <div className="border-b border-gray-200">
          <div className="flex items-center gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`
                    flex items-center gap-2 px-4 py-3 text-sm font-medium
                    border-b-2 transition-all duration-150
                    ${isActive
                      ? 'text-blue-600 border-blue-600'
                      : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Tab Content ── */}
      {activeTab === 'scheduled' && <ScheduledVisitsTab />}
      {activeTab === 'cnp' && canViewCNP && <CallNotPickedTab />}
    </div>
  );
};

export default SiteVisitExecution;