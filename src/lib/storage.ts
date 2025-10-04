import type { Register } from './types';

const PENDING_ENROLLMENTS_KEY = 'pending-enrollments';

// Custom event to notify components of storage changes
const dispatchStorageEvent = () => {
    window.dispatchEvent(new Event('storageUpdated'));
};

export const getPendingEnrollments = (): Register[] => {
  if (typeof window === 'undefined') return [];
  try {
    const data = window.localStorage.getItem(PENDING_ENROLLMENTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to parse pending enrollments from localStorage", error);
    return [];
  }
};

export const savePendingEnrollment = (enrollment: Register) => {
  if (typeof window === 'undefined') return;
  const pending = getPendingEnrollments();
  const updatedPending = [...pending, enrollment];
  window.localStorage.setItem(PENDING_ENROLLMENTS_KEY, JSON.stringify(updatedPending));
  dispatchStorageEvent();
};

export const clearPendingEnrollments = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(PENDING_ENROLLMENTS_KEY);
  dispatchStorageEvent();
};

export const updatePendingEnrollment = (enrollment: Register) => {
  if (typeof window === 'undefined') return;
  const pending = getPendingEnrollments();
  const index = pending.findIndex(e => e.id === enrollment.id);
  if (index > -1) {
    pending[index] = enrollment;
    window.localStorage.setItem(PENDING_ENROLLMENTS_KEY, JSON.stringify(pending));
  } else {
    // If it's an update for an item that wasn't pending (i.e. was synced), add it to pending.
    pending.push(enrollment);
    window.localStorage.setItem(PENDING_ENROLLMENTS_KEY, JSON.stringify(pending));
  }
  dispatchStorageEvent();
};