// frontend/src/components/common/OverdueAlert.jsx
import React, { useState } from 'react';
import { AlertTriangle, X, Eye } from 'lucide-react';

const OverdueAlert = ({ overdueCount = 0, todayCount = 0, onViewOverdue }) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible || overdueCount === 0) return null;

  return (
    <div className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl shadow-lg mb-4 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <AlertTriangle size={18} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold">
              ⚠️ {overdueCount} overdue follow-up{overdueCount !== 1 ? 's' : ''}!
              {todayCount > 0 && (
                <span className="ml-2 opacity-90">({todayCount} total today)</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onViewOverdue}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg text-xs font-medium transition-colors backdrop-blur-sm"
          >
            <Eye size={12} />
            View
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1.5 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OverdueAlert;