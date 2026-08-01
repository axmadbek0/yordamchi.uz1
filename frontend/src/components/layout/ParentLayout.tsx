/**
 * ParentLayout — ota-ona kabineti shell (umumiy Sidebar)
 */

import { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Activity, MessageSquare, Video, UtensilsCrossed, User, LogOut, Heart, Bell } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { getStudents } from '../../lib/db';
import type { Student } from '../../types';
import { Sidebar, MobileNavTabs, type NavItem } from './Sidebar';
import { ParentNotificationToast } from '../../features/parent/ParentNotificationToast';

export const parentNavItems: NavItem[] = [
  { label: 'Kundalik Hisobot', shortLabel: 'Hisobot', icon: Activity, path: '/parent/reports' },
  { label: 'AI Maslahatchi', shortLabel: 'Maslahatchi', icon: MessageSquare, path: '/parent/ai-chat' },
  { label: 'Bildirishnomalar', shortLabel: 'Xabarlar', icon: Bell, path: '/parent/notifications' },
  { label: 'Yotoqxona kuzatuvi', shortLabel: 'Yotoqxona', icon: Video, path: '/parent/dormitory-camera' },
  { label: 'Oshxona', shortLabel: 'Oshxona', icon: UtensilsCrossed, path: '/parent/kitchen-camera' },
  { label: 'Mening Profilim', shortLabel: 'Profil', icon: User, path: '/parent/profile' },
];

export function ParentLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);

  useEffect(() => {
    if (user?.associatedStudentId) {
      getStudents().then((students) => {
        const matched = students.find((s) => s.id === user.associatedStudentId);
        if (matched) setStudent(matched);
      });
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-bg flex flex-col md:flex-row font-sans text-ink">
      <Sidebar
        items={parentNavItems}
        logoSubtitle="OTA-ONA KABINETI"
        footer={
          <>
            {student && (
              <Link
                to="/parent/profile"
                className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center gap-3 cursor-pointer transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-[#1B6FA8] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-inner">
                  {student.fullName[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold truncate text-white leading-tight">{student.fullName}</p>
                  <p className="text-[10px] text-[#D3E6F5] opacity-60 truncate">
                    {student.className} o‘quvchisi • Profil →
                  </p>
                </div>
              </Link>
            )}
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
            <div className="bg-coral text-white rounded-full p-2">
              <Heart className="w-4 h-4" fill="currentColor" />
            </div>
            <div>
              <span className="text-sm font-black text-deep block leading-tight font-serif">
                YORDAMCHI <span className="text-[#E8734A] text-[10px]">MED</span>
              </span>
              <span className="text-[10px] text-muted">
                Ota-ona kabineti • Maktab №{user?.schoolNumber || 12}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/parent/profile')}
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
          <MobileNavTabs items={parentNavItems} />
          <Outlet />
        </main>
      </div>
      <ParentNotificationToast />
    </div>
  );
}
