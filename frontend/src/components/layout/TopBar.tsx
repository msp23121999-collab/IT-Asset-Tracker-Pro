import React from 'react';

export const TopBar: React.FC = () => {
  return (
    <header className="h-12 border-b border-borderLight flex items-center justify-between px-6 bg-background text-textSecondary shrink-0">
      <div className="flex-1 flex justify-center text-sm font-medium">
        IT Asset Tracker v2.1 | Company Assets
      </div>
    </header>
  );
};
