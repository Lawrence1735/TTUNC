/**
 * Keyboard Navigation Utilities
 * Ensures full keyboard accessibility throughout the application
 * ISO 9241-110 & WCAG 2.1 AA Compliant
 */

/**
 * Initialize keyboard navigation handlers
 */
export function initKeyboardNavigation() {
  // Track if user is using keyboard for navigation
  let usingKeyboard = false;

  // Detect keyboard usage
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      usingKeyboard = true;
      document.body.classList.add('using-keyboard');
    }
  });

  // Detect mouse usage
  document.addEventListener('mousedown', () => {
    usingKeyboard = false;
    document.body.classList.remove('using-keyboard');
  });

  // Handle focus-visible polyfill for older browsers
  document.addEventListener('focusin', (e) => {
    if (usingKeyboard && e.target instanceof HTMLElement) {
      e.target.classList.add('keyboard-focus');
    }
  });

  document.addEventListener('focusout', (e) => {
    if (e.target instanceof HTMLElement) {
      e.target.classList.remove('keyboard-focus');
    }
  });
}

/**
 * Trap focus within a modal or dialog
 */
export function trapFocus(element: HTMLElement) {
  const focusableElements = element.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  };

  element.addEventListener('keydown', handleTabKey);

  // Return cleanup function
  return () => {
    element.removeEventListener('keydown', handleTabKey);
  };
}

/**
 * Handle escape key to close modals
 */
export function handleEscape(callback: () => void) {
  const handleEscapeKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      callback();
    }
  };

  document.addEventListener('keydown', handleEscapeKey);

  return () => {
    document.removeEventListener('keydown', handleEscapeKey);
  };
}

/**
 * Announce to screen readers
 */
export function announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const liveRegion = document.createElement('div');
  liveRegion.setAttribute('role', priority === 'assertive' ? 'alert' : 'status');
  liveRegion.setAttribute('aria-live', priority);
  liveRegion.setAttribute('aria-atomic', 'true');
  liveRegion.className = 'sr-only';
  liveRegion.textContent = message;

  document.body.appendChild(liveRegion);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(liveRegion);
  }, 1000);
}

/**
 * Set focus to element by ID
 */
export function setFocusById(id: string) {
  const element = document.getElementById(id);
  if (element) {
    element.focus();
    // Scroll into view if needed
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

/**
 * Get next focusable element
 */
export function getNextFocusable(current: HTMLElement, reverse = false): HTMLElement | null {
  const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  const focusableElements = Array.from(
    document.querySelectorAll<HTMLElement>(focusableSelector)
  ).filter((el) => {
    // Filter out hidden elements
    const style = window.getComputedStyle(el);
    return style.display !== 'none' && style.visibility !== 'hidden' && !el.hasAttribute('disabled');
  });

  const currentIndex = focusableElements.indexOf(current);
  if (currentIndex === -1) return null;

  const nextIndex = reverse ? currentIndex - 1 : currentIndex + 1;
  if (nextIndex < 0) return focusableElements[focusableElements.length - 1];
  if (nextIndex >= focusableElements.length) return focusableElements[0];

  return focusableElements[nextIndex];
}

/**
 * Check if element is in viewport
 */
export function isInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Ensure element is visible when focused
 */
export function ensureVisible(element: HTMLElement) {
  if (!isInViewport(element)) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

/**
 * Create roving tabindex for a group of elements (e.g., radio buttons, menu items)
 */
export function createRovingTabindex(container: HTMLElement, selector: string) {
  const items = Array.from(container.querySelectorAll<HTMLElement>(selector));
  let currentIndex = 0;

  // Set initial tabindex
  items.forEach((item, index) => {
    item.setAttribute('tabindex', index === 0 ? '0' : '-1');
  });

  const handleKeyDown = (e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    const index = items.indexOf(target);

    if (index === -1) return;

    let newIndex = index;

    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault();
        newIndex = (index + 1) % items.length;
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault();
        newIndex = index === 0 ? items.length - 1 : index - 1;
        break;
      case 'Home':
        e.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        newIndex = items.length - 1;
        break;
      default:
        return;
    }

    // Update tabindex and focus
    items[index].setAttribute('tabindex', '-1');
    items[newIndex].setAttribute('tabindex', '0');
    items[newIndex].focus();
    currentIndex = newIndex;
  };

  container.addEventListener('keydown', handleKeyDown);

  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * Manage focus return after modal close
 */
export class FocusManager {
  private previousFocus: HTMLElement | null = null;

  save() {
    this.previousFocus = document.activeElement as HTMLElement;
  }

  restore() {
    if (this.previousFocus && typeof this.previousFocus.focus === 'function') {
      this.previousFocus.focus();
    }
  }

  clear() {
    this.previousFocus = null;
  }
}

/**
 * Add keyboard shortcuts
 */
export function addKeyboardShortcut(
  key: string,
  callback: () => void,
  modifiers: { ctrl?: boolean; alt?: boolean; shift?: boolean } = {}
) {
  const handleShortcut = (e: KeyboardEvent) => {
    const matchKey = e.key.toLowerCase() === key.toLowerCase();
    const matchCtrl = modifiers.ctrl ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey;
    const matchAlt = modifiers.alt ? e.altKey : !e.altKey;
    const matchShift = modifiers.shift ? e.shiftKey : !e.shiftKey;

    if (matchKey && matchCtrl && matchAlt && matchShift) {
      e.preventDefault();
      callback();
    }
  };

  document.addEventListener('keydown', handleShortcut);

  return () => {
    document.removeEventListener('keydown', handleShortcut);
  };
}
