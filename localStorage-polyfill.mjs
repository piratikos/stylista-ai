// Polyfill localStorage for Node.js 22+ where it exists but throws without --localstorage-file
const store = {};
try {
  // Test if localStorage actually works
  globalThis.localStorage.getItem('__test__');
} catch {
  // Replace with a working in-memory implementation
  globalThis.localStorage = {
    getItem(key) { return store[key] ?? null; },
    setItem(key, value) { store[key] = String(value); },
    removeItem(key) { delete store[key]; },
    clear() { Object.keys(store).forEach(k => delete store[k]); },
    get length() { return Object.keys(store).length; },
    key(index) { return Object.keys(store)[index] ?? null; },
  };
}
