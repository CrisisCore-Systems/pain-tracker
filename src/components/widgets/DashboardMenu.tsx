import React from 'react';

export type DashboardTab = 'overview' | 'charts' | 'recent';

export function DashboardMenu({ active, onChange }: { active: DashboardTab; onChange: (t: DashboardTab) => void }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex space-x-2">
        <button onClick={() => onChange('overview')} className={`px-3 py-1 rounded ${active === 'overview' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>Overview</button>
        <button onClick={() => onChange('charts')} className={`px-3 py-1 rounded ${active === 'charts' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>Charts</button>
        <button onClick={() => onChange('recent')} className={`px-3 py-1 rounded ${active === 'recent' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>Recent</button>
      </div>
    </div>
  );
}

export default DashboardMenu;
