/* Warren Chanansingh — site behaviour. No third-party code; every feature degrades to a complete static page. */
(function () {
  'use strict';
  var CFG = window.WC_CONFIG || { MODE: 'preview' };
  var doc = document, root = doc.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
  var store = {
    get: function (k, s) { try { return (s ? sessionStorage : localStorage).getItem(k); } catch (e) { return null; } },
    set: function (k, v, s) { try { (s ? sessionStorage : localStorage).setItem(k, v); } catch (e) { /* ignore */ } },
    del: function (k, s) { try { (s ? sessionStorage : localStorage).removeItem(k); } catch (e) { /* ignore */ } }
  };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var raf = window.requestAnimationFrame.bind(window);

  /* ---------- analytics (only after consent, only on the live site) ---------- */
  function track(name, params) {
    if (typeof window.gtag === 'function') { try { window.gtag('event', name, params || {}); } catch (e) { /* ignore */ } }
  }
  window.wcTrack = track;
  function loadAnalytics() {
    var id = CFG.GA_MEASUREMENT_ID;
    if (CFG.MODE !== 'live' || !id || !/^G-[A-Z0-9]{4,}$/.test(id) || window.__wcGa) return;
    window.__wcGa = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'granted' });
    window.gtag('js', new Date());
    window.gtag('config', id, { anonymize_ip: true });
    var s = doc.createElement('script');
    s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
    doc.head.appendChild(s);
  }

  /* ---------- toast ---------- */
  var toastEl;
  function toast(msg) {
    if (!toastEl) { toastEl = doc.createElement('div'); toastEl.className = 'toast'; toastEl.setAttribute('role', 'status'); toastEl.setAttribute('aria-live', 'polite'); doc.body.appendChild(toastEl); }
    toastEl.textContent = msg; toastEl.classList.add('is-shown');
    clearTimeout(toastEl._t); toastEl._t = setTimeout(function () { toastEl.classList.remove('is-shown'); }, 2600);
  }

  /* ---------- preloader (home, first visit in a session) ---------- */
  function preloader() {
    var el = $('.preloader');
    if (!el) return;
    if (!root.classList.contains('preloading')) { el.remove(); return; }
    var pct = $('.pct', el), n = 0, start = performance.now();
    function tick(t) {
      n = Math.min(100, Math.round((t - start) / 11));
      if (pct) pct.textContent = String(n).padStart(3, '0');
      if (n < 100) raf(tick); else done();
    }
    function done() {
      store.set('wc-seen', '1', true);
      el.classList.add('is-done');
      root.classList.remove('preloading');
      setTimeout(function () { el.remove(); }, 1000);
    }
    raf(tick);
    setTimeout(function () { if (root.classList.contains('preloading')) done(); }, 2500);
  }

  /* ---------- header ---------- */
  function header() {
    var h = $('.site-header'); if (!h) return;
    var bar = $('.progress');
    var nights = $$('[data-tone="night"]');
    var last = window.scrollY, ticking = false;
    function update() {
      ticking = false;
      var y = window.scrollY, hh = h.offsetHeight;
      h.classList.toggle('is-solid', y > 12);
      var menuOpen = root.classList.contains('menu-open');
      h.classList.toggle('is-hidden', !menuOpen && y > 400 && y > last + 4);
      if (y < last - 4 || y < 400) h.classList.remove('is-hidden');
      last = y;
      var probe = hh / 2, onNight = false;
      for (var i = 0; i < nights.length; i++) {
        var r = nights[i].getBoundingClientRect();
        if (r.top <= probe && r.bottom > probe) { onNight = true; break; }
      }
      h.classList.toggle('on-night', onNight);
      if (bar) {
        var max = doc.documentElement.scrollHeight - window.innerHeight;
        bar.style.transform = 'scaleX(' + (max > 0 ? clamp(y / max, 0, 1) : 0) + ')';
      }
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; raf(update); } }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ---------- mobile menu ---------- */
  function menu() {
    var btn = $('.menu-btn'), m = $('#menu'); if (!btn || !m) return;
    var closeBtn = $('.menu-close', m), lastFocus;
    function open() {
      lastFocus = doc.activeElement; m.hidden = false; raf(function () { m.classList.add('is-open'); });
      btn.setAttribute('aria-expanded', 'true'); root.classList.add('menu-open'); root.style.overflow = 'hidden';
      (closeBtn || m).focus();
    }
    function close() {
      m.classList.remove('is-open'); m.hidden = true; btn.setAttribute('aria-expanded', 'false');
      root.classList.remove('menu-open'); root.style.overflow = '';
      if (lastFocus) lastFocus.focus();
    }
    btn.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', close);
    m.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { close(); return; }
      if (e.key !== 'Tab') return;
      var f = $$('a, button', m).filter(function (x) { return x.offsetParent !== null; });
      if (!f.length) return;
      if (e.shiftKey && doc.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && doc.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    });
  }

  /* ---------- theme ---------- */
  function theme() {
    $$('.theme-toggle').forEach(function (b) {
      b.addEventListener('click', function () {
        var cur = root.getAttribute('data-theme');
        if (!cur) cur = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        var next = cur === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', next); store.set('wc-theme', next);
        b.setAttribute('aria-label', next === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
      });
    });
  }

  /* ---------- reveal & counters ---------- */
  function countTo(el) {
    var target = el.getAttribute('data-count') || el.textContent;
    var m = target.match(/^([^\d]*)([\d,]+(?:\.\d+)?)(.*)$/);
    if (!m || reduce.matches) return;
    var pre = m[1], num = m[2], suf = m[3], dec = (num.split('.')[1] || '').length, comma = num.indexOf(',') > -1;
    var val = parseFloat(num.replace(/,/g, '')), t0 = null, dur = 1100;
    function fmt(v) { var s = v.toFixed(dec); if (comma) { var p = s.split('.'); p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ','); s = p.join('.'); } return pre + s + suf; }
    function step(t) {
      if (!t0) t0 = t;
      var p = clamp((t - t0) / dur, 0, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = p < 1 ? fmt(val * e) : target;
      if (p < 1) raf(step);
    }
    raf(step);
  }
  function reveal() {
    var items = $$('[data-reveal], [data-reveal-img]');
    var counters = $$('[data-count]');
    var bars = $$('[data-grow]');
    if (!('IntersectionObserver' in window)) return;
    if (!reduce.matches) {
      items.forEach(function (el) { if (el.getBoundingClientRect().top > window.innerHeight) el.classList.add('is-below'); });
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target; io.unobserve(el);
        el.classList.remove('is-below');
        if (el.hasAttribute('data-count')) countTo(el);
        if (el.hasAttribute('data-grow') && !reduce.matches && el.animate) {
          var vertical = el.getAttribute('data-grow') === 'y';
          el.animate([{ transform: vertical ? 'scaleY(0)' : 'scaleX(0)' }, { transform: 'none' }], { duration: 900, easing: 'cubic-bezier(.2,.7,.1,1)' });
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    items.concat(counters).concat(bars).forEach(function (el) { io.observe(el); });
  }

  /* ---------- hero canvas: interactive dot grid ---------- */
  function heroCanvas() {
    var c = $('.hero__canvas'); if (!c || !c.getContext) return;
    var ctx = c.getContext('2d'), dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, pitch = 30, mx = -9999, my = -9999, tx = -9999, ty = -9999, running = false, visible = true, ready = false, last = 0, t0 = performance.now();
    var green = [35, 87, 63], cit = [205, 226, 108], TAU = Math.PI * 2;
    var host = c.parentElement, quiet = null, cols = 0, rows = 0;
    // Quiet zones: wherever there is text, the dots dim and never light up, so the copy always reads cleanly.
    function zones() {
      var cr = c.getBoundingClientRect(), pad = 12, feather = 34;
      var rects = $$('.hero__copy > *, .hero__label', host).map(function (el) {
        var r = el.getBoundingClientRect();
        return [r.left - cr.left - pad, r.top - cr.top - pad, r.right - cr.left + pad, r.bottom - cr.top + pad];
      });
      cols = Math.ceil((W - pitch / 2) / pitch); rows = Math.ceil((H - pitch / 2) / pitch);
      quiet = new Float32Array(Math.max(0, cols * rows));
      for (var i = 0; i < cols; i++) {
        for (var j = 0; j < rows; j++) {
          var x = pitch / 2 + i * pitch, y = pitch / 2 + j * pitch, f = 0;
          for (var k = 0; k < rects.length; k++) {
            var q = rects[k], ddx = Math.max(q[0] - x, 0, x - q[2]), ddy = Math.max(q[1] - y, 0, y - q[3]);
            f = Math.max(f, 1 - Math.sqrt(ddx * ddx + ddy * ddy) / feather);
          }
          quiet[i * rows + j] = Math.max(0, f);
        }
      }
    }
    function size() { var r = c.getBoundingClientRect(); W = r.width; H = r.height; c.width = W * dpr; c.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); zones(); draw(performance.now()); }
    function draw(t) {
      ctx.clearRect(0, 0, W, H);
      var time = (t - t0) / 1000, near = [], dim = [[], [], [], []];
      mx += (tx - mx) * 0.12; my += (ty - my) * 0.12;
      // Dots away from the pointer and the text share one colour, so they go in a single path and a single fill.
      ctx.fillStyle = 'rgb(' + green.join(',') + ')';
      ctx.beginPath();
      for (var i = 0; i < cols; i++) {
        for (var j = 0; j < rows; j++) {
          var x = pitch / 2 + i * pitch, y = pitch / 2 + j * pitch, f = quiet ? quiet[i * rows + j] : 0;
          var dx = x - mx, dy = y - my, d = Math.sqrt(dx * dx + dy * dy);
          var k = reduce.matches ? 0 : Math.max(0, 1 - d / 220) * (1 - f);
          var wave = reduce.matches ? 0 : (Math.sin(time * 1.4 - (x + y) * 0.012) + 1) / 2 * 0.25;
          var r = (1.6 + k * 2.6 + wave * 0.6) * (1 - f * 0.35);
          if (k > 0.02) { near.push([x - dx / d * k * 8, y - dy / d * k * 8, r, Math.min(1, k * 1.15)]); continue; }
          if (f > 0.05) { dim[Math.min(3, Math.floor(f * 4))].push(x, y, r); continue; }
          ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, TAU);
        }
      }
      ctx.fill();
      // Dots under or around the text, in four steps of fading.
      for (var g = 0; g < 4; g++) {
        var list = dim[g]; if (!list.length) continue;
        ctx.globalAlpha = 1 - (g + 0.5) / 4 * 0.85;
        ctx.beginPath();
        for (var m = 0; m < list.length; m += 3) { ctx.moveTo(list[m] + list[m + 2], list[m + 1]); ctx.arc(list[m], list[m + 1], list[m + 2], 0, TAU); }
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      for (var n2 = 0; n2 < near.length; n2++) {
        var n = near[n2], mix = n[3];
        ctx.fillStyle = 'rgb(' + Math.round(green[0] + (cit[0] - green[0]) * mix) + ',' + Math.round(green[1] + (cit[1] - green[1]) * mix) + ',' + Math.round(green[2] + (cit[2] - green[2]) * mix) + ')';
        ctx.beginPath(); ctx.arc(n[0], n[1], n[2], 0, TAU); ctx.fill();
      }
    }
    // About 30 frames a second is plenty for a slow wave, and halves the work.
    function loop(t) { if (!running) return; if (t - last >= 32) { last = t; draw(t); } raf(loop); }
    function start() { if (!ready || running || reduce.matches || !visible || doc.hidden) return; running = true; raf(loop); }
    // Draw one still frame now; start the motion once the page has finished loading, so it never competes with first paint.
    function whenLoaded() { setTimeout(function () { ready = true; zones(); start(); }, 600); }
    if (doc.readyState === 'complete') whenLoaded(); else window.addEventListener('load', whenLoaded);
    function stop() { running = false; }
    // The copy slides into place when the page opens: measure the quiet zones again once it settles.
    var zt; host.addEventListener('animationend', function () { clearTimeout(zt); zt = setTimeout(function () { zones(); if (!running) draw(performance.now()); }, 60); });
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(function () { zones(); if (!running) draw(performance.now()); });
    host.addEventListener('pointermove', function (e) { var r = c.getBoundingClientRect(); tx = e.clientX - r.left; ty = e.clientY - r.top; if (mx < -999) { mx = tx; my = ty; } });
    host.addEventListener('pointerleave', function () { tx = -9999; ty = -9999; });
    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; visible ? start() : stop(); }).observe(c);
    doc.addEventListener('visibilitychange', function () { doc.hidden ? stop() : start(); });
    window.addEventListener('resize', size);
    size(); start();
  }

  /* ---------- About: the zaboca story, played by scrolling ----------
     A 3D studio render in 90 frames. The section pins while you scroll about 1.3 screens; the scroll position
     picks the frame. The knife cuts around the seed, the halves twist open, the seed lifts out and flies into
     the headline as its full stop, then black pepper falls. Frames load, coarse to fine, as the section nears. */
  function slice() {
    var sec = $('[data-slice]'); if (!sec) return;
    var stage = $('.slice-stage', sec), box = $('.zab-scene', sec), cv = $('.zab-canvas', sec), fly = $('.seed-fly', sec),
        dot = $('[data-seed-target]', sec), hint = $('.scene-hint', sec);
    if (!stage || !box || !cv || !fly || !dot || reduce.matches || !cv.getContext) return;
    var conn = navigator.connection || {};
    if (conn.saveData || /(^|-)2g$/.test(conn.effectiveType || '')) { sec.classList.add('is-static'); return; }   // data saver: keep the still
    var cfg; try { cfg = JSON.parse(box.getAttribute('data-frames')); } catch (e) { return; }
    var n = cfg.n, imgs = new Array(n), set = null, ctx = cv.getContext('2d'), base = box.getAttribute('data-base');
    var desk = window.matchMedia('(min-width: 901px)'), dist = 1, p = 0, last = -1, shown = -1, ticking = false, landed = false, started = false;
    var SEED = [142, 79, 42], CIT = [205, 226, 108];
    function seg(v, a, b) { return clamp((v - a) / (b - a), 0, 1); }
    function lerp(a, b, t) { return a + (b - a) * t; }
    function inOut(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
    function pad(i) { return ('00' + i).slice(-3); }
    // where the frame sits inside the scene box (object-fit: contain), in CSS pixels
    function frameRect() {
      var bw = box.clientWidth, bh = box.clientHeight, a = cfg.w.d / cfg.h.d, fw, fh;
      if (bw / bh > a) { fh = bh; fw = fh * a; } else { fw = bw; fh = fw / a; }
      return { x: (bw - fw) / 2, y: (bh - fh) / 2, w: fw, h: fh };
    }
    function sizeCanvas() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.round(box.clientWidth * dpr); cv.height = Math.round(box.clientHeight * dpr);
      shown = -1;
    }
    function nearest(i) {
      for (var d = 0; d < n; d++) { if (i - d >= 0 && imgs[i - d]) return i - d; if (i + d < n && imgs[i + d]) return i + d; }
      return -1;
    }
    function draw() {
      var want = Math.round(p * (n - 1)), k = nearest(want);
      if (k < 0 || k === shown) return k;
      var im = imgs[k], dpr = cv.width / Math.max(1, box.clientWidth), f = frameRect();
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.drawImage(im, f.x * dpr, f.y * dpr, f.w * dpr, f.h * dpr);
      shown = k;
      if (!sec.classList.contains('has-canvas')) sec.classList.add('has-canvas');
      return k;
    }
    function load() {
      if (started) return; started = true;
      set = box.clientWidth * Math.min(window.devicePixelRatio || 1, 2) > cfg.w.m * 1.15 ? 'd' : 'm';   // phones use the smaller set
      // coarse to fine: first, last, then halves, quarters, eighths...
      var order = [0, n - 1], seen = {}; seen[0] = seen[n - 1] = 1;
      for (var step = n - 1; step > 1;) { step = Math.ceil(step / 2); for (var i = 0; i < n; i += step) if (!seen[i]) { seen[i] = 1; order.push(i); } }
      for (var j = 0; j < n; j++) if (!seen[j]) order.push(j);
      var at = 0, active = 0;
      function next() {
        while (active < 6 && at < order.length) {
          (function (k) {
            active++;
            var im = new Image(); im.decoding = 'async'; im.src = base + set + '/f' + pad(k) + '.webp';
            var done = function () { active--; next(); };
            (im.decode ? im.decode() : new Promise(function (res, rej) { im.onload = res; im.onerror = rej; }))
              .then(function () { imgs[k] = im; render(true); }, function () {}).then(done);
          })(order[at++]);
        }
      }
      next();
    }
    function render(force) {
      var k = draw(); if (force && k < 0) return;
      var shownP = shown >= 0 ? shown / (n - 1) : 0;
      // the seed leaves the render at the hand-over frame and flies to the headline
      var f = seg(p, cfg.hand, .90);
      var inRender = shown < 0 || cfg.track[shown][3] === 1 || shownP < cfg.hand;
      if (inRender || f >= 1) {
        fly.style.visibility = 'hidden';
      } else {
        var fr = frameRect(), bx = box.getBoundingClientRect(), st = stage.getBoundingClientRect(), b = dot.getBoundingClientRect();
        var x0 = bx.left + fr.x + cfg.seed[0] * fr.w - st.left, y0 = bx.top + fr.y + cfg.seed[1] * fr.h - st.top, r0 = cfg.seed[2] * fr.w;
        var x1 = b.left + b.width / 2 - st.left, y1 = b.top + b.height / 2 - st.top, r1 = b.width / 2;
        var cx = (x0 + x1) / 2, cy = Math.min(y0, y1) - Math.max(60, Math.abs(x1 - x0) * .32);
        var u = inOut(f), v = 1 - u;
        var x = v * v * x0 + 2 * v * u * cx + u * u * x1, y = v * v * y0 + 2 * v * u * cy + u * u * y1, r = lerp(r0, r1, inOut(f));
        var s = 2 * r * 1.12;
        fly.style.width = fly.style.height = s.toFixed(1) + 'px';
        fly.style.transform = 'translate(' + (x - s / 2).toFixed(1) + 'px,' + (y - s / 2).toFixed(1) + 'px) rotate(' + (f * 300).toFixed(0) + 'deg)';
        fly.style.setProperty('--c', seg(f, .55, 1).toFixed(3));
        fly.style.visibility = 'visible';
      }
      var isLanded = f >= 1;
      if (isLanded !== landed) { landed = isLanded; dot.style.opacity = landed ? '1' : '0'; dot.classList.toggle('is-landed', landed); }
      if (hint) hint.style.opacity = String(1 - seg(p, 0, .05));
    }
    function update() {
      ticking = false;
      p = clamp(-sec.getBoundingClientRect().top / dist, 0, 1);
      if (p === last) return;
      last = p; render(false);
      if (!started && p > 0) load();   // someone scrolled before the page finished loading: start now
    }
    function setup() {
      sec.classList.add('is-pinned');
      sec.style.height = '';
      dist = Math.round(window.innerHeight * (desk.matches ? 1.3 : .95));
      sec.style.height = (stage.offsetHeight + dist) + 'px';
      sizeCanvas(); last = -1; update(); render(true);
    }
    sec.classList.add('is-live');
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; raf(update); } }, { passive: true });
    window.addEventListener('resize', setup);
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(setup);
    window.addEventListener('load', setup);
    // once the page itself has loaded, start loading the frames when the section is about a screen away
    function watch() {
      if (!('IntersectionObserver' in window)) { load(); return; }
      var io = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { io.disconnect(); load(); } }, { rootMargin: '120% 0px' });
      io.observe(sec);
    }
    if (doc.readyState === 'complete') watch(); else window.addEventListener('load', watch);
    setup();
  }

  /* ---------- horizontal pinned work rail ---------- */
  function hscroll() {
    $$('.hs').forEach(function (sec) {
      var track = $('.hs__track', sec), sticky = $('.hs__sticky', sec), bar = $('.hs__bar i', sec);
      if (!track) return;
      var mq = window.matchMedia('(min-width: 900px)'), dist = 0, active = false;
      function setup() {
        var want = mq.matches && !reduce.matches;
        sec.classList.toggle('is-pinned', want);
        track.style.transform = '';
        if (!want) { sec.style.height = ''; active = false; return; }
        dist = Math.max(0, track.scrollWidth - window.innerWidth);
        sec.style.height = (window.innerHeight + dist) + 'px';
        active = true; update();
      }
      function update() {
        if (!active) return;
        var r = sec.getBoundingClientRect(), p = clamp(-r.top / (sec.offsetHeight - window.innerHeight || 1), 0, 1);
        track.style.transform = 'translate3d(' + (-dist * p) + 'px,0,0)';
        if (bar) bar.style.transform = 'scaleX(' + p + ')';
      }
      window.addEventListener('scroll', function () { raf(update); }, { passive: true });
      window.addEventListener('resize', setup);
      mq.addEventListener && mq.addEventListener('change', setup);
      if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(setup);
      window.addEventListener('load', setup);
      setup();
    });
  }

  /* ---------- approach: the signal line draws as you scroll ---------- */
  function approach() {
    var sec = $('[data-approach]'); if (!sec) return;
    var path = $('.signal-svg .draw', sec), svg = $('.signal-svg', sec), steps = $$('.step', sec), list = $('.steps', sec);
    if (!path) return;
    if (reduce.matches) { path.style.strokeDashoffset = '0'; svg.classList.add('is-done'); return; }
    list.classList.add('is-scrubbing');
    function update() {
      var r = list.getBoundingClientRect(), vh = window.innerHeight;
      var p = clamp((vh * 0.55 - r.top) / (r.height), 0, 1);
      path.style.strokeDashoffset = String(1 - p);
      svg.classList.toggle('is-done', p > 0.97);
      steps.forEach(function (s) { var sr = s.getBoundingClientRect(); s.classList.toggle('is-active', sr.top < vh * 0.62 && sr.bottom > vh * 0.25); });
    }
    window.addEventListener('scroll', function () { raf(update); }, { passive: true });
    update();
  }

  /* ---------- showreel ---------- */
  function reel() {
    var box = $('.reel'); if (!box) return;
    var v = $('video', box), btn = $('.reel__btn', box);
    if (!v) return;
    function label(playing) {
      if (!btn) return;
      btn.innerHTML = playing ? '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M12 6h-4v20h4zM24 6h-4v20h4z"/></svg>Pause showreel' : '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M8 5v22l18-11z"/></svg>Play showreel';
      btn.setAttribute('aria-pressed', playing ? 'true' : 'false');
    }
    var userPaused = false;
    if (btn) btn.addEventListener('click', function () {
      if (v.paused) { userPaused = false; var p = v.play(); if (p && p.catch) p.catch(function () { label(false); }); label(true); track('showreel_play'); }
      else { userPaused = true; v.pause(); label(false); }
    });
    if (!reduce.matches && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        if (en[0].isIntersecting && !userPaused) { var p = v.play(); if (p && p.then) p.then(function () { label(true); }).catch(function () { label(false); }); }
        else if (!en[0].isIntersecting && !v.paused) { v.pause(); label(false); }
      }, { threshold: 0.35 }).observe(box);
      var frame = box;
      window.addEventListener('scroll', function () {
        raf(function () {
          var r = frame.getBoundingClientRect(), vh = window.innerHeight;
          var p = clamp((vh - r.top) / (vh * 0.9), 0, 1);
          frame.style.transform = 'scale(' + (0.9 + 0.1 * p) + ')';
        });
      }, { passive: true });
    }
    label(false);
  }

  /* ---------- cursor & magnetic buttons ---------- */
  function cursor() {
    if (!finePointer.matches || reduce.matches) return;
    var c = doc.createElement('div'); c.className = 'cursor'; c.setAttribute('aria-hidden', 'true'); c.innerHTML = '<b></b>';
    doc.body.appendChild(c);
    var lbl = $('b', c), x = 0, y = 0, cx = 0, cy = 0, on = false;
    doc.addEventListener('pointermove', function (e) { x = e.clientX; y = e.clientY; if (!on) { on = true; cx = x; cy = y; c.classList.add('is-on'); loop(); } }, { passive: true });
    doc.addEventListener('pointerleave', function () { c.classList.remove('is-on'); on = false; });
    function loop() { if (!on) return; cx += (x - cx) * 0.2; cy += (y - cy) * 0.2; c.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0)'; raf(loop); }
    doc.addEventListener('pointerover', function (e) {
      var t = e.target.closest('[data-cursor]');
      if (t) { lbl.textContent = t.getAttribute('data-cursor'); c.classList.add('is-big'); }
    });
    doc.addEventListener('pointerout', function (e) {
      var t = e.target.closest('[data-cursor]');
      if (t && !t.contains(e.relatedTarget)) c.classList.remove('is-big');
    });
    $$('[data-magnetic]').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        var dx = (e.clientX - r.left - r.width / 2) / r.width, dy = (e.clientY - r.top - r.height / 2) / r.height;
        b.style.transform = 'translate(' + dx * 10 + 'px,' + dy * 8 + 'px)';
      });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });
  }

  /* ---------- gallery: drag to scroll + lightbox ---------- */
  function gallery() {
    $$('.gallery').forEach(function (g) {
      var down = false, sx = 0, sl = 0, moved = false;
      g.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = g.scrollLeft; });
      g.addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - sx; if (Math.abs(dx) > 5) { moved = true; g.classList.add('is-dragging'); } g.scrollLeft = sl - dx; });
      ['pointerup', 'pointerleave'].forEach(function (ev) { g.addEventListener(ev, function () { down = false; g.classList.remove('is-dragging'); }); });
      g.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
    });
    var dlg = $('#lightbox'); if (!dlg || typeof dlg.showModal !== 'function') return;
    var img = $('img', dlg), cap = $('.lb-cap', dlg), count = $('.lb-count', dlg), items = [], idx = 0;
    function show(i) {
      idx = (i + items.length) % items.length;
      var b = items[idx], im = $('img', b);
      img.src = im.currentSrc || im.src; img.alt = im.alt; img.width = im.naturalWidth || im.width; img.height = im.naturalHeight || im.height;
      cap.textContent = im.alt; count.textContent = (idx + 1) + ' / ' + items.length;
    }
    $$('[data-lightbox]').forEach(function (b) {
      b.addEventListener('click', function () {
        items = $$('[data-lightbox]', b.closest('.gallery') || doc);
        show(items.indexOf(b)); dlg.showModal();
      });
    });
    $('.lb-prev', dlg).addEventListener('click', function () { show(idx - 1); });
    $('.lb-next', dlg).addEventListener('click', function () { show(idx + 1); });
    $('.lb-close', dlg).addEventListener('click', function () { dlg.close(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') show(idx - 1); if (e.key === 'ArrowRight') show(idx + 1); });
  }

  /* ---------- work filters ---------- */
  function filters() {
    var wrap = $('[data-filters]'); if (!wrap) return;
    var chips = $$('.chip', wrap), cards = $$('[data-part]'), live = $('[data-filter-status]');
    chips.forEach(function (ch) {
      ch.addEventListener('click', function () {
        var f = ch.getAttribute('data-filter'), n = 0;
        chips.forEach(function (c) { c.setAttribute('aria-pressed', c === ch ? 'true' : 'false'); });
        cards.forEach(function (card) { var show = f === 'all' || card.getAttribute('data-part') === f; card.hidden = !show; if (show) n++; });
        if (live) live.textContent = 'Showing ' + n + (n === 1 ? ' case study' : ' case studies');
        track('filter_work', { filter: f });
      });
    });
  }

  /* ---------- copy buttons ---------- */
  function copyButtons() {
    $$('[data-copy]').forEach(function (b) {
      b.addEventListener('click', function () {
        var text = b.getAttribute('data-copy');
        function fallback() {
          var target = b.previousElementSibling;
          if (target && window.getSelection) { var r = doc.createRange(); r.selectNodeContents(target); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); toast('Selected. Press Ctrl+C or Cmd+C to copy.'); }
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(function () { toast('Copied ' + text); }, fallback);
        } else fallback();
      });
    });
  }

  /* ---------- cookie consent ---------- */
  function consent() {
    var banner = $('#cookie'), dlg = $('#cookie-prefs');
    var choice = store.get('wc-consent');
    function apply(c) { if (c === 'granted') loadAnalytics(); }
    function save(c) { store.set('wc-consent', c); if (banner) banner.hidden = true; apply(c); if (c !== 'granted' && window.__wcGa) toast('Analytics is off. It stops fully when you reload the page.'); }
    if (choice) apply(choice); else if (banner) banner.hidden = false;
    $$('[data-consent]').forEach(function (b) { b.addEventListener('click', function () { save(b.getAttribute('data-consent')); }); });
    $$('[data-cookie-settings]').forEach(function (b) {
      b.addEventListener('click', function () {
        if (!dlg || typeof dlg.showModal !== 'function') return;
        var sw = $('#pref-analytics', dlg); if (sw) sw.checked = store.get('wc-consent') === 'granted';
        dlg.showModal();
      });
    });
    if (dlg) {
      var f = $('form', dlg);
      f.addEventListener('submit', function (e) { e.preventDefault(); var sw = $('#pref-analytics', dlg); save(sw && sw.checked ? 'granted' : 'denied'); dlg.close(); toast('Cookie settings saved'); });
      var cancel = $('[data-prefs-cancel]', dlg); if (cancel) cancel.addEventListener('click', function () { dlg.close(); });
    }
  }

  /* ---------- quick actions: a bar on phones, a small floating pill on larger screens ---------- */
  function mobileCta() {
    // v1.14: the quick contact bar (Send a message, WhatsApp) stays on screen on every page; it only steps aside for the open menu
    var el = $('.mcta'); if (!el) return;
    function update() { el.classList.toggle('is-shown', !root.classList.contains('menu-open')); }
    new MutationObserver(update).observe(root, { attributes: true, attributeFilter: ['class'] });
    update();
  }

  /* ---------- video posters load when the video is near the screen, so they never hold up the first paint ---------- */
  function lazyPosters() {
    var vids = $$('video[data-poster]'); if (!vids.length) return;
    function show(v) { if (!v.getAttribute('poster')) v.setAttribute('poster', v.getAttribute('data-poster')); }
    if (!('IntersectionObserver' in window)) { vids.forEach(show); return; }
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } }); }, { rootMargin: '600px 0px' });
    window.addEventListener('load', function () { vids.forEach(function (v) { io.observe(v); }); });
  }

  /* ---------- section to section: the down and up arrows (and Page Down / Page Up) move one section at a time.
     Tall sections are paged a screen at a time, so nothing is skipped. On touch screens, CSS snapping does the same for a swipe. */
  function sectionNav() {
    var main = $('#main'); if (!main) return;
    var pending = null, timer;
    function stops() {
      var y = window.scrollY;
      var vh = window.innerHeight;   // thin strips (proof numbers, brand logos) are passed over, not stopped at
      // on Expertise, each pillar group is a stop too
      return $$('#main > section, #main > .section, .site-footer, .pgroup').filter(function (el) { return el.offsetHeight > vh * 0.3 || el.classList.contains('pgroup'); })
        .map(function (el) { return Math.round(el.getBoundingClientRect().top + y); })
        .filter(function (v, i, a) { return a.indexOf(v) === i; }).sort(function (a, b) { return a - b; });
    }
    function go(down) {
      var y = window.scrollY, vh = window.innerHeight, step = Math.round(vh * 0.85), eps = Math.round(vh * 0.12);   // ignore stops too close to bother with
      var base = (pending !== null && Math.abs(y - pending) > 2) ? pending : y;
      var tops = stops(), target;
      if (down) {
        var next = tops.filter(function (t) { return t > base + eps; })[0];
        target = (next === undefined || next - base > step * 1.3) ? base + step : next;
      } else {
        var prev = tops.filter(function (t) { return t < base - eps; }).pop();
        target = prev === undefined ? 0 : (base - prev > step * 1.3 ? base - step : prev);
      }
      var max = doc.documentElement.scrollHeight - vh;
      target = clamp(target, 0, max);
      if (Math.abs(target - y) < 2) return false;
      pending = target; clearTimeout(timer); timer = setTimeout(function () { pending = null; }, 900);
      window.scrollTo({ top: target, behavior: reduce.matches ? 'auto' : 'smooth' });
      return true;
    }
    doc.addEventListener('keydown', function (e) {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      var k = e.key, down = k === 'ArrowDown' || k === 'PageDown';
      if (!down && k !== 'ArrowUp' && k !== 'PageUp') return;
      var t = e.target;
      if (t && t.closest && (t.isContentEditable || t.closest('input, textarea, select, [role="listbox"], [role="slider"], dialog'))) return;
      if (root.classList.contains('menu-open') || $('dialog[open]')) return;
      if (go(down)) e.preventDefault();
    });
    $$('[data-next-section]').forEach(function (b) { b.addEventListener('click', function () { go(true); }); });
  }

  /* ---------- Expertise: capabilities open to read more. A link to services.html#id opens that one. ---------- */
  function capsAccordion() {
    var items = $$('details.cap-acc'); if (!items.length) return;
    var btn = $('[data-caps-toggle]'), bulk = false;
    function allOpen() { return items.every(function (d) { return d.open; }); }
    function sync() { if (btn) btn.textContent = allOpen() ? 'Close all' : 'Open all nine'; }
    function openFromHash() {
      var h = (location.hash || '').slice(1); if (!h) return;
      var d = doc.getElementById(h);
      if (!d || !d.matches('details.cap-acc')) return;
      d.open = true;
      requestAnimationFrame(function () { d.scrollIntoView({ block: 'start' }); });
    }
    items.forEach(function (d) {
      d.addEventListener('toggle', function () { sync(); if (d.open && !bulk) track('capability_open', { capability: d.id }); });
    });
    if (btn) {
      btn.classList.add('is-ready');
      btn.addEventListener('click', function () { var open = !allOpen(); bulk = true; items.forEach(function (d) { d.open = open; }); setTimeout(function () { bulk = false; }, 80); sync(); });
    }
    openFromHash(); sync();
    window.addEventListener('hashchange', openFromHash);
  }

  /* ---------- forms ---------- */
  var MSG = {
    required: 'This field is required.',
    email: 'Enter an email address like name@company.com.',
    url: 'Enter a website address like company.com.',
    min: 'Tell me a little more (at least %n characters).',
    consent: 'Tick the box so I can reply to you.',
    phone: 'Enter a phone number using digits, spaces, +, ( ) or -.'
  };
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  function fieldError(input) {
    var v = (input.type === 'checkbox') ? input.checked : input.value.trim();
    if (input.required && !v) return input.type === 'checkbox' ? MSG.consent : (input.getAttribute('data-required-msg') || MSG.required);
    if (!v) return '';
    if (input.type === 'email' && !EMAIL_RE.test(v)) return MSG.email;
    if (input.getAttribute('data-type') === 'url' && !/^(https?:\/\/)?[\w-]+(\.[\w-]+)+([\/?#].*)?$/i.test(v)) return MSG.url;
    if (input.type === 'tel' && !/^[+()\d\s.-]{7,20}$/.test(v)) return MSG.phone;
    var min = parseInt(input.getAttribute('minlength') || '0', 10);
    if (min && v.length < min) return MSG.min.replace('%n', min);
    if (input.maxLength > 0 && v.length > input.maxLength) return 'Keep this under ' + input.maxLength + ' characters.';
    return '';
  }
  function showError(input, msg) {
    var f = input.closest('.field'); if (!f) return;
    var err = $('.err span', f);
    f.classList.toggle('is-invalid', !!msg);
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (err) err.textContent = msg;
  }
  function serialize(form) {
    var data = {};
    $$('input, select, textarea', form).forEach(function (el) {
      if (!el.name || el.name === '_gotcha' || el.disabled) return;
      if (el.type === 'checkbox') { data[el.name] = el.checked ? 'yes' : 'no'; return; }
      if (el.type === 'radio') { if (el.checked) data[el.name] = el.value; return; }
      data[el.name] = el.value.trim();
    });
    return data;
  }
  function forms() {
    $$('form[data-form]').forEach(function (form) {
      var loadedAt = Date.now();
      var alertBox = $('.form-alert', form);
      var btn = $('button[type="submit"]', form);
      var inputs = $$('input, select, textarea', form).filter(function (i) { return i.name && i.name !== '_gotcha' && i.type !== 'hidden'; });
      inputs.forEach(function (i) {
        // validate on blur after a short delay, so a click that caused the blur lands before any error text shifts the layout
        i.addEventListener('blur', function () { setTimeout(function () { if (i.value || i.getAttribute('aria-invalid') === 'true') showError(i, fieldError(i)); }, 220); });
        i.addEventListener('input', function () { if (i.getAttribute('aria-invalid') === 'true') showError(i, fieldError(i)); });
        i.addEventListener('change', function () { if (i.type === 'checkbox') showError(i, fieldError(i)); });
      });
      function showAlert(html) { if (!alertBox) return; alertBox.innerHTML = html; alertBox.classList.add('is-shown'); alertBox.focus(); }
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (alertBox) { alertBox.classList.remove('is-shown'); alertBox.textContent = ''; }
        var bad = [];
        inputs.forEach(function (i) { var m = fieldError(i); showError(i, m); if (m) bad.push({ el: i, msg: m }); });
        if (bad.length) {
          var items = bad.map(function (b) {
            var lab = $('label[for="' + b.el.id + '"]', form);
            var name = b.el.getAttribute('data-label') || (lab ? lab.textContent.replace(/\(optional\)/i, '').trim() : b.el.name);
            return '<li><a href="#' + b.el.id + '">' + escapeHtml(name) + ': ' + escapeHtml(b.msg) + '</a></li>';
          }).join('');
          showAlert('<b>Please fix ' + (bad.length === 1 ? 'this' : 'these ' + bad.length) + ' before sending:</b><ul>' + items + '</ul>');
          $$('a', alertBox).forEach(function (a) { a.addEventListener('click', function (ev) { ev.preventDefault(); var t = doc.getElementById(a.getAttribute('href').slice(1)); if (t) t.focus(); }); });
          return;
        }
        var hp = $('input[name="_gotcha"]', form);
        var tooFast = Date.now() - loadedAt < 3000;
        var lastSent = parseInt(store.get('wc-last-send') || '0', 10);
        if (Date.now() - lastSent < 60000) {
          showAlert('<b>You just sent a message.</b> Please wait a minute before sending another, or email <a href="mailto:' + CFG.CONTACT_EMAIL + '">' + CFG.CONTACT_EMAIL + '</a>.');
          return;
        }
        var data = serialize(form);
        data.form = form.getAttribute('data-form');
        data.page = location.pathname.split('/').pop() || 'index.html';
        if (form.getAttribute('data-form') === 'quiz' && window.wcQuizSummary) { data.quiz = window.wcQuizSummary(); }
        btn.setAttribute('aria-busy', 'true'); btn.disabled = true;
        var sr = $('.sending', form); if (sr) sr.textContent = 'Sending your message…';
        function success() {
          store.set('wc-last-send', String(Date.now()));
          store.set('wc-thanks', JSON.stringify({ name: (data.first_name || data.name || '').split(' ')[0].slice(0, 40), form: data.form, profile: data.quiz_profile || '', preview: CFG.MODE !== 'live' }), true);
          track('generate_lead', { form_name: data.form, profile: data.quiz_profile || '' });
          location.href = form.getAttribute('data-next') || 'thank-you.html';
        }
        function fail(msg) {
          btn.removeAttribute('aria-busy'); btn.disabled = false; if (sr) sr.textContent = '';
          showAlert('<b>Your message didn’t send.</b> ' + msg + ' You can also email <a href="mailto:' + CFG.CONTACT_EMAIL + '">' + CFG.CONTACT_EMAIL + '</a>.');
        }
        if ((hp && hp.value) || tooFast) { setTimeout(success, 700); return; } // likely a bot: never sent anywhere
        if (CFG.MODE !== 'live') { setTimeout(success, 900); return; }        // preview copy: nothing leaves the page
        if (!CFG.FORM_ENDPOINT) { fail('The form is not connected yet.'); return; }
        var ctrl = 'AbortController' in window ? new AbortController() : null;
        var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 15000);
        fetch(CFG.FORM_ENDPOINT, { method: 'POST', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify(data), signal: ctrl ? ctrl.signal : undefined, credentials: 'omit' })
          .then(function (r) { clearTimeout(timer); if (r.ok) success(); else fail(r.status === 429 ? 'Too many messages were sent from here. Please try again later.' : 'Please try again in a moment.'); })
          .catch(function () { clearTimeout(timer); fail('Check your connection and try again.'); });
      });
    });
  }
  function escapeHtml(s) { return String(s).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); }
  window.wcEscape = escapeHtml;

  /* ---------- contact: preselect the topic from a #hash ---------- */
  function contactTopic() {
    var sel = $('#topic'); if (!sel) return;
    var map = { 'in-house': 'An in-house role', hiring: 'An in-house role', engagement: 'A consulting engagement', project: 'A consulting engagement', workshop: 'A workshop or talk' };
    var h = (location.hash || '').slice(1);
    if (map[h]) sel.value = map[h];
  }

  /* ---------- thank-you page ---------- */
  function thanks() {
    var box = $('[data-thanks]'); if (!box) return;
    var raw = store.get('wc-thanks', true); if (!raw) return;
    var d; try { d = JSON.parse(raw); } catch (e) { return; }
    store.del('wc-thanks', true);
    var name = $('[data-thanks-name]'); if (name && d.name) name.textContent = ', ' + d.name;
    var prof = $('[data-thanks-profile]');
    if (prof && d.profile) { prof.hidden = false; $('b', prof).textContent = d.profile; }
    var pv = $('[data-preview-note]'); if (pv && d.preview) pv.hidden = false;
  }

  /* ---------- résumé button (shown only when a résumé file is configured) ---------- */
  function resume() {
    var url = CFG.RESUME_URL;
    if (!url || !/^[\w\-./]+\.pdf$/i.test(url)) return;
    $$('[data-resume]').forEach(function (a) { a.href = (a.getAttribute('data-base') || '') + url; a.hidden = false; a.setAttribute('download', ''); a.addEventListener('click', function () { track('resume_download'); }); });
  }

  function init() {
    preloader(); header(); menu(); theme(); reveal(); slice(); heroCanvas(); hscroll(); approach(); reel(); sectionNav(); capsAccordion(); lazyPosters();
    cursor(); gallery(); filters(); copyButtons(); consent(); mobileCta(); forms(); contactTopic(); thanks(); resume();
    $$('[data-track]').forEach(function (a) { a.addEventListener('click', function () { track('cta_click', { cta: a.getAttribute('data-track') }); }); });
  }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init); else init();
})();
