/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import {
  GraduationCap,
  Search,
  Filter,
  Phone,
  User,
  AlertCircle,
  RefreshCw,
  Clock,
  Heart,
  Smile,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { getStudents } from '../../lib/api/schoolAdmin';
import type { StudentItem } from '../../types/schoolAdmin';

export function StudentsOverviewPage() {
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudentsList = async (classFilter?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const list = await getStudents(classFilter === 'all' ? undefined : classFilter);
      setStudents(list);
    } catch (err: any) {
      setError(err?.response?.data?.message || "O'quvchilar ma'lumotlarini yuklab bo'lmadi");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchStudentsList(selectedClass);
  }, [selectedClass]);

  // Extract unique classes
  const classesList = Array.from(new Set(students.map((s) => s.className).filter(Boolean)));

  const filteredStudents = students.filter(
    (s) =>
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.diagnosis.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.parent?.displayName && s.parent.displayName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black font-serif text-deep flex items-center gap-2.5">
            <GraduationCap className="w-7 h-7 text-primary" /> O'quvchilar Ro'yxati
          </h1>
          <p className="text-sm text-muted">
            Maktab o'quvchilari ma'lumotlari, tashxislari, ota-onalar kontaktlari va bugungi holati
          </p>
        </div>

        <div className="text-xs font-semibold text-muted bg-white px-4 py-2 rounded-2xl border border-cardBlue/50 shadow-xs">
          Jami o'quvchilar: <span className="text-deep font-bold">{students.length}</span> nafar
        </div>
      </div>

      {/* Class filter chips & search */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Class Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedClass('all')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedClass === 'all'
                ? 'bg-primary text-white shadow-sm shadow-primary/25'
                : 'bg-white text-muted hover:text-deep border border-cardBlue/50'
            }`}
          >
            Barcha sinflar
          </button>
          {classesList.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedClass(c)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedClass === c
                  ? 'bg-primary text-white shadow-sm shadow-primary/25'
                  : 'bg-white text-muted hover:text-deep border border-cardBlue/50'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="O'quvchi, tashxis yoki ota-ona..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-cardBlue/50 text-sm focus:outline-hidden focus:border-primary transition-all shadow-xs"
          />
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-white rounded-2xl animate-pulse border border-primary/5" />
          ))}
        </div>
      ) : error ? (
        <Card variant="white" className="p-8 text-center max-w-md mx-auto shadow-sm">
          <AlertCircle className="w-10 h-10 text-coral mx-auto mb-3" />
          <p className="text-sm text-muted mb-4">{error}</p>
          <Button variant="primary" onClick={() => fetchStudentsList(selectedClass)} className="gap-2 mx-auto">
            <RefreshCw className="w-4 h-4" /> Qayta yuklash
          </Button>
        </Card>
      ) : filteredStudents.length === 0 ? (
        <Card variant="white" className="p-12 text-center shadow-sm">
          <GraduationCap className="w-12 h-12 text-muted/50 mx-auto mb-3" />
          <h3 className="text-base font-bold text-deep mb-1">O'quvchi topilmadi</h3>
          <p className="text-xs text-muted">
            {searchQuery ? "Qidiruv bo'yicha hech qanday natija topilmadi" : "Ushbu sinfda o'quvchilar mavjud emas"}
          </p>
        </Card>
      ) : (
        <div className="bg-white rounded-3xl border border-primary/5 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-cardBlue/50 text-[11px] font-bold text-muted uppercase tracking-wider bg-bg/50">
                  <th className="py-4 px-6">O'quvchi</th>
                  <th className="py-4 px-4">Sinf</th>
                  <th className="py-4 px-4">Tashxis / Ehtiyoj</th>
                  <th className="py-4 px-4">Ota-ona & Kontakt</th>
                  <th className="py-4 px-6 text-right">Bugungi Holat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cardBlue/30 text-sm">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-bg/40 transition-colors">
                    {/* Student name */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-cardBlue text-primary flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                          {student.firstName[0]}
                          {student.lastName[0]}
                        </div>
                        <div>
                          <div className="font-bold text-deep">{student.fullName}</div>
                          <div className="text-[11px] text-muted flex items-center gap-1">
                            ID: <span className="font-mono">{student.id.slice(0, 8)}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Class */}
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-bold bg-primary/10 text-primary border border-primary/15">
                        {student.className}
                      </span>
                    </td>

                    {/* Diagnosis */}
                    <td className="py-4 px-4 max-w-xs">
                      <span className="text-xs text-deep/90 line-clamp-2">
                        {student.diagnosis}
                      </span>
                    </td>

                    {/* Parent info */}
                    <td className="py-4 px-4">
                      {student.parent ? (
                        <div className="space-y-0.5">
                          <div className="text-xs font-semibold text-deep flex items-center gap-1">
                            <User className="w-3 h-3 text-muted" /> {student.parent.displayName}
                          </div>
                          {student.parent.phone && (
                            <a
                              href={`tel:${student.parent.phone}`}
                              className="text-[11px] text-primary font-medium hover:underline flex items-center gap-1"
                            >
                              <Phone className="w-3 h-3" /> {student.parent.phone}
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted/60">Biriktirilmagan</span>
                      )}
                    </td>

                    {/* Today's Status */}
                    <td className="py-4 px-6 text-right">
                      {student.todayStatus ? (
                        <div className="inline-flex flex-col items-end gap-1">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-success/10 text-success border border-success/20">
                            <Smile className="w-3.5 h-3.5" /> {student.todayStatus.mood}
                          </span>
                          <span className="text-[10px] text-muted">
                            Salomatlik: {student.todayStatus.health}
                          </span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-bg text-muted border border-cardBlue">
                          <Clock className="w-3 h-3" /> Kiritilmagan
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
