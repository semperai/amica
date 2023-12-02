import { useTranslation } from 'react-i18next';

import { Fragment, useEffect, useState } from "react";
import { Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/20/solid';
import { useAddToHomescreenPrompt } from "@/hooks/useAddToHomescreenPrompt";
import { config, updateConfig } from "@/utils/config";

export function AddToHomescreen() {
  const { t } = useTranslation();
  const [prompt, promptToInstall] = useAddToHomescreenPrompt();
  const [show, setShow] = useState(false);

  const hide = () => {
    setShow(false);
  };

  useEffect(() => {
    if (config("show_add_to_homescreen") !== "true") {
      return;
    }

    if (prompt) {
      setShow(true);
    }
  }, [prompt]);


  return (
    <>

      {/* Global notification live region, render this permanently at the end of the document */}
      <div
        aria-live="assertive"
        className="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6 z-50"
        onClick={hide}
      >
        <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
          {/* Notification panel, dynamically insert this into the live region when it needs to be displayed */}
          <Transition
            show={show}
            as={Fragment}
            enter="transform ease-out duration-300 transition"
            enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
            enterTo="translate-y-0 opacity-100 sm:translate-x-0"
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="pointer-events-auto w-full max-w-sm rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
              <div className="p-4">
                <div className="flex items-start">
                  <div className="ml-3 w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">{t("add_to_homescreen", "Add Amica to Homescreen")}</p>
                    <p className="mt-1 text-sm text-gray-500">{t("add_to_homescreen_desc", "Amica can be installed locally for faster loading and less UI clutter.")}</p>
                    <div className="mt-4 flex">
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            const installed = await promptToInstall();
                            console.log(installed);
                            if (installed.outcome === 'accepted') {
                              updateConfig("show_add_to_homescreen", "false");
                            }
                          } catch (e) {
                            console.error(e);
                          }
                        }}
                        className="inline-flex items-center rounded-md bg-secondary px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-secondary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
                      >
                        {t("Accept")}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          updateConfig("show_add_to_homescreen", "false");
                          hide();
                        }}
                        className="ml-3 inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                      >
                        {t("Decline")}
                      </button>
                    </div>
                  </div>
                  <div className="ml-4 flex flex-shrink-0">
                    <button
                      type="button"
                      className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      onClick={() => {
                        setShow(false)
                      }}
                    >
                      <span className="sr-only">{t("Close")}</span>
                      <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </>
  );
}
