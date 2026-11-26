(function () {
  'use strict';
  function buildEmail(name, email, url) {
    var subject = 'Flipbook PDF request - free 20-25 page preview';
    var body = [
      'Hello,', '',
      'I would like a free PDF preview of the first 20-25 pages of this flipbook, without a watermark.', '',
      'Name: ' + name.trim(),
      'Email: ' + email.trim(),
      'Flipbook URL: ' + url.trim(), '',
      'Please email me the preview within a few hours and let me know the price if I would like the complete PDF.', '',
      'Thank you.'
    ].join('\r\n');
    return 'mailto:webservice2t@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  }
  if (typeof module === 'object' && module.exports) { module.exports = buildEmail; return; }
  var form = document.getElementById('fbr-form');
  if (!form) return;
  var feedback = document.getElementById('fbr-feedback');
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    feedback.hidden = true;
    if (!form.reportValidity()) return;
    var url = form.elements.url.value.trim();
    try {
      var parsed = new URL(url);
      if (!/^https?:$/.test(parsed.protocol) || parsed.username || parsed.password) throw new Error();
    } catch (_) {
      feedback.textContent = 'Please enter a valid public flipbook URL beginning with https:// or http://.';
      feedback.classList.add('fbr-feedback--error'); feedback.setAttribute('role', 'alert'); feedback.hidden = false;
      form.elements.url.focus(); return;
    }
    var mailto = buildEmail(form.elements.name.value, form.elements.email.value, url);
    feedback.classList.remove('fbr-feedback--error'); feedback.setAttribute('role', 'status');
    feedback.textContent = 'Your email app should open with your request filled in. Please press Send in that app to finish. If it does not open, email your name and flipbook URL to webservice2t@gmail.com.';
    feedback.hidden = false;
    window.location.href = mailto;
  });
})();
