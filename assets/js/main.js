/* Wolfmaster K9: interactions and motion.
   Everything is readable without JS; GSAP only adds motion on top. */
(function () {
  "use strict";

  var html = document.documentElement;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var hasGSAP = !!(window.gsap && window.ScrollTrigger);
  var WHATSAPP = "919873335698";
  var lenis = null;

  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Enquiry form → WhatsApp (no backend needed) ---------- */
  var form = document.getElementById("form");
  var note = document.getElementById("formNote");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      form.querySelectorAll("[required]").forEach(function (f) {
        var bad = !f.value.trim();
        f.classList.toggle("is-invalid", bad);
        if (bad) ok = false;
      });
      if (!ok) { note.textContent = "Please add your name and phone."; return; }
      var d = new FormData(form);
      var msg = [
        "Website enquiry: " + d.get("interest"),
        "Name: " + d.get("name"),
        "Phone: " + d.get("phone"),
        d.get("email") ? "Email: " + d.get("email") : "",
        d.get("city") ? "City: " + d.get("city") : "",
        d.get("message") ? "\n" + d.get("message") : ""
      ].filter(Boolean).join("\n");
      window.open("https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(msg), "_blank", "noopener");
      note.textContent = "WhatsApp is opening. Press send to reach us.";
      form.reset();
    });
  }

  /* ---------- Menu ---------- */
  var menu = document.getElementById("menu");
  var menuBtn = document.getElementById("menuBtn");
  var menuTxt = menuBtn.querySelector(".nav__menu-txt");
  var menuOpen = false;
  var menuTl = null;

  if (hasGSAP) {
    menuTl = gsap.timeline({ paused: true })
      .set(menu, { visibility: "visible" })
      .to(menu, { clipPath: "inset(0% 0% 0% 0%)", duration: reduced ? 0.01 : 0.9, ease: "power4.inOut" })
      .from(".menu__nav a", { yPercent: 60, opacity: 0, duration: 0.8, stagger: 0.05, ease: "power3.out" }, "-=0.35")
      .from(".menu__media", { opacity: 0, duration: 0.8 }, "<")
      .from(".menu__foot", { opacity: 0, duration: 0.6 }, "-=0.5");
  }

  function setMenu(open) {
    if (open === menuOpen) return;
    menuOpen = open;
    html.classList.toggle("menu-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menu.setAttribute("aria-hidden", String(!open));
    menuTxt.textContent = open ? "Close" : "Menu";
    if (menuTl) {
      open ? menuTl.timeScale(1).play() : menuTl.timeScale(1.7).reverse();
    } else {
      menu.style.visibility = open ? "visible" : "hidden";
      menu.style.clipPath = open ? "none" : "";
    }
    if (lenis) open ? lenis.stop() : lenis.start();
  }
  menuBtn.addEventListener("click", function () { setMenu(!menuOpen); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });

  var menuImgs = menu.querySelectorAll("[data-menu-img]");
  menu.querySelectorAll(".menu__nav a").forEach(function (a) {
    a.addEventListener("mouseenter", function () {
      menuImgs.forEach(function (img) { img.classList.toggle("is-active", img.dataset.menuImg === a.dataset.i); });
    });
  });

  /* ---------- Anchor links (smooth via Lenis when available) ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      var target = id === "#top" ? 0 : document.querySelector(id);
      if (target === null) return;
      e.preventDefault();
      setMenu(false);
      if (lenis) lenis.scrollTo(target, { duration: 1.6 });
      else if (target === 0) window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
      else target.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
    });
  });

  /* ---------- Character-roll links ---------- */
  document.querySelectorAll("[data-roll]").forEach(function (a) {
    var text = a.textContent;
    a.setAttribute("aria-label", text.trim());
    var roll = document.createElement("span");
    roll.className = "roll";
    roll.setAttribute("aria-hidden", "true");
    Array.prototype.forEach.call(text, function (c, i) {
      var ch = document.createElement("span");
      ch.className = "ch";
      ch.style.setProperty("--i", i);
      ch.textContent = c;
      roll.appendChild(ch);
    });
    a.textContent = "";
    a.appendChild(roll);
  });

  var loader = document.querySelector(".loader");
  if (!hasGSAP) { if (loader) loader.remove(); return; }

  gsap.registerPlugin(ScrollTrigger);
  var hasSplit = !!window.SplitText;
  if (hasSplit) gsap.registerPlugin(SplitText);
  var hasScramble = !!window.ScrambleTextPlugin;
  if (hasScramble) gsap.registerPlugin(ScrambleTextPlugin);

  /* ---------- Smooth scroll ---------- */
  if (!reduced && window.Lenis) {
    lenis = new Lenis({ lerp: 0.09 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  /* ---------- Preloader → hero entrance ---------- */
  function heroIn() {
    return gsap.timeline()
      .from(".hero__media", { scale: 1.22, duration: 2.4, ease: "power3.out" }, 0)
      .from(".hero__line > span", { yPercent: 118, duration: 1.3, stagger: 0.12, ease: "power4.out" }, 0.05)
      .from(".hero__aside > *, .hero__bar", { y: 24, opacity: 0, duration: 1, stagger: 0.08, ease: "power3.out" }, 0.5)
      .from(".nav", { opacity: 0, duration: 1 }, 0.4);
  }

  function finishLoad() {
    if (loader && loader.parentNode) loader.remove();
    html.classList.add("is-loaded");
    if (lenis) lenis.start();
    ScrollTrigger.refresh();
  }

  if (reduced || !loader) {
    finishLoad();
  } else {
    if (lenis) lenis.stop();
    var countEl = document.getElementById("loaderCount");
    var barEl = document.getElementById("loaderBar");
    var c = { v: 0 };
    var loadTl = gsap.timeline({ onComplete: finishLoad })
      .to(c, {
        v: 100, duration: 1.6, ease: "power2.inOut",
        onUpdate: function () {
          countEl.textContent = String(Math.round(c.v)).padStart(3, "0");
          barEl.style.transform = "scaleX(" + c.v / 100 + ")";
        }
      })
      .to(".loader__word, .loader__count", { yPercent: -110, duration: 0.7, ease: "power3.in" })
      .to(loader, { clipPath: "inset(0% 0% 100% 0%)", duration: 1, ease: "power4.inOut" }, "-=0.15")
      .add(heroIn(), "-=0.6");
    // Never let the loader trap the page
    setTimeout(function () { if (loadTl.progress() < 1) loadTl.progress(1); }, 4500);
  }

  if (reduced) return; // Layout and content stay intact; no scroll-driven motion.

  /* ---------- Hero exit: image sinks, type lifts ---------- */
  gsap.to(".hero__media", {
    yPercent: 12, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
  });
  gsap.to(".hero__content", {
    yPercent: -25, opacity: 0, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "70% top", scrub: true }
  });

  /* ---------- Nav steps aside while reading, returns on scroll up ---------- */
  var navEl = document.querySelector(".nav");
  ScrollTrigger.create({
    start: function () { return window.innerHeight * 0.8; }, end: "max",
    onUpdate: function (self) { navEl.classList.toggle("is-hidden", self.direction === 1); },
    onLeaveBack: function () { navEl.classList.remove("is-hidden"); }
  });

  // WhatsApp button waits until the hero has been read
  var wa = document.querySelector(".wa");
  if (wa) {
    wa.classList.add("is-away");
    ScrollTrigger.create({
      trigger: ".hero", start: "bottom 60%",
      onEnter: function () { wa.classList.remove("is-away"); },
      onLeaveBack: function () { wa.classList.add("is-away"); }
    });
  }

  /* ---------- Headlines: masked line reveals ---------- */
  function splitHeadings() {
    if (!hasSplit) return;
    document.querySelectorAll("[data-split]").forEach(function (el) {
      SplitText.create(el, {
        type: "lines", mask: "lines", linesClass: "line", autoSplit: true,
        onSplit: function (self) {
          return gsap.from(self.lines, {
            yPercent: 110, duration: 1.2, stagger: 0.1, ease: "power4.out",
            scrollTrigger: { trigger: el, start: "top 85%", once: true }
          });
        }
      });
    });

    // Manifesto: words brighten at reading pace
    var man = document.querySelector("[data-scrub-words]");
    if (man) {
      SplitText.create(man, {
        type: "words", wordsClass: "word", autoSplit: true,
        onSplit: function (self) {
          return gsap.fromTo(self.words, { opacity: 0.14 }, {
            opacity: 1, stagger: 0.05, ease: "none",
            scrollTrigger: { trigger: man, start: "top 78%", end: "bottom 50%", scrub: 0.6 }
          });
        }
      });
    }
    ScrollTrigger.refresh();
  }
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(splitHeadings);

  /* ---------- Labels decode like a field dossier as they enter ---------- */
  if (hasScramble) {
    var labelTargets = [];
    document.querySelectorAll(".label").forEach(function (lab) {
      var node = lab.lastChild;
      if (node && node.nodeType === 3 && node.textContent.trim()) {
        var span = document.createElement("span");
        span.className = "label__txt";
        span.textContent = node.textContent.trim();
        lab.replaceChild(span, node);
        labelTargets.push(span);
      }
    });
    document.querySelectorAll(".dossier dt, .record .mono, .figure dt").forEach(function (el) { labelTargets.push(el); });
    labelTargets.forEach(function (el) {
      var final = el.textContent;
      ScrollTrigger.create({
        trigger: el, start: "top 92%", once: true,
        onEnter: function () {
          gsap.to(el, { duration: 1.1, ease: "none", scrambleText: { text: final, chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/", revealDelay: 0.25, speed: 0.5 } });
        }
      });
    });
  }

  /* ---------- Paragraph fades ---------- */
  gsap.set("[data-fade]", { y: 36, opacity: 0 });
  ScrollTrigger.batch("[data-fade]", {
    start: "top 92%", once: true,
    onEnter: function (batch) { gsap.to(batch, { y: 0, opacity: 1, duration: 1.1, stagger: 0.09, ease: "power3.out" }); }
  });

  /* ---------- Counters ---------- */
  document.querySelectorAll("[data-count]").forEach(function (el) {
    var end = parseInt(el.dataset.count, 10);
    var from = parseInt(el.dataset.from || "0", 10);
    var o = { v: from };
    ScrollTrigger.create({
      trigger: el, start: "top 90%", once: true,
      onEnter: function () {
        gsap.to(o, { v: end, duration: 1.8, ease: "power3.out", onUpdate: function () { el.textContent = Math.round(o.v); } });
      }
    });
  });

  /* ---------- Image chapters: open on entry, drift while in view ---------- */
  document.querySelectorAll("[data-clip]").forEach(function (el) {
    gsap.fromTo(el, { clipPath: "inset(14% 10% 14% 10%)" }, {
      clipPath: "inset(0% 0% 0% 0%)", ease: "none",
      scrollTrigger: { trigger: el, start: "top bottom", end: "top 15%", scrub: true }
    });
  });
  document.querySelectorAll("[data-parallax]").forEach(function (img) {
    gsap.fromTo(img, { yPercent: -8 }, {
      yPercent: 8, ease: "none",
      scrollTrigger: { trigger: img.parentElement, start: "top bottom", end: "bottom top", scrub: true }
    });
  });

  /* ---------- Marquee: speeds up with scroll velocity ---------- */
  var mqTrack = document.querySelector(".marquee__track");
  if (mqTrack) {
    var mq = gsap.to(mqTrack, { xPercent: -50, repeat: -1, duration: 32, ease: "none" });
    var settle;
    ScrollTrigger.create({
      onUpdate: function (self) {
        var ts = gsap.utils.clamp(1, 5, 1 + Math.abs(self.getVelocity()) / 500);
        gsap.to(mq, { timeScale: ts, duration: 0.25, overwrite: true });
        if (settle) settle.kill();
        settle = gsap.delayedCall(0.2, function () { gsap.to(mq, { timeScale: 1, duration: 1.2, ease: "power2.out", overwrite: true }); });
      }
    });
  }

  /* ---------- Dogs: pinned horizontal lineup (desktop) ---------- */
  var mm = gsap.matchMedia();
  mm.add("(min-width: 901px)", function () {
    html.classList.add("has-pin");
    var track = document.querySelector(".dogs__track");
    var bar = document.querySelector(".dogs__progress span");
    var dist = function () { return track.scrollWidth - window.innerWidth; };
    gsap.to(track, {
      x: function () { return -dist(); }, ease: "none",
      scrollTrigger: {
        trigger: ".dogs", pin: true, start: "top top",
        end: function () { return "+=" + dist(); },
        scrub: 1, invalidateOnRefresh: true,
        onUpdate: function (self) { bar.style.transform = "scaleX(" + self.progress + ")"; }
      }
    });
    return function () { html.classList.remove("has-pin"); };
  });

  /* ---------- Process: line draws, steps light as passed ---------- */
  gsap.to(".steps__line i", {
    scaleY: 1, ease: "none",
    scrollTrigger: { trigger: ".steps", start: "top 60%", end: "bottom 60%", scrub: true }
  });
  document.querySelectorAll(".step").forEach(function (s) {
    ScrollTrigger.create({
      trigger: s, start: "top 60%",
      onEnter: function () { s.classList.add("is-active"); },
      onLeaveBack: function () { s.classList.remove("is-active"); }
    });
  });

  /* ---------- Footer wordmark rises into place ---------- */
  gsap.from(".footer__mark span", {
    yPercent: 70, ease: "none",
    scrollTrigger: { trigger: ".footer", start: "top bottom", end: "bottom bottom", scrub: true }
  });

  /* ---------- Pointer-only extras ---------- */
  if (finePointer) {
    // Hero photo ripples around the cursor (WebGL; falls back to the plain image)
    var heroImg = document.querySelector(".hero__media img");
    if (window.initHeroRipple && heroImg) window.initHeroRipple(heroImg);

    // Cursor
    var cur = document.querySelector(".cursor");
    var cx = gsap.quickTo(cur, "x", { duration: 0.25, ease: "power3" });
    var cy = gsap.quickTo(cur, "y", { duration: 0.25, ease: "power3" });
    window.addEventListener("mousemove", function (e) { cx(e.clientX); cy(e.clientY); cur.style.opacity = 1; }, { passive: true });
    document.addEventListener("mouseover", function (e) {
      cur.classList.toggle("is-link", !!e.target.closest("a, button, label"));
    });
    document.addEventListener("mouseleave", function () { cur.style.opacity = 0; });

    // Program rows: preview image follows the pointer
    var float = document.querySelector(".rows-float");
    var fimg = float.querySelector("img");
    var fx = gsap.quickTo(float, "x", { duration: 0.7, ease: "power3" });
    var fy = gsap.quickTo(float, "y", { duration: 0.7, ease: "power3" });
    var frot = gsap.quickTo(float, "rotation", { duration: 0.9, ease: "power3" });
    var lastX = 0;
    window.addEventListener("mousemove", function (e) {
      fx(e.clientX - 150); fy(e.clientY - 187);
      frot(gsap.utils.clamp(-8, 8, (e.clientX - lastX) * 0.6)); lastX = e.clientX;
    }, { passive: true });
    document.querySelectorAll(".row").forEach(function (row) {
      row.addEventListener("mouseenter", function () { fimg.src = row.dataset.img; float.classList.add("is-on"); });
      row.addEventListener("mouseleave", function () { float.classList.remove("is-on"); });
    });

    // Magnetic CTA
    document.querySelectorAll("[data-magnet]").forEach(function (el) {
      var mx = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3" });
      var my = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3" });
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        mx((e.clientX - (r.left + r.width / 2)) * 0.35);
        my((e.clientY - (r.top + r.height / 2)) * 0.35);
      });
      el.addEventListener("mouseleave", function () { mx(0); my(0); });
    });
  }

  window.addEventListener("load", function () { ScrollTrigger.refresh(); });
})();
