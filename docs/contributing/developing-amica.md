---
title: Developing Amica
order: 3
---

Once you've [set up your developer environment](./setup-dev-env.md), you're ready to hack on Amica!

## Tests

Unit tests are run using `jest` via `npm run test` from the `__tests__` directory. To run a specific test, you can pass the path of the test:

```sh
npm run test        # run all unit tests
npm run test [PATH] # run only tests with name matching "PATH"
```

### ARM64 compatibility

On ARM64 platforms (like Mac machines with M1 chips) the `npm run test` command may fail with the following error:

```sh
FATAL ERROR: wasm code commit Allocation failed - process out of memory
```

In order to fix it, the terminal must be running in the **Rosetta** mode, the detailed instructions can be found in
[this SO answer](https://stackoverflow.com/a/67813764/2753863).

## The Development Workflow for Translations

The translation uses the [react-i18next](https://react.i18next.com/) framework.


### Apply Text to Translate

#### In React Component/Page

useTranslation (react hook):

```ts
import { useTranslation } from 'react-i18next';

export function MyComponent() {
  const { t, i18n } = useTranslation();

  // Wrap your 'wanna' translated text in the 't' function
  return <p>{t('my translated text')}</p>

  // When translating text that is too lengthy, it's best to assign a corresponding keyword.
  <p>{t("amica_intro", `
    Amica is an open source chatbot interface that provides emotion, text to speech, and speech to text capabilities.
    It is designed to be able to be attached to any ChatBot API.
    It can be used with any VRM model and is very customizable.
    You can even run Amica on your own computer without an internet connection, or on your phone.
  `)}
  </p>

}
```

#### In Common Function

```ts
import { t } from '@/i18n';

function getLabelFromPage(page: string): string {

  switch(page) {
    case 'appearance':          return t('Appearance');
    case 'chatbot':             return t('ChatBot');
  }
}
```

### Updating Language Files with New Translations

Execute the `npm run i18n` command in order to incorporate updated translations into the language files.

The language JSON files are located within the `src/i18n/locales/` directory.

### Add a new language

If you wish to add a new language:

1. First include its corresponding [ISO 639-1 language code](https://en.wikipedia.org/wiki/ListofISO639-1codes) within the `i18next-parser.config.mjs` file: `locales: ['en', 'zh', 'de']`.
2. Add the new language into the `src/i18n/langs.ts` file.
3. Run `npm run i18n`, the corresponding language files will be automatically created in the '`src/i8n/locales/`' directory.
