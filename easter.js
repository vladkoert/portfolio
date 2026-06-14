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

// Type "play" → mini-game overlay (Space Impact-style side-scroller)
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
      '<div class="egg-game-title">Space <span>Impact</span></div>' +
      '<canvas id="eggCanvas" width="480" height="270"></canvas>' +
      '<div class="egg-game-hint">↑ ↓ or W / S to move · Space to fire · Esc to quit</div>';
    document.body.appendChild(overlay);

    var canvas = overlay.querySelector('#eggCanvas');
    var ctx = canvas.getContext('2d');
    var W = canvas.width, H = canvas.height;

    var keys = {};
    var raf = null;
    var running = true;

    var player, bullets, enemyBullets, enemies, boss;
    var level, score, lives, fireCooldown, spawnTimer, spawnEvery, levelKills, killsToClear, state;

    function init() {
      player = { x: 30, y: H / 2 - 8, w: 28, h: 14, speed: 3.5 };
      bullets = [];
      enemyBullets = [];
      enemies = [];
      boss = null;
      level = 1;
      score = 0;
      lives = 3;
      fireCooldown = 0;
      state = 'playing';
      startLevel();
    }

    function isBossLevel(l) { return l % 3 === 0; }

    function startLevel() {
      bullets = [];
      enemyBullets = [];
      enemies = [];
      spawnTimer = 0;
      spawnEvery = Math.max(28, 70 - level * 4);
      levelKills = 0;
      killsToClear = 8 + level * 2;

      if (isBossLevel(level)) {
        boss = {
          x: W - 90, y: H / 2 - 30, w: 70, h: 60,
          hp: 24 + level * 8, maxHp: 24 + level * 8,
          vy: 1.5 + level * 0.15, dir: 1,
          fireCooldown: 50
        };
      } else {
        boss = null;
      }
    }

    function onKeyDown(e) {
      if (e.key === 'Escape') { closeGame(); return; }
      if (e.key === ' ' || e.key === 'Spacebar') e.preventDefault();
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') e.preventDefault();
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
      if (keys['arrowup'] || keys['w']) player.y -= player.speed;
      if (keys['arrowdown'] || keys['s']) player.y += player.speed;
      player.y = Math.max(0, Math.min(H - player.h, player.y));

      // Player fire
      if (fireCooldown > 0) fireCooldown--;
      if (keys['space'] && fireCooldown === 0) {
        bullets.push({ x: player.x + player.w, y: player.y + player.h / 2 - 2, w: 10, h: 4, speed: 7 });
        fireCooldown = 12;
      }

      // Player bullets
      for (var i = bullets.length - 1; i >= 0; i--) {
        bullets[i].x += bullets[i].speed;
        if (bullets[i].x > W) bullets.splice(i, 1);
      }

      // Enemy bullets
      for (var j = enemyBullets.length - 1; j >= 0; j--) {
        var eb = enemyBullets[j];
        eb.x += eb.vx;
        eb.y += eb.vy || 0;
        if (eb.x < -10) { enemyBullets.splice(j, 1); continue; }
        if (rectsOverlap(eb, player)) {
          enemyBullets.splice(j, 1);
          loseLife();
        }
      }

      if (boss) {
        updateBoss();
      } else {
        updateEnemies();
      }
    }

    function spawnEnemy() {
      var type = Math.random() < 0.35 ? 'wave' : 'straight';
      var size = 16 + Math.random() * 8;
      enemies.push({
        x: W + size,
        y: 20 + Math.random() * (H - 40),
        w: size, h: size,
        baseY: 0,
        speed: 1.2 + Math.random() * 0.8 + level * 0.18,
        type: type,
        t: Math.random() * Math.PI * 2,
        fireCooldown: 60 + Math.floor(Math.random() * 60)
      });
      enemies[enemies.length - 1].baseY = enemies[enemies.length - 1].y;
    }

    function updateEnemies() {
      spawnTimer++;
      if (spawnTimer >= spawnEvery && levelKills < killsToClear) {
        spawnTimer = 0;
        spawnEnemy();
      }

      for (var i = enemies.length - 1; i >= 0; i--) {
        var en = enemies[i];
        en.x -= en.speed;
        en.t += 0.05;
        if (en.type === 'wave') {
          en.y = en.baseY + Math.sin(en.t) * 24;
        }
        en.y = Math.max(0, Math.min(H - en.h, en.y));

        if (en.x + en.w < 0) { enemies.splice(i, 1); continue; }

        if (rectsOverlap(en, player)) {
          enemies.splice(i, 1);
          loseLife();
          continue;
        }

        // Enemy fire
        en.fireCooldown--;
        if (en.fireCooldown <= 0 && en.x < W - 40) {
          en.fireCooldown = 90 + Math.floor(Math.random() * 60);
          enemyBullets.push({ x: en.x, y: en.y + en.h / 2 - 2, w: 8, h: 4, vx: -(3 + level * 0.15), vy: 0 });
        }

        // Player bullets vs enemy
        for (var b = bullets.length - 1; b >= 0; b--) {
          if (rectsOverlap(bullets[b], en)) {
            bullets.splice(b, 1);
            enemies.splice(i, 1);
            score += 10;
            levelKills++;
            break;
          }
        }
      }

      if (levelKills >= killsToClear && enemies.length === 0) {
        nextLevel();
      }
    }

    function updateBoss() {
      boss.y += boss.vy * boss.dir;
      if (boss.y < 0 || boss.y + boss.h > H) boss.dir *= -1;

      boss.fireCooldown--;
      if (boss.fireCooldown <= 0) {
        boss.fireCooldown = Math.max(24, 60 - level * 2);
        var spread = [-1.2, 0, 1.2];
        spread.forEach(function (vy) {
          enemyBullets.push({ x: boss.x, y: boss.y + boss.h / 2 - 2, w: 8, h: 4, vx: -(3.5 + level * 0.15), vy: vy });
        });
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

    function loseLife() {
      lives--;
      bullets = [];
      enemyBullets = [];
      if (lives <= 0) {
        state = 'gameover';
      } else {
        player.y = H / 2 - player.h / 2;
      }
    }

    function nextLevel() {
      level++;
      startLevel();
    }

    function drawShip(p) {
      ctx.fillStyle = '#3df2ff';
      ctx.beginPath();
      ctx.moveTo(p.x + p.w, p.y + p.h / 2);
      ctx.lineTo(p.x, p.y);
      ctx.lineTo(p.x, p.y + p.h);
      ctx.closePath();
      ctx.fill();
    }

    function drawEnemy(en) {
      ctx.fillStyle = '#4a7dff';
      ctx.beginPath();
      ctx.moveTo(en.x, en.y + en.h / 2);
      ctx.lineTo(en.x + en.w, en.y);
      ctx.lineTo(en.x + en.w, en.y + en.h);
      ctx.closePath();
      ctx.fill();
    }

    function drawBoss(b) {
      ctx.fillStyle = '#ff3b30';
      ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.fillRect(b.x - 10, b.y + 10, 10, 10);
      ctx.fillRect(b.x - 10, b.y + b.h - 20, 10, 10);

      // Health bar
      var barW = b.w;
      var pct = Math.max(0, b.hp / b.maxHp);
      ctx.fillStyle = 'rgba(245,245,245,0.2)';
      ctx.fillRect(b.x, b.y - 12, barW, 4);
      ctx.fillStyle = '#ff3b30';
      ctx.fillRect(b.x, b.y - 12, barW * pct, 4);
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);

      // Starfield-ish background dots
      ctx.fillStyle = 'rgba(245,245,245,0.06)';
      for (var s = 0; s < 32; s++) {
        var sx = (s * 53 + level * 7) % W;
        var sy = (s * 97) % H;
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
        enemies.forEach(function (en) { drawEnemy(en); });
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
