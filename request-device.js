(function () {
  'use strict';
  function isMobileDevice(nav) {
    return /Android|iPhone|iPad|iPod/i.test(nav.userAgent || '') ||
      (/Macintosh|MacIntel/i.test((nav.userAgent || '') + ' ' + (nav.platform || '')) && Number(nav.maxTouchPoints || 0) > 1);
  }
  if (typeof module === 'object' && module.exports) { module.exports = isMobileDevice; return; }
  if (isMobileDevice(navigator)) document.documentElement.classList.add('fbr-mobile-device');
})();
