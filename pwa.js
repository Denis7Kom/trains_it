(() => {
  if (!('serviceWorker' in navigator)) return;
  const script = document.currentScript;
  if (!script) return;
  const root = new URL('.', script.src);
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(new URL('sw.js', root).href, { scope: root.pathname })
      .catch((error) => console.warn('Offline support unavailable:', error));
  });
})();
