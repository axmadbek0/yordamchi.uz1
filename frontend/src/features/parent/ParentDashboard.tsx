/**
 * ParentReportsPage — Kundalik Hisobot (/parent/reports)
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { getStudents, getReportsForStudent } from '../../lib/db';
import { Student, DailyStatusEntry } from '../../types';
import { AIReportChart } from '../../components/charts/AIReportChart';
import { Calendar, Activity, Award, Bell } from 'lucide-react';
import { useChatContext } from '../../components/ai-chat/ChatContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export function ParentReportsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { setContextInfo } = useChatContext();
  const [student, setStudent] = useState<Student | null>(null);
  const [studentReports, setStudentReports] = useState<DailyStatusEntry[]>([]);

  useEffect(() => {
    setContextInfo('parent', '/parent/reports');
  }, [setContextInfo]);

  useEffect(() => {
    if (user?.associatedStudentId) {
      getStudents().then((students) => {
        const matched = students.find((s) => s.id === user.associatedStudentId);
        if (matched) {
          setStudent(matched);
          getReportsForStudent(matched.id).then(setStudentReports);
        }
      });
    }
  }, [user]);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayReport = studentReports.find((r) => r.date === todayStr);

  return (
    <div className="flex flex-col gap-6 w-full">
      <header>
        <h2 className="text-2xl sm:text-3xl font-serif text-deep font-bold">
          Farzandingiz Kundalik Qaydlari
        </h2>
        <p className="text-muted text-xs sm:text-sm mt-1">
          {student?.fullName || 'O‘quvchi'} bo‘yicha maktab-internatdan olingan har kungi hisobotlar
          ko‘rsatkichi
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white rounded-3xl border border-cardBlue p-6 shadow-sm flex flex-col gap-4">
            <h3 className="text-lg font-bold text-deep font-serif flex items-center gap-2">
              <Calendar className="w-5 h-5 text-coral" /> Bugungi kunlik holat tahlili
            </h3>
            {todayReport ? (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs font-bold bg-[#EAF3FB] text-primary px-3 py-1.5 rounded-full border border-cardBlue flex items-center gap-1.5">
                    <span>
                      {todayReport.mood === 'xursand'
                        ? '🌟'
                        : todayReport.mood === 'oddiy'
                          ? '🙂'
                          : todayReport.mood === 'tashvishli'
                            ? '😟'
                            : '😴'}
                    </span>
                    Kayfiyati: <strong className="capitalize">{todayReport.mood}</strong>
                  </span>
                  <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-100 flex items-center gap-1.5">
                    <span>✅</span> Salomatligi:{' '}
                    <strong className="capitalize">{todayReport.healthStatus}</strong>
                  </span>
                </div>

                <div className="bg-[#EAF3FB]/30 p-4 rounded-2xl border border-cardBlue/50 text-sm leading-relaxed text-deep">
                  <strong className="block text-xs font-bold uppercase tracking-wider text-muted mb-1">
                    O‘qituvchi izohi:
                  </strong>
                  &quot;{todayReport.teacherNote}&quot;
                </div>

                {todayReport.aiAnalysis && (
                  <div className="bg-[#1B6FA8] text-white p-5 rounded-3xl relative overflow-hidden shadow-lg">
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">✨</span>
                        <strong className="text-xs uppercase tracking-wider text-[#D3E6F5]">
                          Sun’iy Intellekt Tahlili & Maslahati
                        </strong>
                      </div>
                      <p className="text-sm leading-relaxed text-[#EAF3FB] font-medium">
                        {todayReport.aiAnalysis}
                      </p>
                    </div>
                    <div className="absolute -right-12 -bottom-12 w-40 h-40 bg-white/5 rounded-full pointer-events-none" />
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-10 text-muted bg-[#EAF3FB]/20 border border-dashed border-cardBlue rounded-2xl flex flex-col items-center justify-center gap-2">
                <Bell className="w-10 h-10 text-primary/30 animate-bounce" />
                <p className="font-semibold text-deep">Bugun uchun ma’lumotlar hali kiritilmadi</p>
                <p className="text-xs">
                  Maktab rahbariyati yoki o‘qituvchi hisobot kiritishi bilan bu yerda tahlillar
                  shakllanadi.
                </p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl border border-cardBlue p-6 shadow-sm flex flex-col gap-4">
            <h3 className="text-lg font-bold text-deep font-serif flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" /> Farzandingiz faolligi va dinamikasi
              ko‘rsatkichlari
            </h3>
            {studentReports.length === 0 ? (
              <div className="text-center py-12 text-muted bg-[#EAF3FB]/10 border border-dashed border-cardBlue rounded-2xl">
                <Calendar className="w-10 h-10 text-primary/20 mx-auto mb-2" />
                <p className="font-semibold text-lg text-deep">Tarixiy ma’lumotlar hozircha mavjud emas</p>
                <p className="text-xs">Dars davomidagi qaydlar tarixiy jadvalga yig‘ilib boradi.</p>
              </div>
            ) : (
              <ErrorBoundary name="ai-report-chart">
                <AIReportChart entries={studentReports} />
              </ErrorBoundary>
            )}
          </div>
        </div>

        <div className="flex flex-col space-y-6">
          <div className="bg-white rounded-3xl border border-cardBlue p-6 shadow-sm flex flex-col gap-4 text-center items-center">
            <div className="relative">
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-[#D3E6F5] bg-bg flex items-center justify-center">
                {student?.avatarUrl ? (
                  <img
                    src={student.avatarUrl}
                    alt={student.fullName}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="text-primary font-bold text-3xl">{student?.fullName[0]}</span>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-coral text-white p-1.5 rounded-full shadow-md">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div>
              <h4 className="font-bold text-base text-deep">{student?.fullName}</h4>
              <p className="text-xs text-muted">
                Sinfi: {student?.className} • Maktab №{student?.schoolNumber}
              </p>
            </div>
            <div className="w-full pt-3 border-t border-cardBlue/50 text-left space-y-2 text-xs text-muted">
              <div className="flex justify-between">
                <span>Tug‘ilgan kuni:</span>
                <span className="font-semibold text-deep">{student?.birthDate}</span>
              </div>
              <div className="flex justify-between">
                <span>Ota-ona logini:</span>
                <span className="font-mono font-bold text-deep">{student?.parentLogin}</span>
              </div>
              <div className="flex justify-between">
                <span>Telefon raqam:</span>
                <span className="font-semibold text-deep">{student?.parentPhone}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#E8734A] text-white rounded-3xl p-6 relative overflow-hidden shadow-lg flex flex-col gap-3">
            <div className="relative z-10">
              <span className="text-xs font-bold uppercase tracking-wider text-white/80">
                Maxsus Pedagogika AI
              </span>
              <h4 className="text-lg font-bold font-serif leading-tight mt-1">
                Uydagi tarbiya va mashg‘ulotlar haqida so‘rang
              </h4>
              <p className="text-xs text-white/95 mt-1 leading-relaxed">
                AI pedagog sizga bolaning emotsiyalarini boshqarish va uydagi mashqlar bo‘yicha
                professional maslahat beradi.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/parent/ai-chat')}
              className="relative z-10 self-start bg-white text-coral text-xs font-bold px-4 py-2.5 rounded-full hover:bg-white/90 transition-all cursor-pointer shadow-md"
            >
              AI Maslahatlashish →
            </button>
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** @deprecated use ParentReportsPage — redirect compatibility */
export { ParentReportsPage as ParentDashboard };
