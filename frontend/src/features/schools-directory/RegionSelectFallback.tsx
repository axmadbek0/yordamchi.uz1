/**
 * RegionSelectFallback — viloyat/tuman filtri, joylashuv rad etilganda ko'rsatiladi
 */

import { motion } from 'motion/react';
import { MapPinOff, ChevronDown } from 'lucide-react';
import type { SchoolWithLocation } from '../../types';

const REGIONS_WITH_DISTRICTS: Record<string, string[]> = {
  'Toshkent shahri': ['Chilonzor tumani', 'Mirzo Ulug\'bek tumani', 'Shayxontohur tumani', 'Yunusobod tumani', 'Yakkasaroy tumani', 'Olmazor tumani', 'Uchtepa tumani', 'Bektemir tumani', 'Sergeli tumani', 'Yashnobod tumani', 'Mirobod tumani', 'Hamza (Qo\'yliq) tumani'],
  'Toshkent viloyati': ['Angren', 'Bekabad', 'Bo\'stonliq', 'Bo\'ka', 'Chinoz', 'Ohangaron', 'Oqqo\'rg\'on', 'Parkent', 'Piskent', 'Qibray', 'Quyi Chirchiq', 'Toshkent tumani', 'O\'rta Chirchiq', 'Yuqori Chirchiq', 'Zangiota', 'Keles'],
  'Samarqand viloyati': ['Bulung\'ur', 'Ishtixon', 'Jomboy', 'Kattaqo\'rg\'on', 'Narpay', 'Nurobod', 'Oqdaryo', 'Pastdarg\'om', 'Paxtachi', 'Payariq', 'Qo\'shrabot', 'Samarqand tumani', 'Toyloq', 'Urgut'],
  "Farg'ona viloyati": ['Beshariq', 'Bog\'dod', 'Buvayda', 'Dang\'ara', "Farg'ona tumani", 'Furqat', 'Hamza', 'Oltiariq', 'Quva', 'Quvasoy', 'Rishton', 'So\'x', 'Toshloq', 'Uchko\'prik', 'Yozyovon'],
  'Buxoro viloyati': ['Buxoro tumani', 'G\'ijduvon', 'Jondor', 'Kogon', 'Olot', 'Peshku', 'Qorakol', 'Qorovulbozor', 'Romitan', 'Shofirkon', 'Vobkent'],
  'Andijon viloyati': ['Andijon tumani', 'Asaka', 'Baliqchi', 'Bo\'z', 'Buloqboshi', 'Izboskan', 'Jalolquduq', 'Xo\'jaobod', 'Marhamat', 'Oltinko\'l', 'Paxtaobod', 'Qo\'rg\'ontepa', 'Shahrixon', 'Ulug\'nor'],
  'Namangan viloyati': ['Chortoq', 'Chust', 'Kosonsoy', 'Mingbuloq', 'Namangan tumani', 'Norin', 'Pop', 'To\'raqo\'rg\'on', 'Uychi', 'Yangiqo\'rg\'on'],
  'Xorazm viloyati': ['Bog\'ot', 'Gurlan', 'Hazorasp', 'Xiva', 'Xonqa', 'Qo\'shko\'pir', 'Shovot', 'Urganch tumani', 'Yangiariq', 'Yangibozor'],
  'Surxondaryo viloyati': ['Angor', 'Bandixon', 'Boysun', 'Denov', 'Jarqo\'rg\'on', 'Muzrabot', 'Oltinsoy', 'Qiziriq', 'Qumqo\'rg\'on', 'Sariosiyo', 'Sherobod', 'Sho\'rchi', 'Termiz tumani', 'Uzun'],
  'Qashqadaryo viloyati': ['Dehqonobod', 'G\'uzor', 'Kasbi', 'Kitob', 'Ko\'kdala', 'Mirishkor', 'Muborak', 'Nishon', 'Qamashi', 'Qarshi tumani', 'Shahrisabz', 'Yakkabog\''],
  'Navoiy viloyati': ['Karmana', 'Konimex', 'Navbahor', 'Navoiy tumani', 'Nurota', 'Qiziltepa', 'Tomdi', 'Uchquduq', 'Xatirchi'],
  'Jizzax viloyati': ['Arnasoy', 'Baxmal', 'Do\'stlik', 'Forish', 'G\'allaorol', 'Jizzax tumani', 'Mirzacho\'l', 'Paxtakor', 'Yangiobod', 'Zafarobod', 'Zarbdor', 'Zomin'],
  'Sirdaryo viloyati': ['Boyovut', 'Guliston tumani', 'Mirzaobod', 'Oqoltin', 'Sardoba', 'Sayxunobod', 'Shirin', 'Xovos'],
  "Qoraqalpog'iston Respublikasi": ['Amudaryo', 'Beruniy', 'Chimboy', 'Ellikkala', 'Kegeyli', 'Mo\'ynoq', 'Nukus tumani', 'Qanliko\'l', 'Qorao\'zak', 'Shumanay', 'Taxtako\'pir', 'To\'rtko\'l', 'Xo\'jayli'],
};

interface Props {
  schools: SchoolWithLocation[];
  selectedRegion: string;
  selectedDistrict: string;
  onRegionChange: (region: string) => void;
  onDistrictChange: (district: string) => void;
}

export function RegionSelectFallback({
  schools,
  selectedRegion,
  selectedDistrict,
  onRegionChange,
  onDistrictChange,
}: Props) {
  const districts = selectedRegion ? REGIONS_WITH_DISTRICTS[selectedRegion] ?? [] : [];

  // Count schools per region
  const regionCounts = schools.reduce<Record<string, number>>((acc, s) => {
    acc[s.region] = (acc[s.region] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
          <MapPinOff className="w-4 h-4 text-amber-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-amber-800">Joylashuvingizni bilolmadik</p>
          <p className="text-xs text-amber-600 mt-0.5">
            Iltimos, viloyat yoki tumanni qo'lda tanlang
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Region select */}
        <div className="relative">
          <select
            id="region-select"
            value={selectedRegion}
            onChange={(e) => {
              onRegionChange(e.target.value);
              onDistrictChange('');
            }}
            className="w-full appearance-none pl-3 pr-8 py-2.5 text-sm text-ink bg-white border border-amber-200 rounded-xl focus:border-primary focus:outline-none transition-all cursor-pointer"
          >
            <option value="">Viloyat tanlang</option>
            {Object.keys(REGIONS_WITH_DISTRICTS).map((r) => (
              <option key={r} value={r}>
                {r} {regionCounts[r] ? `(${regionCounts[r]})` : ''}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
        </div>

        {/* District select */}
        <div className="relative">
          <select
            id="district-select"
            value={selectedDistrict}
            onChange={(e) => onDistrictChange(e.target.value)}
            disabled={!selectedRegion}
            className="w-full appearance-none pl-3 pr-8 py-2.5 text-sm text-ink bg-white border border-amber-200 rounded-xl focus:border-primary focus:outline-none transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <option value="">Barcha tumanlar</option>
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
        </div>
      </div>
    </motion.div>
  );
}
