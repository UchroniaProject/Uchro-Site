// File: static/scripts/Home_auth.js
// Rôle:
// - Ouvrir/fermer la modale de login
// - Envoyer les identifiants à /login/api/ (POST, fetch, CSRF)
// - Afficher les erreurs de AuthenticationForm
// - Déconnecter via /logout/api/ (POST)
// Dépendances: aucune. Django doit inclure SessionMiddleware + CsrfViewMiddleware.

(() => {
  'use strict';

  // Utilitaires ---------------------------------------------------------------
  const getCookie = (name) => {
    const m = document.cookie.match(new RegExp('(^|;\\s*)' + name + '=([^;]*)'));
    return m ? decodeURIComponent(m[2]) : null;
  };
  const csrfToken = () => getCookie('csrftoken');

  // Elements ------------------------------------------------------------------
  const openBtn = document.querySelector('[data-open-login]');
  const logoutBtn = document.querySelector('[data-logout]');
  const modal = document.getElementById('login-modal');

  // Déconnexion rapide (si affichée) ------------------------------------------
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        const url = (modal && modal.dataset && modal.dataset.logoutApiUrl)
          ? modal.dataset.logoutApiUrl
          : '/logout/api/';
        const resp = await fetch(url, {
          method: 'POST',
          headers: { 'X-CSRFToken': csrfToken() || '' },
          credentials: 'same-origin'
        });
        if (resp.ok) {
          location.reload();
        } else {
          alert('Impossible de se déconnecter pour le moment.');
        }
      } catch {
        alert('Erreur réseau pendant la déconnexion.');
      }
    });
  }

  if (!modal || !openBtn) return; // pas de modale à initialiser

  const panel = modal.querySelector('.modal__panel');
  const closeEls = modal.querySelectorAll('[data-close-login]');
  const form = modal.querySelector('#login-form');
  const errorsBox = modal.querySelector('#login-errors');
  const usernameInput = form.querySelector('#id_username');
  const passwordInput = form.querySelector('#id_password');
  const loginApiUrl = modal.dataset.loginApiUrl || '/login/api/';

  // Modale: ouverture/fermeture -----------------------------------------------
  function openModal(e) {
    if (e) e.preventDefault();
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    setTimeout(() => usernameInput.focus(), 0);
    document.addEventListener('keydown', onKeyDown);
  }
  function closeModal() {
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    document.removeEventListener('keydown', onKeyDown);
    errorsBox.innerHTML = '';
    form.reset();
  }
  function onKeyDown(e) {
    if (e.key === 'Escape') closeModal();
  }

  openBtn.addEventListener('click', openModal);
  closeEls.forEach(el => el.addEventListener('click', closeModal));
  modal.addEventListener('click', (e) => {
    if (!panel.contains(e.target)) closeModal();
  });

  // Soumission AJAX -----------------------------------------------------------
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorsBox.innerHTML = '';

    const body = new FormData();
    body.set('username', usernameInput.value.trim());
    body.set('password', passwordInput.value);

    try {
      const resp = await fetch(loginApiUrl, {
        method: 'POST',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRFToken': csrfToken() || ''
        },
        body,
        credentials: 'same-origin'
      });

      if (resp.ok) {
        // Auth OK
        location.reload();
        return;
      }

      // Erreurs de formulaire
      const data = await resp.json().catch(() => ({}));
      showErrors(data.errors || {});
    } catch {
      showErrors({ __all__: [{ message: 'Erreur réseau. Veuillez réessayer.' }] });
    }
  });

  function showErrors(errors) {
    const blocks = [];
    for (const field of Object.keys(errors)) {
      const msgs = (errors[field] || []).map(o => o.message).join('<br>');
      const label = field === '__all__' ? 'Erreur' : field;
      blocks.push(`<div class="error-row"><strong>${label} :</strong> ${msgs}</div>`);
    }
    errorsBox.innerHTML = blocks.join('') || '<div class="error-row">Identifiants invalides.</div>';
  }
})();
