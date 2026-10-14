import React, { useEffect, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Component
 * Ensures that whenever a route or URL search/hash changes, the window and any
 * active scrolling viewports (like AppLayout / AdminLayout <main>) immediately
 * reset to the top instead of staying stuck at the bottom.
 */
export const ScrollToTop: React.FC = () => {
  const { pathname, search, hash } = useLocation();

  // Disable browser's automatic scroll restoration so it doesn't fight against SPA route changes
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  // useLayoutEffect runs before paint to prevent any visible flash of bottom content
  useLayoutEffect(() => {
    if (hash) {
      const targetId = hash.replace('#', '');
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }

    // Scroll window and root elements to top
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    });
    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
    }

    // Also scroll all overflow scroll containers (such as AppLayout and AdminLayout main tags) to top
    const scrollContainers = document.querySelectorAll<HTMLElement>('main, [data-scroll-container]');
    scrollContainers.forEach((container) => {
      container.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      container.scrollTop = 0;
    });
  }, [pathname, search, hash]);

  return null;
};
