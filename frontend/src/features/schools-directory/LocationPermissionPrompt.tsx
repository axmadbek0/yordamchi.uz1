/**
 * LocationPermissionPrompt — animated prompt shown while geolocation is being requested
 */

import { motion } from 'motion/react';
import { MapPin, Loader2 } from 'lucide-react';

export function LocationPermissionPrompt() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="relative mb-6">
        {/* Pulse rings */}
        <span className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
        <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary to-deep flex items-center justify-center shadow-lg shadow-primary/30">
          <MapPin className="w-9 h-9 text-white" />
        </div>
      </div>

      <h2 className="text-xl font-bold text-deep mb-2">Joylashuvingiz aniqlanmoqda</h2>
      <p className="text-muted max-w-xs leading-relaxed mb-4">
        Sizga yaqin maktablarni ko'rsatish uchun joylashuvingizga ruxsat so'rayapmiz.
      </p>
      <div className="flex items-center gap-2 text-sm text-primary font-medium">
        <Loader2 className="w-4 h-4 animate-spin" />
        Kutilmoqda...
      </div>
    </motion.div>
  );
}
