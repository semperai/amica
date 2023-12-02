// yarn global add i18next-parser
// run i18next
export default {
  defaultNamespace: 'common',
  locales: ['en', 'zh', 'de'],
  output: 'src/i18n/locales/$LOCALE/$NAMESPACE.json',
  input: ["src/**/*.{ts,tsx}"],
  keepRemoved: true,
  // Key separator used in your translation keys
  // If you want to use plain english keys, separators such as `.` and `:` will conflict. You might want to set `keySeparator: false` and `namespaceSeparator: false`. That way, `t('Status: Loading...')` will not think that there are a namespace and three separator dots for instance.
  keySeparator: false,
  namespaceSeparator: false,
  defaultValue: (locale, namespace, key, value) => value || key,
}
