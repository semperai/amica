/**
 * В dev в консоли доступны: __vrmIndexedDB.list() | .addTest() | .pickAndAdd() | .applyAndLoad(hash)
 * Используется для отладки и ручной вставки VRM в IndexedDB.
 */
import isDev from "./isDev";
import { updateConfig } from "./config";
import { viewer } from "@/features/vrmViewer/viewerContext";

function listVrms(): Promise<{ hash: string; saveType: string }[]> {
  return new Promise((resolve, reject) => {
    const r = indexedDB.open("AmicaVrmDatabase");
    r.onsuccess = () => {
      const db = r.result;
      if (!db.objectStoreNames.contains("vrms")) {
        db.close();
        return resolve([]);
      }
      const t = db.transaction("vrms", "readonly");
      const s = t.objectStore("vrms");
      const req = s.getAll();
      req.onsuccess = () => {
        db.close();
        resolve((req.result || []).map((x: { hash: string; saveType: string }) => ({ hash: x.hash, saveType: x.saveType })));
      };
      req.onerror = () => {
        db.close();
        reject(req.error);
      };
    };
    r.onerror = () => reject(r.error);
  });
}

function addTestRecord(): Promise<string> {
  const record = {
    hash: "test-" + Date.now(),
    saveType: "local",
    vrmData: "data:application/octet-stream;base64,",
    vrmUrl: "",
    thumbData: "",
  };
  return new Promise((resolve, reject) => {
    const r = indexedDB.open("AmicaVrmDatabase");
    r.onsuccess = () => {
      const db = r.result;
      const t = db.transaction("vrms", "readwrite");
      const s = t.objectStore("vrms");
      const req = s.put(record);
      req.onsuccess = () => {
        db.close();
        resolve(record.hash);
      };
      req.onerror = () => {
        db.close();
        reject(req.error);
      };
    };
    r.onerror = () => reject(r.error);
  });
}

function addVrmFromFile(file: File): Promise<{ hash: string; size: number }> {
  if (!file?.name.toLowerCase().endsWith(".vrm")) {
    return Promise.reject(new Error("Нужен файл .vrm"));
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const vrmData = reader.result;
      if (typeof vrmData !== "string") {
        reject(new Error("Ожидалась строка data URL"));
        return;
      }
      const len = vrmData.length;
      const S = 100000;
      let h = 0;
      for (let i = 0; i < Math.min(S, len); i++) h = ((h << 5) - h + vrmData.charCodeAt(i)) << 0;
      for (let i = Math.max(0, len - S); i < len; i++) h = ((h << 5) - h + vrmData.charCodeAt(i)) << 0;
      h = ((h << 5) - h + len) << 0;
      const hash = String(h);
      const record = { hash, saveType: "local", vrmData, vrmUrl: "", thumbData: "" };
      const r = indexedDB.open("AmicaVrmDatabase");
      r.onsuccess = () => {
        const db = r.result;
        const t = db.transaction("vrms", "readwrite");
        const s = t.objectStore("vrms");
        const req = s.put(record);
        req.onsuccess = () => {
          db.close();
          resolve({ hash, size: vrmData.length });
        };
        req.onerror = () => {
          db.close();
          reject(req.error);
        };
      };
      r.onerror = () => reject(r.error);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function pickAndAdd(): void {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".vrm,.VRM";
  input.onchange = () => {
    const file = input.files?.[0];
    if (!file) return;
    addVrmFromFile(file)
      .then((r) => console.log("[VRM] Запись в IndexedDB:", r))
      .catch((e) => console.error("[VRM] Ошибка:", e));
  };
  input.click();
}

/** Достать запись из IndexedDB по hash и подгрузить её как текущую модель (конфиг + viewer). Без аргумента — подгружает последнюю локальную запись. */
function applyAndLoad(hash?: string): Promise<void> {
  const doLoad = (h: string) => {
  return new Promise((resolve, reject) => {
    const r = indexedDB.open("AmicaVrmDatabase");
    r.onsuccess = () => {
      const db = r.result;
      if (!db.objectStoreNames.contains("vrms")) {
        db.close();
        return reject(new Error("Store vrms не найден"));
      }
      const t = db.transaction("vrms", "readonly");
      const s = t.objectStore("vrms");
      const req = s.get(h);
      req.onsuccess = async () => {
        db.close();
        const record = req.result;
        if (!record?.vrmData) {
          return reject(new Error("Запись не найдена или без vrmData: " + h));
        }
        try {
          await updateConfig("vrm_save_type", "local");
          await updateConfig("vrm_hash", h);
          await updateConfig("vrm_url", record.vrmData);
          viewer.loadVrm(record.vrmData, () => {}).then(
            () => {
              console.log("[VRM] Модель подгружена, hash =", h);
              resolve();
            },
            (err) => reject(err)
          );
        } catch (e) {
          reject(e);
        }
      };
      req.onerror = () => {
        db.close();
        reject(req.error);
      };
    };
    r.onerror = () => reject(r.error);
  });
  };
  if (hash) return doLoad(hash);
  return listVrms().then((arr) => {
    const local = arr.filter((x) => x.saveType === "local");
    const h = local.length ? local[local.length - 1].hash : null;
    if (!h) return Promise.reject(new Error("В IndexedDB нет локальных записей. Сначала __vrmIndexedDB.pickAndAdd()"));
    return doLoad(h);
  });
}

export function attachVrmIndexedDBHelper(): void {
  if (typeof window === "undefined" || !isDev) return;
  (window as unknown as { __vrmIndexedDB?: unknown }).__vrmIndexedDB = {
    list: listVrms,
    addTest: addTestRecord,
    addFromFile: addVrmFromFile,
    pickAndAdd,
    applyAndLoad,
  };
  console.log("[VRM] Консоль: __vrmIndexedDB.list() | .addTest() | .pickAndAdd() | .applyAndLoad(hash)");
}
