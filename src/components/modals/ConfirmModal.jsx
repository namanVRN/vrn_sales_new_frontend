// frontend/src/components/modals/ConfirmModal.jsx
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useState } from 'react';

const COLOR_STYLES = {
  red: {
    button: 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
    icon: 'text-red-600',
    iconBg: 'bg-red-100',
  },
  purple: {
    button: 'from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700',
    icon: 'text-purple-600',
    iconBg: 'bg-purple-100',
  },
  amber: {
    button: 'from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600',
    icon: 'text-amber-600',
    iconBg: 'bg-amber-100',
  },
};

const ConfirmModal = ({
  isOpen, title, message,
  onConfirm, onCancel,
  confirmText = 'Confirm', cancelText = 'Cancel',
  confirmColor = 'purple',
}) => {
  const [loading, setLoading] = useState(false);
  const styles = COLOR_STYLES[confirmColor] || COLOR_STYLES.purple;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">

          <div className="p-6 text-center">
            <div className={`w-16 h-16 rounded-full ${styles.iconBg} flex items-center justify-center mx-auto mb-4`}>
              <AlertTriangle size={30} className={styles.icon} />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">{title}</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
          </div>

          <div className="flex gap-2 px-6 pb-6">
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className={`flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r ${styles.button} text-white text-sm font-semibold disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-md`}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Processing...
                </>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;