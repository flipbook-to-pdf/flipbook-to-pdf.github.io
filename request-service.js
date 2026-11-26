(function () {
  'use strict';
  var form = document.getElementById('fbr-form');
  if (!form) return;
  var section = document.getElementById('request-pdf');
  var submit = document.getElementById('fbr-submit');
  var feedback = document.getElementById('fbr-feedback');
  var tokenInput = document.getElementById('fbr-token');
  var pagesInput = document.getElementById('fbr-pages');
  var tokenPromise = null;
  var sent = false;
  var endpoint = new URL((window.FLIPBOOK_REQUEST_CONFIG || {}).endpoint || './request-pdf.php', window.location.href);
  form.action = endpoint.href;
  if (document.documentElement.classList.contains('fbr-mobile-device')) {
    var header = document.querySelector('header.header');
    if (header && !document.body.classList.contains('fbr-standalone')) header.insertAdjacentElement('afterend', section);
  }
  function estimate(pages) {
    if (pages < 50) return 12;
    if (pages <= 100) return 16;
    if (pages <= 200) return 24;
    if (pages <= 500) return 39;
    return null;
  }
  function updateEdition() {
    var clean = form.querySelector('[name="edition"]:checked').value === 'clean';
    document.getElementById('fbr-pages-field').hidden = !clean;
    pagesInput.disabled = !clean;
    var p = Number(pagesInput.value);
    var amount = Number.isInteger(p) && p > 0 ? estimate(p) : null;
    document.getElementById('fbr-estimate').textContent = !pagesInput.value ? 'We’ll check the page count and confirm the price before payment.' :
      (amount ? 'Estimated price: $' + amount + ' USD, paid once for this flipbook. We’ll verify the page count before payment.' : 'We’ll check your link and send you a quote before payment.');
    submit.textContent = clean ? 'Request PDF without watermark' : 'Send free PDF request';
  }
  function show(message, error) {
    feedback.textContent = message;
    feedback.classList.toggle('fbr-feedback--error', Boolean(error));
    feedback.setAttribute('role', error ? 'alert' : 'status');
    feedback.hidden = false;
  }
  async function readResponse(response) {
    var type = response.headers.get('content-type') || '';
    if (type.indexOf('application/json') === -1) throw new Error('The request service is unavailable. Please email your name and flipbook URL to webservice2t@gmail.com.');
    var result = await response.json();
    if (!response.ok || !result.ok) throw new Error(result.message || 'Your request could not be sent. Please try again or email webservice2t@gmail.com.');
    return result;
  }
  function loadToken() {
    if (tokenPromise) return tokenPromise;
    var tokenURL = new URL(endpoint.href); tokenURL.searchParams.set('action', 'token');
    tokenPromise = fetch(tokenURL.href, {method: 'GET', mode: 'cors', credentials: 'omit', cache: 'no-store'})
      .then(readResponse).then(function (result) { tokenInput.value = result.token; return result.token; })
      .catch(function (error) { tokenPromise = null; throw error; });
    return tokenPromise;
  }
  form.querySelectorAll('[name="edition"]').forEach(function (input) { input.addEventListener('change', updateEdition); });
  pagesInput.addEventListener('input', updateEdition);
  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    if (sent || submit.disabled) return;
    feedback.hidden = true;
    if (!form.reportValidity()) return;
    var url = form.elements.url.value.trim();
    try { var parsed = new URL(url); if (!/^https?:$/.test(parsed.protocol) || parsed.username || parsed.password) throw new Error(); }
    catch (_) { show('Please enter a valid public flipbook URL beginning with https:// or http://.', true); form.elements.url.focus(); return; }
    submit.disabled = true; submit.textContent = 'Sending your request…';
    try {
      var token = tokenInput.value || await loadToken();
      var edition = form.querySelector('[name="edition"]:checked').value;
      var result = await fetch(endpoint.href, {method: 'POST', mode: 'cors', credentials: 'omit',
        headers: {'Content-Type': 'application/json'}, body: JSON.stringify({
          token: token, name: form.elements.name.value.trim(), email: form.elements.email.value.trim(),
          url: url, edition: edition, pages: edition === 'clean' ? pagesInput.value : '', website: form.elements.website.value
        })}).then(readResponse);
      sent = true;
      show(result.message, false); submit.textContent = 'Request sent';
      form.querySelectorAll('input, button').forEach(function (input) { input.disabled = true; });
      feedback.focus();
    } catch (error) {
      show(error.message || 'Your request could not be sent. Please email webservice2t@gmail.com.', true);
      submit.disabled = false; updateEdition();
      tokenInput.value = ''; tokenPromise = null; loadToken().catch(function () {});
    }
  });
  updateEdition();
  loadToken().catch(function () { /* Retried on submit; preserve entered fields. */ });
})();
