/* ============================================================
   Autoniq — interactions
   ============================================================ */
(function () {
  "use strict";

  /* ---- Loading screen ---- */
  var loader = document.getElementById("loader");
  if (loader) {
    document.body.classList.add("is-loading");
    var fill = document.getElementById("loaderFill");
    var pctEl = document.getElementById("loaderPct");
    var statusEl = document.getElementById("loaderStatus");
    var statuses = [
      "Booting automation engine",
      "Connecting integrations",
      "Syncing AI core",
      "Optimizing workflows",
      "Ready"
    ];
    var pct = 0;
    var tick = setInterval(function () {
      pct += Math.random() * 16 + 6;
      if (pct >= 100) pct = 100;
      if (fill) fill.style.width = pct + "%";
      if (pctEl) pctEl.textContent = Math.round(pct) + "%";
      if (statusEl) {
        var idx = Math.min(statuses.length - 1, Math.floor((pct / 100) * statuses.length));
        statusEl.textContent = statuses[idx];
      }
      if (pct >= 100) {
        clearInterval(tick);
        setTimeout(function () {
          loader.classList.add("done");
          document.body.classList.remove("is-loading");
          setTimeout(function () { if (loader.parentNode) loader.parentNode.removeChild(loader); }, 700);
        }, 350);
      }
    }, 220);
  }

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

  /* ---- Sticky header shadow + scroll progress ---- */
  var header = document.getElementById("header");
  var scrollProgress = document.getElementById("scrollProgress");
  function onScroll() {
    if (window.scrollY > 8) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
    if (scrollProgress) {
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var pct = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
      scrollProgress.style.width = pct + "%";
    }
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---- Magnetic button ---- */
  var magneticBtns = document.querySelectorAll(".btn-magnetic");
  magneticBtns.forEach(function (btn) {
    btn.addEventListener("mousemove", function (e) {
      var r = btn.getBoundingClientRect();
      var x = e.clientX - r.left - r.width / 2;
      var y = e.clientY - r.top - r.height / 2;
      btn.style.transform = "translate(" + (x * 0.18) + "px," + (y * 0.35 - 2) + "px)";
    });
    btn.addEventListener("mouseleave", function () {
      btn.style.transform = "";
    });
  });

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

  /* ---- Interactive workflow canvas ---- */
  var wfCanvas = document.getElementById("wfCanvas");
  if (wfCanvas) {
    var SVGNS = "http://www.w3.org/2000/svg";
    var wires = document.getElementById("wfWires");
    var runBtn = document.getElementById("wfRun");
    var nodes = {};
    wfCanvas.querySelectorAll(".wf-node").forEach(function (n) {
      nodes[n.getAttribute("data-node")] = n;
    });
    // directed connections: [from, to]
    var links = [
      ["trigger", "ai"],
      ["ai", "crm"],
      ["ai", "notify"]
    ];
    var paths = [];

    // build a <path> per link
    links.forEach(function () {
      var p = document.createElementNS(SVGNS, "path");
      wires.appendChild(p);
      paths.push(p);
    });

    function centerRight(el, base) {
      return { x: el.offsetLeft + el.offsetWidth, y: el.offsetTop + el.offsetHeight / 2 };
    }
    function centerLeft(el) {
      return { x: el.offsetLeft, y: el.offsetTop + el.offsetHeight / 2 };
    }

    function drawWires() {
      var w = wfCanvas.clientWidth, h = wfCanvas.clientHeight;
      wires.setAttribute("width", w);
      wires.setAttribute("height", h);
      wires.setAttribute("viewBox", "0 0 " + w + " " + h);
      links.forEach(function (lk, i) {
        var a = centerRight(nodes[lk[0]]);
        var b = centerLeft(nodes[lk[1]]);
        var dx = Math.max(40, Math.abs(b.x - a.x) * 0.5);
        var d = "M" + a.x + "," + a.y +
          " C" + (a.x + dx) + "," + a.y + " " + (b.x - dx) + "," + b.y + " " + b.x + "," + b.y;
        paths[i].setAttribute("d", d);
      });
    }

    // ---- dragging ----
    var active = null, startX = 0, startY = 0, origL = 0, origT = 0, moved = false;
    function onDown(e, node) {
      active = node;
      moved = false;
      var pt = e.touches ? e.touches[0] : e;
      startX = pt.clientX;
      startY = pt.clientY;
      origL = node.offsetLeft;
      origT = node.offsetTop;
      node.classList.add("dragging");
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    }
    function onMove(e) {
      if (!active) return;
      moved = true;
      var nx = origL + (e.clientX - startX);
      var ny = origT + (e.clientY - startY);
      var maxX = wfCanvas.clientWidth - active.offsetWidth;
      var maxY = wfCanvas.clientHeight - active.offsetHeight;
      nx = Math.max(0, Math.min(maxX, nx));
      ny = Math.max(0, Math.min(maxY, ny));
      active.style.left = nx + "px";
      active.style.top = ny + "px";
      drawWires();
    }
    function onUp() {
      if (active) active.classList.remove("dragging");
      active = null;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    }
    Object.keys(nodes).forEach(function (k) {
      nodes[k].addEventListener("pointerdown", function (e) { onDown(e, nodes[k]); });
    });

    // ---- run animation: send packets along the wires ----
    function sendPacket(path, dur) {
      return new Promise(function (resolve) {
        var len = path.getTotalLength();
        var dot = document.createElementNS(SVGNS, "circle");
        dot.setAttribute("r", "5");
        dot.setAttribute("class", "wf-packet");
        wires.appendChild(dot);
        path.classList.add("lit");
        var start = null;
        function step(ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / dur, 1);
          var pt = path.getPointAtLength(len * p);
          dot.setAttribute("cx", pt.x);
          dot.setAttribute("cy", pt.y);
          if (p < 1) requestAnimationFrame(step);
          else {
            dot.remove();
            setTimeout(function () { path.classList.remove("lit"); }, 400);
            resolve();
          }
        }
        requestAnimationFrame(step);
      });
    }

    var running = false;
    function activate(node, on) {
      nodes[node].classList.toggle("active", on);
    }
    function resetNodes() {
      Object.keys(nodes).forEach(function (k) { nodes[k].classList.remove("active"); });
    }

    function runFlow() {
      if (running) return;
      running = true;
      if (runBtn) runBtn.classList.add("is-running");
      resetNodes();
      drawWires();
      activate("trigger", true);
      setTimeout(function () {
        sendPacket(paths[0], 650).then(function () {
          activate("ai", true);
          setTimeout(function () {
            Promise.all([
              sendPacket(paths[1], 650),
              sendPacket(paths[2], 650)
            ]).then(function () {
              activate("crm", true);
              activate("notify", true);
              setTimeout(function () {
                running = false;
                if (runBtn) runBtn.classList.remove("is-running");
              }, 900);
            });
          }, 250);
        });
      }, 350);
    }

    window.addEventListener("resize", drawWires);

    /* ---- Auto-demo ghost cursor (guides the user, then yields) ---- */
    var wrap = wfCanvas.closest(".wf-wrap");
    var ghost = document.createElement("div");
    ghost.className = "wf-ghost";
    ghost.setAttribute("aria-hidden", "true");
    ghost.innerHTML =
      '<svg viewBox="0 0 24 24" class="wf-ghost-ic"><path d="M4 2l6.5 17 1.8-7 7-1.8z"/></svg>' +
      '<span class="wf-ghost-label">auto</span>';
    wrap.appendChild(ghost);

    var ghostX = 24, ghostY = 24;
    var demoToken = 0;
    var demoTimer = null;
    var idleTimer = null;
    var userActive = false;

    function easeInOut(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
    function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

    function tween(dur, token, onFrame) {
      return new Promise(function (resolve) {
        var start = null;
        function step(ts) {
          if (token !== demoToken) { resolve(); return; }
          if (!start) start = ts;
          var p = Math.min((ts - start) / dur, 1);
          onFrame(easeInOut(p), p);
          if (p < 1) requestAnimationFrame(step);
          else resolve();
        }
        requestAnimationFrame(step);
      });
    }

    function wrapPoint(el, fx, fy) {
      var wr = wrap.getBoundingClientRect();
      var r = el.getBoundingClientRect();
      return { x: r.left - wr.left + r.width * fx, y: r.top - wr.top + r.height * fy };
    }
    function placeGhost(x, y) {
      ghostX = x; ghostY = y;
      ghost.style.transform = "translate(" + x + "px," + y + "px)";
    }
    function moveGhost(to, dur, token) {
      var from = { x: ghostX, y: ghostY };
      return tween(dur, token, function (e) {
        placeGhost(from.x + (to.x - from.x) * e, from.y + (to.y - from.y) * e);
      });
    }
    function ghostDrag(node, target, dur, token) {
      var fromL = node.offsetLeft, fromT = node.offsetTop;
      node.classList.add("dragging");
      return tween(dur, token, function (e) {
        node.style.left = (fromL + (target.x - fromL) * e) + "px";
        node.style.top = (fromT + (target.y - fromT) * e) + "px";
        drawWires();
        var gp = wrapPoint(node, 0.42, 0.32);
        placeGhost(gp.x, gp.y);
      }).then(function () { node.classList.remove("dragging"); });
    }
    function hideGhost() { ghost.classList.remove("show", "press", "click"); }

    function runDemo() {
      if (userActive) return;
      var token = ++demoToken;
      ghost.classList.add("show");
      var node = nodes.notify;
      var home = { x: node.offsetLeft, y: node.offsetTop };

      moveGhost(wrapPoint(node, 0.42, 0.32), 850, token)
        .then(function () { if (token !== demoToken) return; return sleep(180); })
        .then(function () { if (token !== demoToken) return; ghost.classList.add("press"); return sleep(130); })
        .then(function () {
          if (token !== demoToken) return;
          var maxX = wfCanvas.clientWidth - node.offsetWidth;
          var maxY = wfCanvas.clientHeight - node.offsetHeight;
          var tgt = {
            x: Math.max(0, Math.min(maxX, home.x - 78)),
            y: Math.max(0, Math.min(maxY, home.y - 34))
          };
          return ghostDrag(node, tgt, 880, token);
        })
        .then(function () { if (token !== demoToken) return; return sleep(160); })
        .then(function () { if (token !== demoToken) return; return ghostDrag(node, home, 760, token); })
        .then(function () {
          if (token !== demoToken) return;
          ghost.classList.remove("press");
          return moveGhost(wrapPoint(runBtn, 0.5, 0.5), 720, token);
        })
        .then(function () {
          if (token !== demoToken) return;
          ghost.classList.add("press", "click");
          return sleep(150);
        })
        .then(function () {
          if (token !== demoToken) return;
          ghost.classList.remove("press");
          setTimeout(function () { ghost.classList.remove("click"); }, 500);
          runFlow();
          return sleep(3300);
        })
        .then(function () {
          if (token !== demoToken) return;
          hideGhost();
          scheduleDemo(5200);
        });
    }

    function scheduleDemo(delay) {
      clearTimeout(demoTimer);
      demoTimer = setTimeout(function () { if (!userActive) runDemo(); }, delay);
    }

    // Real user takes over the moment their cursor enters the widget
    function takeOver() {
      userActive = true;
      demoToken++;            // invalidate any in-flight demo
      clearTimeout(demoTimer);
      hideGhost();
    }
    function startIdleCountdown() {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(function () {
        userActive = false;
        scheduleDemo(400);
      }, 4000);
    }
    wrap.addEventListener("pointerenter", function (e) { if (e.isTrusted) takeOver(); });
    wrap.addEventListener("pointerleave", function (e) { if (e.isTrusted) startIdleCountdown(); });
    wrap.addEventListener("pointerdown", function (e) { if (e.isTrusted) takeOver(); });

    // Run button: real clicks also count as user interaction
    if (runBtn) runBtn.addEventListener("click", function (e) {
      if (e.isTrusted) { takeOver(); runFlow(); }
    });

    // initial draw, then kick off the guided demo
    requestAnimationFrame(function () {
      drawWires();
      placeGhost(wfCanvas.offsetLeft + 30, wfCanvas.offsetTop + wfCanvas.clientHeight - 20);
      scheduleDemo(1100);
    });
  }

  /* ---- Hero cursor spotlight ---- */
  var heroEl = document.querySelector(".hero");
  if (heroEl) {
    heroEl.addEventListener("mousemove", function (e) {
      var r = heroEl.getBoundingClientRect();
      heroEl.style.setProperty("--spot-x", (e.clientX - r.left) + "px");
      heroEl.style.setProperty("--spot-y", (e.clientY - r.top) + "px");
    });
  }

  /* ---- Card tilt + glow ---- */
  var tiltCards = document.querySelectorAll(".benefit-card, .feature-card");
  tiltCards.forEach(function (card) {
    card.addEventListener("mousemove", function (e) {
      var r = card.getBoundingClientRect();
      var x = e.clientX - r.left;
      var y = e.clientY - r.top;
      var px = x / r.width - 0.5;
      var py = y / r.height - 0.5;
      card.style.setProperty("--ry", (px * 8) + "deg");
      card.style.setProperty("--rx", (py * -8) + "deg");
      card.style.setProperty("--mx", (x / r.width * 100) + "%");
      card.style.setProperty("--my", (y / r.height * 100) + "%");
    });
    card.addEventListener("mouseleave", function () {
      card.style.setProperty("--ry", "0deg");
      card.style.setProperty("--rx", "0deg");
    });
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
