/**
 * Вставка в консоль браузера (на странице приложения).
 * База: AmicaVrmDatabase, store: vrms.
 * Запись: { hash, saveType, vrmData, vrmUrl, thumbData }.
 */

// --------------- 1) Проверить, что в базе есть ---------------
function listVrms() {
  return new Promise((resolve, reject) => {
    const r = indexedDB.open('AmicaVrmDatabase');
    r.onsuccess = () => {
      const db = r.result;
      if (!db.objectStoreNames.contains('vrms')) {
        db.close();
        return resolve([]);
      }
      const t = db.transaction('vrms', 'readonly');
      const s = t.objectStore('vrms');
      const req = s.getAll();
      req.onsuccess = () => { db.close(); resolve(req.result || []); };
      req.onerror = () => { db.close(); reject(req.error); };
    };
    r.onerror = () => reject(r.error);
  });
}
// В консоли: listVrms().then(console.log)

// --------------- 2) Добавить одну тестовую запись (минимальная, без реального VRM) ---------------
function addTestRecord() {
  const record = {
    hash: 'test-' + Date.now(),
    saveType: 'local',
    vrmData: 'data:application/octet-stream;base64,', // пустой base64
    vrmUrl: '',
    thumbData: ''
  };
  return new Promise((resolve, reject) => {
    const r = indexedDB.open('AmicaVrmDatabase');
    r.onsuccess = () => {
      const db = r.result;
      const t = db.transaction('vrms', 'readwrite');
      const s = t.objectStore('vrms');
      const req = s.put(record);
      req.onsuccess = () => { db.close(); resolve(record.hash); };
      req.onerror = () => { db.close(); reject(req.error); };
    };
    r.onerror = () => reject(r.error);
  });
}
// В консоли: addTestRecord().then(h => console.log('Добавлен hash:', h))
// Затем обнови страницу (F5) — в списке моделей может появиться карточка (по клику будет ошибка загрузки — это нормально для теста).

// --------------- 3) Добавить реальный VRM из выбранного файла ---------------
function addVrmFromFile(file) {
  if (!file || !file.name.toLowerCase().endsWith('.vrm')) {
    return Promise.reject(new Error('Нужен файл .vrm'));
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const vrmData = reader.result;
      if (typeof vrmData !== 'string') {
        reject(new Error('Ожидалась строка data URL'));
        return;
      }
      const len = vrmData.length;
      const S = 100000;
      let h = 0;
      for (let i = 0; i < Math.min(S, len); i++) h = ((h << 5) - h + vrmData.charCodeAt(i)) << 0;
      for (let i = Math.max(0, len - S); i < len; i++) h = ((h << 5) - h + vrmData.charCodeAt(i)) << 0;
      h = ((h << 5) - h + len) << 0;
      const hash = String(h);
      const record = {
        hash,
        saveType: 'local',
        vrmData,
        vrmUrl: '',
        thumbData: ''
      };
      const r = indexedDB.open('AmicaVrmDatabase');
      r.onsuccess = () => {
        const db = r.result;
        const t = db.transaction('vrms', 'readwrite');
        const s = t.objectStore('vrms');
        const req = s.put(record);
        req.onsuccess = () => { db.close(); resolve({ hash, size: vrmData.length }); };
        req.onerror = () => { db.close(); reject(req.error); };
      };
      r.onerror = () => reject(r.error);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

// Создать input и по выбору файла добавить в IndexedDB
function addVrmViaFilePicker() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.vrm,.VRM';
  input.onchange = () => {
    const file = input.files && input.files[0];
    if (!file) return;
    addVrmFromFile(file)
      .then((r) => console.log('[VRM] Запись в IndexedDB:', r))
      .catch((e) => console.error('[VRM] Ошибка:', e));
  };
  input.click();
}

// Экспорт в глобал, чтобы в консоли вызывать по имени
if (typeof window !== 'undefined') {
  window.__vrmIndexedDB = {
    list: listVrms,
    addTest: addTestRecord,
    addFromFile: addVrmFromFile,
    pickAndAdd: addVrmViaFilePicker
  };
  console.log('VRM IndexedDB helper: __vrmIndexedDB.list() | .addTest() | .pickAndAdd()');
}
