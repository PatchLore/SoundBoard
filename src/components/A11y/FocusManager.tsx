import React, { useEffect, useRef, useCallback } from 'react';

interface FocusManagerProps {
  children: React.ReactNode;
  trap?: boolean;
  restoreFocus?: boolean;
  className?: string;
}

const FocusManager: React.FC<FocusManagerProps> = ({
  children,
  trap = false,
  restoreFocus = false,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Store the previously focused element when component mounts
  useEffect(() => {
    if (restoreFocus) {
      previousActiveElement.current = document.activeElement as HTMLElement;
    }
  }, [restoreFocus]);

  // Restore focus when component unmounts
  useEffect(() => {
    return () => {
      if (restoreFocus && previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [restoreFocus]);

  // Focus trap implementation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!trap || e.key !== 'Tab' || !containerRef.current) return;

    const focusableElements = containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

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
  }, [trap]);

  useEffect(() => {
    if (trap) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [trap, handleKeyDown]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
};

// Hook for managing focus programmatically
export const useFocusManagement = () => {
  const focusElement = useCallback((element: HTMLElement | null) => {
    if (element) {
      element.focus();
      // Ensure the element is visible
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  const focusFirstElement = useCallback((container: HTMLElement) => {
    const firstFocusable = container.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as HTMLElement;
    focusElement(firstFocusable);
  }, [focusElement]);

  const focusLastElement = useCallback((container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    focusElement(lastElement);
  }, [focusElement]);

  return {
    focusElement,
    focusFirstElement,
    focusLastElement
  };
};

export default FocusManager;



