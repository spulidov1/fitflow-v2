import React, { useEffect } from 'react';

const Toast = ({ message, type = 'success', onClose, duration = 3000, showUndo, onUndo }) => {
  useEffect(() => {
    if (!showUndo) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose, showUndo]);

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500'
  }[type] || 'bg-gray-500';

  const icon = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  }[type] || 'ℹ';

  return (
    <div className={`${bgColor} text-white px-6 py-4 rounded-button shadow-lg flex items-center justify-between gap-4 min-w-[300px] max-w-md animate-slide-up`}>
      <div className="flex items-center gap-3">
        <span className="text-xl font-bold">{icon}</span>
        <span className="font-medium">{message}</span>
      </div>
      <div className="flex items-center gap-2">
        {showUndo && onUndo && (
          <button
            onClick={onUndo}
            className="text-white hover:text-gray-200 font-semibold px-3 py-1 border border-white rounded transition-colors"
          >
            UNDO
          </button>
        )}
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200 text-xl font-bold"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default Toast;
