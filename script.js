(function () {
  var root = document.documentElement;
  var stored = localStorage.getItem("theme");
  if (stored === "light" || stored === "dark") {
    root.setAttribute("data-theme", stored);
  }

  function syncToggle() {
    var theme = root.getAttribute("data-theme") || "dark";
    document.querySelectorAll(".theme-toggle").forEach(function (toggle) {
      var dark = toggle.querySelector('[data-mode="dark"]');
      var light = toggle.querySelector('[data-mode="light"]');
      if (dark) dark.classList.toggle("is-active", theme === "dark");
      if (light) light.classList.toggle("is-active", theme === "light");
    });
  }

  function setTheme(theme) {
    root.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    syncToggle();
  }

  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-mode]");
    if (btn) setTheme(btn.getAttribute("data-mode"));
  });

  syncToggle();

  // Mobile nav toggle
  var menuBtn = document.querySelector(".menu-btn");
  var nav = document.querySelector(".nav");
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
      });
    });
  }

  // Portfolio filters
  var filterBtns = document.querySelectorAll(".filter-btn");
  var cards = document.querySelectorAll("[data-category]");
  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      filterBtns.forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      var filter = btn.getAttribute("data-filter");
      cards.forEach(function (card) {
        var match = filter === "all" || card.getAttribute("data-category") === filter;
        card.hidden = !match;
      });
    });
  });

  // Contact form (static demo — no backend) with lightweight bot deterrents:
  // honeypot field, minimum-time check, and a simple math challenge.
  var form = document.querySelector(".contact-form");
  if (form) {
    var loadedAt = Date.now();
    var captchaQuestion = form.querySelector(".captcha-question");
    var captchaInput = form.querySelector("#captcha");
    var a = 1 + Math.floor(Math.random() * 8);
    var b = 1 + Math.floor(Math.random() * 8);

    function newChallenge() {
      a = 1 + Math.floor(Math.random() * 8);
      b = 1 + Math.floor(Math.random() * 8);
      if (captchaQuestion) {
        captchaQuestion.textContent = "Quick check — what is " + a + " + " + b + "?";
      }
    }
    newChallenge();

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var note = form.querySelector(".form-status");
      if (!note) return;

      var honeypot = form.querySelector("#company");
      var elapsed = Date.now() - loadedAt;
      var answer = captchaInput ? parseInt(captchaInput.value, 10) : NaN;

      // Silently drop likely-bot submissions (filled honeypot or too fast)
      if ((honeypot && honeypot.value) || elapsed < 1500) {
        note.textContent = "Thanks — your message has been noted. I'll get back to you shortly.";
        note.classList.remove("is-error");
        form.reset();
        loadedAt = Date.now();
        newChallenge();
        return;
      }

      if (answer !== a + b) {
        note.textContent = "That answer doesn't look right — please try the check again.";
        note.classList.add("is-error");
        if (captchaInput) captchaInput.value = "";
        newChallenge();
        return;
      }

      note.textContent = "Thanks — your message has been noted. I'll get back to you shortly.";
      note.classList.remove("is-error");
      form.reset();
      loadedAt = Date.now();
      newChallenge();
    });
  }
})();
