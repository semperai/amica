import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';

export default function Import() {
  const { t } = useTranslation();

  const [sqid, setSqid] = useState('');

  return (
    <div className="fixed w-full h-full top-0 left-0 backdrop-blur-sm bg-gray-900 bg-opacity-50 z-50 flex">
      <div className="p-4 md:p-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white px-4 py-2 rounded-lg shadow-lg">
  
            <div className="sm:col-span-3 max-w-md rounded-xl mt-4 p-2">
              <h1 className="text-lg">
                {t("Import character")}
              </h1>

              <p className="text-sm mt-2">
                {t("Wrong place?")}
                {' '}
                <Link href="/" className="text-cyan-600 hover:text-cyan-700">{t('Go home')}</Link>
              </p>
            </div>
  
  
            <div className="sm:col-span-3 max-w-md rounded-xl mt-4 bg-gray-50 p-2">
              <p className="text-sm">
                {t("Please enter the code you received from the share page.")}
              </p>
            </div>
    
            <div className="sm:col-span-3 max-w-md rounded-xl mt-4">
              <label className="block text-sm font-medium leading-6 text-gray-900">
                {t("Code")}
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  onChange={(e) => setSqid(e.target.value)}
                />
              </div>
    
              <div className="sm:col-span-3 max-w-md rounded-xl mt-2">
                <button
                  onClick={() => {
                    window.location.href = `/import/${sqid}`;
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-fuchsia-500 hover:bg-fuchsia-600 focus:outline-none disabled:bg-fuschia-300 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={sqid === ''}
                >
                  {t("Import")}
                </button>
              </div>
            </div>
          </div>
          <div>
            {/* empty column */}
          </div>
        </div>
      </div>
    </div>
  );
}
