import {useEffect} from 'react';
import useScript from '../hooks/useScript';
import useFbCookies from '../hooks/useFbCookies';

export function CustomScriptsAndAnalytics() {
  const [fbp, fbc] = useFbCookies();

  // Facebook Pixel
  useEffect(() => {
    (function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod
          ? n.callMethod.apply(n, arguments)
          : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = !0; // Changed from 0 to true for better performance
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(
      window,
      document,
      'script',
      'https://connect.facebook.net/en_US/fbevents.js',
    );

    // Get user data from localStorage/sessionStorage if available
    const userData = getUserDataForFacebookPixel();
    
    // Initialize with user data for Advanced Matching if available
    if (Object.keys(userData).length > 0) {
      window.fbq('init', '280447639311369', userData);
    } else {
      window.fbq('init', '280447639311369');
    }
    
    // Send a pageview event
    window.fbq('track', 'PageView');
  }, []);

  // tag manager
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      (function (w, d, s, l, i) {
        w[l] = w[l] || [];
        w[l].push({'gtm.start': new Date().getTime(), event: 'gtm.js'});
        var f = d.getElementsByTagName(s)[0],
          j = d.createElement(s),
          dl = l != 'dataLayer' ? '&l=' + l : '';
        j.defer = true;
        j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
        f.parentNode.insertBefore(j, f);
      })(window, document, 'script', 'dataLayer', 'GTM-NX97D93');
    }
  }, []);

  useScript(
    'https://static.klaviyo.com/onsite/js/klaviyo.js?company_id=QuicR8',
  );

  return <></>;
}

// Helper function to get user data for Facebook Advanced Matching
function getUserDataForFacebookPixel() {
  const userData: Record<string, string> = {};
  
  // Try to get customer data from localStorage or sessionStorage
  try {
    const customerDataString = localStorage.getItem('customerData');
    if (customerDataString) {
      const customerData = JSON.parse(customerDataString);
      
      // Add available user data for advanced matching
      if (customerData.email) userData.em = customerData.email;
      if (customerData.phone) userData.ph = customerData.phone;
      if (customerData.firstName) userData.fn = customerData.firstName;
      if (customerData.lastName) userData.ln = customerData.lastName;
      if (customerData.city) userData.ct = customerData.city;
      if (customerData.state) userData.st = customerData.state;
      if (customerData.zip) userData.zp = customerData.zip;
    }
  } catch (error) {
    console.error('Error parsing customer data for Facebook Pixel:', error);
  }
  
  return userData;
}
