/**
 * Admin Billing — Subscriptions & Payments
 * 5 states implemented
 */

import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  CreditCard,
  AlertTriangle,
  RefreshCw,
  Clock,
} from 'lucide-react';
import { motion } from 'motion/react';
import { getBillingRecords } from '../../lib/adminDb';
import type { BillingRecord } from '../../types';

type LoadState = 'loading' | 'success' | 'error' | 'empty';

export function AdminBilling() {
  const [records, setRecords] = useState<BillingRecord[]>([]);
  const [state, setState] = useState<LoadState>('loading');

  const loadData = () => {
    setState('loading');
    setTimeout(() => {
      try {
        const data = getBillingRecords();
        setRecords(data);
        setState(data.length === 0 ? 'empty' : 'success');
      } catch {
        setState('error');
      }
    }, 400);
  };

  useEffect(() => {
    loadData();
  }, []);

  const overdueRecords = records.filter((r) => r.status === 'overdue');
  const otherRecords = records.filter((r) => r.status !== 'overdue');

  // Loading
  if (state === 'loading') {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-primary/10 rounded-lg w-48 animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 bg-white rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Error
  if (state === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <AlertTriangle className="w-12 h-12 text-coral/40 mb-3" />
        <h2 className="text-lg font-bold text-deep mb-2">To'lov ma'lumotlarini yuklab bo'lmadi</h2>
        <p className="text-muted mb-4">Iltimos, qaytadan urining</p>
        <Button variant="outline" onClick={loadData}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Qayta urinish
        </Button>
      </div>
    );
  }

  // Empty
  if (state === 'empty') {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-black text-deep font-serif">Obunalar / To'lovlar</h1>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <CreditCard className="w-8 h-8 text-primary/40" />
          </div>
          <h2 className="text-lg font-bold text-deep mb-2">To'lov ma'lumotlari yo'q</h2>
          <p className="text-muted max-w-sm">Maktablar obuna bo'lgandan so'ng to'lovlar bu yerda ko'rinadi</p>
        </div>
      </div>
    );
  }

  const statusBadge = (status: BillingRecord['status']) => {
    const map: Record<BillingRecord['status'], { variant: 'success' | 'danger' | 'muted'; label: string }> = {
      active: { variant: 'success', label: 'Faol' },
      overdue: { variant: 'danger', label: "Muddati o'tgan" },
      cancelled: { variant: 'muted', label: 'Bekor qilingan' },
    };
    const s = map[status];
    return <Badge variant={s.variant}>{s.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-deep font-serif">Obunalar / To'lovlar</h1>
          <p className="text-sm text-muted mt-0.5">{records.length} ta to'lov yozuvi</p>
        </div>
        <Button variant="ghost" size="sm" onClick={loadData}>
          <RefreshCw className="w-4 h-4 mr-1.5" />
          Yangilash
        </Button>
      </div>

      {/* Overdue Section */}
      {overdueRecords.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Card variant="white" className="!p-0 overflow-hidden border-2 !border-coral/20">
            <div className="bg-coral/5 px-4 py-3 border-b border-coral/10 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-coral" />
              <h3 className="text-sm font-bold text-coral">Muddati o'tgan to'lovlar ({overdueRecords.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-coral/3 border-b border-coral/10">
                    <th className="text-left px-4 py-3 font-semibold text-muted text-xs uppercase tracking-wider">Maktab</th>
                    <th className="text-center px-4 py-3 font-semibold text-muted text-xs uppercase tracking-wider">Status</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted text-xs uppercase tracking-wider">Reja</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted text-xs uppercase tracking-wider">To'lov sanasi</th>
                    <th className="text-right px-4 py-3 font-semibold text-muted text-xs uppercase tracking-wider">Summa</th>
                  </tr>
                </thead>
                <tbody>
                  {overdueRecords.map((r) => (
                    <tr key={r.id} className="border-b border-coral/5 bg-coral/2 hover:bg-coral/5 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-deep">{r.schoolNumber}-maktab</p>
                        <p className="text-xs text-muted">{r.schoolName}</p>
                      </td>
                      <td className="px-4 py-3 text-center">{statusBadge(r.status)}</td>
                      <td className="px-4 py-3 text-muted">{r.plan}</td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1 text-coral text-xs font-semibold">
                          <Clock className="w-3 h-3" />
                          {new Date(r.nextPayment).toLocaleDateString('uz-UZ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-coral">{r.amount.toLocaleString()} so'm</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      )}

      {/* All Other Records */}
      <Card variant="white" className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-bg/50 border-b border-primary/5">
                <th className="text-left px-4 py-3 font-semibold text-muted text-xs uppercase tracking-wider">Maktab</th>
                <th className="text-center px-4 py-3 font-semibold text-muted text-xs uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-muted text-xs uppercase tracking-wider">Reja</th>
                <th className="text-left px-4 py-3 font-semibold text-muted text-xs uppercase tracking-wider">Keyingi to'lov</th>
                <th className="text-right px-4 py-3 font-semibold text-muted text-xs uppercase tracking-wider">Summa</th>
              </tr>
            </thead>
            <tbody>
              {otherRecords.map((r) => (
                <tr key={r.id} className="border-b border-primary/5 hover:bg-bg/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-deep">{r.schoolNumber}-maktab</p>
                    <p className="text-xs text-muted">{r.schoolName}</p>
                  </td>
                  <td className="px-4 py-3 text-center">{statusBadge(r.status)}</td>
                  <td className="px-4 py-3 text-muted">{r.plan}</td>
                  <td className="px-4 py-3 text-muted text-xs">{new Date(r.nextPayment).toLocaleDateString('uz-UZ')}</td>
                  <td className="px-4 py-3 text-right font-semibold text-deep">{r.amount.toLocaleString()} so'm</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
