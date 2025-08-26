// UI barre latérale + panneau: toggle, persistance, chargement AJAX
(() => {
  // — Sélection robuste (ancien id ou nouvelle structure)
  const sidebar   = document.getElementById('mgui-sidebar');
  const toggleBtn = document.getElementById('mgui-sidebar-toggle');
  const toolbar   =
    document.getElementById('mgui-toolbar') ||
    (sidebar ? sidebar.querySelector('.mgui-toolbar') : null);

  const panel      = document.getElementById('mgui-panel');
  const panelBody  = document.getElementById('mgui-panel-body');
  const panelTitle = document.getElementById('mgui-panel-title');
  const panelClose = document.getElementById('mgui-panel-close');

  // Si l’essentiel n’est pas là, on sort sans bruit
  if (!toolbar || !panel || !panelBody || !panelTitle || !panelClose) return;

  // — Etat de la barre (persistant)
  const STORAGE_KEY = 'mgui.sidebarState';
  function applySidebarState(state) {
    if (!sidebar || !toggleBtn) return;
    const expanded = state === 'expanded';
    sidebar.classList.toggle('is-expanded', expanded);
    sidebar.classList.toggle('is-collapsed', !expanded);
    toggleBtn.setAttribute('aria-expanded', String(expanded));
  }
  // Valeur par défaut: repliée
  if (sidebar && toggleBtn) {
    applySidebarState(localStorage.getItem(STORAGE_KEY) || 'collapsed');
    toggleBtn.addEventListener('click', () => {
      const expanded = !sidebar.classList.contains('is-expanded');
      applySidebarState(expanded ? 'expanded' : 'collapsed');
      localStorage.setItem(STORAGE_KEY, expanded ? 'expanded' : 'collapsed');
    });
  }

  // — Panneau: ouverture/fermeture + fetch AJAX
  let currentUrl = null;

  function openPanel(url, title) {
    // Toggle si on reclique le même bouton
    if (panel.classList.contains('is-open') && url === currentUrl) {
      return closePanel();
    }

    currentUrl = url;
    panelTitle.textContent = title || 'Panel';
    panel.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');

    panelBody.innerHTML =
      '<div style="padding:8px;color:#fff;opacity:.8">Chargement…</div>';

    // Chargement AJAX
    fetch(url, { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
      .then(r => {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.text();
      })
      .then(html => {
        panelBody.innerHTML = html;
        const focusable = panelBody.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        (focusable || panelClose).focus({ preventScroll: true });
      })
      .catch(err => {
        panelBody.innerHTML =
          '<div style="padding:8px;color:#ffb4b4">Erreur: ' + err.message + '</div>';
      });
  }

    function closePanel() {
    const panel = document.querySelector('.mgui-panel');
    if (!panel) return;

    // Fermer sans animation
    panel.style.transition = 'none';
    panel.classList.remove('is-open');     // bascule à l'état "fermé" => règle CSS :not(.is-open)
    panel.setAttribute('aria-hidden', 'true');

    // Important: ne PAS laisser d'inline qui persiste (pas de pointer-events en inline)
    panel.style.removeProperty('pointer-events');
    panel.style.removeProperty('transform');
    panel.style.removeProperty('opacity');

    void panel.offsetWidth;
    panel.style.removeProperty('transition');

    const panelBody = panel.querySelector('.mgui-panel__body');
    if (panelBody) panelBody.innerHTML = '';
    }


  // — Délégation de clic sur la barre (icônes)
  toolbar.addEventListener('click', (e) => {
    const btn = e.target.closest('.mgui-tool');
    if (!btn || !toolbar.contains(btn)) return;

    // 1) titre: data-label > title > texte
    const title =
      btn.dataset.label ||
      btn.getAttribute('title') ||
      btn.textContent.trim() ||
      'Panel';

    // 2) URL: data-url > /MainGameUI/<data-tool>/
    let url = btn.dataset.url;
    if (!url && btn.dataset.tool) url = `/MainGameUI/${btn.dataset.tool}/`;

    if (!url) {
      // Pas d’URL: on n’ouvre pas pour éviter un fetch invalide (cohérent avec ton code)
      console.warn('[MainGameUI] Aucun URL pour le bouton', btn);
      return;
    }
    openPanel(url, title);
  });

  // — Fermetures
  panelClose.addEventListener('click', closePanel);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePanel();
  });
})();
