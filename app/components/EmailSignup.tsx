import {Transition} from '@headlessui/react';
import {useFetcher} from '@remix-run/react';
import {useMotionValueEvent, useScroll} from 'framer-motion';
import {useEffect, useRef, useState} from 'react';

export default function EmailSignup() {
  const [isShowing, setShowing] = useState(false);
  const {scrollYProgress} = useScroll();
  const [wasHidden, setHidden] = useState(false);

  useEffect(() => {
    setHidden(window.sessionStorage.getItem('hideEmailSignup') === 'true');
  }, [setShowing]);

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    if (latest > 0.3 && !wasHidden) {
      setShowing(true);
    }
  });

  function handleHide() {
    setShowing(false);
    window.sessionStorage.setItem('hideEmailSignup', 'true');
    setHidden(true);
  }

  return (
    <Transition
      show={isShowing}
      enter="transition-bottom duration-500"
      enterFrom="opacity-0 translate-y-1/2"
      enterTo="opacity-100 translate-y-0"
      leave="transition-bottom duration-500"
      leaveFrom="opacity-100 translate-y-0"
      leaveTo="opacity-0 translate-y-1/2"
      className="fixed bottom-0 left-0 right-0 z-10 flex flex-col items-center gap-4 bg-white py-6 shadow-xl md:flex-row md:p-4 lg:p-8"
    >
      <h2 className="font-heading text-4xl uppercase md:text-7xl">
        Hey, Patriot!
      </h2>
      <div className="flex flex-col items-start justify-start">
        <p className="text-base md:text-lg">Get 20% off your first purchase.</p>
        <SignUpForm source={'popup'} callback={handleHide} />
      </div>
      <button className="absolute right-2 top-2" onClick={() => handleHide()}>
        <span className="hover:border-b-2">
          <span className="text-lg">&times;</span> Close
        </span>
      </button>
    </Transition>
  );
}

export function SignUpForm({
  source,
  variant,
  callback,
}: {
  source: string;
  variant?: 'light' | 'dark';
  callback?: () => void;
}) {
  const newsletter = useFetcher();
  const ref = useRef(null);

  useEffect(() => {
    if (newsletter.state === 'idle' && newsletter.data?.ok) {
      ref.current.reset();

      callback?.();
    }
  }, [newsletter]);

  return (
    <newsletter.Form ref={ref} method="post" action="/newsletter/subscribe">
      <input type="hidden" name="source" value={source} />
      <div
        className={`border-b-2 ${
          variant === 'dark' ? 'border-b-white' : 'border-b-black'
        }`}
      >
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          className="border-none bg-transparent pl-0 text-base"
        />
        <button type="submit" disabled={newsletter.state === 'submitting'}>
          Submit
        </button>
      </div>
      {newsletter.state === 'idle' && newsletter.data ? (
        newsletter.data.ok ? (
          <p>Thanks for subscribing!</p>
        ) : (
          <p className="text-red-500">
            Something went wrong. We&apos;re looking into it!
          </p>
        )
      ) : null}
    </newsletter.Form>
  );
}
