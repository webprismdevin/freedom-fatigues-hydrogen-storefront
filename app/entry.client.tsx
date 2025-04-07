import {RemixBrowser} from '@remix-run/react';
import {hydrateRoot} from 'react-dom/client';
import {StrictMode, useEffect, startTransition} from 'react';
import posthog from 'posthog-js';

// Add type declaration for window.posthog
declare global {
  interface Window {
    posthog: typeof posthog;
  }
}

function PosthogInit() {
  useEffect(() => {
    // Attach to window
    window.posthog = posthog;
    
    // Only init if not already loaded
    if (!window.posthog.__loaded) {
      posthog.init('phc_xymVXqqszGW2G9KrgRFCpWNfHz6jdpGZpDAzIb6W9nC', {
        api_host: '/ingest', // Uses existing proxy route
        capture_pageview: false, // We'll handle this in useAnalytics
        person_profiles: 'identified_only',
      });
    }
  }, []);

  return null;
}

// Check if we're not in Google Web Cache before hydrating
if (!window.location.origin.includes("webcache.googleusercontent.com")) {
  startTransition(() => {
    hydrateRoot(
      document,
      <StrictMode>
        <RemixBrowser />
        <PosthogInit />
      </StrictMode>,
    );
  });
}
