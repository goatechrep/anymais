import React from 'react';
import { Lock } from 'lucide-react';
import { DashboardView } from '../../types';

interface DashboardNavItemProps {
  view: DashboardView;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  activeView: DashboardView;
  onSelect: (view: DashboardView) => void;
  locked?: boolean;
  disabled?: boolean;
  description?: string;
  planReq?: string;
}

export const DashboardNavItem: React.FC<DashboardNavItemProps> = ({
  view,
  icon: Icon,
  label,
  activeView,
  onSelect,
  locked,
  disabled,
  description,
  planReq,
}) => (
  <button
    onClick={() => onSelect(view)}
    disabled={disabled}
    className={`relative group flex items-center w-full p-3 rounded-lg mb-2 transition-colors justify-between ${
      activeView === view
        ? 'bg-brand-50 text-brand-600 font-medium'
        : disabled
          ? 'text-gray-300 cursor-not-allowed'
          : 'text-gray-600 hover:bg-gray-50'
    }`}
  >
    <div className="flex items-center">
      <Icon size={20} className="mr-3" />
      {label}
    </div>
    {locked && <Lock size={14} className="text-gray-400 group-hover:text-brand-500" />}

    {description && (
      <div className="hidden md:block invisible group-hover:visible absolute left-full top-1/2 -translate-y-1/2 ml-3 w-56 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        <div className="font-bold mb-1 text-sm">{label}</div>
        <div className="text-gray-300 mb-2 leading-tight">{description}</div>
        {planReq && (
          <div className={`font-bold uppercase text-[10px] tracking-wider ${locked ? 'text-red-300' : 'text-green-300'}`}>
            {planReq}
          </div>
        )}
        <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-2 h-2 bg-gray-900 rotate-45"></div>
      </div>
    )}
  </button>
);
