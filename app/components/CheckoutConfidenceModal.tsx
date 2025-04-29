import {Dialog, Transition} from '@headlessui/react';
import {Fragment, useState} from 'react';
import {IconInformation} from './Icon';

export function CheckoutConfidenceModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault(); // Prevent parent button click
          e.stopPropagation(); // Prevent event bubbling
          setIsOpen(true);
        }}
        className="inline-flex items-center gap-2 text-primary hover:text-primary/80 text-sm mt-2 justify-center"
      >
        <IconInformation className="h-5 w-5" />
        <span>Learn about unlimited exchanges and returns</span>
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setIsOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <div className="mb-6">
                    <img src="/logo_on_white.png" alt="Freedom Fatigues Logo" className="mx-auto h-12 w-auto" />
                  </div>
                  
                  <Dialog.Title as="h3" className="text-2xl font-bold text-center mb-4">
                    Check out with confidence.
                  </Dialog.Title>
                  
                  <div className="mt-4 space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M4 4V9H4.58152M19.9381 11C19.446 7.05369 16.0796 4 12 4C8.64262 4 5.76829 6.06817 4.58152 9M4.58152 9H9M20 20V15H19.4185M19.4185 15C18.2317 17.9318 15.3574 20 12 20C7.92038 20 4.55399 16.9463 4.06189 13M19.4185 15H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold">Free returns for exchanges & store credit</h4>
                        <p className="text-gray-600">Exchange your items or return them for store credit free of charge. We'll cover the cost to ship your return back to us.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20.5 7.27783L12 12.0001M12 12.0001L3.5 7.27783M12 12.0001L12 21.5001M21 16.0001V8.00008C21 7.20094 20.5552 6.46502 19.8555 6.08008L13.3555 2.58008C12.5429 2.14008 11.4571 2.14008 10.6445 2.58008L4.14446 6.08008C3.44475 6.46502 3 7.20094 3 8.00008V16.0001C3 16.7992 3.44475 17.5351 4.14446 17.9201L10.6445 21.4201C11.4571 21.8601 12.5429 21.8601 13.3555 21.4201L19.8555 17.9201C20.5552 17.5351 21 16.7992 21 16.0001Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold">Package protection</h4>
                        <p className="text-gray-600">Rest assured, if your package is lost, stolen, or damaged, we've got you covered.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 6H20M9 12H20M9 18H20M5 6V6.01M5 12V12.01M5 18V18.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold">Easy return portal</h4>
                        <p className="text-gray-600">Skip the back and forth and submit your return in just a few clicks.</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 text-center">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                      onClick={() => setIsOpen(false)}
                    >
                      Got it
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
} 