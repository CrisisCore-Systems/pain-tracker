/**
 * Clinic Sidebar - Professional navigation optimized for clinical workflows
 */

import { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Stethoscope } from 'lucide-react';

interface NavItem {
  label: string;
  icon: LucideIcon;
  path: string;
  description: string;
  badge?: string | number;
}

interface ClinicUser {
  name: string;
  role: string;
  specialty?: string;
}

interface ClinicSidebarProps {
  items: NavItem[];
  currentPath: string;
  collapsed: boolean;
  onToggleCollapse: () => void;
  user: ClinicUser;
}

export function ClinicSidebar({ 
  items, 
  currentPath, 
  collapsed, 
  onToggleCollapse,
  user 
}: ClinicSidebarProps) {
  return (
    <aside 
      className={`
        bg-slate-900 text-slate-100 transition-all duration-300 flex flex-col
        ${collapsed ? 'w-20' : 'w-72'}
      `}
      aria-label="Clinic navigation"
    >
      {/* Clinic Branding */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
            <Stethoscope className="w-6 h-6 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-lg font-semibold">Clinic Portal</h1>
              <p className="text-xs text-slate-400">Pain Tracker Pro</p>
            </div>
          )}
        </div>
      </div>

      {/* User Info */}
      {!collapsed && (
        <div className="p-4 border-b border-slate-700 bg-slate-800/50">
          <div className="text-sm">
            <p className="font-medium text-slate-100">{user.name}</p>
            <p className="text-xs text-slate-400 capitalize">{user.role}</p>
            {user.specialty && (
              <p className="text-xs text-blue-400 mt-1">{user.specialty}</p>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath.startsWith(item.path);
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                    ${isActive 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }
                    ${collapsed ? 'justify-center' : ''}
                  `}
                  title={collapsed ? item.label : undefined}
                  aria-label={item.label}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : ''}`} />
                  {!collapsed && (
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium truncate">{item.label}</span>
                        {item.badge && (
                          <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-red-500 text-white">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      {!collapsed && (
                        <p className="text-xs opacity-75 truncate">{item.description}</p>
                      )}
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse Toggle */}
      <div className="p-4 border-t border-slate-700">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-slate-300"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
