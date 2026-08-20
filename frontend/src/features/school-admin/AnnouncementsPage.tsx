/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import {
  Megaphone,
  Send,
  CheckCircle,
  AlertTriangle,
  Users,
  Bell,
  Clock,
  Sparkles,
  Layers,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { sendAnnouncement, getStudents } from '../../lib/api/schoolAdmin';
import type { AnnouncementItem } from '../../types/schoolAdmin';

export function AnnouncementsPage() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [announcementType, setAnnouncementType] = useState<
    'announcement' | 'urgent' | 'pickup_request'
  >('announcement');
  const [targetScope, setTargetScope] = useState<'all' | 'custom'>('all');
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);

  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; count: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Past announcements list simulation
  const [history, setHistory] = useState<AnnouncementItem[]>([
    {
      id: 'ann-1',
      title: 'Ertangi bayram tadbiri haqida',
      body: 'Hurmatli ota-onalar! Ertaga soat 10:00 da maktab zalida ixtisoslashtirilgan ochiq dars bo‘lib o‘tadi.',
      type: 'announcement',
      targetClasses: '4-A sinf',
      deliveredCount: 2,
      createdAt: new Date().toISOString(),
    },
  ]);

  useEffect(() => {
    const loadClasses = async () => {
      try {
        const students = await getStudents();
        const classes = Array.from(new Set(students.map((s) => s.className).filter(Boolean)));
        setAvailableClasses(classes.length > 0 ? classes : ['4-A sinf', '2-B sinf']);
      } catch {
        setAvailableClasses(['4-A sinf', '2-B sinf']);
      }
    };
    void loadClasses();
  }, []);

  const handleToggleClass = (className: string) => {
    if (selectedClasses.includes(className)) {
      setSelectedClasses(selectedClasses.filter((c) => c !== className));
    } else {
      setSelectedClasses([...selectedClasses, className]);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFeedback(null);

    if (!title.trim()) {
      setError('Bildirishnoma sarlavhasini kiriting');
      return;
    }
    if (!body.trim()) {
      setError('Xabar matnini kiriting');
      return;
    }
    if (targetScope === 'custom' && selectedClasses.length === 0) {
      setError('Kamida bitta sinfni tanlang');
      return;
    }

    setIsSending(true);
    try {
      const res = await sendAnnouncement({
        title: title.trim(),
        body: body.trim(),
        type: announcementType,
        targetClasses: targetScope === 'custom' ? selectedClasses : undefined,
      });

      setFeedback({
        message: 'Bildirishnoma ota-onalar mobil ilovalariga yetkazildi!',
        count: res.deliveredCount,
      });

      setHistory((prev) => [res.announcement, ...prev]);

      setTitle('');
      setBody('');
      setSelectedClasses([]);
      setTargetScope('all');

      setTimeout(() => setFeedback(null), 5000);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Xabar yuborishda xatolik');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black font-serif text-deep flex items-center gap-2.5">
          <Megaphone className="w-7 h-7 text-primary" /> Umumiy Bildirishnomalar Markazi
        </h1>
        <p className="text-sm text-muted">
          Maktab ota-onalariga tezkor e'lonlar, bayram xabarlari yoki shoshilinch ogohlantirishlar yuborish
        </p>
      </div>

      {feedback && (
        <div className="p-4 bg-success/10 text-success border border-success/20 rounded-2xl flex items-center gap-3 text-sm font-bold animate-in fade-in">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>
            {feedback.message} (Yetkazilganlar: {feedback.count} nafar ota-ona)
          </span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-coral/10 text-coral border border-coral/20 rounded-2xl flex items-center gap-3 text-sm font-bold">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Dispatch Form (2 cols) */}
        <form onSubmit={handleSend} className="lg:col-span-2 space-y-5">
          <Card variant="white" className="p-6 sm:p-8 shadow-sm space-y-5">
            {/* Announcement Type Switcher */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-deep">Xabar turi va ahamiyati</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setAnnouncementType('announcement')}
                  className={`p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer text-center ${
                    announcementType === 'announcement'
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'bg-bg text-muted border-cardBlue hover:text-deep'
                  }`}
                >
                  📢 Umumiy E'lon
                </button>
                <button
                  type="button"
                  onClick={() => setAnnouncementType('urgent')}
                  className={`p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer text-center ${
                    announcementType === 'urgent'
                      ? 'bg-coral text-white border-coral shadow-sm'
                      : 'bg-bg text-muted border-cardBlue hover:text-deep'
                  }`}
                >
                  🚨 Shoshilinch
                </button>
                <button
                  type="button"
                  onClick={() => setAnnouncementType('pickup_request')}
                  className={`p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer text-center ${
                    announcementType === 'pickup_request'
                      ? 'bg-[#123C5C] text-white border-[#123C5C] shadow-sm'
                      : 'bg-bg text-muted border-cardBlue hover:text-deep'
                  }`}
                >
                  🚶 Olib ketish
                </button>
              </div>
            </div>

            {/* Target Audience Scope */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-deep">Qamrov (Kimlarga yuboriladi?)</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTargetScope('all')}
                  className={`py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    targetScope === 'all'
                      ? 'bg-primary/10 text-primary border-primary/30 font-extrabold'
                      : 'bg-white text-muted border-cardBlue'
                  }`}
                >
                  🏫 Butun maktabga
                </button>
                <button
                  type="button"
                  onClick={() => setTargetScope('custom')}
                  className={`py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    targetScope === 'custom'
                      ? 'bg-primary/10 text-primary border-primary/30 font-extrabold'
                      : 'bg-white text-muted border-cardBlue'
                  }`}
                >
                  🎯 Tanlangan sinflarga
                </button>
              </div>
            </div>

            {/* Class selector chips if custom */}
            {targetScope === 'custom' && (
              <div className="p-4 rounded-2xl bg-bg border border-cardBlue space-y-2 animate-in fade-in">
                <span className="text-xs font-bold text-deep block">Sinflarni tanlang:</span>
                <div className="flex flex-wrap gap-2">
                  {availableClasses.map((c) => {
                    const isSelected = selectedClasses.includes(c);
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => handleToggleClass(c)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-primary text-white shadow-xs'
                            : 'bg-white text-muted border border-cardBlue'
                        }`}
                      >
                        {c} {isSelected && '✓'}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Title */}
            <Input
              label="Bildirishnoma sarlavhasi"
              placeholder="Masalan: Ertangi bayram tadbiri haqida"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            {/* Body */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-deep">Xabar matni</label>
              <textarea
                rows={4}
                placeholder="Ota-onalarga yetkazilishi kerak bo'lgan xabar mazmuni..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-white border border-cardBlue/60 text-sm focus:outline-hidden focus:border-primary transition-all resize-y"
                required
              />
            </div>

            {/* Submit */}
            <Button
              variant="primary"
              size="lg"
              type="submit"
              disabled={isSending}
              className="gap-2 font-bold shadow-md w-full justify-center"
            >
              <Send className="w-4 h-4" />
              {isSending ? 'Yuborilmoqda...' : 'Bildirishnomani Yuborish'}
            </Button>
          </Card>
        </form>

        {/* Right: Info & Past History */}
        <div className="space-y-5">
          <Card variant="white" className="p-6 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-deep flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" /> Qamrov va yetkazish
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Yuborilgan xabarlar ota-onalarning mobil ilovalariga (iOS / Android) real vaqtda push-bildirishnoma sifatida boradi.
            </p>
            <div className="p-3 rounded-xl bg-cardBlue/30 text-xs font-semibold text-primary">
              ✓ Ota-onalar tezkor javob berishlari mumkin
            </div>
          </Card>

          {/* History */}
          <Card variant="white" className="p-6 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-deep flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" /> Yuborilgan xabarlar tarixi
            </h3>

            <div className="space-y-3">
              {history.map((ann) => (
                <div
                  key={ann.id}
                  className="p-3.5 rounded-2xl bg-bg border border-cardBlue space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between font-bold text-deep">
                    <span className="truncate">{ann.title}</span>
                    <span className="text-[10px] text-success bg-success/10 px-2 py-0.5 rounded-full">
                      ✓ {ann.deliveredCount} yetkazildi
                    </span>
                  </div>
                  <p className="text-muted line-clamp-2">{ann.body}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
