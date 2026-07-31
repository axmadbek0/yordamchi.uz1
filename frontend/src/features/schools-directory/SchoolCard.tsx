/**
 * SchoolCard — compact school listing card
 */

import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { MapPin, Phone, ArrowRight, BadgeCheck, Clock3 } from 'lucide-react';
import { formatDistance } from '../../lib/distance';
import type { SchoolWithLocation } from '../../types';

interface Props {
  school: SchoolWithLocation;
  isHighlighted?: boolean;
  onHover?: (id: string | null) => void;
  id?: string;
}

export function SchoolCard({ school, isHighlighted, onHover, id }: Props) {
  const navigate = useNavigate();

  const yearsActive = school.foundedYear
    ? new Date().getFullYear() - school.foundedYear
    : null;

  return (
    <motion.div
      id={id}
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      onMouseEnter={() => onHover?.(school.id)}
      onMouseLeave={() => onHover?.(null)}
      className={`group bg-white rounded-2xl border transition-all duration-200 overflow-hidden cursor-pointer ${
        isHighlighted
          ? 'border-coral shadow-lg shadow-coral/10 ring-2 ring-coral/20'
          : 'border-primary/8 shadow-sm shadow-primary/5 hover:border-primary/20 hover:shadow-md hover:shadow-primary/10'
      }`}
      onClick={() => navigate(`/maktablar/${school.id}`)}
    >
      {/* Photo / Placeholder */}
      <div className="relative h-36 bg-gradient-to-br from-primary/10 to-cardBlue overflow-hidden">
        {school.photoUrl || (school.photoUrls && school.photoUrls[0]) ? (
          <img
            src={school.photoUrl || school.photoUrls![0]}
            alt={school.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          /* Brand-colored placeholder — never a broken image icon */
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-deep flex items-center justify-center shadow-md">
              <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-white" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
              </svg>
            </div>
            <p className="text-xs text-primary/50 font-medium">{school.number}-maktab</p>
          </div>
        )}

        {/* Distance badge */}
        {school.distanceKm !== undefined && (
          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-primary text-xs font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {formatDistance(school.distanceKm)}
          </div>
        )}

        {/* Verified badge */}
        {school.isVerified && (
          <div className="absolute top-2 left-2 bg-emerald-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
            <BadgeCheck className="w-3 h-3" />
            Tekshirilgan
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-deep text-sm leading-snug line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {school.name}
        </h3>

        <div className="flex items-start gap-1.5 text-xs text-muted mb-1">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          <span className="line-clamp-1">{school.district ? `${school.district}, ` : ''}{school.region}</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted mb-3">
          <Phone className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{school.phone}</span>
        </div>

        {/* Trust indicators */}
        <div className="flex items-center gap-2 flex-wrap mb-3">
          {yearsActive !== null && yearsActive > 0 && (
            <span className="inline-flex items-center gap-1 bg-cardBlue text-primary text-xs font-medium px-2 py-0.5 rounded-full">
              <Clock3 className="w-3 h-3" />
              {yearsActive} yildan beri
            </span>
          )}
          {school.classCount > 0 && (
            <span className="inline-flex items-center gap-1 bg-bg text-muted text-xs font-medium px-2 py-0.5 rounded-full">
              {school.classCount} sinf
            </span>
          )}
          {school.ageRangeMin && school.ageRangeMax && (
            <span className="inline-flex items-center gap-1 bg-bg text-muted text-xs font-medium px-2 py-0.5 rounded-full">
              {school.ageRangeMin}–{school.ageRangeMax} yosh
            </span>
          )}
        </div>

        {/* CTA */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/maktablar/${school.id}`);
          }}
          className="w-full flex items-center justify-center gap-2 bg-primary/5 hover:bg-primary text-primary hover:text-white text-sm font-semibold py-2.5 rounded-xl transition-all duration-200 group/btn"
        >
          Batafsil ko'rish
          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
}
