/* Bandeau de démonstration : non intrusif, n'intercepte pas les clics. */
(function () {
  function add() {
    if (document.getElementById('demo-banner')) return;
    var b = document.createElement('div');
    b.id = 'demo-banner';
    b.setAttribute('role', 'note');
    b.textContent = 'Démo · données simulées';
    b.style.cssText = 'position:fixed;left:10px;bottom:10px;z-index:2147483647;' +
      'background:rgba(20,20,28,.72);color:#fff;font:600 11px/1.2 system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;' +
      'letter-spacing:.02em;padding:5px 9px;border-radius:999px;pointer-events:none;' +
      'box-shadow:0 2px 8px rgba(0,0,0,.18);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);opacity:.85';
    document.body.appendChild(b);
  }
  if (document.body) add(); else document.addEventListener('DOMContentLoaded', add);
})();
