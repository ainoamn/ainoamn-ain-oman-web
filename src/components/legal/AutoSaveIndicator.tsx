import React from 'react';

interface AutoSaveIndicatorProps {
  saving: boolean;
  lastSaved: Date | null;
}

const AutoSaveIndicator: React.FC<AutoSaveIndicatorProps> = ({ saving, lastSaved }) => {
  return (
    <div className="flex items-center space-x-2 text-sm text-gray-500">
      {saving ? (
        <>
          <div className="w-3 h-3 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
          <span>جاري الحفظ...</span>
        </>
      ) : lastSaved ? (
        <>
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>تم الحفظ {lastSaved.toLocaleTimeString()}</span>
        </>
      ) : (
        <>
          <div className="w-2 h-2 bg-gray-400 rounded-full"></div> {/* تم تصحيح الخطأ هنا */}
          <span>لم يتم الحفظ بعد</span>
        </>
      )}
    </div>
  );
};

export default AutoSaveIndicator;