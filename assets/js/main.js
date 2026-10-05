(function () {
  "use strict";

  var WHATSAPP_NUMBER = "919873335698";

  // Nav: solid background once scrolled
  var nav = document.getElementById("nav");
  function onScroll() { nav.classList.toggle("is-scrolled", window.scrollY > 40); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Mobile menu
  var toggle = document.getElementById("navToggle");
  var links = document.getElementById("navLinks");
  function setMenu(open) {
    links.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  }
  toggle.addEventListener("click", function () { setMenu(!links.classList.contains("is-open")); });
  links.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });

  // Placeholders: load the real image from data-src if it exists
  document.querySelectorAll(".ph[data-src]").forEach(function (el) {
    var src = el.getAttribute("data-src");
    var img = new Image();
    img.onload = function () {
      el.style.backgroundImage = "url('" + src + "')";
      el.classList.add("has-img");
    };
    img.src = src;
  });

  // Scroll reveal + stat counters
  var reveals = document.querySelectorAll(".reveal");
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function countUp(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    var suffix = el.getAttribute("data-suffix") || "";
    if (isNaN(target) || reduced) return;
    var start = target > 1900 ? target - 40 : 0;
    var t0 = null, dur = 1600;
    function frame(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(start + (target - start) * eased) + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  if ("IntersectionObserver" in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        // Stagger siblings slightly
        var idx = Array.prototype.indexOf.call(el.parentNode.children, el);
        el.style.transitionDelay = Math.min(idx * 80, 400) + "ms";
        el.classList.add("is-in");
        var num = el.querySelector("[data-count]");
        if (num) countUp(num);
        io.unobserve(el);
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  // Testimonials slider
  var slider = document.getElementById("slider");
  if (slider) {
    var slides = slider.querySelectorAll(".quote");
    var dotsWrap = slider.querySelector(".slider__dots");
    var current = 0, timer;
    slides.forEach(function (_, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("role", "tab");
      b.setAttribute("aria-label", "Testimonial " + (i + 1));
      b.addEventListener("click", function () { go(i); restart(); });
      dotsWrap.appendChild(b);
    });
    var dots = dotsWrap.querySelectorAll("button");
    function go(i) {
      slides[current].classList.remove("is-active");
      dots[current].setAttribute("aria-selected", "false");
      current = (i + slides.length) % slides.length;
      slides[current].classList.add("is-active");
      dots[current].setAttribute("aria-selected", "true");
    }
    function restart() {
      clearInterval(timer);
      if (!reduced) timer = setInterval(function () { go(current + 1); }, 6000);
    }
    dots[0].setAttribute("aria-selected", "true");
    restart();
  }

  // Contact form: no backend yet, so send the enquiry to WhatsApp
  var form = document.getElementById("contactForm");
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
      if (!ok) { note.textContent = "Please add your name and phone number."; return; }

      var d = new FormData(form);
      var msg = [
        "New enquiry from website",
        "Name: " + d.get("name"),
        "Phone: " + d.get("phone"),
        d.get("email") ? "Email: " + d.get("email") : "",
        "Interest: " + d.get("interest"),
        d.get("city") ? "City: " + d.get("city") : "",
        d.get("message") ? "Message: " + d.get("message") : ""
      ].filter(Boolean).join("\n");

      window.open("https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(msg), "_blank", "noopener");
      note.textContent = "Thank you! WhatsApp is opening with your enquiry. Press send to reach us.";
      form.reset();
    });
  }

  document.getElementById("year").textContent = new Date().getFullYear();
})();
