import { useState } from "react";
import { Link } from "../settings/common";
import { ArrowUturnLeftIcon, ChevronRightIcon, HomeIcon } from "@heroicons/react/20/solid";
import { TextButton } from "../textButton";
import { CharacterDetailsPage } from "./CharacterDetailsPage";

export const CharactersPage = ({
    setSettingsUpdated,
    handleClickOpenVrmFile,
    onClickClose
}: {
    setSettingsUpdated: (updated: boolean) => void;
    handleClickOpenVrmFile: () => void;
    onClickClose: () => void;
}) => {
    const [breadcrumbs, setBreadcrumbs] = useState<Link[]>([]);
    const [page, setPage] = useState('current_character');
    
    function renderPage() {
        switch(page) {
            case 'current_character':
                return <CharacterDetailsPage setSettingsUpdated={setSettingsUpdated} />;

            default:
                throw new Error('page not found');
        }
    }

    return (
        <div className="fixed top-0 left-0 w-full max-h-full text-black text-xs text-left z-20 overflow-y-auto backdrop-blur">
            <div
            className="absolute top-0 left-0 w-full h-full bg-violet-700 opacity-10 z-index-50"
            ></div>
            <div className="fixed w-full top-0 left-0 z-50 p-2 bg-white">

            <nav aria-label="Breadcrumb" className="inline-block ml-4">
                <ol role="list" className="flex items-center space-x-4">
                <li className="flex">
                    <div className="flex items-center">
                    <span
                        onClick={() => {
                        if (breadcrumbs.length === 0) {
                            onClickClose();
                            return;
                        }
                        setPage('main_menu');
                        setBreadcrumbs([]);
                        }}
                        className="text-gray-400 hover:text-gray-500 cursor-pointer"
                    >
                        <HomeIcon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                        <span className="sr-only">Home</span>
                    </span>
                    </div>
                </li>

                {breadcrumbs.map((breadcrumb) => (
                    <li key={breadcrumb.key} className="flex">
                    <div className="flex items-center">
                        <ChevronRightIcon className="h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                        <span
                        onClick={() => {
                            setPage(breadcrumb.key);
                            const nb = [];
                            for (let b of breadcrumbs) {
                            nb.push(b);
                            if (b.key === breadcrumb.key) {
                                break;
                            }
                            }
                            setBreadcrumbs(nb);
                        }}
                        className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700 cursor-pointer"
                        >
                        {breadcrumb.label}
                        </span>
                    </div>
                    </li>
                ))}
                </ol>
            </nav>
            </div>

            <div className="h-screen overflow-auto opacity-95 backdrop-blur">
            <div className="mx-auto max-w-2xl py-16 text-text1">
                <div className="mt-16">
                <TextButton
                    className="rounded-b-none text-lg ml-4 px-8 shadow-sm"
                    onClick={() => {
                    if (breadcrumbs.length === 0) {
                        onClickClose();
                        return;
                    }
                    if (breadcrumbs.length === 1) {
                        setPage('main_menu');
                        setBreadcrumbs([]);
                        return;
                    }

                    const prevPage = breadcrumbs[breadcrumbs.length - 2];
                    setPage(prevPage.key);
                    setBreadcrumbs(breadcrumbs.slice(0, -1));
                    }}
                >
                    <ArrowUturnLeftIcon className="h-5 w-5 flex-none text-white" aria-hidden="true" />
                </TextButton>

                { renderPage() }
                </div>
            </div>
            </div>
        </div>
    );
}