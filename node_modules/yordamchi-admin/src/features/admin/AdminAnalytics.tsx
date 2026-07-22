/**
 * Admin Analytics — Wellbeing trend, region distribution, top schools
 * 5 states implemented
 */

import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  AlertTriangle,
  RefreshCw,
  Download,
  BarChart3,
  TrendingUp,
  Trophy,
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  getWellbeingTrendData,
  getRegionData,
  getTopSchools,
} from '../../lib/adminDb';
import type { RegionData, TopSchoolData } from '../../types';

type LoadState = 'loading' | 'success' | 'error' | 'empty';
type TimePeriod = 'week' | 'month' | 'quarter' | 'year';

export function AdminAnalytics() {
  const [wellbeing, setWellbeing] = useState<{ month: string; score: number }[]>([]);
  const [regions, setRegions] = useState<RegionData[]>([]);
  const [topSchools, setTopSchools] = useState<TopSchoolData[]>([]);
  const [state, setState] = useState<LoadState>('loading');
  const [period, setPeriod] = useState<TimePeriod>('year');

  const loadData = () => {
    setState('loading');
    setTimeout(() => {
      try {
        setWellbeing(getWellbeingTrendData());
        setRegions(getRegionData());
        setTopSchools(getTopSchools());
        setState('success');
      } catch {
        setState('error');
      }
    }, 600);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleExportCSV = () => {
    // Mock export
    const csvContent = 'Oy,Farovonlik ball\n' + wellbeing.map((w) => `${w.month},${w.score}`).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'yordamchi_analytics.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const periods: { key: TimePeriod; label: string }[] = [
    { key: 'week', label: 'Hafta' },
    { key: 'month', label: 'Oy' },
    { key: 'quarter', label: 'Chorak' },
    { key: 'year', label: 'Yil' },
  ];

  // Loading
  if (state === 'loading') {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-primary/10 rounded-lg w-48 animate-pulse" />
        <div className="h-[300px] bg-white rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-[280px] bg-white rounded-2xl animate-pulse" />
          <div className="h-[280px] bg-white rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  // Error
  if (state === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <AlertTriangle className="w-12 h-12 text-coral/40 mb-3" />
        <h2 className="text-lg font-bold text-deep mb-2">Tahlil ma'lumotlarini yuklab bo'lmadi</h2>
        <p className="text-muted mb-4">Iltimos, qaytadan urining</p>
        <Button variant="outline" onClick={loadData}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Qayta urinish
        </Button>
      </div>
    );
  }

  // Empty
  if (state === 'empty' || (wellbeing.length === 0 && regions.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <BarChart3 className="w-12 h-12 text-primary/30 mb-3" />
        <h2 className="text-lg font-bold text-deep mb-2">Tahlil uchun ma'lumot yo'q</h2>
        <p className="text-muted max-w-sm">Maktablar qo'shilgandan so'ng tahlil ma'lumotlari paydo bo'ladi</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-deep font-serif">Tahlil va hisobotlar</h1>
          <p className="text-sm text-muted mt-0.5">Platforma bo'yicha umumiy ko'rsatkichlar</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Time filter */}
          <div className="flex bg-white rounded-xl p-1 border border-primary/5 shadow-sm">
            {periods.map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  period === p.key ? 'bg-primary/8 text-primary font-semibold' : 'text-muted hover:text-deep'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-1.5" />
            CSV yuklab olish
          </Button>
        </div>
      </div>

      {/* Wellbeing Trend */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card variant="white" className="!p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h3 className="text-base font-bold text-deep">Umumiy farovonlik trendi</h3>
            <span className="text-xs text-muted">(barcha maktablar bo'yicha o'rtacha)</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={wellbeing}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EAF3FB" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#51728C' }} axisLine={false} tickLine={false} />
              <YAxis domain={[60, 100]} tick={{ fontSize: 12, fill: '#51728C' }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(value: number) => [`${value}%`, 'Farovonlik']}
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
                dataKey="score"
                stroke="#1B6FA8"
                strokeWidth={3}
                dot={{ r: 4, fill: '#1B6FA8', stroke: '#fff', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#E8734A' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>

      {/* Bottom grid: Region + Top Schools */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Region Distribution */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card variant="white" className="!p-5">
            <h3 className="text-base font-bold text-deep mb-4">Viloyat bo'yicha taqsimot</h3>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie
                    data={regions.filter((r) => r.count > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={80}
                    dataKey="count"
                    paddingAngle={3}
                    stroke="none"
                  >
                    {regions
                      .filter((r) => r.count > 0)
                      .map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, _: string, props: any) => [`${value} o'quvchi`, props.payload.region]}
                    contentStyle={{
                      background: '#fff',
                      border: '1px solid #D3E6F5',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {regions
                  .filter((r) => r.count > 0)
                  .map((r) => (
                    <div key={r.region} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: r.color }} />
                      <span className="text-xs text-muted flex-1 truncate">{r.region}</span>
                      <span className="text-xs font-bold text-deep">{r.count}</span>
                    </div>
                  ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Top Schools */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card variant="white" className="!p-5">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-4 h-4 text-coral" />
              <h3 className="text-base font-bold text-deep">Top maktablar reytingi</h3>
            </div>
            <div className="space-y-3">
              {topSchools.map((school, idx) => (
                <div key={school.id} className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 ${
                    idx === 0 ? 'bg-coral/10 text-coral' : idx === 1 ? 'bg-primary/10 text-primary' : 'bg-bg text-muted'
                  }`}>
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-deep truncate">{school.number}-maktab</span>
                      <span className="text-xs font-bold text-primary">{school.score}%</span>
                    </div>
                    <div className="w-full h-2 bg-bg rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${school.score}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.1 }}
                        className={`h-full rounded-full ${
                          idx === 0 ? 'bg-coral' : idx === 1 ? 'bg-primary' : 'bg-primary/50'
                        }`}
                      />
                    </div>
                  </div>
                  <span className="text-[11px] text-muted shrink-0">{school.studentCount} o'quv.</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
