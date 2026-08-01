/**
 * TeacherLayout — o‘qituvchi kabineti shell (umumiy Sidebar)
 */

import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Users, ClipboardList, BarChart, User, LogOut, School } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { Sidebar, MobileNavTabs, type NavItem } from './Sidebar';

export const teacherNavItems: NavItem[] = [
  { label: 'Mening sinfim', shortLabel: 'Sinfim', icon: Users, path: '/teacher/class' },
  { label: 'Kunlik holat kiritish', shortLabel: 'Qaydlar', icon: ClipboardList, path: '/teacher/daily-status' },
  { label: 'Hisobotlar', shortLabel: 'Hisobot', icon: BarChart, path: '/teacher/reports' },
  { label: 'Mening Profilim', shortLabel: 'Profil', icon: User, path: '/teacher/profile' },
];

export function TeacherLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg flex flex-col md:flex-row font-sans text-ink">
      <Sidebar
        items={teacherNavItems}
        logoSubtitle="O‘QITUVCHI KABINETI"
        footer={
          <>
            <Link
              to="/teacher/profile"
              className="flex items-center space-x-3 text-white cursor-pointer hover:bg-white/5 p-1.5 rounded-xl transition-colors"
            >
              <div className="w-10 h-10 bg-coral rounded-full flex items-center justify-center font-bold text-white uppercase shadow-md shadow-coral/25 shrink-0">
                {user?.displayName ? user.displayName.slice(0, 2) : 'O‘'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate leading-tight text-white">
                  {user?.displayName || 'O‘qituvchi'}
                </p>
                <p className="text-[10px] text-[#D3E6F5] opacity-60 truncate">Sinf rahbari • Profil →</p>
              </div>
            </Link>
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
        <header className="md:hidden bg-white border-b border-primary/5 sticky top-0 z-10 shadow-sm flex items-center justify-between p-4 shrink-0">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-white rounded-full p-2">
              <School className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-black text-deep block leading-tight font-serif">
                YORDAMCHI <span className="text-[#E8734A] text-[10px]">MED</span>
              </span>
              <span className="text-[10px] text-muted">№{user?.schoolNumber || 12}-Maktab</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/teacher/profile')}
              className="text-primary text-xs font-bold py-1.5 px-3 hover:bg-primary/5 rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <User className="w-3.5 h-3.5" /> Profil
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
          <MobileNavTabs items={teacherNavItems} />
          <Outlet />
        </main>
      </div>
    </div>
  );
}
