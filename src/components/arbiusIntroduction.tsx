import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useState } from "react";
import { useTranslation } from 'react-i18next';

export const ArbiusIntroduction = ({ open, close }: {
  open: boolean;
  close: () => void;
}) => {
  const { t } = useTranslation();
  const { address } = useAccount();


  if (! open) {
    return null;
  }

  return (
    <div className="absolute z-40 h-full w-full bg-black/30 mx-auto sm:px-24 lg:px-32 font-M_PLUS_2"
    >
      <div className="mx-auto max-h-full overflow-auto rounded-lg bg-white/80 p-4 backdrop-blur-lg shadow-lg">
        <div className="my-4">
          <div className="my-8 font-bold text-xl">
            {t("Welcome to Amica by Arbius")}
          </div>
          <p>{t("arbius_intro", `
            Amica is the best way for AI to interact with humans. The Arbius interface shows how people may interact with decentralized AI. With this setup, anyone may prompt Amica by spending a small amount of AIUS tokens, and when an Arbius miner solves the prompt, the users connected will receive a response. This is set up as a global demonstration, so do not expect any privacy.
          `)}
          </p>
        </div>

        <div className="my-8 flex space-x-4">
          <ConnectButton />
        </div>
        <div className="my-8">
          {address && (
            <button
              onClick={() => {
                close();
              }}
              className="ml-3 inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              {t("Continue to Amica")}
            </button>
          )}
          {(!address) && (
            <p>{t("Please connect your wallet to continue.")}</p>
          )}
        </div>
      </div>
    </div>
  );
};
