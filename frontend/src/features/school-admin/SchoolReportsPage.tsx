/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import {
  BarChart3,
  Calendar,
  Smile,
  Heart,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Award,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { getReports } from '../../lib/api/schoolAdmin';
import type { SchoolReportData } from '../../types/schoolAdmin';

const MOOD_COLORS = ['#10B981', '#1B6FA8', '#F59E0B', '#E8734A'];

export function SchoolReportsPage() {
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter'>('week');
  const [report, setReport] = useState<SchoolReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReportsData = async (selectedPeriod: 'week' | 'month' | 'quarter') => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getReports(selectedPeriod);
      setReport(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Hisobotlarni yuklab bo\'lmadi');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchReportsData(period);
  }, [period]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-14 bg-white rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-72 bg-white rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <Card variant="white" className="p-8 text-center max-w-md mx-auto my-12 shadow-sm">
        <AlertTriangle className="w-10 h-10 text-coral mx-auto mb-3" />
        <p className="text-sm text-muted mb-4">{error || "Ma'lumotlar topilmadi"}</p>
        <Button variant="primary" onClick={() => fetchReportsData(period)} className="gap-2 mx-auto">
          <RefreshCw className="w-4 h-4" /> Qayta yuklash
        </Button>
      </Card>
    );
  }

  const { kpis, moodDistribution, healthDistribution, classesBreakdown, trendData } = report;

  return (
    <div className="space-y-6">
      {/* Header with Period Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black font-serif text-deep flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-primary" /> Maktab Monitoring Hisobotlari
          </h1>
          <p className="text-sm text-muted">
            Bolalarning psixologik-ijtimoiy kayfiyati, salomatligi va sinflarning kunlik davomati
          </p>
        </div>

        {/* Period Switcher */}
        <div className="flex bg-white rounded-2xl p-1 border border-cardBlue/50 shadow-xs">
          {(['week', 'month', 'quarter'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                period === p
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-muted hover:text-deep'
              }`}
            >
              {p === 'week' ? 'Haftalik' : p === 'month' ? 'Oylik' : 'Choraklik'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Trend Line Chart */}
      <Card variant="white" className="p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-deep flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Kunlik Holat Kiritish va Ijobiy Dinamika
            </h3>
            <p className="text-xs text-muted">
              Belgilangan muddat davomida qaydlar kiritish foizi va o'quvchilar ijobiy kayfiyati ko'rsatkichi
            </p>
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="rateGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1B6FA8" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#1B6FA8" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748B' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="rate"
                name="Qaydlar foizi (%)"
                stroke="#1B6FA8"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#rateGradient)"
              />
              <Area
                type="monotone"
                dataKey="positiveMoodRate"
                name="Ijobiy kayfiyat (%)"
                stroke="#10B981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#moodGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* 2-Column Analytics Distribution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mood Distribution */}
        <Card variant="white" className="p-6 shadow-sm">
          <h3 className="text-base font-bold text-deep mb-1 flex items-center gap-2">
            <Smile className="w-4 h-4 text-primary" /> Bolalarning Kayfiyat Taqsimoti
          </h3>
          <p className="text-xs text-muted mb-4">
            Pedagoglar tomonidan belgilangan hissiy-emotsional holat
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={moodDistribution}
                    dataKey="count"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    outerRadius={75}
                    innerRadius={45}
                    paddingAngle={4}
                  >
                    {moodDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={MOOD_COLORS[index % MOOD_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2.5">
              {moodDistribution.map((item, index) => (
                <div key={item.label} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: MOOD_COLORS[index % MOOD_COLORS.length] }}
                    />
                    <span className="font-semibold text-deep">{item.label}</span>
                  </div>
                  <span className="font-bold text-muted">{item.percent}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Health / Medical Attention Card */}
        <Card variant="white" className="p-6 shadow-sm">
          <h3 className="text-base font-bold text-deep mb-1 flex items-center gap-2">
            <Heart className="w-4 h-4 text-coral" /> Salomatlik va Tibbiy Nazorat
          </h3>
          <p className="text-xs text-muted mb-4">
            Hamshira va tarbiyachilar tomonidan dori/parvarish monitoringi
          </p>

          <div className="space-y-4">
            {healthDistribution.map((item) => (
              <div key={item.label} className="p-3.5 rounded-2xl bg-bg border border-cardBlue space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-deep">{item.label}</span>
                  <span className="text-primary font-black text-sm">{item.count} ta qayd</span>
                </div>
                <div className="w-full h-2 bg-white rounded-full overflow-hidden border border-cardBlue">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${Math.min(100, (item.count / 20) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Class by Class Activity Table */}
      <Card variant="white" className="p-6 shadow-sm">
        <h3 className="text-base font-bold text-deep mb-1 flex items-center gap-2">
          <Award className="w-4 h-4 text-primary" /> Sinflar Faolligi Ko'rsatkichlari
        </h3>
        <p className="text-xs text-muted mb-4">
          Har bir sinfda bolalarning qamrovi va kunlik jurnal to'ldirilishi darajasi
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-cardBlue/50 text-[11px] font-bold text-muted uppercase bg-bg/40">
                <th className="py-3 px-4">Sinf</th>
                <th className="py-3 px-4">O'quvchilar soni</th>
                <th className="py-3 px-4">Bugungi kiritilgan qaydlar</th>
                <th className="py-3 px-4 text-right">Foiz</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cardBlue/30">
              {classesBreakdown.map((c) => (
                <tr key={c.className} className="hover:bg-bg/30">
                  <td className="py-3 px-4 font-bold text-deep">{c.className}</td>
                  <td className="py-3 px-4 text-muted">{c.totalStudents} nafar</td>
                  <td className="py-3 px-4 text-muted">{c.todayLogged} ta</td>
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                        c.ratePercentage === 100
                          ? 'bg-success/10 text-success'
                          : c.ratePercentage >= 50
                          ? 'bg-primary/10 text-primary'
                          : 'bg-coral/10 text-coral'
                      }`}
                    >
                      {c.ratePercentage}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
