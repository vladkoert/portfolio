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

// Type "play" → mini-game overlay (Space Invaders)
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
      '<div class="egg-game-title">Space <span>Invaders</span></div>' +
      '<canvas id="eggCanvas" width="360" height="480"></canvas>' +
      '<div class="egg-game-hint">← → or A / D to move · Space to fire · Esc to quit</div>';
    document.body.appendChild(overlay);

    var canvas = overlay.querySelector('#eggCanvas');
    var ctx = canvas.getContext('2d');
    var W = canvas.width, H = canvas.height;

    var keys = {};
    var raf = null;
    var running = true;

    var player, bullets, enemyBullets, invaders, boss;
    var level, score, lives, fireCooldown, groupDir, groupSpeed, state, stateTimer;

    function init() {
      player = { x: W / 2 - 12, y: H - 32, w: 24, h: 12, speed: 4 };
      bullets = [];
      enemyBullets = [];
      invaders = [];
      boss = null;
      level = 1;
      score = 0;
      lives = 3;
      fireCooldown = 0;
      groupDir = 1;
      state = 'playing';
      stateTimer = 0;
      startLevel();
    }

    function isBossLevel(l) { return l % 3 === 0; }

    function startLevel() {
      bullets = [];
      enemyBullets = [];
      groupDir = 1;

      if (isBossLevel(level)) {
        invaders = [];
        boss = {
          x: W / 2 - 40, y: 50, w: 80, h: 32,
          hp: 20 + level * 6, maxHp: 20 + level * 6,
          dir: 1, speed: 1.5 + level * 0.1,
          fireCooldown: 60
        };
        groupSpeed = 0;
      } else {
        boss = null;
        invaders = [];
        var rows = Math.min(2 + Math.ceil(level / 2), 5);
        var cols = 6;
        var gapX = 36, gapY = 28;
        var startX = (W - (cols - 1) * gapX) / 2 - 10;
        var startY = 40;
        for (var r = 0; r < rows; r++) {
          for (var c = 0; c < cols; c++) {
            invaders.push({
              x: startX + c * gapX,
              y: startY + r * gapY,
              w: 20, h: 14,
              alive: true
            });
          }
        }
        groupSpeed = 0.6 + level * 0.25;
      }
    }

    function onKeyDown(e) {
      if (e.key === 'Escape') { closeGame(); return; }
      if (e.key === ' ' || e.key === 'Spacebar') e.preventDefault();
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') e.preventDefault();
      keys[e.key.toLowerCase()] = true;
      if (e.key === ' ' || e.key === 'Spacebar') keys['space'] = true;

      if (state === 'gameover' && e.key.toLowerCase() === 'r') {
        init();
      }
    }
    function onKeyUp(e) {
      keys[e.key.toLowerCase()] = false;
      if (e.key === ' ' || e.key === 'Spacebar') keys['space'] = false;
    }

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

    function rectsOverlap(a, b) {
      return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
    }

    function update() {
      // Player movement
      if (keys['arrowleft'] || keys['a']) player.x -= player.speed;
      if (keys['arrowright'] || keys['d']) player.x += player.speed;
      player.x = Math.max(0, Math.min(W - player.w, player.x));

      // Player fire
      if (fireCooldown > 0) fireCooldown--;
      if (keys['space'] && fireCooldown === 0) {
        bullets.push({ x: player.x + player.w / 2 - 2, y: player.y - 8, w: 4, h: 10, speed: 6 });
        fireCooldown = 14;
      }

      // Player bullets
      for (var i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y -= bullets[i].speed;
        if (bullets[i].y + bullets[i].h < 0) bullets.splice(i, 1);
      }

      // Enemy bullets
      for (var j = enemyBullets.length - 1; j >= 0; j--) {
        var eb = enemyBullets[j];
        eb.y += eb.speed;
        if (eb.y > H) { enemyBullets.splice(j, 1); continue; }
        if (rectsOverlap(eb, player)) {
          enemyBullets.splice(j, 1);
          hitPlayer();
        }
      }

      if (boss) {
        updateBoss();
      } else {
        updateInvaders();
      }

      // Check level clear
      if (!boss) {
        var anyAlive = invaders.some(function (inv) { return inv.alive; });
        if (!anyAlive) nextLevel();
      }
    }

    function updateInvaders() {
      // Determine bounds of alive invaders
      var minX = Infinity, maxX = -Infinity, maxY = -Infinity;
      var aliveCount = 0;
      invaders.forEach(function (inv) {
        if (!inv.alive) return;
        aliveCount++;
        minX = Math.min(minX, inv.x);
        maxX = Math.max(maxX, inv.x + inv.w);
        maxY = Math.max(maxY, inv.y + inv.h);
      });

      if (aliveCount === 0) return;

      var step = groupSpeed * groupDir;
      var willHitEdge = (minX + step < 4) || (maxX + step > W - 4);
      if (willHitEdge) {
        groupDir *= -1;
        invaders.forEach(function (inv) { if (inv.alive) inv.y += 12; });
        if (maxY + 12 >= player.y) {
          loseLife(true);
        }
      } else {
        invaders.forEach(function (inv) { if (inv.alive) inv.x += step; });
      }

      // Player bullets vs invaders
      for (var i = bullets.length - 1; i >= 0; i--) {
        for (var k = 0; k < invaders.length; k++) {
          var inv = invaders[k];
          if (!inv.alive) continue;
          if (rectsOverlap(bullets[i], inv)) {
            inv.alive = false;
            bullets.splice(i, 1);
            score += 10;
            break;
          }
        }
      }

      // Random enemy fire
      if (Math.random() < 0.02 + level * 0.002) {
        var shooters = invaders.filter(function (inv) { return inv.alive; });
        if (shooters.length) {
          var shooter = shooters[Math.floor(Math.random() * shooters.length)];
          enemyBullets.push({ x: shooter.x + shooter.w / 2 - 2, y: shooter.y + shooter.h, w: 4, h: 10, speed: 3 + level * 0.2 });
        }
      }
    }

    function updateBoss() {
      boss.x += boss.speed * boss.dir;
      if (boss.x < 4 || boss.x + boss.w > W - 4) boss.dir *= -1;

      boss.fireCooldown--;
      if (boss.fireCooldown <= 0) {
        boss.fireCooldown = Math.max(20, 50 - level * 2);
        enemyBullets.push({ x: boss.x + boss.w / 2 - 3, y: boss.y + boss.h, w: 6, h: 12, speed: 3.5 + level * 0.15 });
        enemyBullets.push({ x: boss.x + 12, y: boss.y + boss.h, w: 6, h: 12, speed: 3.5 + level * 0.15 });
        enemyBullets.push({ x: boss.x + boss.w - 18, y: boss.y + boss.h, w: 6, h: 12, speed: 3.5 + level * 0.15 });
      }

      // Player bullets vs boss
      for (var i = bullets.length - 1; i >= 0; i--) {
        if (rectsOverlap(bullets[i], boss)) {
          bullets.splice(i, 1);
          boss.hp--;
          score += 5;
          if (boss.hp <= 0) {
            score += 50 * level;
            boss = null;
            nextLevel();
            return;
          }
        }
      }
    }

    function hitPlayer() {
      loseLife(false);
    }

    function loseLife(fromInvaderRow) {
      lives--;
      bullets = [];
      enemyBullets = [];
      if (lives <= 0) {
        state = 'gameover';
      } else {
        player.x = W / 2 - player.w / 2;
        if (fromInvaderRow) {
          // give a brief breather by nudging invaders back up slightly
          invaders.forEach(function (inv) { if (inv.alive) inv.y -= 12; });
        }
      }
    }

    function nextLevel() {
      level++;
      startLevel();
    }

    function drawShip(p) {
      ctx.fillStyle = '#3df2ff';
      ctx.beginPath();
      ctx.moveTo(p.x + p.w / 2, p.y);
      ctx.lineTo(p.x + p.w, p.y + p.h);
      ctx.lineTo(p.x, p.y + p.h);
      ctx.closePath();
      ctx.fill();
    }

    function drawInvader(inv) {
      ctx.fillStyle = '#4a7dff';
      ctx.fillRect(inv.x, inv.y, inv.w, inv.h);
      ctx.fillRect(inv.x + 4, inv.y - 4, 4, 4);
      ctx.fillRect(inv.x + inv.w - 8, inv.y - 4, 4, 4);
    }

    function drawBoss(b) {
      ctx.fillStyle = '#ff3b30';
      ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.fillRect(b.x + 10, b.y - 6, 10, 6);
      ctx.fillRect(b.x + b.w - 20, b.y - 6, 10, 6);

      // Health bar
      var barW = b.w;
      var pct = Math.max(0, b.hp / b.maxHp);
      ctx.fillStyle = 'rgba(245,245,245,0.2)';
      ctx.fillRect(b.x, b.y - 14, barW, 4);
      ctx.fillStyle = '#ff3b30';
      ctx.fillRect(b.x, b.y - 14, barW * pct, 4);
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);

      // Starfield-ish background dots
      ctx.fillStyle = 'rgba(245,245,245,0.06)';
      for (var s = 0; s < 24; s++) {
        var sx = (s * 53) % W;
        var sy = (s * 97 + level * 13) % H;
        ctx.fillRect(sx, sy, 2, 2);
      }

      drawShip(player);

      ctx.fillStyle = '#3df2ff';
      bullets.forEach(function (b) { ctx.fillRect(b.x, b.y, b.w, b.h); });

      ctx.fillStyle = '#ff3b30';
      enemyBullets.forEach(function (b) { ctx.fillRect(b.x, b.y, b.w, b.h); });

      if (boss) {
        drawBoss(boss);
      } else {
        invaders.forEach(function (inv) { if (inv.alive) drawInvader(inv); });
      }

      // HUD
      ctx.fillStyle = 'rgba(245,245,245,0.85)';
      ctx.font = '700 12px Bricolage Grotesque, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('SCORE ' + score, 8, 16);
      ctx.textAlign = 'right';
      ctx.fillText('LVL ' + level + (isBossLevel(level) ? ' · BOSS' : ''), W - 8, 16);
      ctx.textAlign = 'center';
      ctx.fillText('LIVES ' + lives, W / 2, 16);

      if (state === 'gameover') {
        ctx.fillStyle = 'rgba(5,5,5,0.8)';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#f5f5f5';
        ctx.font = '700 22px Bricolage Grotesque, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Game over', W / 2, H / 2 - 12);
        ctx.font = '400 13px Bricolage Grotesque, sans-serif';
        ctx.fillStyle = 'rgba(245,245,245,0.6)';
        ctx.fillText('Score: ' + score + ' · Level: ' + level, W / 2, H / 2 + 12);
        ctx.fillText('Press R to retry', W / 2, H / 2 + 32);
      }
    }

    function loop() {
      if (!running) return;
      if (state === 'playing') update();
      draw();
      raf = requestAnimationFrame(loop);
    }

    init();
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    raf = requestAnimationFrame(loop);
  }
})();
