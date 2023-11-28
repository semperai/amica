---
title: Developing Amica
order: 3
---

Once you've [set up your developer environment](./setting-up-your-development-environment.md), you're ready to hack on Amica!

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
