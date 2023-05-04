import {useEffect} from 'react';

export default function useScript(url: string) {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = url;
    script.defer = true;
    document.body.appendChild(script);

    // const redoScript = document.createElement('script');
    // redoScript.src =
    //   'http://shopify-extension.getredo.com/js/redo.js?widget_id=o5xzy8sv9eq3ma3';
    // redoScript.async = true;
    // document.body.appendChild(redoScript);
  }, []);

  return true;
}
