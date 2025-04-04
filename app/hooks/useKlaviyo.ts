import {useState, useEffect} from 'react';

export function useKlaviyo() {
  const [isKlaviyoReady, setIsKlaviyoReady] = useState(false);

  useEffect(() => {
    console.log('Checking Klaviyo initialization...');
    const checkKlaviyo = () => {
      if (window.klaviyo) {
        console.log('Klaviyo loaded successfully:', window.klaviyo);
        setIsKlaviyoReady(true);
      } else {
        console.log('Klaviyo not loaded yet');
        setTimeout(checkKlaviyo, 1000); // Check again in 1 second
      }
    };
    checkKlaviyo();
  }, []);

  return isKlaviyoReady;
} 