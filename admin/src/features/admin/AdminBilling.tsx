/**
 * Admin Billing & Payments — Subscriptions & User Payments Management
 * Comprehensive 2-tab view: Foydalanuvchi to'lovlari & Maktab obunalari
 */

import { useState, useEffect, useMemo } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  CreditCard,
  AlertTriangle,
  RefreshCw,
  Clock,
  Search,
  Plus,
  CheckCircle2,
  XCircle,
  FileText,
  Filter,
  User,
  School as SchoolIcon,
  TrendingUp,
  X,
  Sparkles,
  ShieldCheck,
  Calendar,
  Phone,
  Layers,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  getBillingRecords,
  getUserPayments,
  addUserPayment,
  updateUserPaymentStatus,
} from '../../lib/adminDb';
import type { BillingRecord, UserPaymentRecord, PaymentStatus, PaymentProvider } from '../../types';

type TabType = 'user_payments' | 'school_billing';
type LoadState = 'loading' | 'success' | 'error' | 'empty';

export function AdminBilling() {
  const [activeTab, setActiveTab] = useState<TabType>('user_payments');
  const [schoolRecords, setSchoolRecords] = useState<BillingRecord[]>([]);
  const [userPayments, setUserPayments] = useState<UserPaymentRecord[]>([]);
  const [state, setState] = useState<LoadState>('loading');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [providerFilter, setProviderFilter] = useState<string>('all');

  // Modals
  const [selectedReceipt, setSelectedReceipt] = useState<UserPaymentRecord | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Payment Form State
  const [newPaymentForm, setNewPaymentForm] = useState<{
    userName: string;
    userRole: 'parent' | 'teacher' | 'school_admin';
    userPhone: string;
    studentName: string;
    schoolNumber: string;
    planName: string;
    amount: string;
    provider: PaymentProvider;
    status: PaymentStatus;
  }>({
    userName: '',
    userRole: 'parent',
    userPhone: '+998 ',
    studentName: '',
    schoolNumber: '12',
    planName: 'Ota-ona Premium (AI Maslahatchi + Oylik Tahlil)',
    amount: '89000',
    provider: 'Click',
    status: 'completed',
  });

  const loadData = () => {
    setState('loading');
    setTimeout(() => {
      try {
        const schoolsData = getBillingRecords();
        const usersData = getUserPayments();
        setSchoolRecords(schoolsData);
        setUserPayments(usersData);
        setState('success');
      } catch {
        setState('error');
      }
    }, 300);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered User Payments
  const filteredUserPayments = useMemo(() => {
    return userPayments.filter((payment) => {
      const matchesSearch =
        payment.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.userPhone.includes(searchQuery) ||
        payment.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (payment.studentName && payment.studentName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        payment.planName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
      const matchesProvider = providerFilter === 'all' || payment.provider === providerFilter;

      return matchesSearch && matchesStatus && matchesProvider;
    });
  }, [userPayments, searchQuery, statusFilter, providerFilter]);

  // Statistics
  const stats = useMemo(() => {
    const totalUserRevenue = userPayments
      .filter((p) => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);

    const totalSchoolRevenue = schoolRecords
      .filter((s) => s.status === 'active')
      .reduce((sum, s) => sum + s.amount, 0);

    const totalRevenue = totalUserRevenue + totalSchoolRevenue;

    const activeUserCount = userPayments.filter((p) => p.status === 'completed').length;
    const pendingUserCount = userPayments.filter((p) => p.status === 'pending').length;
    const overdueCount = userPayments.filter((p) => p.status === 'overdue').length +
      schoolRecords.filter((s) => s.status === 'overdue').length;

    return {
      totalRevenue,
      totalUserRevenue,
      activeUserCount,
      pendingUserCount,
      overdueCount,
    };
  }, [userPayments, schoolRecords]);

  // Handle Quick Status Change
  const handleStatusChange = (id: string, newStatus: PaymentStatus) => {
    const updated = updateUserPaymentStatus(id, newStatus);
    if (updated) {
      setUserPayments((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
      );
      if (selectedReceipt && selectedReceipt.id === id) {
        setSelectedReceipt((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    }
  };

  // Handle Add New Payment
  const handleAddPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPaymentForm.userName || !newPaymentForm.amount) return;

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);

    const created = addUserPayment({
      userName: newPaymentForm.userName,
      userRole: newPaymentForm.userRole,
      userPhone: newPaymentForm.userPhone,
      studentName: newPaymentForm.studentName || undefined,
      schoolNumber: Number(newPaymentForm.schoolNumber) || 12,
      planName: newPaymentForm.planName,
      amount: Number(newPaymentForm.amount) || 0,
      provider: newPaymentForm.provider,
      status: newPaymentForm.status,
      expiryDate: expiryDate.toISOString().split('T')[0],
      cardNumberMasked: '8600 **** **** ' + Math.floor(1000 + Math.random() * 9000),
    });

    setUserPayments((prev) => [created, ...prev]);
    setIsAddModalOpen(false);
    setNewPaymentForm({
      userName: '',
      userRole: 'parent',
      userPhone: '+998 ',
      studentName: '',
      schoolNumber: '12',
      planName: 'Ota-ona Premium (AI Maslahatchi + Oylik Tahlil)',
      amount: '89000',
      provider: 'Click',
      status: 'completed',
    });
  };

  // Status Badge Helper
  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Bajarildi
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600 animate-spin" /> Kutilmoqda
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-3 h-3 text-rose-600" /> Muddati o'tgan
          </span>
        );
      case 'refunded':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <XCircle className="w-3 h-3 text-slate-500" /> Qaytarildi
          </span>
        );
    }
  };

  // Provider Badge
  const getProviderBadge = (provider: PaymentProvider) => {
    const colors: Record<PaymentProvider, string> = {
      Click: 'bg-sky-50 text-sky-700 border-sky-200',
      Payme: 'bg-teal-50 text-teal-700 border-teal-200',
      'Uzum Pay': 'bg-purple-50 text-purple-700 border-purple-200',
      'Karta (Uzcard/Humo)': 'bg-blue-50 text-blue-700 border-blue-200',
    };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold border ${colors[provider]}`}>
        {provider}
      </span>
    );
  };

  // Loading State
  if (state === 'loading') {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-primary/10 rounded-lg w-48 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-white rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-white rounded-2xl animate-pulse" />
      </div>
    );
  }

  // Error State
  if (state === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <AlertTriangle className="w-12 h-12 text-coral/40 mb-3" />
        <h2 className="text-lg font-bold text-deep mb-2">To'lov ma'lumotlarini yuklab bo'lmadi</h2>
        <p className="text-muted mb-4">Iltimos, qaytadan urining</p>
        <Button variant="outline" onClick={loadData}>
          <RefreshCw className="w-4 h-4 mr-2" /> Qayta urinish
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-deep font-serif">Obunalar / To'lovlar</h1>
            <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-0.5 rounded-full">
              Barcha Tranzaksiyalar
            </span>
          </div>
          <p className="text-sm text-muted mt-1">
            Foydalanuvchi obunalari, ota-ona to'lovlari va maktab litsenziyalarini boshqarish
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={loadData}>
            <RefreshCw className="w-4 h-4 mr-1.5" /> Yangilash
          </Button>
          <Button
            size="sm"
            className="bg-primary hover:bg-primary/90 text-white font-bold shadow-md hover:shadow-lg transition-all"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-1.5" /> To'lov Qo'shish
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="white" className="p-4 relative overflow-hidden border border-primary/10 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted uppercase tracking-wider">Jami Daromad</p>
              <h3 className="text-xl font-black text-deep mt-1">
                {stats.totalRevenue.toLocaleString()} <span className="text-xs font-normal text-muted">so'm</span>
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold">
            <Sparkles className="w-3 h-3" /> Ota-onalar va Maktablar to'lovi
          </div>
        </Card>

        <Card variant="white" className="p-4 relative overflow-hidden border border-primary/10 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted uppercase tracking-wider">Faol Obunachilar</p>
              <h3 className="text-xl font-black text-deep mt-1">{stats.activeUserCount} ta</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-sky-600 font-semibold">
            <ShieldCheck className="w-3 h-3" /> Muvaffaqiyatli to'lov qilganlar
          </div>
        </Card>

        <Card variant="white" className="p-4 relative overflow-hidden border border-primary/10 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted uppercase tracking-wider">Kutilayotgan To'lovlar</p>
              <h3 className="text-xl font-black text-amber-600 mt-1">{stats.pendingUserCount} ta</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-[11px] text-muted">
            Tekshirish va tasdiqlash jarayonida
          </div>
        </Card>

        <Card variant="white" className="p-4 relative overflow-hidden border border-coral/20 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-coral uppercase tracking-wider">Qarzdorlik / Muddati o'tgan</p>
              <h3 className="text-xl font-black text-coral mt-1">{stats.overdueCount} ta</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-coral/10 text-coral flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-[11px] text-coral/80 font-medium">
            Obuna muddatini uzaytirish talab etiladi
          </div>
        </Card>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-primary/10 gap-2">
        <button
          onClick={() => setActiveTab('user_payments')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'user_payments'
              ? 'border-primary text-primary bg-primary/5 rounded-t-xl'
              : 'border-transparent text-muted hover:text-deep hover:bg-bg/50 rounded-t-xl'
          }`}
        >
          <User className="w-4 h-4" />
          Foydalanuvchi (Ota-ona / O'qituvchi) To'lovlari
          <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary">
            {userPayments.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('school_billing')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'school_billing'
              ? 'border-primary text-primary bg-primary/5 rounded-t-xl'
              : 'border-transparent text-muted hover:text-deep hover:bg-bg/50 rounded-t-xl'
          }`}
        >
          <SchoolIcon className="w-4 h-4" />
          Maktablar Obunalari
          <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700">
            {schoolRecords.length}
          </span>
        </button>
      </div>

      {/* TAB 1: User Payments */}
      {activeTab === 'user_payments' && (
        <div className="space-y-4">
          {/* Search & Filters Toolbar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-primary/8 shadow-sm">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Foydalanuvchi ismi, telefon, tranzaksiya ID yoki obuna bo'yicha qidiruv..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-bg/50 rounded-xl text-sm border border-primary/10 focus:outline-none focus:border-primary transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-deep"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Selects */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 bg-bg/50 px-3 py-1.5 rounded-xl border border-primary/10">
                <Filter className="w-3.5 h-3.5 text-muted" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-deep focus:outline-none cursor-pointer"
                >
                  <option value="all">Barcha Statuslar</option>
                  <option value="completed">Bajarildi</option>
                  <option value="pending">Kutilmoqda</option>
                  <option value="overdue">Muddati o'tgan</option>
                  <option value="refunded">Qaytarildi</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-bg/50 px-3 py-1.5 rounded-xl border border-primary/10">
                <CreditCard className="w-3.5 h-3.5 text-muted" />
                <select
                  value={providerFilter}
                  onChange={(e) => setProviderFilter(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-deep focus:outline-none cursor-pointer"
                >
                  <option value="all">Barcha To'lov Turlari</option>
                  <option value="Click">Click</option>
                  <option value="Payme">Payme</option>
                  <option value="Uzum Pay">Uzum Pay</option>
                  <option value="Karta (Uzcard/Humo)">Karta (Uzcard/Humo)</option>
                </select>
              </div>
            </div>
          </div>

          {/* User Payments Table */}
          <Card variant="white" className="!p-0 overflow-hidden border border-primary/10 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="bg-bg/60 border-b border-primary/10 text-muted text-xs uppercase tracking-wider font-semibold">
                    <th className="px-4 py-3.5">Foydalanuvchi & Farzand</th>
                    <th className="px-4 py-3.5">Obuna Rejasi</th>
                    <th className="px-4 py-3.5">Tranzaksiya ID & Usul</th>
                    <th className="px-4 py-3.5 text-center">Status</th>
                    <th className="px-4 py-3.5 text-right">Summa</th>
                    <th className="px-4 py-3.5 text-center">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/5">
                  {filteredUserPayments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-muted">
                        <CreditCard className="w-10 h-10 mx-auto mb-2 text-muted/40" />
                        <p className="font-semibold text-deep">Qidiruv bo'yicha to'lovlar topilmadi</p>
                        <p className="text-xs text-muted mt-1">Filtr yoki qidiruv so'zini o'zgartirib ko'ring</p>
                      </td>
                    </tr>
                  ) : (
                    filteredUserPayments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-bg/40 transition-colors">
                        {/* User & Student info */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                              {payment.userName.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-deep text-sm leading-tight">{payment.userName}</p>
                              <p className="text-xs text-muted flex items-center gap-1 mt-0.5">
                                <Phone className="w-3 h-3 text-muted/70" /> {payment.userPhone}
                              </p>
                              {payment.studentName && (
                                <p className="text-[11px] text-primary/80 font-medium mt-0.5 bg-primary/5 px-2 py-0.5 rounded w-fit">
                                  Ota-ona: {payment.studentName}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Plan Name */}
                        <td className="px-4 py-3.5">
                          <p className="font-semibold text-deep text-xs max-w-[200px] leading-snug">
                            {payment.planName}
                          </p>
                          <p className="text-[11px] text-muted flex items-center gap-1 mt-1">
                            <Calendar className="w-3 h-3" /> Muddat: {payment.expiryDate}
                          </p>
                        </td>

                        {/* Transaction ID & Provider */}
                        <td className="px-4 py-3.5">
                          <p className="font-mono text-xs font-bold text-deep">{payment.transactionId}</p>
                          <div className="mt-1">{getProviderBadge(payment.provider)}</div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5 text-center">{getStatusBadge(payment.status)}</td>

                        {/* Amount */}
                        <td className="px-4 py-3.5 text-right font-black text-deep text-base">
                          {payment.amount.toLocaleString()} <span className="text-xs font-normal text-muted">so'm</span>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Receipt Button */}
                            <button
                              onClick={() => setSelectedReceipt(payment)}
                              className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors"
                              title="Kvitansiya va chekni ko'rish"
                            >
                              <FileText className="w-4 h-4" />
                            </button>

                            {/* Status Toggle Quick Menu */}
                            <select
                              value={payment.status}
                              onChange={(e) => handleStatusChange(payment.id, e.target.value as PaymentStatus)}
                              className="text-xs bg-bg/50 border border-primary/10 rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
                            >
                              <option value="completed">Bajarildi</option>
                              <option value="pending">Kutilmoqda</option>
                              <option value="overdue">Muddati o'tgan</option>
                              <option value="refunded">Qaytarildi</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: School Billing */}
      {activeTab === 'school_billing' && (
        <div className="space-y-4">
          <Card variant="white" className="!p-0 overflow-hidden border border-primary/10 shadow-sm">
            <div className="p-4 border-b border-primary/10 bg-bg/40 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-deep text-sm">Maktab va Internatlar Obuna Litsenziyalari</h3>
                <p className="text-xs text-muted">Tizimga ulangan muassasalar to'lovi va faollik muddati</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="bg-bg/60 border-b border-primary/10 text-muted text-xs uppercase tracking-wider font-semibold">
                    <th className="px-4 py-3.5">Maktab Muassasasi</th>
                    <th className="px-4 py-3.5">Litsenziya Rejasi</th>
                    <th className="px-4 py-3.5 text-center">Status</th>
                    <th className="px-4 py-3.5">Keyingi To'lov Sanasi</th>
                    <th className="px-4 py-3.5 text-right">Oylik Obuna Summasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/5">
                  {schoolRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-bg/40 transition-colors">
                      <td className="px-4 py-3.5">
                        <p className="font-bold text-deep text-sm">{record.schoolNumber}-sonli Maktab</p>
                        <p className="text-xs text-muted">{record.schoolName}</p>
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-deep">{record.plan} Rejasi</td>
                      <td className="px-4 py-3.5 text-center">
                        {record.status === 'active' && (
                          <Badge variant="success">Faol</Badge>
                        )}
                        {record.status === 'overdue' && (
                          <Badge variant="danger">Muddati o'tgan</Badge>
                        )}
                        {record.status === 'cancelled' && (
                          <Badge variant="muted">Bekor qilingan</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-muted font-medium">
                        {new Date(record.nextPayment).toLocaleDateString('uz-UZ')}
                      </td>
                      <td className="px-4 py-3.5 text-right font-black text-deep">
                        {record.amount.toLocaleString()} <span className="text-xs font-normal text-muted">so'm</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* MODAL 1: Receipt / Invoice Modal */}
      <AnimatePresence>
        {selectedReceipt && (
          <div className="fixed inset-0 bg-deep/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-primary/10 relative overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-primary/10">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-deep text-base font-serif">To'lov Kvitansiyasi</h3>
                    <p className="text-xs text-muted">Tranzaksiya Cheki #{selectedReceipt.transactionId}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="w-8 h-8 rounded-full bg-bg flex items-center justify-center text-muted hover:text-deep"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Receipt Content */}
              <div className="py-5 space-y-4">
                <div className="text-center py-4 bg-bg/50 rounded-2xl border border-primary/5">
                  <p className="text-xs font-medium text-muted uppercase tracking-wider">To'langan Summa</p>
                  <h2 className="text-3xl font-black text-deep mt-1">
                    {selectedReceipt.amount.toLocaleString()} <span className="text-sm text-muted font-normal">so'm</span>
                  </h2>
                  <div className="mt-2 inline-block">{getStatusBadge(selectedReceipt.status)}</div>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-dashed border-primary/10">
                    <span className="text-muted">Foydalanuvchi:</span>
                    <span className="font-bold text-deep">{selectedReceipt.userName}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-dashed border-primary/10">
                    <span className="text-muted">Telefon:</span>
                    <span className="font-medium text-deep">{selectedReceipt.userPhone}</span>
                  </div>
                  {selectedReceipt.studentName && (
                    <div className="flex justify-between py-1.5 border-b border-dashed border-primary/10">
                      <span className="text-muted">Oquvchi / Farzand:</span>
                      <span className="font-medium text-primary">{selectedReceipt.studentName}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-1.5 border-b border-dashed border-primary/10">
                    <span className="text-muted">Obuna Rejasi:</span>
                    <span className="font-semibold text-deep text-right">{selectedReceipt.planName}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-dashed border-primary/10">
                    <span className="text-muted">To'lov Usuli:</span>
                    <span>{getProviderBadge(selectedReceipt.provider)}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-dashed border-primary/10">
                    <span className="text-muted">Karta:</span>
                    <span className="font-mono text-muted">{selectedReceipt.cardNumberMasked || '8600 **** **** ****'}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-dashed border-primary/10">
                    <span className="text-muted">To'lov Sanasi:</span>
                    <span className="font-medium text-deep">
                      {new Date(selectedReceipt.paymentDate).toLocaleString('uz-UZ')}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-muted">Amal Qilish Muddati:</span>
                    <span className="font-bold text-emerald-600">{selectedReceipt.expiryDate} gacha</span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 text-xs"
                  onClick={() => {
                    alert(`Tranzaksiya #${selectedReceipt.transactionId} kvitansiyasi chop etishga tayyorlandi`);
                  }}
                >
                  Chekni Chop Etish
                </Button>
                <Button
                  className="flex-1 text-xs bg-primary text-white font-bold"
                  onClick={() => setSelectedReceipt(null)}
                >
                  Yopish
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: Add Manual Payment */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-deep/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-primary/10 relative overflow-hidden"
            >
              <div className="flex items-center justify-between pb-4 border-b border-primary/10">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-deep text-base font-serif">Yangi To'lov Qo'shish</h3>
                    <p className="text-xs text-muted">Foydalanuvchi obuna to'lovini kiritish</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-bg flex items-center justify-center text-muted hover:text-deep"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddPaymentSubmit} className="py-4 space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-deep mb-1">Foydalanuvchi F.I.Sh.*</label>
                  <input
                    type="text"
                    required
                    placeholder="Masalan: Dilshoda Karimova"
                    value={newPaymentForm.userName}
                    onChange={(e) => setNewPaymentForm({ ...newPaymentForm, userName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-bg/50 rounded-xl border border-primary/10 focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-deep mb-1">Foydalanuvchi Roli</label>
                    <select
                      value={newPaymentForm.userRole}
                      onChange={(e) => setNewPaymentForm({ ...newPaymentForm, userRole: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 bg-bg/50 rounded-xl border border-primary/10 focus:outline-none focus:border-primary"
                    >
                      <option value="parent">Ota-ona</option>
                      <option value="teacher">O'qituvchi</option>
                      <option value="school_admin">Maktab Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-deep mb-1">Telefon Raqami</label>
                    <input
                      type="text"
                      required
                      placeholder="+998 90 123 45 67"
                      value={newPaymentForm.userPhone}
                      onChange={(e) => setNewPaymentForm({ ...newPaymentForm, userPhone: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-bg/50 rounded-xl border border-primary/10 focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-deep mb-1">Oquvchi / Farzand (ixtiyoriy)</label>
                    <input
                      type="text"
                      placeholder="Jasur Karimov (3-A)"
                      value={newPaymentForm.studentName}
                      onChange={(e) => setNewPaymentForm({ ...newPaymentForm, studentName: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-bg/50 rounded-xl border border-primary/10 focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-deep mb-1">Maktab Raqami</label>
                    <input
                      type="number"
                      placeholder="12"
                      value={newPaymentForm.schoolNumber}
                      onChange={(e) => setNewPaymentForm({ ...newPaymentForm, schoolNumber: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-bg/50 rounded-xl border border-primary/10 focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-deep mb-1">Obuna Rejasi</label>
                  <select
                    value={newPaymentForm.planName}
                    onChange={(e) => setNewPaymentForm({ ...newPaymentForm, planName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-bg/50 rounded-xl border border-primary/10 focus:outline-none focus:border-primary"
                  >
                    <option value="Ota-ona Premium (AI Maslahatchi + Oylik Tahlil)">Ota-ona Premium (89,000 so'm/oy)</option>
                    <option value="Ota-ona Standart Obuna">Ota-ona Standart Obuna (49,000 so'm/oy)</option>
                    <option value="Individual AI Psixologik Yordam">Individual AI Psixologik Yordam (120,000 so'm/oy)</option>
                    <option value="O'qituvchi Pro (Master AI Metodika)">O'qituvchi Pro (199,000 so'm/oy)</option>
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-deep mb-1">Summa (so'm)</label>
                    <input
                      type="number"
                      required
                      placeholder="89000"
                      value={newPaymentForm.amount}
                      onChange={(e) => setNewPaymentForm({ ...newPaymentForm, amount: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-bg/50 rounded-xl border border-primary/10 focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-deep mb-1">To'lov Turi</label>
                    <select
                      value={newPaymentForm.provider}
                      onChange={(e) => setNewPaymentForm({ ...newPaymentForm, provider: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 bg-bg/50 rounded-xl border border-primary/10 focus:outline-none focus:border-primary"
                    >
                      <option value="Click">Click</option>
                      <option value="Payme">Payme</option>
                      <option value="Uzum Pay">Uzum Pay</option>
                      <option value="Karta (Uzcard/Humo)">Karta</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-deep mb-1">Status</label>
                    <select
                      value={newPaymentForm.status}
                      onChange={(e) => setNewPaymentForm({ ...newPaymentForm, status: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 bg-bg/50 rounded-xl border border-primary/10 focus:outline-none focus:border-primary"
                    >
                      <option value="completed">Bajarildi</option>
                      <option value="pending">Kutilmoqda</option>
                      <option value="overdue">Muddati o'tgan</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setIsAddModalOpen(false)}
                  >
                    Bekor qilish
                  </Button>
                  <Button type="submit" className="flex-1 bg-primary text-white font-bold">
                    To'lovni Saqlash
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
