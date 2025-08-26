/* File: MainGameUI_topbar_modifiers.js
   Rôle: Dropdown unique réutilisé par les 5 slots d’indicateurs, avec recherche et option pour "vider" (aucun modificateur).
   Intégration: <script src="{% static scripts/MainGameUI_topbar_modifiers.js %}" defer></script>
   Attentes HTML: 5 boutons .indicator-select (un par .indicator-slot)
*/

(() => {
  'use strict';

  // ---------------------------------------------------------------------------
  // Configuration
  // ---------------------------------------------------------------------------
  const MODIFIERS = Array.from({ length: 10 }, (_, i) => `Modif ${i + 1}`);
  // Texte affiché sur le bouton lorsque le slot est vidé (modifiable selon ton UI)
  const EMPTY_BUTTON_LABEL = 'Aucun indicateur';
  const VIEWPORT_EDGE_GAP = 8;     // marge min. avec les bords (px)
  const TRIGGER_GAP = 6;           // écart vertical bouton <-> menu (px)
  const MIN_DROPDOWN_WIDTH = 220;  // largeur min. du menu (px)

  // ---------------------------------------------------------------------------
  // État et utilitaires DOM
  // ---------------------------------------------------------------------------
  let dropdownEl, listEl, searchInputEl, resetBtnEl, currentTriggerBtn = null;

  // Sélections DOM
  const queryOne = (selector, root = document) => root.querySelector(selector);
  const queryAll = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  // Normalise pour recherche insensible à la casse et aux accents
  const normalizeText = s => (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');

  // ---------------------------------------------------------------------------
  // Création du dropdown (une seule instance réutilisée)
  // ---------------------------------------------------------------------------
  function ensureDropdownExists() {
    if (dropdownEl) return;

    // Conteneur principal
    dropdownEl = document.createElement('div');
    dropdownEl.id = 'indicator-dropdown';
    dropdownEl.className = 'indicator-dropdown';
    dropdownEl.hidden = true; // invisible tant qu’il n’est pas ouvert
    dropdownEl.style.position = 'fixed';
    dropdownEl.style.zIndex = '9999';

    // Entête: barre de recherche + bouton "Réinitialiser"
    const headerEl = document.createElement('div');
    headerEl.className = 'indicator-dropdown__header';

    const searchWrapEl = document.createElement('div');
    searchWrapEl.className = 'indicator-dropdown__search';

    searchInputEl = document.createElement('input');
    Object.assign(searchInputEl, {
      type: 'search',
      placeholder: 'Rechercher…',
      autocomplete: 'off',
      'aria-label': 'Rechercher un modificateur'
    });

    resetBtnEl = document.createElement('button');
    resetBtnEl.type = 'button';
    resetBtnEl.className = 'indicator-dropdown__reset';
    resetBtnEl.textContent = 'Réinitialiser'; // action "revenir à zéro"
    resetBtnEl.setAttribute('aria-label', 'Vider le slot (aucun indicateur)');

    searchWrapEl.appendChild(searchInputEl);
    headerEl.append(searchWrapEl, resetBtnEl);

    // Liste d’options (sans "Aucun", qui n’est plus une option)
    listEl = document.createElement('ul');
    listEl.className = 'indicator-dropdown__list';
    listEl.setAttribute('role', 'listbox');

    dropdownEl.append(headerEl, listEl);
    document.body.appendChild(dropdownEl);

    // Écoutes: saisie pour filtrer
    searchInputEl.addEventListener('input', () => renderList(searchInputEl.value));

    // Écoute: clic sur une option => sélection
    listEl.addEventListener('click', (e) => {
      const optionEl = e.target.closest('.indicator-option');
      if (!optionEl || !currentTriggerBtn) return;
      const value = optionEl.dataset.value || '';
      applySelectionToTrigger(currentTriggerBtn, value);
      closeDropdown();
    });

    // Écoute: clic sur "Réinitialiser" => vider le slot (hors liste)
    resetBtnEl.addEventListener('click', () => {
      if (!currentTriggerBtn) return;
      clearTrigger(currentTriggerBtn, 'reset-button');
      closeDropdown();
    });

    // Raccourci clavier: Backspace/Delete quand la recherche est vide => vider
    searchInputEl.addEventListener('keydown', (e) => {
      if (!currentTriggerBtn) return;
      const isEmpty = (searchInputEl.value || '') === '';
      if (isEmpty && (e.key === 'Backspace' || e.key === 'Delete')) {
        e.preventDefault();
        clearTrigger(currentTriggerBtn, 'keyboard');
        closeDropdown();
      }
    });

    // Fermer au clic extérieur
    document.addEventListener('click', (e) => {
      if (!dropdownEl.hidden && !dropdownEl.contains(e.target) && e.target !== currentTriggerBtn) {
        closeDropdown();
      }
    });

    // Fermer via Échap
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !dropdownEl.hidden) closeDropdown();
    });
  }

  // ---------------------------------------------------------------------------
  // Rendu de la liste
  // ---------------------------------------------------------------------------
  function renderList(filterText = '') {
    const f = normalizeText(filterText);
    listEl.innerHTML = '';

    MODIFIERS
      .filter(m => normalizeText(m).includes(f))
      .forEach(m => {
        const li = document.createElement('li');
        li.className = 'indicator-option';
        li.textContent = m;
        li.dataset.value = m;
        li.setAttribute('role', 'option');
        listEl.appendChild(li);
      });

    // Optionnel: afficher un état vide
    if (!listEl.children.length) {
      const emptyLi = document.createElement('li');
      emptyLi.className = 'indicator-option indicator-option--empty';
      emptyLi.textContent = 'Aucun résultat';
      emptyLi.setAttribute('aria-disabled', 'true');
      listEl.appendChild(emptyLi);
    }
  }

  // ---------------------------------------------------------------------------
  // Application d’une sélection sur le bouton déclencheur
  // ---------------------------------------------------------------------------
  function applySelectionToTrigger(triggerBtn, value) {
    // dataset.value utile si tu exploites attr(data-value) en CSS
    triggerBtn.dataset.value = value;
    // Fallback visuel: texte du bouton (à adapter si tu utilises un ::after)
    triggerBtn.textContent = value || EMPTY_BUTTON_LABEL;
  }

  // Réinitialisation (revenir à zéro) du slot
  function clearTrigger(triggerBtn, source = 'api') {
    triggerBtn.dataset.value = '';
    triggerBtn.textContent = EMPTY_BUTTON_LABEL;
  }

  // ---------------------------------------------------------------------------
  // Ouverture / positionnement du menu
  // ---------------------------------------------------------------------------
  function openDropdown(triggerBtn) {
    ensureDropdownExists();
    currentTriggerBtn = triggerBtn;

    // Fermer autres triggers
    queryAll('.indicator-select[aria-expanded="true"]').forEach(b => b.setAttribute('aria-expanded', 'false'));
    triggerBtn.setAttribute('aria-expanded', 'true');

    // Préparer contenu
    searchInputEl.value = '';
    renderList('');
    dropdownEl.hidden = false;

    // Largeur et position
    dropdownEl.style.width = Math.max(MIN_DROPDOWN_WIDTH, triggerBtn.offsetWidth) + 'px';
    const rect = triggerBtn.getBoundingClientRect();
    const dw = dropdownEl.offsetWidth;
    const dh = dropdownEl.offsetHeight;

    let left = Math.min(Math.max(rect.left, VIEWPORT_EDGE_GAP), window.innerWidth - dw - VIEWPORT_EDGE_GAP);
    let top = rect.bottom + TRIGGER_GAP;
    if (top + dh + VIEWPORT_EDGE_GAP > window.innerHeight) {
      top = Math.max(VIEWPORT_EDGE_GAP, rect.top - TRIGGER_GAP - dh);
    }

    dropdownEl.style.left = left + 'px';
    dropdownEl.style.top = top + 'px';

    // Focus immédiat sur la recherche
    setTimeout(() => searchInputEl.focus(), 0);
  }

  // Fermeture du menu
  function closeDropdown() {
    if (!currentTriggerBtn) return;
    currentTriggerBtn.setAttribute('aria-expanded', 'false');
    currentTriggerBtn = null;
    dropdownEl.hidden = true;
  }

  // ---------------------------------------------------------------------------
  // Initialisation des déclencheurs (.indicator-select)
  // ---------------------------------------------------------------------------
  function attachTriggers() {
    queryAll('.indicator-select').forEach((btn, i) => {
      // ARIA minimale
      if (!btn.hasAttribute('aria-haspopup')) btn.setAttribute('aria-haspopup', 'listbox');
      if (!btn.hasAttribute('aria-expanded')) btn.setAttribute('aria-expanded', 'false');
      if (!btn.hasAttribute('aria-label')) btn.setAttribute('aria-label', `Choisir l’indicateur du slot ${i + 1}`);

      // Ouverture par clic
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        (btn.getAttribute('aria-expanded') === 'true') ? closeDropdown() : openDropdown(btn);
      });

      // Astuce UX (optionnelle): double-clic sur le bouton pour vider
      btn.addEventListener('dblclick', () => clearTrigger(btn, 'double-click'));
    });
  }

  // Démarrage après parsing du DOM (grâce à defer)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachTriggers, { once: true });
  } else {
    attachTriggers();
  }
})();
