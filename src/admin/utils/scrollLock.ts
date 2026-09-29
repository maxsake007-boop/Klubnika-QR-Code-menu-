import { useEffect } from 'react';

let lockCount = 0;

export function lockScroll() {
  lockCount++;
  if (lockCount === 1) {
    document.documentElement.classList.add('modal-open');
    document.body.classList.add('modal-open');
  }
}

export function unlockScroll() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    document.documentElement.classList.remove('modal-open');
    document.body.classList.remove('modal-open');
  }
}

/**
 * React hook to lock body/html scrolling while a modal or drawer is open.
 * Safely handles nested modals via reference counting.
 */
export function useModalScrollLock(isOpen: boolean) {
  useEffect(() => {
    if (isOpen) {
      lockScroll();
      return () => {
        unlockScroll();
      };
    }
  }, [isOpen]);
}
