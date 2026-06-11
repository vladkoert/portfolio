// Easter eggs ──────────────────────────────────────────

// Console message
console.log(
  '%cVlad Koert',
  'font-size: 24px; font-weight: 800; letter-spacing: -1px; color: #4a7dff; text-shadow: 2px 0 #4a7dff, -2px 0 #3df2ff;'
);
console.log(
  '%cPoking around? Nice. If you can read this, you can probably build things — let\'s talk: vladkoert.com/contact',
  'font-size: 12px; color: #999;'
);
console.log(
  '%cPsst — try the Konami code.',
  'font-size: 11px; color: #3df2ff;'
);

// Konami code → chromatic aberration glow flash
(function () {
  var sequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  var pos = 0;

  window.addEventListener('keydown', function (e) {
    var key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    var expected = sequence[pos];

    if (key === expected) {
      pos++;
      if (pos === sequence.length) {
        pos = 0;
        triggerGlowFlash();
      }
    } else {
      pos = (key === sequence[0]) ? 1 : 0;
    }
  });

  function triggerGlowFlash() {
    var el = document.createElement('div');
    el.className = 'egg-rgb';
    el.innerHTML = '<span></span><span></span>';
    document.body.appendChild(el);
    setTimeout(function () { el.remove(); }, 700);
  }
})();
