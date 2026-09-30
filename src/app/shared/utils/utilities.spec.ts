import { HttpErrorResponse } from '@angular/common/http';

import { describe, it, expect } from 'vitest';

import { initials, getApiErrorMessage, normalizeBaseUrl, shortId } from '@shared/utils/utilities';

const fallback = 'Something went wrong';

describe('initials', () => {
  it('returns first letter for a single name', () => {
    expect(initials('John')).toBe('J');
  });

  it('returns two initials for first and last name', () => {
    expect(initials('John Doe')).toBe('JD');
  });

  it('uses only the first two words when name has more parts', () => {
    expect(initials('John Doe Smith')).toBe('JD');
  });

  it('uppercases lowercase input', () => {
    expect(initials('john doe')).toBe('JD');
  });

  it('handles extra whitespace between parts', () => {
    expect(initials('  john   doe  ')).toBe('JD');
  });

  it('returns empty string for empty input', () => {
    expect(initials('')).toBe('');
  });
});

describe('getApiErrorMessage', () => {
  it('returns fallback for non-HttpErrorResponse errors', () => {
    expect(getApiErrorMessage(new Error('network'), fallback)).toBe(fallback);
    expect(getApiErrorMessage('oops', fallback)).toBe(fallback);
    expect(getApiErrorMessage(null, fallback)).toBe(fallback);
  });

  it('returns fallback when error body is missing or not an object', () => {
    expect(getApiErrorMessage(new HttpErrorResponse({ error: null, status: 500 }), fallback)).toBe(
      fallback,
    );

    expect(
      getApiErrorMessage(new HttpErrorResponse({ error: 'plain text', status: 500 }), fallback),
    ).toBe(fallback);
  });

  it('joins validation errors from errors map (Shape A)', () => {
    const err = new HttpErrorResponse({
      status: 400,
      error: {
        errors: {
          Email: ['Email is required.', 'Email is invalid.'],
          Password: ['Password is too short.'],
        },
      },
    });

    expect(getApiErrorMessage(err, fallback)).toBe(
      'Email is required. Email is invalid. Password is too short.',
    );
  });

  it('ignores empty strings in errors map and uses title when no messages', () => {
    const err = new HttpErrorResponse({
      status: 400,
      error: {
        errors: { Field: ['', ''] },
        title: 'Bad request',
      },
    });

    expect(getApiErrorMessage(err, fallback)).toBe('Bad request');
  });

  it('returns title for single problem responses (Shape B)', () => {
    const err = new HttpErrorResponse({
      status: 404,
      error: { title: 'Quiz not found' },
    });

    expect(getApiErrorMessage(err, fallback)).toBe('Quiz not found');
  });

  it('returns detail if present in single problem responses', () => {
    const err = new HttpErrorResponse({
      status: 500,
      error: { title: 'Application error', detail: 'Actual stack trace or exception message' },
    });

    expect(getApiErrorMessage(err, fallback)).toBe('Actual stack trace or exception message');
  });

  it('returns fallback for generic validation title without errors map', () => {
    const err = new HttpErrorResponse({
      status: 400,
      error: { title: 'One or more validation errors occurred.' },
    });

    expect(getApiErrorMessage(err, fallback)).toBe('One or more validation errors occurred.');
  });

  it('prefers errors map over title when both are present', () => {
    const err = new HttpErrorResponse({
      status: 400,
      error: {
        title: 'One or more validation errors occurred.',
        errors: { Name: ['Name is required.'] },
      },
    });

    expect(getApiErrorMessage(err, fallback)).toBe('Name is required.');
  });
});

describe('normalizeBaseUrl', () => {
  it('removes a single trailing slash', () => {
    expect(normalizeBaseUrl('http://localhost:7100/')).toBe('http://localhost:7100');
  });

  it('removes multiple trailing slashes', () => {
    expect(normalizeBaseUrl('http://localhost:7100///')).toBe('http://localhost:7100');
  });

  it('leaves url unchanged when there is no trailing slash', () => {
    expect(normalizeBaseUrl('http://localhost:7100')).toBe('http://localhost:7100');
  });

  it('does not remove slashes in the middle of the path', () => {
    expect(normalizeBaseUrl('http://localhost:7100/api/v1/')).toBe('http://localhost:7100/api/v1');
  });
});

describe('shortId', () => {
  it('returns first 8 characters of a string', () => {
    expect(shortId('1234567890')).toBe('12345678');
  });

  it('returns empty string if input is null', () => {
    expect(shortId(null)).toBe('');
  });

  it('returns empty string if input is undefined', () => {
    expect(shortId(undefined)).toBe('');
  });

  it('returns empty string if input is empty string', () => {
    expect(shortId('')).toBe('');
  });

  it('returns the whole string if it is shorter than 8 characters', () => {
    expect(shortId('abc')).toBe('abc');
  });
});
