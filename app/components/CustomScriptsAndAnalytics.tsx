import {useEffect} from 'react';
import useScript from '../hooks/useScript';

export function CustomScriptsAndAnalytics() {
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
      t.async = 0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(
      window,
      document,
      'script',
      'https://connect.facebook.net/en_US/fbevents.js',
    );
    window.fbq('init', '280447639311369');
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

  return (
    <>
      <script
        defer
        data-domain="freedomfatigues.com"
        src="https://plausible.io/js/script.js"
      ></script>
    </>
  );
}
