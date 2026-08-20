/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Outlet, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BarChart3,
  School,
  Video,
  Megaphone,
  LogOut,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { Sidebar, MobileNavTabs, type NavItem } from './Sidebar';

export const schoolAdminNavItems: NavItem[] = [
  {
    label: 'Boshqaruv paneli',
    shortLabel: 'Panel',
    icon: LayoutDashboard,
    path: '/school-admin/dashboard',
  },
  {
    label: "O'qituvchilar",
    shortLabel: "O'qituvchi",
    icon: Users,
    path: '/school-admin/teachers',
  },
  {
    label: "O'quvchilar",
    shortLabel: "O'quvchi",
    icon: GraduationCap,
    path: '/school-admin/students',
  },
  {
    label: 'Hisobotlar',
    shortLabel: 'Hisobot',
    icon: BarChart3,
    path: '/school-admin/reports',
  },
  {
    label: 'Maktab profili',
    shortLabel: 'Maktab',
    icon: School,
    path: '/school-admin/profile',
  },
  {
    label: 'Kamera sozlamalari',
    shortLabel: 'Kameralar',
    icon: Video,
    path: '/school-admin/cameras',
  },
  {
    label: 'Bildirishnoma yuborish',
    shortLabel: 'Xabarlar',
    icon: Megaphone,
    path: '/school-admin/announcements',
  },
];

export function SchoolAdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const schoolNumber = user?.schoolNumber || 71;

  return (
    <div className="min-h-screen bg-bg flex flex-col md:flex-row font-sans text-ink">
      <Sidebar
        items={schoolAdminNavItems}
        logoSubtitle="MAKTAB ADMINI"
        footer={
          <>
            <div className="bg-white/10 rounded-xl p-3 border border-white/10 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-sm shadow-md">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="bg-[#E8734A] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded">
                    ADMIN
                  </span>
                  <p className="text-xs font-bold text-white truncate">
                    {user?.displayName || `${schoolNumber}-Maktab Admini`}
                  </p>
                </div>
                <p className="text-[10px] text-[#D3E6F5]/70 truncate mt-0.5">
                  №{schoolNumber}-sonli Maktab-Internat
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-coral/30 text-coral hover:bg-coral/10 hover:border-coral rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> Chiqish
            </button>
          </>
        }
      />

      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-primary/5 sticky top-0 z-10 shadow-sm flex items-center justify-between p-4 shrink-0">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-white rounded-xl p-2 shadow-sm">
              <School className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black text-deep block leading-tight font-serif">
                  YORDAMCHI <span className="text-[#E8734A] text-[10px]">MED</span>
                </span>
                <span className="bg-primary/10 text-primary text-[9px] font-bold px-1.5 py-0.2 rounded">
                  ADMIN
                </span>
              </div>
              <span className="text-[10px] text-muted">№{schoolNumber}-Maktab-Internat</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/school-admin/profile')}
              className="text-primary text-xs font-bold py-1.5 px-3 hover:bg-primary/5 rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <School className="w-3.5 h-3.5" /> Maktab
            </button>
            <button
              type="button"
              onClick={logout}
              className="text-coral text-xs font-bold py-1.5 px-3 hover:bg-coral/5 rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> Chiqish
            </button>
          </div>
        </header>

        <main className="flex-1 flex flex-col p-4 sm:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          <MobileNavTabs items={schoolAdminNavItems} />
          <Outlet />
        </main>
      </div>
    </div>
  );
}
