import {useEffect} from 'react';
import useScript from '../lib/useScript';

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
      t.defer = true;
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
    window.fbq('track', 'PageView');
  }, []);

  // tag manager
  useEffect(() => {
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
  }, []);
  // triplewhale pixel
  useEffect(() => {
    window.TripleHeadless = 'freedom-fatigues.myshopify.com';
    ~(function (W, H, A, L, E, _, B, N) {
      function O(U, T, H, R) {
        void 0 === R && (R = !1),
          (H = new XMLHttpRequest()),
          H.open('GET', U, !0),
          H.send(null),
          (H.onreadystatechange = function () {
            4 === H.readyState && 200 === H.status
              ? ((R = H.responseText),
                U.includes('.txt') ? eval(R) : (N[B] = R))
              : (299 < H.status || H.status < 200) &&
                T &&
                !R &&
                ((R = !0), O(U, T - 1));
          });
      }
      if (((N = window), !N[H + 'sn'])) {
        N[H + 'sn'] = 1;
        try {
          A.setItem(H, 1 + (0 | A.getItem(H) || 0)),
            (E = JSON.parse(A.getItem(H + 'U') || '[]')).push(location.href),
            A.setItem(H + 'U', JSON.stringify(E));
        } catch (e) {}
        A.getItem('"!nC`') ||
          ((A = N),
          A[H] ||
            ((L = function () {
              return Date.now().toString(36) + '_' + Math.random().toString(36);
            }),
            (E = A[H] =
              function (t, e) {
                return (W = L()), (E._q = E._q || []).push([W, t, e]), W;
              }),
            (E.ch = W),
            (B = 'configSecurityConfModel'),
            (N[B] = 1),
            O('//conf.config-security.com/model', 0),
            O('//triplewhale-pixel.web.app/triplefw.txt?', 5)));
      }
    })('', 'TriplePixel', localStorage);
  }, []);
  //clarity for early testing
  useEffect(() => {
    (function (c, l, a, r, i, t, y) {
      c[a] =
        c[a] ||
        function () {
          (c[a].q = c[a].q || []).push(arguments);
        };
      t = l.createElement(r);
      t.async = 1;
      t.src = 'https://www.clarity.ms/tag/' + i;
      y = l.getElementsByTagName(r)[0];
      y.parentNode.insertBefore(t, y);
    })(window, document, 'clarity', 'script', 'h1zr8912jr');
  }, []);

  useScript(
    'https://static.klaviyo.com/onsite/js/klaviyo.js?company_id=QuicR8',
  );

  return null;
}
