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

// Custom cursor — dot + lagging ring, expands on hover
(function () {
  if (!window.matchMedia || !window.matchMedia("(pointer: fine)").matches) return;

  var dot = document.createElement("div");
  dot.className = "cursor-dot";
  var ring = document.createElement("div");
  ring.className = "cursor-ring";
  document.body.appendChild(dot);
  document.body.appendChild(ring);

  function lerp(a, b, t) { return a + (b - a) * t; }

  var mouseX = 0, mouseY = 0;
  var ringX  = 0, ringY  = 0;
  var started = false;

  function setPos(el, x, y) {
    el.style.transform = "translate(" + x + "px, " + y + "px) translate(-50%, -50%)";
  }

  function animate() {
    ringX = lerp(ringX, mouseX, 0.16);
    ringY = lerp(ringY, mouseY, 0.16);
    setPos(ring, ringX, ringY);
    requestAnimationFrame(animate);
  }
  animate();

  document.addEventListener("mousemove", function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    setPos(dot, mouseX, mouseY);
    if (!started) {
      started = true;
      ringX = mouseX; ringY = mouseY;
      document.body.classList.add("cursor-ready");
    }
  });

  document.addEventListener("mouseleave", function () {
    document.body.classList.remove("cursor-ready");
  });
  document.addEventListener("mouseenter", function () {
    if (started) document.body.classList.add("cursor-ready");
  });

  var hoverSelector = "a, button, .work-item, .pj-arr, .sec-num, .pj-sec-num";
  var textSelector  = "input, textarea";

  document.addEventListener("mouseover", function (e) {
    if (e.target.closest(textSelector)) {
      document.body.classList.add("cursor-text");
    } else if (e.target.closest(hoverSelector)) {
      document.body.classList.add("cursor-hover");
    }
  });

  document.addEventListener("mouseout", function (e) {
    if (e.target.closest(textSelector)) {
      document.body.classList.remove("cursor-text");
    } else if (e.target.closest(hoverSelector)) {
      document.body.classList.remove("cursor-hover");
    }
  });
})();

// Scroll reveal — fades/scales content in as it enters the viewport.
// Runs on every page via GSAP + ScrollTrigger (loaded from CDN); if either
// failed to load, or the visitor prefers reduced motion, everything just
// stays at its default, fully visible state — no dependency, no breakage.
(function () {
  if (!window.gsap || !window.ScrollTrigger) return;
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  gsap.registerPlugin(ScrollTrigger);

  // Text/row blocks: fade + rise
  var riseTargets = gsap.utils.toArray(
    ".sec-head, .work-item, .tbl-row, .pj-sec-hd, .pj-meta, .pj-title, " +
    ".hero-eyebrow, .hero-tagline, .hero-desc, .hero-meta, .hero-cta, " +
    ".notfound-eyebrow, .notfound-text, .notfound-links"
  );
  if (riseTargets.length) {
    gsap.set(riseTargets, { opacity: 0, y: 28 });
    ScrollTrigger.batch(riseTargets, {
      start: "top 92%",
      once: true,
      onEnter: function (batch) {
        gsap.to(batch, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.06, overwrite: true });
      },
    });
  }

  // Imagery: fade + scale up slightly, echoing a scattered gallery settling into place
  var scaleTargets = gsap.utils.toArray('img[loading="lazy"], .pj-card video, .notfound-num, .bt');
  if (scaleTargets.length) {
    gsap.set(scaleTargets, { opacity: 0, scale: 0.94 });
    ScrollTrigger.batch(scaleTargets, {
      start: "top 92%",
      once: true,
      onEnter: function (batch) {
        gsap.to(batch, { opacity: 1, scale: 1, duration: 0.9, ease: "power3.out", stagger: 0.05, overwrite: true });
      },
    });
  }

  // Footer columns: fade + rise + blur-in, once, as the footer comes into view
  var footerTargets = gsap.utils.toArray(".footer-brand, .footer-col");
  if (footerTargets.length) {
    gsap.set(footerTargets, { opacity: 0, y: -8, filter: "blur(4px)" });
    ScrollTrigger.batch(footerTargets, {
      start: "top 95%",
      once: true,
      onEnter: function (batch) {
        gsap.to(batch, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.8, ease: "power2.out", stagger: 0.1, overwrite: true });
      },
    });
  }
})();
