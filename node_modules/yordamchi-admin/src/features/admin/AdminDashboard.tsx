/**
 * Admin Dashboard — KPI cards, growth chart, activity feed, attention items
 * All 5 states implemented: Loading, Empty, Error, Success, Partial
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  School,
  Users,
  GraduationCap,
  MessageSquare,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Plus,
  Clock,
} from 'lucide-react';
import { motion } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import {
  getPlatformStats,
  getMonthlyGrowthData,
  getActivityFeed,
  getAttentionItems,
} from '../../lib/adminDb';
import type { PlatformStats, MonthlyGrowthData, ActivityFeedItem, AttentionItem } from '../../types';

type LoadState = 'loading' | 'success' | 'error' | 'empty';

// KPI Card Component
function KPICard({
  label,
  value,
  trend,
  icon: Icon,
  state,
  delay = 0,
}: {
  label: string;
  value: number;
  trend: number;
  icon: React.ElementType;
  state: LoadState;
  delay?: number;
}) {
  if (state === 'loading') {
    return (
      <Card variant="white" className="!p-5">
        <div className="animate-pulse flex flex-col gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl" />
          <div className="h-8 bg-primary/10 rounded-lg w-20" />
          <div className="h-4 bg-primary/5 rounded w-28" />
        </div>
      </Card>
    );
  }

  if (state === 'error') {
    return (
      <Card variant="white" className="!p-5 border-coral/20">
        <div className="flex flex-col items-center gap-2 text-center py-2">
          <AlertTriangle className="w-6 h-6 text-coral/60" />
          <p className="text-xs text-muted">Yuklab bo'lmadi</p>
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1, duration: 0.4 }}
    >
      <Card variant="white" className="!p-5 hover:shadow-lg transition-shadow duration-300">
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
            trend >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-coral/10 text-coral'
          }`}>
            <TrendingUp className={`w-3 h-3 ${trend < 0 ? 'rotate-180' : ''}`} />
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        </div>
        <p className="text-3xl font-black text-deep tracking-tight">{value.toLocaleString()}</p>
        <p className="text-sm text-muted mt-1">{label}</p>
      </Card>
    </motion.div>
  );
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [growth, setGrowth] = useState<MonthlyGrowthData[]>([]);
  const [activity, setActivity] = useState<ActivityFeedItem[]>([]);
  const [attention, setAttention] = useState<AttentionItem[]>([]);

  const [statsState, setStatsState] = useState<LoadState>('loading');
  const [growthState, setGrowthState] = useState<LoadState>('loading');
  const [activityState, setActivityState] = useState<LoadState>('loading');

  const loadData = () => {
    // Simulate independent loading for each section
    setStatsState('loading');
    setGrowthState('loading');
    setActivityState('loading');

    setTimeout(() => {
      try {
        const s = getPlatformStats();
        setStats(s);
        setStatsState(s.totalSchools === 0 ? 'empty' : 'success');
      } catch {
        setStatsState('error');
      }
    }, 400);

    setTimeout(() => {
      try {
        setGrowth(getMonthlyGrowthData());
        setGrowthState('success');
      } catch {
        setGrowthState('error');
      }
    }, 700);

    setTimeout(() => {
      try {
        setActivity(getActivityFeed());
        setAttention(getAttentionItems());
        setActivityState('success');
      } catch {
        setActivityState('error');
      }
    }, 500);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Empty state
  if (statsState === 'empty') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <School className="w-10 h-10 text-primary/50" />
        </div>
        <h2 className="text-xl font-bold text-deep mb-2">Hali ma'lumot yo'q</h2>
        <p className="text-muted mb-6 max-w-sm">
          Platformada hali birorta maktab ro'yxatdan o'tmagan. Birinchi maktabni qo'shing va statistikani kuzating.
        </p>
        <Button variant="coral" onClick={() => navigate('/admin/schools')}>
          <Plus className="w-4 h-4 mr-2" />
          Birinchi maktabni qo'shish
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-deep font-serif">Boshqaruv paneli</h1>
          <p className="text-sm text-muted mt-0.5">Platformaning umumiy ko'rinishi</p>
        </div>
        <Button variant="ghost" size="sm" onClick={loadData}>
          <RefreshCw className="w-4 h-4 mr-1.5" />
          Yangilash
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Jami maktablar"
          value={stats?.totalSchools || 0}
          trend={stats?.schoolsTrend || 0}
          icon={School}
          state={statsState}
          delay={0}
        />
        <KPICard
          label="Jami o'qituvchilar"
          value={stats?.totalTeachers || 0}
          trend={stats?.teachersTrend || 0}
          icon={Users}
          state={statsState}
          delay={1}
        />
        <KPICard
          label="Jami o'quvchilar"
          value={stats?.totalStudents || 0}
          trend={stats?.studentsTrend || 0}
          icon={GraduationCap}
          state={statsState}
          delay={2}
        />
        <KPICard
          label="Bugungi AI suhbatlar"
          value={stats?.activeChatsToday || 0}
          trend={stats?.chatsTrend || 0}
          icon={MessageSquare}
          state={statsState}
          delay={3}
        />
      </div>

      {/* Attention Items */}
      {attention.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card variant="white" className="!p-4 border-2 !border-coral/20 !bg-coral/3">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-coral" />
              <h3 className="text-sm font-bold text-deep">Diqqat talab etadi</h3>
            </div>
            <div className="space-y-2">
              {attention.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigate(item.link)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-white/80 hover:bg-white text-left transition-all cursor-pointer border border-coral/10"
                >
                  <div className="w-2 h-2 rounded-full bg-coral shrink-0" />
                  <span className="text-sm text-deep font-medium">{item.message}</span>
                  <span className="ml-auto text-xs text-coral font-semibold">Ko'rish →</span>
                </button>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Growth Chart — 2 cols */}
        <div className="lg:col-span-2">
          <Card variant="white" className="!p-5">
            <h3 className="text-base font-bold text-deep mb-4">Platforma o'sish grafigi</h3>
            {growthState === 'loading' ? (
              <div className="animate-pulse h-[280px] bg-primary/5 rounded-xl" />
            ) : growthState === 'error' ? (
              <div className="h-[280px] flex flex-col items-center justify-center text-center">
                <AlertTriangle className="w-8 h-8 text-coral/40 mb-2" />
                <p className="text-sm text-muted mb-3">Grafikni yuklab bo'lmadi</p>
                <Button variant="outline" size="sm" onClick={loadData}>
                  <RefreshCw className="w-3 h-3 mr-1.5" />
                  Qayta urinish
                </Button>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={growth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EAF3FB" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#51728C' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#51728C' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: '#fff',
                      border: '1px solid #D3E6F5',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(27,111,168,0.1)',
                      fontSize: '13px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="students"
                    name="O'quvchilar"
                    stroke="#1B6FA8"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#1B6FA8' }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="schools"
                    name="Maktablar"
                    stroke="#E8734A"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#E8734A' }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="teachers"
                    name="O'qituvchilar"
                    stroke="#123C5C"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#123C5C' }}
                    strokeDasharray="4 2"
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>

        {/* Activity Feed — 1 col */}
        <div>
          <Card variant="white" className="!p-5">
            <h3 className="text-base font-bold text-deep mb-4">So'nggi faoliyat</h3>
            {activityState === 'loading' ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="animate-pulse flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary/10 mt-2 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-primary/10 rounded w-full" />
                      <div className="h-2 bg-primary/5 rounded w-16" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activityState === 'error' ? (
              <div className="flex flex-col items-center py-8 text-center">
                <AlertTriangle className="w-6 h-6 text-coral/40 mb-2" />
                <p className="text-sm text-muted mb-3">Yuklab bo'lmadi</p>
                <Button variant="outline" size="sm" onClick={loadData}>
                  Qayta urinish
                </Button>
              </div>
            ) : (
              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                {activity.map((item) => {
                  const typeColors: Record<string, string> = {
                    school: 'bg-primary',
                    teacher: 'bg-deep',
                    billing: 'bg-coral',
                    system: 'bg-muted',
                  };
                  return (
                    <div key={item.id} className="flex gap-3 group">
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${typeColors[item.type]}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-deep leading-snug">{item.message}</p>
                        <p className="text-[11px] text-muted flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          {new Date(item.timestamp).toLocaleDateString('uz-UZ', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
