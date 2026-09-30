import { computed } from '@angular/core';

import { signalStoreFeature, withComputed, withState } from '@ngrx/signals';

export type RequestStatus = 'idle' | 'pending' | 'fulfilled' | { error: string };

export interface RequestStatusState {
  statuses: Record<string, RequestStatus>;
}

export function withRequestStatus() {
  return signalStoreFeature(
    withState<RequestStatusState>({ statuses: {} }),
    withComputed(({ statuses }) => ({
      isPending: computed(() => (key: string) => statuses()[key] === 'pending'),
      isFulfilled: computed(() => (key: string) => statuses()[key] === 'fulfilled'),
      error: computed(() => (key: string) => {
        const status = statuses()[key];
        return typeof status === 'object' ? status.error : null;
      }),
      isAnyPending: computed(() => Object.values(statuses()).some((s) => s === 'pending')),
      anyError: computed(() => {
        const firstError = Object.values(statuses()).find((s) => typeof s === 'object');
        return firstError && typeof firstError === 'object' ? firstError.error : null;
      }),
    })),
  );
}

export function setPending(key: string) {
  return (state: RequestStatusState): RequestStatusState => ({
    statuses: { ...state.statuses, [key]: 'pending' },
  });
}

export function setFulfilled(key: string) {
  return (state: RequestStatusState): RequestStatusState => ({
    statuses: { ...state.statuses, [key]: 'fulfilled' },
  });
}

export function setError(key: string, error: string) {
  return (state: RequestStatusState): RequestStatusState => ({
    statuses: { ...state.statuses, [key]: { error } },
  });
}
