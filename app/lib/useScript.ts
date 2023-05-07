import {useEffect} from 'react';

export default function useScript(url: string) {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = url;
    script.defer = true;
    document.body.appendChild(script);
  }, []);

  return true;
}