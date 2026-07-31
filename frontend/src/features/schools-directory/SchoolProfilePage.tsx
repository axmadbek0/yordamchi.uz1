/**
 * SchoolProfilePage — /maktablar/:schoolId
 * 5 states: loading, empty (partial data — hide blank fields), error, success, not-found
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  Phone,
  MapPin,
  Clock,
  BadgeCheck,
  Award,
  Calendar,
  BookOpen,
  Users,
  ChevronDown,
  ExternalLink,
  ArrowLeft,
  School,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import { getSchoolById } from '../../lib/schoolsApi';
import type { SchoolDetail } from '../../types';

// ————————————————————————————
// Skeleton
// ————————————————————————————

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-bg animate-pulse">
      <div className="h-72 bg-gradient-to-br from-primary/15 to-cardBlue" />
      <div className="max-w-3xl mx-auto px-4 -mt-8 space-y-5 pb-32">
        <div className="bg-white rounded-2xl p-6 shadow-md space-y-3">
          <div className="h-6 bg-primary/10 rounded w-3/4" />
          <div className="h-4 bg-primary/6 rounded w-1/2" />
          <div className="h-4 bg-primary/6 rounded w-2/3" />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-md space-y-3">
            <div className="h-5 bg-primary/8 rounded w-1/3" />
            <div className="h-4 bg-primary/6 rounded" />
            <div className="h-4 bg-primary/6 rounded w-4/5" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ————————————————————————————
// FAQ Accordion item
// ————————————————————————————

function FaqAccordion({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-primary/8 last:border-b-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 py-4 text-left"
      >
        <span className="text-sm font-semibold text-deep">{question}</span>
        <ChevronDown
          className={`w-4 h-4 text-muted flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="text-sm text-muted leading-relaxed pb-4">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ————————————————————————————
// Photo Carousel
// ————————————————————————————

function PhotoCarousel({ photos, name }: { photos: string[]; name: string }) {
  const [idx, setIdx] = useState(0);
  const prev = () => setIdx((i) => (i - 1 + photos.length) % photos.length);
  const next = () => setIdx((i) => (i + 1) % photos.length);

  if (photos.length === 0) return null;

  return (
    <div className="relative h-72 md:h-96 overflow-hidden group">
      <AnimatePresence mode="wait">
        <motion.img
          key={idx}
          src={photos[idx]}
          alt={`${name} - rasm ${idx + 1}`}
          initial={{ opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full h-full object-cover"
        />
      </AnimatePresence>

      {photos.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft className="w-5 h-5 text-deep" />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="w-5 h-5 text-deep" />
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`w-2 h-2 rounded-full transition-all ${i === idx ? 'bg-white w-5' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ————————————————————————————
// Hero brand placeholder (no photos)
// ————————————————————————————

function HeroPlaceholder({ school }: { school: SchoolDetail }) {
  return (
    <div className="h-72 md:h-80 bg-gradient-to-br from-deep via-primary to-[#1E5F9A] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/5" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-white/5" />

      <div className="w-20 h-20 rounded-3xl bg-white/15 backdrop-blur flex items-center justify-center mb-4 shadow-xl z-10">
        <School className="w-10 h-10 text-white" />
      </div>
      <h2 className="text-white font-bold text-xl text-center px-8 z-10">{school.number}-maktab</h2>
      <p className="text-white/60 text-sm mt-1 z-10">{school.region}</p>
    </div>
  );
}

// ————————————————————————————
// Main
// ————————————————————————————

export function SchoolProfilePage() {
  const { schoolId } = useParams<{ schoolId: string }>();
  const navigate = useNavigate();

  type PageState = 'loading' | 'success' | 'error' | 'not_found';
  const [state, setState] = useState<PageState>('loading');
  const [school, setSchool] = useState<SchoolDetail | null>(null);

  useEffect(() => {
    if (!schoolId) {
      setState('not_found');
      return;
    }

    setState('loading');
    getSchoolById(schoolId)
      .then((data) => {
        if (!data) {
          setState('not_found');
        } else {
          setSchool(data);
          setState('success');
        }
      })
      .catch(() => setState('error'));
  }, [schoolId]);

  // ——— Loading ———
  if (state === 'loading') return <ProfileSkeleton />;

  // ——— Not found ———
  if (state === 'not_found') {
    return (
      <div className="min-h-screen bg-bg flex flex-col">
        <div className="bg-gradient-to-br from-deep to-primary h-16" />
        <div className="flex-1 flex flex-col items-center justify-center px-4 text-center py-20">
          <div className="w-20 h-20 rounded-3xl bg-primary/8 flex items-center justify-center mb-5">
            <School className="w-10 h-10 text-primary/30" />
          </div>
          <h1 className="text-2xl font-black text-deep mb-2">Bu maktab topilmadi</h1>
          <p className="text-muted max-w-sm leading-relaxed mb-6">
            Ehtimol maktab o'chirilgan yoki havola noto'g'ri. Iltimos, barcha maktablar ro'yxatiga qayting.
          </p>
          <button
            onClick={() => navigate('/maktablar')}
            className="flex items-center gap-2 bg-primary text-white font-semibold px-6 py-3 rounded-xl hover:bg-deep transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Barcha maktablarni ko'rish
          </button>
        </div>
      </div>
    );
  }

  // ——— Error ———
  if (state === 'error') {
    return (
      <div className="min-h-screen bg-bg flex flex-col">
        <div className="bg-gradient-to-br from-deep to-primary h-16" />
        <div className="flex-1 flex flex-col items-center justify-center px-4 text-center py-20">
          <AlertTriangle className="w-12 h-12 text-coral/40 mb-4" />
          <h2 className="text-xl font-bold text-deep mb-2">Maktab ma'lumotini yuklab bo'lmadi</h2>
          <p className="text-muted mb-6">Internet aloqasini tekshirib, qaytadan urining</p>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/maktablar')}
              className="flex items-center gap-2 border border-primary/20 text-primary font-semibold px-5 py-2.5 rounded-xl hover:bg-primary/5 transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Orqaga
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 bg-primary text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-deep transition-colors text-sm"
            >
              Qayta urinish
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ——— Success ———
  if (!school) return null;

  const photos: string[] = [
    ...(school.photoUrls ?? []),
    ...(school.photoUrl ? [school.photoUrl] : []),
  ];

  const yearsActive = school.foundedYear
    ? new Date().getFullYear() - school.foundedYear
    : null;

  const mapsUrl = school.lat && school.lng
    ? `https://www.openstreetmap.org/?mlat=${school.lat}&mlon=${school.lng}&zoom=16`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(school.address)}`;

  return (
    <div className="min-h-screen bg-bg pb-28">
      {/* ——— Hero ——— */}
      {photos.length > 0 ? (
        <div className="relative">
          <PhotoCarousel photos={photos} name={school.name} />
          {/* Overlay nav */}
          <button
            onClick={() => navigate('/maktablar')}
            className="absolute top-4 left-4 flex items-center gap-1.5 bg-black/30 backdrop-blur-sm text-white text-sm font-medium px-3 py-2 rounded-xl hover:bg-black/50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Orqaga
          </button>
        </div>
      ) : (
        <div className="relative">
          <HeroPlaceholder school={school} />
          <button
            onClick={() => navigate('/maktablar')}
            className="absolute top-4 left-4 flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white text-sm font-medium px-3 py-2 rounded-xl hover:bg-white/25 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Orqaga
          </button>
        </div>
      )}

      {/* ——— Content ——— */}
      <div className="max-w-3xl mx-auto px-4">
        {/* Title card — overlaps hero */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg shadow-primary/8 p-6 -mt-6 relative z-10 border border-primary/5 mb-5"
        >
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              {school.isVerified && (
                <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full mb-2">
                  <BadgeCheck className="w-3.5 h-3.5" />
                  Tekshirilgan maktab
                </div>
              )}
              <h1 className="text-xl font-black text-deep leading-snug mb-1">{school.name}</h1>
              <div className="flex items-center gap-1.5 text-sm text-muted mt-1">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{[school.district, school.region].filter(Boolean).join(', ')}</span>
              </div>
            </div>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/8 hover:bg-primary hover:text-white px-3 py-2 rounded-xl transition-all flex-shrink-0"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Xaritada ko'rish
            </a>
          </div>
        </motion.div>

        {/* ——— Description ——— */}
        {school.description && (
          <Section title="Maktab haqida" icon={<BookOpen className="w-4 h-4" />}>
            <p className="text-sm text-muted leading-relaxed">{school.description}</p>

            {/* Quick stats row */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              {school.classCount > 0 && (
                <StatBadge label="Sinflar" value={String(school.classCount)} />
              )}
              {school.ageRangeMin && school.ageRangeMax && (
                <StatBadge label="Yosh" value={`${school.ageRangeMin}–${school.ageRangeMax}`} />
              )}
              {school.studentCount > 0 && (
                <StatBadge label="O'quvchi" value={String(school.studentCount)} />
              )}
            </div>
          </Section>
        )}

        {/* ——— Contact ——— */}
        <Section title="Aloqa" icon={<Phone className="w-4 h-4" />}>
          <div className="space-y-3">
            <a
              href={`tel:${school.phone.replace(/\s/g, '')}`}
              className="flex items-center gap-3 p-3 bg-bg hover:bg-cardBlue rounded-xl transition-colors group"
            >
              <div className="w-9 h-9 rounded-xl bg-primary/10 group-hover:bg-primary flex items-center justify-center flex-shrink-0 transition-colors">
                <Phone className="w-4 h-4 text-primary group-hover:text-white" />
              </div>
              <div>
                <p className="text-xs text-muted">Telefon</p>
                <p className="text-sm font-bold text-deep">{school.phone}</p>
              </div>
            </a>

            <div className="flex items-center gap-3 p-3 bg-bg rounded-xl">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted">Manzil</p>
                <p className="text-sm font-bold text-deep">{school.address}</p>
              </div>
            </div>

            {school.workingHours && school.workingHours !== "Ma'lumot mavjud emas" && school.workingHours !== "Vaqtincha to'xtatilgan" && (
              <div className="flex items-center gap-3 p-3 bg-bg rounded-xl">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted">Ish vaqti</p>
                  <p className="text-sm font-bold text-deep">{school.workingHours}</p>
                </div>
              </div>
            )}
          </div>
        </Section>

        {/* ——— Trust ——— */}
        {(school.isVerified || school.foundedYear || school.licenseNumber) && (
          <Section title="Ishonch" icon={<Award className="w-4 h-4" />}>
            <div className="space-y-3">
              {school.isVerified && (
                <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                  <BadgeCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-700">Tekshirilgan muassasa</p>
                    <p className="text-xs text-emerald-600">Yordamchi Med platformasi tomonidan tasdiqlangan</p>
                  </div>
                </div>
              )}

              {school.foundedYear && (
                <div className="flex items-center gap-3 p-3 bg-bg rounded-xl">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted">Tashkil etilgan</p>
                    <p className="text-sm font-bold text-deep">
                      {school.foundedYear}-yil
                      {yearsActive && yearsActive > 0 ? ` (${yearsActive} yildan beri faoliyatda)` : ''}
                    </p>
                  </div>
                </div>
              )}

              {school.licenseNumber && (
                <div className="flex items-center gap-3 p-3 bg-bg rounded-xl">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Award className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted">Litsenziya raqami</p>
                    <p className="text-sm font-bold text-deep font-mono">{school.licenseNumber}</p>
                  </div>
                </div>
              )}

              {school.teacherCount > 0 && (
                <div className="flex items-center gap-3 p-3 bg-bg rounded-xl">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted">Pedagoglar</p>
                    <p className="text-sm font-bold text-deep">{school.teacherCount} nafar o'qituvchi</p>
                  </div>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* ——— FAQ ——— */}
        {school.faqItems && school.faqItems.length > 0 && (
          <Section title="Tez-tez so'raladigan savollar" icon={<BookOpen className="w-4 h-4" />}>
            <div className="divide-y divide-primary/8">
              {school.faqItems.map((faq, i) => (
                <FaqAccordion key={i} question={faq.question} answer={faq.answer} />
              ))}
            </div>
          </Section>
        )}
      </div>

      {/* ——— Sticky CTA ——— */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-t border-primary/10 px-4 py-4 shadow-lg">
        <div className="max-w-3xl mx-auto flex gap-3">
          <button
            onClick={() => navigate('/maktablar')}
            className="flex items-center gap-2 border border-primary/20 text-primary font-semibold px-4 py-3.5 rounded-xl hover:bg-primary/5 transition-colors text-sm flex-shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
            Orqaga
          </button>
          <a
            href={`tel:${school.phone.replace(/\s/g, '')}`}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-coral to-[#D45F35] text-white font-bold py-3.5 rounded-xl hover:shadow-lg hover:shadow-coral/30 transition-all text-sm"
          >
            <Phone className="w-4 h-4" />
            Qo'ng'iroq qilish
          </a>
        </div>
      </div>
    </div>
  );
}

// ————————————————————————————
// Helpers
// ————————————————————————————

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl border border-primary/5 shadow-sm shadow-primary/5 p-5 mb-4"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
        <h2 className="text-base font-bold text-deep">{title}</h2>
      </div>
      {children}
    </motion.div>
  );
}

function StatBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-bg rounded-xl p-3 text-center">
      <p className="text-lg font-black text-primary">{value}</p>
      <p className="text-xs text-muted mt-0.5">{label}</p>
    </div>
  );
}
