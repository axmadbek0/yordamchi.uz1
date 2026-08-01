/**
 * Universal site content — schema-less key/value
 */

export interface SiteContentEntry {
  key: string;
  value: string;
  updatedBy: string;
  updatedAt: string;
}

export type DataState<T> =
  | { status: 'loading' }
  | { status: 'empty' }
  | { status: 'error'; message: string }
  | { status: 'success'; data: T };
