/**
 * @typedef {"storeweb:v1:cart"|"storeweb:v1:auth"|"storeweb:v1:products"|"storeweb:v1:orders"} StorageKey
 */

/**
 * @template T
 * @param {StorageKey} key
 * @param {T} fallback
 * @returns {T}
 */
export function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

/**
 * @template T
 * @param {StorageKey} key
 * @param {T} value
 */
export function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore write errors (quota/private mode)
  }
}

/**
 * @param {StorageKey} key
 */
export function removeKey(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

