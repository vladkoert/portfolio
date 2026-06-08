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

  // Mobile nav
  var menuBtn = document.querySelector(".menu-btn");
  var nav = document.querySelector(".nav");
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", function () { nav.classList.toggle("is-open"); });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () { nav.classList.remove("is-open"); });
    });
  }

  // Generic carousel init — works for both .pf-carousel and .project-carousel
  function initCarousel(container, slideClass, dotClass, prevClass, nextClass, autoMs) {
    if (!container) return;
    var slides = container.querySelectorAll("." + slideClass);
    var dotsEl = container.querySelector("." + dotClass);
    var current = 0;
    if (!slides.length) return;

    if (dotsEl) {
      slides.forEach(function (_, i) {
        var dot = document.createElement("button");
        dot.className = dotClass.replace("s", "") + (i === 0 ? " active" : "");
        dot.setAttribute("aria-label", "Slide " + (i + 1));
        dot.addEventListener("click", function () { go(i); });
        dotsEl.appendChild(dot);
      });
    }

    function go(idx) {
      slides[current].classList.remove("active");
      if (dotsEl) dotsEl.querySelectorAll("button")[current] && dotsEl.querySelectorAll("button")[current].classList.remove("active");
      current = (idx + slides.length) % slides.length;
      slides[current].classList.add("active");
      if (dotsEl) dotsEl.querySelectorAll("button")[current] && dotsEl.querySelectorAll("button")[current].classList.add("active");
    }

    var prev = container.querySelector("." + prevClass);
    var next = container.querySelector("." + nextClass);
    if (prev) prev.addEventListener("click", function () { go(current - 1); });
    if (next) next.addEventListener("click", function () { go(current + 1); });

    if (autoMs) setInterval(function () { go(current + 1); }, autoMs);
  }

  // Portfolio page featured carousel
  initCarousel(
    document.getElementById("pfCarousel"),
    "pf-slide", "pf-dots", "pf-prev", "pf-next", 4000
  );

  // Project detail carousel (if present)
  initCarousel(
    document.querySelector(".project-carousel"),
    "carousel-slide", "carousel-dots", "prev", "next", 4000
  );

  // Contact form
  var form = document.querySelector(".contact-form");
  if (form) {
    var loadedAt = Date.now();
    var a = Math.floor(Math.random() * 9) + 1;
    var b = Math.floor(Math.random() * 9) + 1;
    var answer = a + b;

    function newChallenge() {
      a = Math.floor(Math.random() * 9) + 1;
      b = Math.floor(Math.random() * 9) + 1;
      answer = a + b;
      var q = form.querySelector(".captcha-question");
      if (q) q.textContent = "Quick check — what is " + a + " + " + b + "?";
      var inp = document.getElementById("captcha");
      if (inp) inp.value = "";
    }
    newChallenge();

    var submitBtn = form.querySelector('[type="submit"]');
    var note = form.querySelector(".form-note");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var honey = form.querySelector('[name="company"]');
      if (honey && honey.value.trim() !== "") return;
      if (Date.now() - loadedAt < 1500) {
        if (note) { note.textContent = "Please wait a moment before submitting."; note.classList.add("is-error"); }
        return;
      }
      var captchaInput = document.getElementById("captcha");
      if (!captchaInput || parseInt(captchaInput.value, 10) !== answer) {
        if (note) { note.textContent = "Incorrect answer — please try again."; note.classList.add("is-error"); }
        newChallenge();
        return;
      }
      if (submitBtn) submitBtn.disabled = true;
      if (note) { note.textContent = "Sending…"; note.classList.remove("is-error"); }
      var formData = new FormData(form);
      formData.delete("company");
      formData.delete("captcha");
      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData,
      })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (data.success) {
            note.textContent = "Thanks — your message has been sent. I'll get back to you shortly.";
            note.classList.remove("is-error");
            form.reset(); loadedAt = Date.now(); newChallenge();
          } else {
            note.textContent = "Something went wrong — please try again.";
            note.classList.add("is-error");
          }
        })
        .catch(function () {
          note.textContent = "Something went wrong — please try again.";
          note.classList.add("is-error");
        })
        .finally(function () { if (submitBtn) submitBtn.disabled = false; });
    });
  }

  // Lightbox
  var lb = document.getElementById("lightbox");
  var lbImg = document.getElementById("lightbox-img");
  if (lb && lbImg) {
    function lbOpen(src, alt) {
      lbImg.src = src; lbImg.alt = alt || "";
      lb.classList.add("open");
      document.body.style.overflow = "hidden";
    }
    function lbClose() {
      lb.classList.remove("open");
      document.body.style.overflow = "";
      lbImg.src = "";
    }
    document.querySelectorAll(".eg-block img, .masonry-col img, .project-gallery img").forEach(function (img) {
      img.addEventListener("click", function () { lbOpen(img.src, img.alt); });
    });
    lb.addEventListener("click", function (e) { if (e.target === lb) lbClose(); });
    var closeBtn = lb.querySelector(".lightbox-close");
    if (closeBtn) closeBtn.addEventListener("click", lbClose);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") lbClose(); });
  }

})();
