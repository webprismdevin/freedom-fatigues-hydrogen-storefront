import {Fragment, useEffect, useState, useRef} from 'react';
import {Dialog, Transition} from '@headlessui/react';

import {Heading, IconClose} from '~/components';
import {useLocation} from '@remix-run/react';

/**
 * Drawer component that opens on user click.
 * @param heading - string. Shown at the top of the drawer.
 * @param open - boolean state. if true opens the drawer.
 * @param onClose - function should set the open state.
 * @param openFrom - right, left
 * @param children - react children node.
 */
export function Drawer({
  heading,
  open,
  onClose,
  openFrom = 'right',
  children,
}: {
  heading?: string;
  open: boolean;
  onClose: () => void;
  openFrom: 'right' | 'left';
  children: React.ReactNode;
}) {
  const offScreen = {
    right: 'translate-x-full',
    left: '-translate-x-full',
  };

  const location = useLocation();
  const prevLocationRef = useRef(location);
  
  // Log when the open state changes
  useEffect(() => {
    console.log('Drawer open state changed:', open);
  }, [open]);

  useEffect(() => {
    // Only close the drawer if the location has changed and the drawer is open
    if (open && prevLocationRef.current !== location) {
      onClose();
    }
    prevLocationRef.current = location;
  }, [location, open, onClose]);

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 left-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0">
          <div className="absolute inset-0 overflow-hidden">
            <div
              className={`fixed inset-y-0 flex max-w-full ${
                openFrom === 'right' ? 'right-0' : ''
              }`}
            >
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom={offScreen[openFrom]}
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="translate-x-0"
                leaveTo={offScreen[openFrom]}
              >
                <Dialog.Panel className="h-screen-dynamic w-screen max-w-lg transform bg-contrast text-left align-middle shadow-xl transition-all">
                  <header
                    // h-nav
                    className={`sticky top-0 flex items-center px-6 py-4 sm:px-8 md:px-12 ${
                      heading ? 'justify-between' : 'justify-end'
                    }`}
                  >
                    {heading !== null && (
                      <Dialog.Title>
                        <Heading as="span" size="lead" id="cart-contents">
                          {heading}
                        </Heading>
                      </Dialog.Title>
                    )}
                    <button
                      type="button"
                      className="-m-4 p-4 text-primary transition hover:text-primary/50"
                      onClick={onClose}
                      data-test="close-cart"
                    >
                      <IconClose aria-label="Close panel" />
                    </button>
                  </header>
                  {children}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

/* Use for associating arialabelledby with the title*/
Drawer.Title = Dialog.Title;

export function useDrawer(openDefault = false) {
  const [isOpen, setIsOpen] = useState(openDefault);

  function openDrawer() {
    console.log('Opening drawer');
    setIsOpen(true);
  }

  function closeDrawer() {
    console.log('Closing drawer');
    setIsOpen(false);
  }

  return {
    isOpen,
    openDrawer,
    closeDrawer,
  };
}
