import {useEffect} from 'react';

export default function useScript(src: string) {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.defer = true;
    
    // Get the nonce from any existing script tag that has it
    const existingScript = document.querySelector('script[nonce]') as HTMLScriptElement;
    if (existingScript?.nonce) {
      script.nonce = existingScript.nonce;
    }
    
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [src]);

  return true;
}