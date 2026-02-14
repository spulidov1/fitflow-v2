import { useEffect, useRef } from 'react';

// ============================================================================
// ACCESSIBILITY UTILITIES
// ============================================================================

/**
 * Announces message to screen readers
 * @param {string} message - Message to announce
 * @param {string} priority - 'polite' or 'assertive'
 */
export const announceToScreenReader = (message, priority = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * Hook to manage focus trap in modals
 * @param {boolean} isActive - Whether trap is active
 */
export const useFocusTrap = (isActive) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus first element
    firstElement?.focus();

    const handleTab = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        const closeButton = container.querySelector('[aria-label*="Close"], [aria-label*="close"]');
        closeButton?.click();
      }
    };

    document.addEventListener('keydown', handleTab);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleTab);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isActive]);

  return containerRef;
};

/**
 * Hook to detect reduced motion preference
 */
export const usePrefersReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleChange = (e) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
};

/**
 * Hook to manage keyboard shortcuts
 * @param {Object} shortcuts - Key: shortcut, Value: callback
 */
export const useKeyboardShortcuts = (shortcuts) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check for modifier keys
      const key = e.key.toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;
      const alt = e.altKey;

      // Build shortcut string
      let shortcut = '';
      if (ctrl) shortcut += 'ctrl+';
      if (shift) shortcut += 'shift+';
      if (alt) shortcut += 'alt+';
      shortcut += key;

      // Execute callback if found
      if (shortcuts[shortcut]) {
        e.preventDefault();
        shortcuts[shortcut]();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};

/**
 * Generate unique ID for accessibility attributes
 */
let idCounter = 0;
export const useA11yId = (prefix = 'a11y') => {
  const idRef = useRef(null);
  
  if (!idRef.current) {
    idRef.current = `${prefix}-${++idCounter}`;
  }
  
  return idRef.current;
};

/**
 * Hook for skip links navigation
 */
export const useSkipLink = (targetId) => {
  const handleSkip = (e) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return handleSkip;
};

// ============================================================================
// ACCESSIBILITY COMPONENTS
// ============================================================================

/**
 * Visually hidden but screen reader accessible
 */
export const VisuallyHidden = ({ children, ...props }) => (
  <span
    style={{
      position: 'absolute',
      width: '1px',
      height: '1px',
      padding: 0,
      margin: '-1px',
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      whiteSpace: 'nowrap',
      border: 0
    }}
    {...props}
  >
    {children}
  </span>
);

/**
 * Skip to main content link
 */
export const SkipLink = ({ targetId = 'main-content' }) => (
  <a
    href={`#${targetId}`}
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-lg focus:shadow-xl"
    onClick={(e) => {
      e.preventDefault();
      const target = document.getElementById(targetId);
      if (target) {
        target.focus();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }}
  >
    Skip to main content
  </a>
);

/**
 * Loading state announcement
 */
export const LoadingAnnouncement = ({ isLoading, message = 'Loading' }) => (
  <div
    role="status"
    aria-live="polite"
    aria-atomic="true"
    className="sr-only"
  >
    {isLoading ? message : ''}
  </div>
);

/**
 * Error announcement
 */
export const ErrorAnnouncement = ({ error }) => (
  <div
    role="alert"
    aria-live="assertive"
    aria-atomic="true"
    className="sr-only"
  >
    {error}
  </div>
);

// ============================================================================
// ARIA HELPERS
// ============================================================================

/**
 * Generate ARIA props for expandable sections
 */
export const getExpandableProps = (isExpanded, id) => ({
  'aria-expanded': isExpanded,
  'aria-controls': `${id}-content`,
  id: `${id}-trigger`
});

/**
 * Generate ARIA props for tabs
 */
export const getTabProps = (isSelected, id, index) => ({
  role: 'tab',
  'aria-selected': isSelected,
  'aria-controls': `${id}-panel-${index}`,
  id: `${id}-tab-${index}`,
  tabIndex: isSelected ? 0 : -1
});

/**
 * Generate ARIA props for tab panels
 */
export const getTabPanelProps = (id, index) => ({
  role: 'tabpanel',
  'aria-labelledby': `${id}-tab-${index}`,
  id: `${id}-panel-${index}`,
  tabIndex: 0
});

/**
 * Generate ARIA props for form fields
 */
export const getFormFieldProps = (id, error, required) => ({
  id,
  'aria-invalid': !!error,
  'aria-describedby': error ? `${id}-error` : undefined,
  'aria-required': required,
  required
});

// ============================================================================
// KEYBOARD NAVIGATION HELPERS
// ============================================================================

/**
 * Handle arrow key navigation in lists
 */
export const handleArrowNavigation = (e, items, currentIndex, onNavigate) => {
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    const nextIndex = (currentIndex + 1) % items.length;
    onNavigate(nextIndex);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    const prevIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
    onNavigate(prevIndex);
  }
};

/**
 * Handle Home/End key navigation
 */
export const handleHomeEndNavigation = (e, itemCount, onNavigate) => {
  if (e.key === 'Home') {
    e.preventDefault();
    onNavigate(0);
  } else if (e.key === 'End') {
    e.preventDefault();
    onNavigate(itemCount - 1);
  }
};

export default {
  announceToScreenReader,
  useFocusTrap,
  usePrefersReducedMotion,
  useKeyboardShortcuts,
  useA11yId,
  useSkipLink,
  VisuallyHidden,
  SkipLink,
  LoadingAnnouncement,
  ErrorAnnouncement,
  getExpandableProps,
  getTabProps,
  getTabPanelProps,
  getFormFieldProps,
  handleArrowNavigation,
  handleHomeEndNavigation
};
