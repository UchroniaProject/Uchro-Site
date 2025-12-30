// static/scripts/MainGameUI_parameters.js
(() => {
  // 1) Ouverture/fermeture du dialog Paramètres
  const btnOpen = document.getElementById('topbar-settings-btn');  // icône (le <a>)
  const dlg = document.getElementById('settings-dialog');          // le <dialog> réel

  if (btnOpen && dlg && typeof dlg.showModal === 'function') {
    btnOpen.addEventListener('click', (e) => {
      e.preventDefault();
      if (!dlg.open) dlg.showModal();
    });
    // Fermer au clic sur le backdrop
    dlg.addEventListener('click', (e) => {
      const r = dlg.getBoundingClientRect();
      const inside = (e.clientX >= r.left && e.clientX <= r.right &&
                      e.clientY >= r.top && e.clientY <= r.bottom);
      if (!inside) dlg.close('backdrop');
    });
  }

  // 2) Thème: 3 états Auto / Sombre / Clair
  const THEME_KEY = 'mgui:theme';
  const LEGACY_KEY = 'mgui.theme';
  const btnTheme = document.getElementById('theme-button');
  const root = document.documentElement;
  const media = window.matchMedia('(prefers-color-scheme: dark)');

  // a) Migration éventuelle d’une clé legacy
  (function migrate() {
    try {
      if (!localStorage.getItem(THEME_KEY) && localStorage.getItem(LEGACY_KEY)) {
        localStorage.setItem(THEME_KEY, localStorage.getItem(LEGACY_KEY));
      }
    } catch (_) {}
  })();

  // b) Libellés + cycle
  const LABELS = { auto: 'Auto', dark: 'Sombre', light: 'Clair' };
  const ORDER  = ['auto', 'dark', 'light'];
  const nextOf = v => ORDER[(ORDER.indexOf(v) + 1) % ORDER.length];

  // c) Résolution du thème effectif
  function resolveTheme(pref) {
    if (pref === 'light' || pref === 'dark') return pref;
    return media.matches ? 'dark' : 'light'; // 'auto' → OS
  }

  // d) Application + MAJ de l’UI
  function applyTheme(pref) {
    const resolved = resolveTheme(pref);
    // Attribut pour le CSS: on indique explicitement l’intention
    root.setAttribute('data-theme', pref === 'auto' ? 'auto' : resolved);

    // MAJ du bouton (texte, dataset, aria, title)
    if (btnTheme) {
      btnTheme.dataset.theme = pref;
      btnTheme.textContent = LABELS[pref];
      const nxt = nextOf(pref);
      const aria = `Thème: ${LABELS[pref]} (cliquer pour passer en ${LABELS[nxt]})`;
      btnTheme.setAttribute('aria-label', aria);
      btnTheme.title = aria;
    }

    // Événement global si d’autres modules écoutent
    document.dispatchEvent(new CustomEvent('mgui:themechange', {
      detail: { pref, resolved }
    }));
  }

  // e) API publique
  let pref = localStorage.getItem(THEME_KEY) || 'auto';

  window.MGUI = window.MGUI || {};
  window.MGUI.setTheme = (v) => {
    if (!['auto', 'light', 'dark'].includes(v)) return;
    pref = v;
    try { localStorage.setItem(THEME_KEY, v); } catch(_) {}
    applyTheme(v);
  };
  window.MGUI.cycleTheme = () => window.MGUI.setTheme(nextOf(pref));
  window.MGUI.getThemePref = () => pref;
  window.MGUI.getThemeResolved = () => resolveTheme(pref);

  // f) Init
  applyTheme(pref);

  // g) Suivre l’OS si 'auto'
  const onMedia = () => { if (pref === 'auto') applyTheme('auto'); };
  if (media && media.addEventListener) media.addEventListener('change', onMedia);
  else if (media && media.addListener) media.addListener(onMedia); // Safari ancien

  // h) Clic sur le bouton: on passe par l’API (persistance + UI)
  if (btnTheme) {
    btnTheme.addEventListener('click', () => {
      window.MGUI.cycleTheme();
    });
  }

  // i) Raccourci clavier 'T'
  window.addEventListener('keydown', (e) => {
    if (e.code === 'KeyT' && !e.altKey && !e.ctrlKey && !e.metaKey) {
      const t = (e.target?.tagName || '').toLowerCase();
      if (!['input','textarea','select'].includes(t) && !e.target?.isContentEditable) {
        e.preventDefault();
        window.MGUI.cycleTheme();
      }
    }
  });
})();
