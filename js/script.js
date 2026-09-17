/* ==========================================================================
   Horbach Wirtschaftsberatung · Simon Langkabel
   Interaktivität: Mobile-Nav, Zinseszins-Rechner, Kontaktformular, Fade-in
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function () {

  /* ---------------- Mobile-Navigation ---------------- */
  var navToggle = document.getElementById('nav-toggle');
  var mainNav = document.getElementById('main-nav');

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function () {
      var isOpen = mainNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Menü nach Klick auf einen Link schließen (mobil)
    mainNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mainNav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------------- Themen-Dropdown (Desktop) ---------------- */
  var topicsToggle = document.getElementById('topics-toggle');
  var topicsMenu = document.getElementById('topics-menu');

  if (topicsToggle && topicsMenu) {
    function closeTopicsMenu() {
      topicsMenu.hidden = true;
      topicsToggle.setAttribute('aria-expanded', 'false');
    }
    function openTopicsMenu() {
      topicsMenu.hidden = false;
      topicsToggle.setAttribute('aria-expanded', 'true');
    }

    topicsToggle.addEventListener('click', function (event) {
      event.stopPropagation();
      if (topicsMenu.hidden) { openTopicsMenu(); } else { closeTopicsMenu(); }
    });

    topicsMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeTopicsMenu);
    });

    document.addEventListener('click', function (event) {
      if (!topicsMenu.hidden && !topicsMenu.contains(event.target) && event.target !== topicsToggle) {
        closeTopicsMenu();
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !topicsMenu.hidden) {
        closeTopicsMenu();
        topicsToggle.focus();
      }
    });
  }

  /* ---------------- Fade-in beim Scrollen ---------------- */
  var fadeEls = document.querySelectorAll('.fade-in');
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    fadeEls.forEach(function (el) { observer.observe(el); });
  } else {
    fadeEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------------- Altersvorsorge-Rechner (Sparplan / Rürup-Umschalter) ---------------- */
  var rateInput = document.getElementById('rate-input');
  var yearsInput = document.getElementById('years-input');
  var returnInput = document.getElementById('return-input');
  var taxrateInput = document.getElementById('taxrate-input');

  var rateValue = document.getElementById('rate-value');
  var yearsValue = document.getElementById('years-value');
  var returnValue = document.getElementById('return-value');
  var taxrateValue = document.getElementById('taxrate-value');

  var barEinzahlung = document.getElementById('bar-einzahlung');
  var barZuwachs = document.getElementById('bar-zuwachs');

  var outEinzahlung = document.getElementById('out-einzahlung');
  var outZuwachs = document.getElementById('out-zuwachs');
  var outTotal = document.getElementById('out-total');
  var outTotalLabel = document.getElementById('out-total-label');
  var outRuerupRente = document.getElementById('out-ruerup-rente');
  var outSteuerersparnis = document.getElementById('out-steuerersparnis');

  var modeSparplanBtn = document.getElementById('mode-sparplan');
  var modeRuerupBtn = document.getElementById('mode-ruerup');
  var controlTaxrate = document.getElementById('control-taxrate');
  var ruerupExtra = document.getElementById('ruerup-extra');

  var calculatorMode = 'sparplan';
  var RUERUP_RENTENBEZUGSJAHRE = 20; // vereinfachte Annahme für die Beispielrechnung

  var currencyFormatter = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
  });

  function formatEuro(value) {
    return currencyFormatter.format(Math.round(value));
  }

  function setMode(mode) {
    calculatorMode = mode;
    var isRuerup = mode === 'ruerup';

    if (modeSparplanBtn && modeRuerupBtn) {
      modeSparplanBtn.classList.toggle('is-active', !isRuerup);
      modeSparplanBtn.setAttribute('aria-selected', String(!isRuerup));
      modeRuerupBtn.classList.toggle('is-active', isRuerup);
      modeRuerupBtn.setAttribute('aria-selected', String(isRuerup));
    }
    if (controlTaxrate) controlTaxrate.hidden = !isRuerup;
    if (ruerupExtra) ruerupExtra.hidden = !isRuerup;
    if (outTotalLabel) outTotalLabel.textContent = isRuerup ? 'Kapital bei Rentenbeginn' : 'Gesamt-Endwert';

    calculate();
  }

  function calculate() {
    if (!rateInput || !yearsInput || !returnInput) return;

    var monthlyRate = parseFloat(rateInput.value);
    var years = parseInt(yearsInput.value, 10);
    var annualReturnPercent = parseFloat(returnInput.value);

    var months = years * 12;
    var monthlyRateOfReturn = annualReturnPercent / 100 / 12;

    var totalContributions = monthlyRate * months;
    var finalValue;

    if (monthlyRateOfReturn === 0) {
      // Ohne Rendite entspricht der Endwert exakt den Einzahlungen
      finalValue = totalContributions;
    } else {
      // Endwert = Sparrate x ((1+r)^n - 1) / r  (monatliche Verzinsung)
      finalValue = monthlyRate * ((Math.pow(1 + monthlyRateOfReturn, months) - 1) / monthlyRateOfReturn);
    }

    var growth = Math.max(finalValue - totalContributions, 0);

    // Labels aktualisieren
    rateValue.textContent = formatEuro(monthlyRate);
    yearsValue.textContent = years + (years === 1 ? ' Jahr' : ' Jahre');
    returnValue.textContent = annualReturnPercent.toFixed(1).replace('.', ',') + ' %';

    // Ergebniszahlen aktualisieren
    outEinzahlung.textContent = formatEuro(totalContributions);
    outZuwachs.textContent = formatEuro(growth);
    outTotal.textContent = formatEuro(finalValue);

    // Balkendiagramm aktualisieren (relative Höhe zueinander)
    var maxValue = Math.max(totalContributions, finalValue, 1);
    var einzahlungHeight = (totalContributions / maxValue) * 100;
    var totalHeight = (finalValue / maxValue) * 100;

    barEinzahlung.style.height = einzahlungHeight + '%';
    barZuwachs.style.height = totalHeight + '%';

    // Rürup-spezifische Näherungswerte (nur im Rürup-Modus sichtbar)
    if (calculatorMode === 'ruerup' && taxrateInput && outRuerupRente && outSteuerersparnis) {
      var taxRatePercent = parseFloat(taxrateInput.value);
      taxrateValue.textContent = taxRatePercent.toFixed(0) + ' %';

      var monthlyPension = finalValue / (RUERUP_RENTENBEZUGSJAHRE * 12);
      var annualTaxSaving = monthlyRate * 12 * (taxRatePercent / 100);

      outRuerupRente.textContent = formatEuro(monthlyPension);
      outSteuerersparnis.textContent = formatEuro(annualTaxSaving);
    }
  }

  [rateInput, yearsInput, returnInput, taxrateInput].forEach(function (input) {
    if (input) input.addEventListener('input', calculate);
  });

  if (modeSparplanBtn && modeRuerupBtn) {
    modeSparplanBtn.addEventListener('click', function () { setMode('sparplan'); });
    modeRuerupBtn.addEventListener('click', function () { setMode('ruerup'); });
  }

  calculate();

  /* ---------------- Kontaktformular (rein client-seitig) ---------------- */
  var form = document.getElementById('contact-form');
  var errorBox = document.getElementById('form-error');
  var successBox = document.getElementById('form-success');

  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();

      errorBox.hidden = true;
      successBox.hidden = true;

      var firstname = document.getElementById('firstname');
      var lastname = document.getElementById('lastname');
      var email = document.getElementById('email');
      var message = document.getElementById('message');
      var dsgvo = document.getElementById('dsgvo');

      var missing = [];
      if (!firstname.value.trim()) missing.push('Vorname');
      if (!lastname.value.trim()) missing.push('Nachname');
      if (!email.value.trim() || !email.checkValidity()) missing.push('gültige E-Mail-Adresse');
      if (!message.value.trim()) missing.push('Nachricht');
      if (!dsgvo.checked) missing.push('Zustimmung zur Datenverarbeitung');

      if (missing.length > 0) {
        errorBox.textContent = 'Bitte prüfen Sie folgende Angaben: ' + missing.join(', ') + '.';
        errorBox.hidden = false;
        return;
      }

      // Kein Backend angebunden: Erfolgsmeldung wird client-seitig angezeigt.
      successBox.hidden = false;
      form.reset();
    });
  }

});
