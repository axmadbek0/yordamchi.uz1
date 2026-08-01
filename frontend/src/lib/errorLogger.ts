/**
 * Xatolarni loglash (Sentry o‘rniga konsol + localStorage ring-buffer)
 */

const LOG_KEY = 'yordamchi_error_log';
const MAX = 40;

export function logErrorToService(error: unknown, info?: unknown) {
  const entry = {
    at: new Date().toISOString(),
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    info,
  };

  try {
    const prev = JSON.parse(localStorage.getItem(LOG_KEY) || '[]') as unknown[];
    const next = [entry, ...(Array.isArray(prev) ? prev : [])].slice(0, MAX);
    localStorage.setItem(LOG_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }

  if (import.meta.env.DEV) {
    console.error('[YordamchiMed]', entry.message, info ?? '');
  }

  // Ishlab chiqarishda: Sentry.captureException(error, { extra: info })
}
