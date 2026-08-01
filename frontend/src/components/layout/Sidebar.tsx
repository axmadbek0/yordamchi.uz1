/**
 * Umumiy kabinet sidebar — Ota-ona va O‘qituvchi uchun bir xil uslub
 */

import type { ComponentType, ReactNode, SVGProps } from 'react';
import { Link, useLocation } from 'react-router-dom';

export type NavIcon = ComponentType<SVGProps<SVGSVGElement> & { className?: string }>;

export interface NavItem {
  label: string;
  icon: NavIcon;
  path: string;
  /** Mobil tab’da qisqa yorliq */
  shortLabel?: string;
}

export interface SidebarProps {
  items: NavItem[];
  logoSubtitle: string;
  footer?: ReactNode;
}

export function Sidebar({ items, logoSubtitle, footer }: SidebarProps) {
  const location = useLocation();

  return (
    <aside className="w-64 bg-[#123C5C] flex flex-col h-screen sticky top-0 shrink-0 text-[#D3E6F5] hidden md:flex z-20 shadow-xl border-r border-cardBlue/10">
      <div className="p-6 mb-2">
        <p className="text-white font-serif text-2xl italic tracking-tight leading-tight">
          Yordamchi <span className="text-[#E8734A] text-sm not-italic font-semibold">med</span>
        </p>
        <p className="text-[10px] tracking-wider text-white/50 uppercase mt-1.5">
          {logoSubtitle}
        </p>
      </div>

      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-150 ${
                isActive
                  ? 'bg-[#1B6FA8] text-white font-medium shadow-md shadow-primary/25'
                  : 'text-white/70 hover:bg-white/5'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="text-sm font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {footer && (
        <div className="p-4 border-t border-[#D3E6F5]/10 flex flex-col gap-3 mt-auto">
          {footer}
        </div>
      )}
    </aside>
  );
}

/** Mobil yuqori navigatsiya — Link asosida */
export function MobileNavTabs({ items }: { items: NavItem[] }) {
  const location = useLocation();

  return (
    <div className="flex md:hidden bg-white rounded-2xl p-1 mb-6 shadow-sm border border-cardBlue/50 shrink-0 overflow-x-auto">
      {items
        .filter((item) => !item.path.endsWith('/profile'))
        .map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex-1 min-w-[4.5rem] py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                isActive ? 'bg-[#1B6FA8] text-white shadow-md' : 'text-muted'
              }`}
            >
              <Icon className="w-4 h-4 hidden sm:block" />
              {item.shortLabel || item.label}
            </Link>
          );
        })}
    </div>
  );
}
