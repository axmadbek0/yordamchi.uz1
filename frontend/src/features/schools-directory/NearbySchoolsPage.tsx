/**
 * NearbySchoolsPage — /maktablar
 * Desktop: split map (left) + scrollable list (right)
 * Mobile: tab toggle Ro'yxat / Xarita
 * 5 states: loading, empty, error, success, partial (location denied)
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  MapPin,
  List,
  Map,
  RefreshCw,
  School,
  ChevronLeft,
  AlertTriangle,
  Navigation,
} from 'lucide-react';
import { useNearbySchools } from './useNearbySchools';
import { LocationPermissionPrompt } from './LocationPermissionPrompt';
import { RegionSelectFallback } from './RegionSelectFallback';
import { SchoolCard } from './SchoolCard';
import { SchoolMap } from './SchoolMap';
import type { SchoolWithLocation } from '../../types';

// ————————————————————————————
// Skeleton helpers
// ————————————————————————————

function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-primary/8 overflow-hidden animate-pulse">
      <div className="h-36 bg-gradient-to-br from-primary/10 to-cardBlue" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-primary/8 rounded w-3/4" />
        <div className="h-3 bg-primary/6 rounded w-1/2" />
        <div className="h-3 bg-primary/6 rounded w-2/3" />
        <div className="h-9 bg-primary/6 rounded-xl" />
      </div>
    </div>
  );
}

function MapSkeleton() {
  return (
    <div className="h-full rounded-2xl bg-gradient-to-br from-cardBlue to-bg animate-pulse flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
          <Map className="w-6 h-6 text-primary/30" />
        </div>
        <p className="text-xs text-muted">Xarita yuklanmoqda...</p>
      </div>
    </div>
  );
}

// ————————————————————————————
// Main component
// ————————————————————————————

export function NearbySchoolsPage() {
  const navigate = useNavigate();
  const { schools, isLoading, error, locationState, userLocation, refetch } = useNearbySchools();

  const [search, setSearch] = useState('');
  const [mobileTab, setMobileTab] = useState<'list' | 'map'>('list');
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [locationMode, setLocationMode] = useState<'gps' | 'manual'>('gps');

  const listRef = useRef<HTMLDivElement>(null);

  // Filter schools
  const filtered: SchoolWithLocation[] = schools.filter((s) => {
    const matchSearch =
      !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.district.toLowerCase().includes(search.toLowerCase());
    const matchRegion = !selectedRegion || s.region === selectedRegion;
    const matchDistrict = !selectedDistrict || s.district === selectedDistrict;
    return matchSearch && matchRegion && matchDistrict;
  });

  // When marker clicked on map → scroll to card + highlight
  const handleMarkerClick = useCallback(
    (id: string) => {
      setHighlightedId(id);
      setMobileTab('list');
      setTimeout(() => {
        const el = document.getElementById(`school-card-${id}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    },
    []
  );

  // Clear highlight after 3s
  useEffect(() => {
    if (!highlightedId) return;
    const t = setTimeout(() => setHighlightedId(null), 3000);
    return () => clearTimeout(t);
  }, [highlightedId]);

  // GPS rad etilganda avtomatik qo'lda tanlashga o'tish
  useEffect(() => {
    if (
      locationState === 'denied' ||
      locationState === 'unsupported' ||
      locationState === 'error'
    ) {
      setLocationMode('manual');
    }
  }, [locationState]);

  const showLocationFallback =
    locationMode === 'manual' ||
    locationState === 'denied' ||
    locationState === 'unsupported' ||
    locationState === 'error';

  const switchToGps = () => {
    setLocationMode('gps');
    setSelectedRegion('');
    setSelectedDistrict('');
    refetch();
  };

  const switchToManual = () => {
    setLocationMode('manual');
  };

  // ————————————————————————————
  // States
  // ————————————————————————————

  const isRequestingLocation =
    locationMode === 'gps' && locationState === 'requesting' && isLoading;

  if (isRequestingLocation) {
    return (
      <div className="min-h-screen bg-bg">
        <PageHeader navigate={navigate} />
        <div className="max-w-7xl mx-auto px-4 pb-12">
          <LocationPermissionPrompt />
        </div>
      </div>
    );
  }

  if (error && !isLoading) {
    return (
      <div className="min-h-screen bg-bg">
        <PageHeader navigate={navigate} />
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-coral/10 flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-coral/60" />
          </div>
          <h2 className="text-xl font-bold text-deep mb-2">Maktablar ro'yxatini yuklab bo'lmadi</h2>
          <p className="text-muted mb-6">Internet aloqasini tekshirib, qaytadan urining</p>
          <button
            onClick={refetch}
            className="flex items-center gap-2 bg-primary text-white font-semibold px-6 py-3 rounded-xl hover:bg-deep transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Qayta urinish
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <PageHeader navigate={navigate} />

      <div className="max-w-7xl mx-auto px-4 pb-12">
        {/* Location denied fallback */}
        <AnimatePresence>
          {showLocationFallback && (
            <RegionSelectFallback
              schools={schools}
              selectedRegion={selectedRegion}
              selectedDistrict={selectedDistrict}
              onRegionChange={setSelectedRegion}
              onDistrictChange={setSelectedDistrict}
            />
          )}
        </AnimatePresence>

        {/* Search + location mode toggle + mobile tabs */}
        <div className="flex flex-col gap-3 mb-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                id="school-search"
                type="text"
                placeholder="Maktab nomi yoki tuman bo'yicha qidirish..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-sm text-ink bg-white border border-primary/10 rounded-xl focus:border-primary focus:outline-none transition-all shadow-sm"
              />
            </div>

            {/* Joriy joylashuvdan / Viloyat tanlash */}
            <div className="flex bg-white border border-primary/10 rounded-xl p-1 shadow-sm flex-shrink-0">
              <button
                type="button"
                onClick={switchToGps}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  locationMode === 'gps' && locationState === 'granted'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-muted hover:text-primary'
                }`}
              >
                <Navigation className="w-3.5 h-3.5" />
                Joriy joylashuvdan
              </button>
              <button
                type="button"
                onClick={switchToManual}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  showLocationFallback
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-muted hover:text-primary'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                Viloyat tanlash
              </button>
            </div>
          </div>

          {/* Mobile tab toggle */}
          <div className="flex md:hidden bg-white border border-primary/10 rounded-xl p-1 shadow-sm">
            <button
              onClick={() => setMobileTab('list')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
                mobileTab === 'list'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted hover:text-primary'
              }`}
            >
              <List className="w-4 h-4" />
              Ro'yxat
            </button>
            <button
              onClick={() => setMobileTab('map')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
                mobileTab === 'map'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted hover:text-primary'
              }`}
            >
              <Map className="w-4 h-4" />
              Xarita
            </button>
          </div>
        </div>

        {/* Result count */}
        {!isLoading && (
          <p className="text-xs text-muted mb-4 font-medium">
            {filtered.length > 0
              ? `${filtered.length} ta maktab topildi`
              : search || selectedRegion
              ? 'Hech narsa topilmadi'
              : ''}
          </p>
        )}

        {/* ——— Desktop: split layout ——— */}
        <div className="hidden md:grid md:grid-cols-[1fr_400px] gap-5" style={{ minHeight: 600 }}>
          {/* LEFT: Map */}
          <div className="sticky top-5" style={{ height: 'calc(100vh - 200px)' }}>
            {isLoading ? (
              <MapSkeleton />
            ) : (
              <SchoolMap
                schools={filtered}
                userLocation={userLocation}
                highlightedId={highlightedId}
                onMarkerClick={handleMarkerClick}
              />
            )}
          </div>

          {/* RIGHT: Scrollable list */}
          <div ref={listRef} className="overflow-y-auto pr-1" style={{ height: 'calc(100vh - 200px)' }}>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)}
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState onReset={() => { setSearch(''); setSelectedRegion(''); setSelectedDistrict(''); }} />
            ) : (
              <div className="space-y-4">
                {filtered.map((school) => (
                  <SchoolCard
                    key={school.id}
                    id={`school-card-${school.id}`}
                    school={school}
                    isHighlighted={highlightedId === school.id}
                    onHover={setHighlightedId}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ——— Mobile: tab view ——— */}
        <div className="md:hidden">
          <AnimatePresence mode="wait">
            {mobileTab === 'list' ? (
              <motion.div
                key="list"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2 }}
              >
                {isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
                  </div>
                ) : filtered.length === 0 ? (
                  <EmptyState onReset={() => { setSearch(''); setSelectedRegion(''); setSelectedDistrict(''); }} />
                ) : (
                  <div className="space-y-4">
                    {filtered.map((school) => (
                      <SchoolCard
                        key={school.id}
                        id={`school-card-${school.id}`}
                        school={school}
                        isHighlighted={highlightedId === school.id}
                        onHover={setHighlightedId}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="map"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.2 }}
                style={{ height: '70vh' }}
              >
                {isLoading ? (
                  <MapSkeleton />
                ) : (
                  <SchoolMap
                    schools={filtered}
                    userLocation={userLocation}
                    highlightedId={highlightedId}
                    onMarkerClick={handleMarkerClick}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ————————————————————————————
// Sub-components
// ————————————————————————————

function PageHeader({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  return (
    <div className="bg-gradient-to-br from-deep via-primary to-[#1E5F9A] text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm mb-5 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Bosh sahifaga qaytish
        </button>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center flex-shrink-0">
            <School className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              Yaqin atrofdagi maktablar
            </h1>
            <p className="text-white/60 text-sm mt-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              Maxsus ta'lim maktab-internatlari
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-primary/8 flex items-center justify-center mb-4">
        <School className="w-8 h-8 text-primary/30" />
      </div>
      <h2 className="text-lg font-bold text-deep mb-2">Sizning hududingizda hozircha ro'yxatdan o'tgan maktab yo'q</h2>
      <p className="text-muted mb-5 max-w-xs">Boshqa hududni tanlab ko'ring yoki qidiruvni tozalang</p>
      <button
        onClick={onReset}
        className="flex items-center gap-2 bg-primary text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-deep transition-colors text-sm"
      >
        Boshqa hududni tanlash
      </button>
    </motion.div>
  );
}
