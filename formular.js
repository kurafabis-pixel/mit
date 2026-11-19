/* TROBAG | Erweiterung bestehendes Powermail-Formular 66 | Funktionen & Felder */
/*
 * TROBAG | ERWEITERUNG DES BESTEHENDEN SCHNELLANFRAGE-FORMULARS
 * Wirkt ausschliesslich in .powermail_form_66 (Powermail-Formular UID 66).
 * Bestehende Eingabefelder, Powermail-Namen, Form-Action, Datei-Upload,
 * Datenschutz, Validierung und versteckte TYPO3-Felder bleiben erhalten.
 *
 * Aktuelle Formular-Konfiguration: "beschreibung" ist das einzige bestehende
 * Textfeld für Schadenangaben. Deshalb werden die freiwilligen Zusatzangaben
 * beim Abschicken als zusammengefasster Text an DIESES BESTEHENDE Feld angehängt.
 * Für separate Backend-Felder muss die Formular-Konfiguration in TYPO3/Powermail
 * ergänzt werden. Bitte __trustedProperties NIE manuell erweitern.
 */
(function () {
  'use strict';
  const FORM_SELECTOR = 'form.powermail_form_66';
  const MARKER = ' [Zusätzliche Schadenangaben: ';
  const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  const rooms = ['Badezimmer', 'Küche', 'Wohnzimmer', 'Schlafzimmer', 'Keller', 'Waschküche', 'Weitere Räume'];
  const parts = ['Wand', 'Decke', 'Boden'];
  function checkboxGroup(items, group) {
    return items.map(item => {
      const id = 'trobag-' + group + '-' + item.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      return `<label class="trobag-more__check" for="${id}"><input type="checkbox" id="${id}" data-trobag-${group}="${escapeHtml(item)}">${escapeHtml(item)}</label>`;
    }).join('');
  }
  const extraHTML = `
  <section class="powermail_fieldwrap trobag-more" aria-label="Ergänzende Angaben zum Schaden">
    <div class="trobag-more__heading">Weitere Angaben zum Schaden</div>
    <div class="trobag-more__grid">
      <div class="form-group">
        <select id="trobag-objektart" class="powermail_select form-control" aria-label="Objektart (Pflichtfeld)" required>
          <option value="">Objektart*</option>
          <option>Einfamilienhaus</option><option>Mehrfamilienhaus</option>
          <option>Gewerbe</option><option>Andere Objektart</option>
        </select><div class="material-icons" aria-hidden="true">&#xe5cf;</div></div>
      <div class="form-group">
        <select id="trobag-etage" class="powermail_select form-control" aria-label="Etage der Schadenstelle (Pflichtfeld)" required>
          <option value="">Etage der Schadenstelle*</option>
          <option>Untergeschoss (UG)</option><option>Erdgeschoss (EG)</option>
          <option>1. OG</option><option>2. OG</option><option>3. OG</option>
          <option>4. OG oder höher</option><option>Dachgeschoss</option><option>Nicht bekannt</option>
        </select><div class="material-icons" aria-hidden="true">&#xe5cf;</div></div>
    </div>
    <div class="trobag-more__accordion-grid">
    <details class="trobag-more__accordion" id="trobag-betroffen">
      <summary><span class="trobag-more__summary-main"><span>Betroffene Räume und Schadenstellen</span><span class="trobag-more__muted">optional</span></span></summary>
      <div class="trobag-more__accordion-body">
        <div class="trobag-more__group">
          <div class="trobag-more__label">Welche Räume sind betroffen?</div>
          <div class="trobag-more__checks">${checkboxGroup(rooms, 'room')}</div>
        </div>
        <div class="trobag-more__group">
          <div class="trobag-more__label">Wo ist der Schaden sichtbar?</div>
          <div class="trobag-more__checks">${checkboxGroup(parts, 'part')}</div>
        </div>
        <div class="trobag-more__note" id="trobag-neighbours" hidden>
          <p><strong>Möglicherweise sind weitere Wohnungen betroffen.</strong><br>
            Bei Schäden an der Decke oder am Boden können Angaben zu Bewohnern der Wohnung darüber bzw. darunter hilfreich sein.</p>
          <button class="trobag-more__linkbutton" type="button" id="trobag-toggle-neighbour" aria-expanded="false" aria-controls="trobag-neighbour-fields">+ Nachbarn angeben (freiwillig)</button>
          <div class="trobag-more__inner" id="trobag-neighbour-fields" hidden>
            <div class="form-group"><label for="trobag-neighbour-flat" class="trobag-more__label">Welche Wohnung?</label>
              <select id="trobag-neighbour-flat" class="form-control powermail_select">
                <option value="">Welche Wohnung?</option><option>Wohnung darüber</option><option>Wohnung darunter</option><option>Beide Wohnungen</option>
              </select><div class="material-icons" aria-hidden="true">&#xe5cf;</div></div>
            <div class="form-group"><label for="trobag-neighbour-name" class="trobag-more__label">Name der Bewohner (falls bekannt)</label>
              <input id="trobag-neighbour-name" class="form-control powermail_input" type="text" autocomplete="off" placeholder="Auch nur ein Name hilft uns weiter"></div>
            <div class="form-group"><label for="trobag-neighbour-contact" class="trobag-more__label">Telefon oder E-Mail (optional)</label>
              <input id="trobag-neighbour-contact" class="form-control powermail_input" type="text" autocomplete="off" placeholder="Nur falls bekannt"></div>
          </div>
        </div>
      </div>
    </details>
    <details class="trobag-more__accordion" id="trobag-beteiligte">
      <summary><span class="trobag-more__summary-main"><span>Weitere Beteiligte hinzufügen</span><span class="trobag-more__muted">optional</span></span></summary>
      <div class="trobag-more__accordion-body">
        <div id="trobag-persons" aria-live="polite"></div>
        <button type="button" class="trobag-more__linkbutton" id="trobag-add-person">+ Person hinzufügen</button>
        <p class="trobag-more__small">Zum Beispiel betroffene Bewohner, Eigentümer, Verwaltung oder bereits involvierte Sanitärfirmen. Bitte nur notwendige Kontaktdaten angeben.</p>
      </div>
    </details>
    </div>
  </section>`;


  // Einheitliche blaue Plus-Icons für alle Selects (auch "Ich bin"):
  // Das Original-Material-Icon wird ausgeblendet, das Wrapper-CSS zeigt nur ein Plus.
  function setupSelectIcons(scope) {
    scope.querySelectorAll('select.form-control').forEach(select => {
      const wrapper = select.parentElement;
      if (wrapper && wrapper.classList.contains('form-group')) {
        wrapper.classList.add('trobag-select-ui');
      }
    });
  }

  function init(form) {
    if (!form || form.dataset.trobagEnhanced === '1') return;
    const description = form.querySelector('#powermail_field_beschreibung');
    const anchor = description && description.closest('.powermail_fieldwrap');
    if (!anchor) return;
    form.dataset.trobagEnhanced = '1';
    // Die Beschreibung bleibt das ORIGINAL-Powermail-Feld (auch der Feldname).
    description.placeholder = 'Was ist passiert?*';
    description.setAttribute('aria-label', 'Was ist passiert? (Pflichtfeld)');
    anchor.insertAdjacentHTML('afterend', extraHTML);
    setupSelectIcons(form);
    const root = form.querySelector('.trobag-more');
    const $ = selector => root.querySelector(selector);
    const checked = attr => Array.from(root.querySelectorAll(`input[${attr}]:checked`)).map(i => i.getAttribute(attr));

    function updateNeighbour() {
      const needs = $('#trobag-objektart').value === 'Mehrfamilienhaus' &&
        checked('data-trobag-part').some(value => value === 'Decke' || value === 'Boden');
      $('#trobag-neighbours').hidden = !needs;
      if (!needs) {
        $('#trobag-neighbour-fields').hidden = true;
        $('#trobag-toggle-neighbour').setAttribute('aria-expanded', 'false');
        $('#trobag-toggle-neighbour').textContent = '+ Nachbarn angeben (freiwillig)';
      }
    }
    root.addEventListener('change', event => {
      if (event.target.id === 'trobag-objektart' || event.target.hasAttribute('data-trobag-part')) updateNeighbour();
    });
    $('#trobag-toggle-neighbour').addEventListener('click', () => {
      const panel = $('#trobag-neighbour-fields');
      panel.hidden = !panel.hidden;
      $('#trobag-toggle-neighbour').setAttribute('aria-expanded', String(!panel.hidden));
      $('#trobag-toggle-neighbour').textContent = panel.hidden ? '+ Nachbarn angeben (freiwillig)' : '− Angaben zu Nachbarn schliessen';
      if (!panel.hidden) {
        const ceiling = checked('data-trobag-part').includes('Decke');
        const floor = checked('data-trobag-part').includes('Boden');
        const select = $('#trobag-neighbour-flat');
        if (!select.value) select.value = ceiling && floor ? 'Beide Wohnungen' : ceiling ? 'Wohnung darüber' : 'Wohnung darunter';
      }
    });

    let counter = 0;
    $('#trobag-add-person').addEventListener('click', () => {
      counter += 1;
      const index = counter;
      const node = document.createElement('div');
      node.className = 'trobag-more__person';
      node.dataset.person = String(index);
      node.innerHTML = `
        <div class="trobag-more__personheader"><strong>Weitere Person</strong>
          <button class="trobag-more__linkbutton" type="button" data-trobag-remove>Entfernen</button></div>
        <div class="trobag-more__grid">
          <div class="form-group"><label for="trobag-person-role-${index}">Funktion</label>
            <select id="trobag-person-role-${index}" class="form-control powermail_select" data-trobag-role>
              <option value="">Funktion auswählen</option><option>Bewohner/in</option><option>Eigentümer/in</option>
              <option>Verwaltung</option><option>Sanitär / Handwerker</option><option>Andere</option>
            </select><div class="material-icons" aria-hidden="true">&#xe5cf;</div></div>
          <div class="form-group"><label for="trobag-person-name-${index}">Name / Firma</label>
            <input id="trobag-person-name-${index}" class="form-control powermail_input" data-trobag-name type="text" autocomplete="off" placeholder="Falls bekannt"></div>
        </div>
        <div class="form-group"><label class="trobag-more__label" for="trobag-person-contact-${index}">Telefon / E-Mail (optional)</label>
          <input id="trobag-person-contact-${index}" class="form-control powermail_input" data-trobag-contact type="text" autocomplete="off" placeholder="Falls bekannt"></div>`;
      $('#trobag-persons').appendChild(node);
      setupSelectIcons(node);
    });
    $('#trobag-persons').addEventListener('click', event => {
      if (event.target.closest('[data-trobag-remove]')) event.target.closest('.trobag-more__person').remove();
    });

    function getSummary() {
      const data = [];
      const add = (key, value) => { if (value) data.push(`${key}: ${value}`); };
      add('Objektart', $('#trobag-objektart').value);
      add('Etage', $('#trobag-etage').value);
      add('Räume', checked('data-trobag-room').join(', '));
      add('Schadenstellen', checked('data-trobag-part').join(', '));
      if (!$('#trobag-neighbours').hidden && !$('#trobag-neighbour-fields').hidden) {
        const neighbour = [$('#trobag-neighbour-flat').value,
          $('#trobag-neighbour-name').value.trim(), $('#trobag-neighbour-contact').value.trim()].filter(Boolean).join(' / ');
        add('Wohnung darüber/darunter', neighbour);
      }
      const people = Array.from($('#trobag-persons').querySelectorAll('.trobag-more__person'));
      people.forEach((person, i) => {
        const values = ['[data-trobag-role]', '[data-trobag-name]', '[data-trobag-contact]']
          .map(selector => person.querySelector(selector).value.trim()).filter(Boolean);
        add(`Weitere Person ${i + 1}`, values.join(' / '));
      });
      return data.join('; ');
    }
    function baseDescription() {
      const current = description.value;
      const idx = current.indexOf(MARKER);
      return idx === -1 ? current : current.substring(0, idx);
    }
    // Der Powermail-Server vertraut NUR seinen im TYPO3-Backend definierten
    // Feldern. Die neuen Browser-Felder bekommen bewusst KEINEN Powermail-Namen.
    form.addEventListener('submit', () => {
      const extras = getSummary();
      description.value = baseDescription() + (extras ? `${MARKER}${extras}]` : '');
    }, true);
    // Bei erneutem Bearbeiten keine alten zusammengefassten Angaben duplizieren.
    description.addEventListener('focus', () => {
      if (description.value.includes(MARKER)) description.value = baseDescription();
    });
    // Schutz: ein lokal geöffnetes Beispiel soll nie an die Live-Website posten.
    if (document.documentElement.dataset.trobagPreview === 'true') {
      form.addEventListener('submit', event => {
        event.preventDefault();
        event.stopImmediatePropagation();
        const info = document.getElementById('trobag-preview-status');
        if (info) {
          info.textContent = 'Vorschau: Die Angaben wurden geprüft, aber nicht versendet. Das bestehende Powermail-Backend wird hier nicht aufgerufen.';
          info.hidden = false;
        }
      }, true);
    }

    // Drei kompakte, progressive Bereiche direkt auf den bestehenden
    // Powermail-Feldsets. Keine neuen Formulare, keine geänderten Feldnamen.
    setupProgressiveSections(form);
  }

  function setupProgressiveSections(form) {
    const fieldsets = ['.powermail_fieldset_80', '.powermail_fieldset_81', '.powermail_fieldset_82']
      .map(selector => form.querySelector(selector));
    if (fieldsets.some(fieldset => !fieldset)) return;
    const steps = [
      { title: 'Kontaktdaten', next: 'Weiter zu den Schadenangaben' },
      { title: 'Schaden & Schadenstelle', next: 'Weiter zu Fotos & Absenden' },
      { title: 'Fotos & Absenden' }
    ];

    fieldsets.forEach((fieldset, index) => {
      fieldset.classList.add('trobag-step');
      if (index > 0) fieldset.classList.add('trobag-step--collapsed');
      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'trobag-step__toggle';
      toggle.setAttribute('aria-expanded', String(index === 0));
      toggle.setAttribute('aria-label', `${steps[index].title} ${index === 0 ? 'schliessen' : 'öffnen'}`);
      toggle.innerHTML = `<span class="trobag-step__label">${steps[index].title}</span>` +
        `<span class="trobag-step__action" aria-hidden="true">${index === 0 ? 'Schliessen' : 'Öffnen'}</span>`;
      const legend = fieldset.querySelector('legend.powermail_legend');
      if (legend) legend.insertAdjacentElement('afterend', toggle);
      else fieldset.insertBefore(toggle, fieldset.firstChild);
      toggle.addEventListener('click', () => {
        if (fieldset.classList.contains('trobag-step--collapsed')) openStep(index);
        else { // bewusstes Zuklappen; alle Schritte können geschlossen sein
          fieldset.classList.add('trobag-step--collapsed');
          updateToggle(toggle, false);
        }
      });
      if (index < 2) {
        const next = document.createElement('div');
        next.className = 'trobag-step__next';
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = steps[index].next;
        button.addEventListener('click', () => {
          const invalid = Array.from(fieldset.querySelectorAll('input, select, textarea'))
            .find(control => control.willValidate && !control.checkValidity());
          if (invalid) {
            openStep(index);
            invalid.focus();
            invalid.reportValidity();
            return;
          }
          openStep(index + 1, true);
        });
        next.appendChild(button);
        fieldset.appendChild(next);
      }
    });

    form.classList.add('trobag-steps-ready');
    // Im Live-Template koennen die Powermail-Feldspalten einen kleinen
    // rechten Innenabstand besitzen. Damit Trennlinien, Dropdowns und
    // aufklappbare Zusatzfelder exakt an den ORIGINAL-Feldern enden,
    // messen wir deren tatsaechliche Geometrie (statt fixe px zu raten).
    function alignToExistingFields() {
      const firstInput = fieldsets[1].querySelector('#powermail_field_schadenadressestrasse');
      const secondInput = fieldsets[1].querySelector('#powermail_field_schadenadresseplz');
      const firstContact = fieldsets[0].querySelector('#powermail_field_name');
      const secondContact = fieldsets[0].querySelector('#powermail_field_vorname');
      const damageVisible = firstInput && firstInput.getClientRects().length &&
        secondInput && secondInput.getClientRects().length;
      const pair = damageVisible ? [firstInput, secondInput] : [firstContact, secondContact];
      if (!pair[0] || !pair[1] || !pair[0].getClientRects().length || !pair[1].getClientRects().length) return;
      const container = pair[0].closest('fieldset.trobag-step');
      if (!container) return;
      const outer = container.getBoundingClientRect();
      const first = pair[0].getBoundingClientRect();
      const second = pair[1].getBoundingClientRect();
      if (outer.width <= 0 || first.width <= 0 || second.width <= 0) return;
      // Gleiche Feldhöhe für neue Selects und optionale Aufklappfelder wie bei den
      // Original-Eingaben der Website (auch wenn sich diese responsiv ändern).
      if (first.height >= 30 && first.height <= 85) {
        form.style.setProperty('--trobag-native-field-height', `${first.height.toFixed(2)}px`);
      }
      const rightInset = Math.max(0, outer.right - Math.max(first.right, second.right));
      if (rightInset < outer.width * 0.3) {
        form.style.setProperty('--trobag-native-right-inset', `${rightInset.toFixed(2)}px`);
      }
      // Bei zwei sichtbaren Spalten genau dieselben Kanten und dieselbe
      // Luecke verwenden wie die bestehenden Schadenadress-Felder.
      if (damageVisible && second.left > first.left + 15) {
        const firstWidth = first.right - outer.left;
        const columnGap = second.left - first.right;
        if (firstWidth > 0 && columnGap >= 0 && columnGap < 60 &&
            firstWidth + columnGap < outer.width - rightInset) {
          form.style.setProperty('--trobag-native-first-width', `${firstWidth.toFixed(2)}px`);
          form.style.setProperty('--trobag-native-column-gap', `${columnGap.toFixed(2)}px`);
        }
      }
    }
    let resizeQueued = false;
    window.addEventListener('resize', () => {
      if (resizeQueued) return;
      resizeQueued = true;
      requestAnimationFrame(() => { resizeQueued = false; alignToExistingFields(); });
    }, {passive:true});
    alignToExistingFields();
    function updateToggle(toggle, open) {
      toggle.setAttribute('aria-expanded', String(open));
      const label = toggle.querySelector('.trobag-step__label').textContent;
      toggle.setAttribute('aria-label', `${label} ${open ? 'schliessen' : 'öffnen'}`);
      const action = toggle.querySelector('.trobag-step__action');
      if (action) action.textContent = open ? 'Schliessen' : 'Öffnen';
    }
    function openStep(index, scroll = false) {
      fieldsets.forEach((fieldset, i) => {
        const open = i === index;
        fieldset.classList.toggle('trobag-step--collapsed', !open);
        const toggle = fieldset.querySelector('.trobag-step__toggle');
        if (toggle) updateToggle(toggle, open);
      });
      alignToExistingFields();
      if (scroll) {
        const button = fieldsets[index].querySelector('.trobag-step__toggle');
        if (button) button.scrollIntoView({behavior: 'smooth', block: 'nearest'});
      }
    }
    // Beim Absenden bzw. bei nativer HTML5-Validierung den fehlerhaften
    // Abschnitt sofort öffnen. Die Original-Validierung bleibt aktiv.
    // Native Validierung meldet ggf. mehrere ungültige Felder nacheinander.
    // Den ZUERSTEN betroffenen Schritt öffnen, nicht den letzten.
    let earliestInvalid = null;
    let resetInvalidQueued = false;
    form.addEventListener('invalid', event => {
      const idx = fieldsets.findIndex(fieldset => fieldset.contains(event.target));
      if (idx < 0) return;
      if (earliestInvalid === null || idx < earliestInvalid) {
        earliestInvalid = idx;
        openStep(idx);
      }
      if (!resetInvalidQueued) {
        resetInvalidQueued = true;
        queueMicrotask(() => { earliestInvalid = null; resetInvalidQueued = false; });
      }
    }, true);
    // Sanftes automatisches Weitergehen, wenn die letzten Kontaktdaten
    // ausgefüllt und alle Kontakt-Pflichtfelder gültig sind.
    const role = form.querySelector('#powermail_field_ichbin');
    if (role) role.addEventListener('change', () => {
      if (fieldsets[0].classList.contains('trobag-step--collapsed')) return;
      const required = Array.from(fieldsets[0].querySelectorAll('[required]'));
      if (required.length && required.every(control => control.checkValidity())) openStep(1, true);
    });
  }
  function start() {
    document.querySelectorAll(FORM_SELECTOR).forEach(init);
    // Wenn Powermail das Formular per AJAX nachlädt, ebenfalls ergänzen.
    const host = document.querySelector('.quick-contact');
    if (host && typeof MutationObserver !== 'undefined') {
      let scheduled = false;
      new MutationObserver(() => {
        if (scheduled) return;
        scheduled = true;
        queueMicrotask(() => { scheduled = false; document.querySelectorAll(FORM_SELECTOR).forEach(init); });
      }).observe(host, {childList: true, subtree: true});
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once:true});
  else start();
})();
