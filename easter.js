// Easter eggs ──────────────────────────────────────────

// Console message
console.log(
  '%cVlad Koert',
  'font-size: 24px; font-weight: 800; letter-spacing: -1px; color: #000; text-shadow: 2px 0 #4a7dff, -2px 0 #3df2ff;'
);
console.log(
  '%cPoking around? Nice. If you can read this, you can probably build things — let\'s talk: vladkoert.com/contact',
  'font-size: 12px; color: #999;'
);
console.log(
  '%cPsst — try the Konami code. Or just type "play".',
  'font-size: 11px; color: #3df2ff;'
);

// Konami code → glitch + shake + chromatic flash
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
        triggerKonamiEffect();
      }
    } else {
      pos = (key === sequence[0]) ? 1 : 0;
    }
  });

  function triggerKonamiEffect() {
    // Chromatic aberration flash
    var flash = document.createElement('div');
    flash.className = 'egg-rgb';
    flash.innerHTML = '<span></span><span></span>';
    document.body.appendChild(flash);
    setTimeout(function () { flash.remove(); }, 700);

    // Screen shake
    document.body.classList.add('egg-shake');
    setTimeout(function () { document.body.classList.remove('egg-shake'); }, 400);

    // Glitch the page's main heading
    var heading = document.querySelector('h1');
    if (heading) {
      var text = heading.textContent;
      heading.setAttribute('data-egg-text', text);
      heading.classList.add('egg-glitch');
      setTimeout(function () {
        heading.classList.remove('egg-glitch');
        heading.removeAttribute('data-egg-text');
      }, 1200);
    }

    console.log('%cCheat code accepted. Type "play" for something else.', 'font-size: 11px; color: #4a7dff;');
  }
})();

// Type "play" → mini-game overlay
(function () {
  var sequence = ['p', 'l', 'a', 'y'];
  var pos = 0;

  window.addEventListener('keydown', function (e) {
    if (document.body.classList.contains('egg-game-open')) return;
    var key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    var expected = sequence[pos];

    if (key === expected) {
      pos++;
      if (pos === sequence.length) {
        pos = 0;
        openGame();
      }
    } else {
      pos = (key === sequence[0]) ? 1 : 0;
    }
  });

  function openGame() {
    document.body.classList.add('egg-game-open');

    var overlay = document.createElement('div');
    overlay.className = 'egg-game-overlay';
    overlay.innerHTML =
      '<div class="egg-game-title">Dodge the <span>hexagons</span> — score: <span id="eggScore">0</span></div>' +
      '<canvas id="eggCanvas" width="360" height="480"></canvas>' +
      '<div class="egg-game-hint">← → or A / D to move · Esc to quit</div>';
    document.body.appendChild(overlay);

    var canvas = overlay.querySelector('#eggCanvas');
    var ctx = canvas.getContext('2d');
    var scoreEl = overlay.querySelector('#eggScore');

    var W = canvas.width, H = canvas.height;
    var player = { x: W / 2 - 16, y: H - 36, w: 32, h: 16, speed: 5 };
    var keys = {};
    var obstacles = [];
    var spawnTimer = 0;
    var spawnEvery = 45;
    var score = 0;
    var running = true;
    var raf = null;

    function onKeyDown(e) {
      if (e.key === 'Escape') { closeGame(); return; }
      keys[e.key.toLowerCase()] = true;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') e.preventDefault();
    }
    function onKeyUp(e) { keys[e.key.toLowerCase()] = false; }

    function closeGame() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      overlay.remove();
      document.body.classList.remove('egg-game-open');
    }

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeGame();
    });

    function drawHex(cx, cy, r) {
      ctx.beginPath();
      for (var i = 0; i < 6; i++) {
        var angle = (Math.PI / 3) * i - Math.PI / 2;
        var x = cx + r * Math.cos(angle);
        var y = cy + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
    }

    function spawnObstacle() {
      var r = 12 + Math.random() * 10;
      obstacles.push({
        x: r + Math.random() * (W - r * 2),
        y: -r,
        r: r,
        speed: 1.5 + Math.random() * 1.5 + score * 0.01
      });
    }

    function loop() {
      if (!running) return;

      // Move player
      if (keys['arrowleft'] || keys['a']) player.x -= player.speed;
      if (keys['arrowright'] || keys['d']) player.x += player.speed;
      player.x = Math.max(0, Math.min(W - player.w, player.x));

      // Spawn
      spawnTimer++;
      if (spawnTimer >= spawnEvery) {
        spawnTimer = 0;
        spawnEvery = Math.max(18, 45 - Math.floor(score / 5));
        spawnObstacle();
      }

      // Update obstacles
      for (var i = obstacles.length - 1; i >= 0; i--) {
        var o = obstacles[i];
        o.y += o.speed;

        // Collision (circle vs rect, approximate)
        if (
          o.y + o.r > player.y &&
          o.y - o.r < player.y + player.h &&
          o.x + o.r > player.x &&
          o.x - o.r < player.x + player.w
        ) {
          gameOver();
          return;
        }

        if (o.y - o.r > H) {
          obstacles.splice(i, 1);
          score++;
          scoreEl.textContent = score;
        }
      }

      // Draw
      ctx.clearRect(0, 0, W, H);

      // Player
      ctx.fillStyle = '#3df2ff';
      ctx.fillRect(player.x, player.y, player.w, player.h);

      // Obstacles
      ctx.strokeStyle = '#4a7dff';
      ctx.lineWidth = 2;
      obstacles.forEach(function (o) { drawHex(o.x, o.y, o.r); });

      raf = requestAnimationFrame(loop);
    }

    function gameOver() {
      running = false;
      ctx.fillStyle = 'rgba(5,5,5,0.8)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#f5f5f5';
      ctx.font = '700 22px Bricolage Grotesque, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Game over', W / 2, H / 2 - 12);
      ctx.font = '400 13px Bricolage Grotesque, sans-serif';
      ctx.fillStyle = 'rgba(245,245,245,0.6)';
      ctx.fillText('Score: ' + score + ' — press R to retry', W / 2, H / 2 + 16);

      window.addEventListener('keydown', function retry(e) {
        if (e.key.toLowerCase() === 'r') {
          window.removeEventListener('keydown', retry);
          overlay.remove();
          document.body.classList.remove('egg-game-open');
          window.removeEventListener('keydown', onKeyDown);
          window.removeEventListener('keyup', onKeyUp);
          openGame();
        }
      });
    }

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    raf = requestAnimationFrame(loop);
  }
})();
