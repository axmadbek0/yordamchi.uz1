/**
 * Site content API — localStorage (backend site_content jadvaliga oson ko‘chiriladi)
 */

import type { SiteContentEntry } from '../types/siteContent';
import { fetchWithRetry } from './fetchWithRetry';

const STORAGE_KEY = 'yordamchi_site_content';

function readMap(): Record<string, SiteContentEntry> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed as Record<string, SiteContentEntry>;
  } catch {
    return {};
  }
}

function writeMap(map: Record<string, SiteContentEntry>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export async function fetchSiteContent(key: string): Promise<SiteContentEntry | null> {
  return fetchWithRetry(async () => {
    await new Promise((r) => setTimeout(r, 80));
    const map = readMap();
    return map[key] ?? null;
  });
}

export async function saveSiteContent(
  key: string,
  value: string,
  updatedBy = 'editor'
): Promise<SiteContentEntry> {
  return fetchWithRetry(async () => {
    await new Promise((r) => setTimeout(r, 200));
    // Demo: simulyatsiya qilingan tarmoq xatosini yoqish uchun
    // if (Math.random() < 0.05) throw new Error('Network');

    const entry: SiteContentEntry = {
      key,
      value,
      updatedBy,
      updatedAt: new Date().toISOString(),
    };
    const map = readMap();
    map[key] = entry;
    writeMap(map);
    return entry;
  });
}

export async function saveSiteImage(
  key: string,
  dataUrl: string,
  updatedBy = 'editor'
): Promise<SiteContentEntry> {
  return saveSiteContent(key, dataUrl, updatedBy);
}
