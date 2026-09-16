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

  /* ---------------- Zinseszins-Rechner ---------------- */
  var rateInput = document.getElementById('rate-input');
  var yearsInput = document.getElementById('years-input');
  var returnInput = document.getElementById('return-input');

  var rateValue = document.getElementById('rate-value');
  var yearsValue = document.getElementById('years-value');
  var returnValue = document.getElementById('return-value');

  var barEinzahlung = document.getElementById('bar-einzahlung');
  var barZuwachs = document.getElementById('bar-zuwachs');

  var outEinzahlung = document.getElementById('out-einzahlung');
  var outZuwachs = document.getElementById('out-zuwachs');
  var outTotal = document.getElementById('out-total');

  var currencyFormatter = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
  });

  function formatEuro(value) {
    return currencyFormatter.format(Math.round(value));
  }

  function calculate() {
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
  }

  [rateInput, yearsInput, returnInput].forEach(function (input) {
    if (input) input.addEventListener('input', calculate);
  });

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
