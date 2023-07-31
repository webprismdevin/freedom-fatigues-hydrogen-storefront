import {ReactNode, useState, useEffect} from 'react';

let isHydrating = true;

export default function ResponsiveBrowserWidget({
  breakpoint,
  children,
  greaterThan = false,
}: {
  breakpoint: number;
  children: ReactNode;
  greaterThan?: boolean;
}) {
  const [isHydrated, setIsHydrated] = useState(!isHydrating);

  useEffect(() => {
    isHydrating = false;
    setIsHydrated(true);
  }, []);

  if (isHydrated && greaterThan) {
    return <>{window.innerWidth > breakpoint && children}</>;
  } else if (isHydrated && !greaterThan) {
    return <>{window.innerWidth < breakpoint && children}</>;
  } else {
    return <div>loading...</div>;
  }
}
