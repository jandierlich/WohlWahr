/* Verhindert Pinch-Zoom (Zwei-Finger-Zoom) zuverlässig auf iOS,
   auch dort, wo die viewport-Meta-Angabe (user-scalable=no) allein nicht greift. */
(function () {
  // iOS Safari: eigene Gesture-Events für Pinch-Zoom
  document.addEventListener('gesturestart', function (e) { e.preventDefault(); }, { passive: false });
  document.addEventListener('gesturechange', function (e) { e.preventDefault(); }, { passive: false });
  document.addEventListener('gestureend', function (e) { e.preventDefault(); }, { passive: false });

  // iOS: Zwei-Finger-Touch als Zoom-Versuch blocken
  document.addEventListener('touchmove', function (e) {
    if (e.touches && e.touches.length > 1) e.preventDefault();
  }, { passive: false });

  // Doppel-Tap-Zoom verhindern (schnelles doppeltes Antippen)
  var lastTouchEnd = 0;
  document.addEventListener('touchend', function (e) {
    var now = Date.now();
    if (now - lastTouchEnd <= 300) e.preventDefault();
    lastTouchEnd = now;
  }, { passive: false });
})();
