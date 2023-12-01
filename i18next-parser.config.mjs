// yarn global add i18next-parser
// run i18next
export default {
  defaultNamespace: 'common',
  locales: ['en', 'zh', 'de'],
  output: 'src/i18n/locales/$LOCALE/$NAMESPACE.json',
  input: ["src/**/*.{ts,tsx}"],
  defaultValue: (locale, namespace, key, value) => key,
}