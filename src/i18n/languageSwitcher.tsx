import { useTranslation, Trans } from 'react-i18next';
import { ChevronDownIcon, LanguageIcon } from '@heroicons/react/20/solid'
import { Menu, Transition } from '@headlessui/react'
import { langs } from './langs';


export default function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const currLang = i18n.resolvedLanguage;

  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className="inline-flex w-full justify-center rounded-md bg-black/20 px-4 py-2 text-sm font-medium text-white hover:bg-black/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75">
        {currLang ? langs[currLang].nativeName : "English"}<LanguageIcon className="-mr-1 ml-2 h-5 w-5 text-violet-200 hover:text-violet-100" aria-hidden="true" />
      </Menu.Button>
      <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
        <div className="px-1 py-1 ">
          {Object.keys(langs).map((lng) => (
            <Menu.Item key={lng}>
              <button
                className={`${currLang === lng ? 'bg-violet-500 text-white' : ''} group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                onClick={() => i18n.changeLanguage(lng)}>
                {langs[lng].nativeName}
              </button>
            </Menu.Item>
          ))}
        </div>
      </Menu.Items>
    </Menu>
  )
}

