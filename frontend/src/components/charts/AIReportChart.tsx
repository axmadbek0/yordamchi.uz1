/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  TooltipProps,
} from 'recharts';
import { DailyStatusEntry } from '../../types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Heart, Activity, Calendar, Award } from 'lucide-react';

interface AIReportChartProps {
  entries: DailyStatusEntry[];
  onSelectEntry?: (entry: DailyStatusEntry) => void;
}

const moodToScore = {
  xursand: 5,
  oddiy: 3,
  charchagan: 2,
  tashvishli: 1,
};

const scoreToMoodLabel = {
  5: 'Xursand 🌟',
  3: 'Oddiy 🙂',
  2: 'Charchagan 😴',
  1: 'Tashvishli 😟',
};

const moodToColorClass = {
  xursand: 'text-coral bg-coral/10',
  oddiy: 'text-primary bg-primary/10',
  charchagan: 'text-muted bg-muted/10',
  tashvishli: 'text-deep bg-deep/10',
};

export function AIReportChart({ entries, onSelectEntry }: AIReportChartProps) {
  const [selectedRange, setSelectedRange] = useState<'7' | '30'>('7');
  const [activeEntry, setActiveEntry] = useState<DailyStatusEntry | null>(
    entries.length > 0 ? entries[0] : null
  );

  // Filter entries based on range
  const sortedEntries = [...entries]
    .sort((a, b) => a.date.localeCompare(b.date)) // oldest to newest for graph
    .slice(-parseInt(selectedRange));

  const chartData = sortedEntries.map((entry) => ({
    date: new Date(entry.date).toLocaleDateString('uz-UZ', {
      day: 'numeric',
      month: 'short',
    }),
    rawDate: entry.date,
    score: moodToScore[entry.mood] || 3,
    entry: entry,
  }));

  const handlePointClick = (data: any) => {
    if (data && data.activePayload && data.activePayload[0]) {
      const entry = data.activePayload[0].payload.entry;
      setActiveEntry(entry);
      if (onSelectEntry) onSelectEntry(entry);
    }
  };

  // Custom tool tip with no numbers
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const entry = payload[0].payload.entry as DailyStatusEntry;
      return (
        <div className="bg-white/95 backdrop-blur-md p-4 rounded-xl border border-primary/10 shadow-lg text-sm max-w-xs">
          <p className="font-bold text-deep mb-1 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-primary" />
            {new Date(entry.date).toLocaleDateString('uz-UZ', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
          <div className="flex gap-2 mt-2 flex-wrap">
            <Badge variant={entry.mood === 'xursand' ? 'coral' : entry.mood === 'oddiy' ? 'primary' : 'muted'}>
              {scoreToMoodLabel[moodToScore[entry.mood]]}
            </Badge>
            <Badge variant="cardBlue">
              Sog‘liq: {entry.healthStatus}
            </Badge>
          </div>
          <p className="text-xs text-muted mt-2 line-clamp-2">
            "{entry.teacherNote}"
          </p>
          <p className="text-[11px] text-primary font-medium mt-1">
            🔍 Batafsil ko‘rish uchun bosing
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-6">
      <Card variant="white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-deep flex items-center gap-2 font-serif">
              <Activity className="w-5 h-5 text-coral" />
              Farzandingiz rivojlanish va kayfiyat dinamikasi
            </h3>
            <p className="text-sm text-muted">
              Nuqtalarni bosib, kunlik o‘qituvchi izohi va AI hisobotini ko‘ring
            </p>
          </div>
          <div className="flex bg-bg rounded-full p-1 self-start sm:self-center">
            <button
              onClick={() => setSelectedRange('7')}
              className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-all cursor-pointer ${
                selectedRange === '7' ? 'bg-primary text-white' : 'text-muted hover:text-deep'
              }`}
            >
              Haftalik
            </button>
            <button
              onClick={() => setSelectedRange('30')}
              className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-all cursor-pointer ${
                selectedRange === '30' ? 'bg-primary text-white' : 'text-muted hover:text-deep'
              }`}
            >
              Oylik
            </button>
          </div>
        </div>

        {chartData.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center gap-2 text-muted">
            <Calendar className="w-12 h-12 text-primary/20" />
            <p className="font-semibold">Hisobotlar mavjud emas</p>
            <p className="text-xs">Ushbu davr uchun hali kunlik holat kiritilmagan.</p>
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                onClick={handlePointClick}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1B6FA810" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#51728C', fontSize: 12, fontWeight: 500 }}
                />
                <YAxis
                  domain={[0, 6]}
                  ticks={[1, 2, 3, 5]}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => {
                    if (value === 5) return '🌟 Xursand';
                    if (value === 3) return '🙂 Oddiy';
                    if (value === 2) return '😴 Charchoq';
                    if (value === 1) return '😟 Tashvish';
                    return '';
                  }}
                  tick={{ fill: '#123C5C', fontSize: 11, fontWeight: 600 }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#1B6FA820', strokeWidth: 1.5 }} />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#1B6FA8"
                  strokeWidth={3}
                  activeDot={{
                    r: 8,
                    stroke: '#EAF3FB',
                    strokeWidth: 2,
                    fill: '#E8734A',
                  }}
                  dot={{
                    r: 5,
                    stroke: '#FFF',
                    strokeWidth: 2,
                    fill: '#1B6FA8',
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* Selected Day AI analysis summary */}
      {activeEntry && (
        <Card variant="blue" className="border-l-4 border-l-coral relative overflow-hidden">
          <div className="absolute right-3 top-3 opacity-10">
            <Award className="w-20 h-20 text-deep" />
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-primary/10 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                <span className="font-bold text-deep">
                  {new Date(activeEntry.date).toLocaleDateString('uz-UZ', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex gap-2">
                <Badge variant={activeEntry.mood === 'xursand' ? 'coral' : activeEntry.mood === 'oddiy' ? 'primary' : 'muted'}>
                  Kayfiyat: {activeEntry.mood}
                </Badge>
                <Badge variant="success">
                  Sog‘liq: {activeEntry.healthStatus}
                </Badge>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-xs font-semibold text-deep uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-coral" fill="currentColor" />
                  O‘qituvchi izohi:
                </h4>
                <p className="text-base text-ink leading-relaxed italic bg-white/40 p-4 rounded-xl border border-primary/5">
                  "{activeEntry.teacherNote}"
                </p>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-primary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span className="p-1 rounded-full bg-primary/10">🤖</span>
                  AI Tahlili va Ota-onaga Tavsiya:
                </h4>
                <div className="text-base text-deep leading-relaxed bg-primary/5 p-4 rounded-xl border border-primary/10 relative">
                  {activeEntry.aiAnalysis ? (
                    <p>{activeEntry.aiAnalysis}</p>
                  ) : (
                    <p className="text-sm text-muted">
                      Hozircha ushbu kun uchun sun'iy intellekt tahlili shakllantirilmagan.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
