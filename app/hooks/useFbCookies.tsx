import {useEffect, useState} from 'react';

export default function useFbCookies() {
  const [fbp, setFbp] = useState<string | null>(null);
  const [fbc, setFbc] = useState<string | null>(null);

  useEffect(() => {
    const fbpCookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith('_fbp='));
    if (fbpCookie) {
      const fbpValue = fbpCookie.split('=')[1];
      setFbp(fbpValue);
    }

    const fbcCookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith('_fbc='));
    if (fbcCookie) {
      const fbcValue = fbcCookie.split('=')[1];
      setFbc(fbcValue);
    }
  }, []);

  return [fbp, fbc];
}
