'use client';

import React from 'react';
import {
  LayoutDashboard,
  Images,
  BarChart3,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Moon,
  Satellite,
  Layers,
  HelpCircle,
  Activity,
  Clock,
} from 'lucide-react';
import { ViewState } from '@/types';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  activeView: ViewState;
  onNavigate: (view: ViewState) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  section?: string;
  view?: ViewState;
  badge?: string;
}

const navItems: NavItem[] = [
  { id: 'dashboard',    label: 'Dashboard',        icon: <LayoutDashboard size={18} />, section: 'main', view: 'UPLOAD' },
  { id: 'images',       label: 'Image Analysis',   icon: <Images size={18} />,          section: 'main', view: 'UPLOAD' },
  { id: 'registration', label: 'Registration',     icon: <Layers size={18} />,          section: 'main', view: 'RESULT' },
  { id: 'activity',     label: 'Activity Log',     icon: <Activity size={18} />,        section: 'main', view: 'UPLOAD' },
  { id: 'temporal',     label: 'Temporal Predict', icon: <Clock size={18} />,           section: 'main', view: 'TEMPORAL', badge: 'NEW' },
  { id: 'reports',      label: 'Reports',          icon: <BarChart3 size={18} />,       section: 'science' },
  { id: 'docs',         label: 'Documentation',    icon: <FileText size={18} />,        section: 'science' },
  { id: 'settings',     label: 'Settings',         icon: <Settings size={18} />,        section: 'system' },
  { id: 'help',         label: 'Help & Support',   icon: <HelpCircle size={18} />,      section: 'system' },
];

export default function Sidebar({ collapsed, onToggle, activeView, onNavigate }: SidebarProps) {
  const activeId =
    activeView === 'UPLOAD'    ? 'images' :
    activeView === 'RESULT'    ? 'registration' :
    activeView === 'TEMPORAL'  ? 'temporal' : 'dashboard';

  return (
    <aside
      className={`
        relative flex flex-col h-full bg-white border-r border-gray-200
        transition-all duration-300 ease-in-out shrink-0 z-20
        ${collapsed ? 'w-16' : 'w-60'}
      `}
      style={{ boxShadow: '2px 0 8px rgba(0,0,0,0.06)' }}
    >
      {/* ── Logo / Brand ── */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-gray-100 ${collapsed ? 'justify-center' : ''}`}>
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-isro-700 shrink-0">
          <Moon size={16} className="text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-gray-900 tracking-tight leading-none">LUNARIS</p>
            <p className="text-[10px] text-isro-600 font-medium tracking-widest uppercase mt-0.5">ISRO · Image Reg</p>
          </div>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
        {/* Section: Main */}
        {!collapsed && (
          <p className="px-3 mb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Main</p>
        )}
        {navItems.filter(n => n.section === 'main').map((item) => (
          <NavButton
            key={item.id}
            item={item}
            active={item.id === activeId}
            collapsed={collapsed}
            onClick={() => item.view && onNavigate(item.view)}
          />
        ))}

        <div className="my-3 border-t border-gray-100 mx-2" />

        {!collapsed && (
          <p className="px-3 mb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Science</p>
        )}
        {navItems.filter(n => n.section === 'science').map((item) => (
          <NavButton
            key={item.id}
            item={item}
            active={item.id === activeId}
            collapsed={collapsed}
            onClick={() => item.view && onNavigate(item.view)}
          />
        ))}

        <div className="my-3 border-t border-gray-100 mx-2" />

        {!collapsed && (
          <p className="px-3 mb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">System</p>
        )}
        {navItems.filter(n => n.section === 'system').map((item) => (
          <NavButton
            key={item.id}
            item={item}
            active={false}
            collapsed={collapsed}
            onClick={() => {}}
          />
        ))}
      </nav>

      {/* ── ISRO badge ── */}
      {!collapsed && (
        <div className="px-4 py-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <Satellite size={14} className="text-isro-500" />
            <div>
              <p className="text-[10px] font-semibold text-gray-700">Chandrayaan Programme</p>
              <p className="text-[9px] text-gray-400">Problem Statement 26166</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Collapse Toggle ── */}
      <button
        onClick={onToggle}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="
          absolute -right-3 top-16 z-30
          flex items-center justify-center
          w-6 h-6 rounded-full
          bg-white border border-gray-200
          shadow-sm text-gray-500
          hover:text-isro-700 hover:border-isro-300
          transition-colors duration-200
        "
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}

function NavButton({
  item, active, collapsed, onClick
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  onClick: () => void;
}) {
  return (
    <button
      id={`nav-${item.id}`}
      title={collapsed ? item.label : undefined}
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
        text-sm font-medium transition-all duration-150 cursor-pointer
        ${active
          ? 'bg-isro-50 text-isro-700 shadow-sm'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }
        ${collapsed ? 'justify-center' : ''}
      `}
    >
      <span className={`shrink-0 ${active ? 'text-isro-600' : ''}`}>{item.icon}</span>
      {!collapsed && <span className="truncate flex-1 text-left">{item.label}</span>}
      {!collapsed && item.badge && (
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white shrink-0"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#1d4ed8)' }}>
          {item.badge}
        </span>
      )}
      {active && !collapsed && !item.badge && (
        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-isro-500 shrink-0" />
      )}
    </button>
  );
}
