/* ============================================================
   Autoniq — interactions
   ============================================================ */
(function () {
  "use strict";

  /* ---- Dark mode ---- */
  var root = document.documentElement;
  var themeToggle = document.getElementById("themeToggle");
  var STORAGE_KEY = "autoniq-theme";

  function getPreferred() {
    var saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }

  applyTheme(getPreferred());

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
    });
  }

  // Listen for OS theme changes (only when user hasn't manually picked)
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function (e) {
    if (!localStorage.getItem(STORAGE_KEY)) {
      applyTheme(e.matches ? "dark" : "light");
    }
  });

  /* ---- Year ---- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- Announcement dismiss ---- */
  var announce = document.getElementById("announce");
  var announceClose = document.getElementById("announceClose");
  if (announceClose && announce) {
    announceClose.addEventListener("click", function () { announce.classList.add("hide"); });
  }

  /* ---- Sticky header shadow ---- */
  var header = document.getElementById("header");
  function onScroll() {
    if (window.scrollY > 8) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---- Mobile nav ---- */
  var menuToggle = document.getElementById("menuToggle");
  var nav = document.getElementById("nav");
  var backdrop = document.getElementById("navBackdrop");

  function setMenu(open) {
    nav.classList.toggle("open", open);
    menuToggle.classList.toggle("open", open);
    backdrop.classList.toggle("show", open);
    menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.style.overflow = open ? "hidden" : "";
  }
  if (menuToggle) {
    menuToggle.addEventListener("click", function () {
      setMenu(!nav.classList.contains("open"));
    });
    backdrop.addEventListener("click", function () { setMenu(false); });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { setMenu(false); });
    });
    window.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setMenu(false);
    });
  }

  /* ---- Scroll reveal ---- */
  var revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var delay = parseInt(el.getAttribute("data-reveal-delay") || "0", 10);
          setTimeout(function () { el.classList.add("in"); }, delay);
          io.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---- Animated counters ---- */
  var counters = document.querySelectorAll("[data-counter]");
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-counter"));
    var suffix = el.getAttribute("data-suffix") || "";
    var dur = 1400, start = null;
    var isFloat = target % 1 !== 0;
    function tick(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = target * eased;
      el.textContent = (isFloat ? val.toFixed(1) : Math.round(val)) + suffix;
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = (isFloat ? target.toFixed(1) : target) + suffix;
    }
    requestAnimationFrame(tick);
  }
  if ("IntersectionObserver" in window && counters.length) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { animateCount(entry.target); cio.unobserve(entry.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(function (el) { el.textContent = el.getAttribute("data-counter") + (el.getAttribute("data-suffix") || ""); });
  }

  /* ---- Solutions tabs ---- */
  var tabBtns = document.querySelectorAll(".tab-btn");
  var tabPanels = document.querySelectorAll(".tab-panel");
  tabBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var key = btn.getAttribute("data-tab");
      tabBtns.forEach(function (b) {
        var active = b === btn;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-selected", active ? "true" : "false");
      });
      tabPanels.forEach(function (p) {
        p.classList.toggle("is-active", p.getAttribute("data-panel") === key);
      });
    });
  });

  /* ---- Pricing toggle ---- */
  var billSwitch = document.getElementById("billSwitch");
  var billMonthly = document.getElementById("billMonthly");
  var billAnnual = document.getElementById("billAnnual");
  var nums = document.querySelectorAll(".price-amt .num[data-monthly]");
  var notes = document.querySelectorAll(".price-note[data-monthly-note]");

  function setBilling(annual) {
    billSwitch.setAttribute("aria-checked", annual ? "true" : "false");
    billMonthly.classList.toggle("is-active", !annual);
    billAnnual.classList.toggle("is-active", annual);
    nums.forEach(function (n) {
      var val = annual ? n.getAttribute("data-annual") : n.getAttribute("data-monthly");
      n.style.opacity = "0";
      setTimeout(function () { n.textContent = val; n.style.opacity = "1"; }, 120);
    });
    notes.forEach(function (note) {
      note.textContent = annual ? note.getAttribute("data-annual-note") : note.getAttribute("data-monthly-note");
    });
  }
  if (billSwitch) {
    billSwitch.addEventListener("click", function () {
      setBilling(billSwitch.getAttribute("aria-checked") !== "true");
    });
    billAnnual.addEventListener("click", function () { setBilling(true); });
    billMonthly.addEventListener("click", function () { setBilling(false); });
  }

  /* ---- FAQ accordion ---- */
  var accItems = document.querySelectorAll(".acc-item");
  accItems.forEach(function (item) {
    var q = item.querySelector(".acc-q");
    var a = item.querySelector(".acc-a");
    q.addEventListener("click", function () {
      var isOpen = item.classList.contains("open");
      accItems.forEach(function (other) {
        other.classList.remove("open");
        other.querySelector(".acc-q").setAttribute("aria-expanded", "false");
        other.querySelector(".acc-a").style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add("open");
        q.setAttribute("aria-expanded", "true");
        a.style.maxHeight = a.scrollHeight + "px";
      }
    });
  });
  window.addEventListener("resize", function () {
    var open = document.querySelector(".acc-item.open .acc-a");
    if (open) open.style.maxHeight = open.scrollHeight + "px";
  });

  /* ---- CTA form (demo) ---- */
  var ctaForm = document.getElementById("ctaForm");
  var ctaMsg = document.getElementById("ctaMsg");
  if (ctaForm) {
    ctaForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = ctaForm.querySelector("input[type=email]");
      var submitBtn = ctaForm.querySelector("button[type=submit]");
      var val = (input.value || "").trim();
      var ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      if (!ok) {
        ctaMsg.textContent = "Please enter a valid work email.";
        ctaMsg.classList.remove("ok");
        ctaMsg.classList.add("error");
        input.focus();
        return;
      }

      // Disable button and show loading state
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending...";
      ctaMsg.textContent = "";
      ctaMsg.classList.remove("ok", "error");

      fetch("https://n8n.bcap.tech/webhook/book-demo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: val
        })
      })
        .then(function (res) {
          if (!res.ok) throw new Error("Request failed");
          ctaMsg.textContent = "Thanks! We'll reach out to " + val + " to schedule your demo.";
          ctaMsg.classList.add("ok");
          ctaMsg.classList.remove("error");
          ctaForm.reset();
        })
        .catch(function () {
          ctaMsg.textContent = "Something went wrong. Please try again.";
          ctaMsg.classList.add("error");
          ctaMsg.classList.remove("ok");
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = "Book a free demo";
        });
    });
  }
})();
