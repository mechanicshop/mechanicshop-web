import { HttpErrorResponse, HttpParams } from '@angular/common/http';

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/) // split by one or more spaces
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}
export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (!(err instanceof HttpErrorResponse)) return fallback;
  const body = err.error;

  if (!body || typeof body !== 'object') return fallback;

  // Shape A: ValidationProblem
  const errors = (body as { errors?: Record<string, string[]> }).errors;
  if (errors && typeof errors === 'object') {
    const messages = Object.values(errors).flat().filter(Boolean);
    if (messages.length > 0) return messages.join(' ');
  }

  // Shape B: single Problem
  if (
    typeof (body as { detail?: string }).detail === 'string' &&
    (body as { detail: string }).detail
  ) {
    return (body as { detail: string }).detail;
  }

  if (typeof (body as { title?: string }).title === 'string') {
    return (body as { title: string }).title;
  }

  return fallback;
}

export const normalizeBaseUrl = (url: string): string => url.replace(/\/+$/, '');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildParameters(query: Record<string, any>): HttpParams {
  let params = new HttpParams();

  for (const key in query) {
    if (Object.prototype.hasOwnProperty.call(query, key)) {
      const val = query[key];
      if (val !== undefined && val !== null && val !== '') {
        params = params.set(key, String(val));
      }
    }
  }

  return params;
}

export function shortId(id: string | null | undefined): string {
  if (!id) return '';
  return id.slice(0, 8);
}
