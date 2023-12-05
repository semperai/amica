import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';

import { ChevronRightIcon } from '@heroicons/react/20/solid';
import { Link, pagesToLinks } from './common';

export function MenuPage({
  keys,
  menuClick,
}: {
  keys: string[];
  menuClick: (link: Link) => void;
}) {
  const { t } = useTranslation();

  const links = pagesToLinks(keys);
  return (
    <ul role="list" className="divide-y divide-black/5 bg-white rounded-lg shadow-lg">
      {links.map((link) => (
        <li
          key={link.key}
          className="relative flex items-center space-x-4 py-4 cursor-pointer rounded-lg hover:bg-gray-50 p-4 transition-all"
          onClick={() => {
            menuClick(link);
          }}
        >
          <div className="min-w-0 flex-auto">
            <div className="flex items-center gap-x-3">
              <h2 className="min-w-0 text-sm font-semibold leading-6">
                <span className={clsx(
                  'whitespace-nowrap flex w-0 flex-1 gap-x-2 items-center',
                  link.className,
                )}>
                  {link.icon}
                  {t(link.label)}
                </span>
              </h2>
            </div>
          </div>
          <ChevronRightIcon className="h-5 w-5 flex-none text-gray-400" aria-hidden="true" />
        </li>
      ))}
    </ul>
  );
}
