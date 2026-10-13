/* Growth goal finder: steps through server-rendered questions, scores a goal profile, then reveals the enquiry form.
   Answers stay in this browser tab (sessionStorage) until the visitor chooses to send them. */
(function () {
  'use strict';
  var doc = document;
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
  var quiz = $('[data-quiz]'); if (!quiz) return;
  var steps = $$('.qstep', quiz), total = steps.length, cur = 0;
  var meter = $('.quiz__meter'), meterPath = meter ? $('.p', meter) : null, count = $('.quiz__count');
  var resultBox = $('#result'), formWrap = $('#quiz-form');
  var KEY = 'wc-quiz';
  var track = window.wcTrack || function () {};
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var CASES = {
    'insurance-family-plan-leads': 'Insurance provider: 614 leads against a target of 500',
    'insurance-annuity-leads': 'Insurance provider: 1,561 annuity leads in two markets',
    'vehicle-dealership-sales-events': 'Vehicle dealership: 1,779 leads and 1,217 event responses',
    'sports-t20-tickets': 'Professional sports: 57% of ticket sales tracked online',
    'sports-home-internationals-2025': 'Professional sports: 201,400 link clicks in six host markets',
    'energy-drink-cap-contest': 'Energy drink: contest 2.0 and 3.0, compared',
    'bank-christmas-loans': 'Commercial bank: 290K clicks for Christmas loans',
    'money-transfer-app': 'Money transfer company: 64,270 link clicks in 2025',
    'energy-drink-product-launch': 'Energy drink: 4.38M ThruPlays for a product launch',
    'confectionery-always-on': 'Confectionery brand: 3.2M post engagements in four markets',
    'spirits-always-on': 'Spirits brand: 40 campaigns of always-on social',
    'malt-beverage-ar-game': 'Malt beverage brand: its first AR game on five channels'
  };
  var PROFILES = {
    leads: {
      name: 'A lead engine',
      focus: 'Your measure of success is the cost of a qualified lead, not reach. Build for the moment someone hands over their details.',
      moves: [
        ['Test the form against the page', 'Run on-platform lead forms alongside traffic to a landing page with a strong call to action. In an insurance provider’s annuity campaign, each market preferred a different one.', 'insurance-annuity-leads'],
        ['Give the algorithm options', 'Launch three to five creatives per offer under one campaign-level budget, so the platform can find what converts.', 'insurance-family-plan-leads'],
        ['Leave it alone long enough to learn', 'Hold budget, targeting and duration steady before you judge the results. The insurer’s family plan campaign saw its cost per lead fall as it ran.', 'insurance-family-plan-leads']
      ]
    },
    sales: {
      name: 'A sales sprint',
      focus: 'Every stage of the message should move people toward one action, with a clear reason to act now.',
      moves: [
        ['Sequence the message, then add urgency', 'Move from awareness to engagement quickly, then open a short “act now” window. A T20 cricket campaign ran it this way, and a tracked 57% of ticket sales came through the online ticket page.', 'sports-t20-tickets'],
        ['Pair emotion with the offer', 'Run emotive and functional creative together, each optimized for its stage of the journey, as a commercial bank did for its Christmas loans.', 'bank-christmas-loans'],
        ['Buy for action, not reach alone', 'Optimize for traffic, engagement and conversions. Reach-only buying cut an energy drink contest’s reminders until the campaign changed course.', 'energy-drink-cap-contest']
      ]
    },
    entries: {
      name: 'A countdown campaign',
      focus: 'People need a reason, a date and reminders, from the first view to the moment they enter or arrive.',
      moves: [
        ['Lead with a reason to take part', 'A clear prize or offer gives every ad a job. A vehicle dealership’s sales events, trade-up offer and trip for two drew 1,779 leads and 1,217 event responses.', 'vehicle-dealership-sales-events'],
        ['Keep the reminders coming', 'Buy enough frequency and engagement that people are reminded to act. When an energy drink contest added engagement and widened its age range, website entries rose by an average of 60%.', 'energy-drink-cap-contest'],
        ['Borrow trust from creators', 'Run creator content as Paid Partnerships so it earns organic and paid visibility, as a vehicle dealership and a T20 cricket campaign did.', 'sports-t20-tickets']
      ]
    },
    attention: {
      name: 'Attention that converts later',
      focus: 'Awareness is worth buying when you measure what it does next: engagement, recall, visits and enquiries.',
      moves: [
        ['Measure beyond reach', 'Optimize for video views, engagement and ad recall, and test before you scale. An energy drink launch tested three versions of one ad on ad recall; version B lifted it 19% more than version A.', 'energy-drink-product-launch'],
        ['Plan peaks on top of the calendar', 'Keep a steady content calendar, then add promotions people can join. A confectionery brand’s 2024 promotions out-engaged every monthly calendar.', 'confectionery-always-on'],
        ['Give clicks their own objective', 'If you need visits or enquiries, buy for them. A spirits brand’s reach-optimized posts stayed at or below a 0.13% link click-through rate; its traffic campaign reached 0.72%.', 'spirits-always-on']
      ]
    }
  };
  var FROM_FINAL = { web: 'sales', form: 'leads', offline: 'attention', event: 'entries' };

  function load() { try { return JSON.parse(sessionStorage.getItem(KEY) || '{}'); } catch (e) { return {}; } }
  function save(a) { try { sessionStorage.setItem(KEY, JSON.stringify(a)); } catch (e) { /* ignore */ } }
  var answers = load();

  function valuesOf(step) {
    var inputs = $$('input', step), id = step.getAttribute('data-id');
    var picked = inputs.filter(function (i) { return i.checked; }).map(function (i) { return i.value; });
    return { id: id, picked: picked, type: inputs[0] ? inputs[0].type : 'radio' };
  }
  function labelFor(id, v) {
    var inp = $('input[name="' + id + '"][value="' + v + '"]', quiz);
    var lab = inp ? $('label[for="' + inp.id + '"] b', quiz) : null;
    return lab ? lab.textContent : v;
  }
  function restore() {
    Object.keys(answers).forEach(function (id) {
      [].concat(answers[id]).forEach(function (v) { var i = $('input[name="' + id + '"][value="' + v + '"]', quiz); if (i) i.checked = true; });
    });
    var h = (location.hash || '').slice(1);
    if (h && PROFILES[h] || h === 'optimize') { var g = $('input[name="goal"][value="' + h + '"]', quiz); if (g) { g.checked = true; answers.goal = h; save(answers); } }
  }
  function setMeter(i) {
    if (!meterPath) return;
    meterPath.style.strokeDashoffset = String(1 - i / total);
    meter.classList.toggle('is-done', i >= total);
    if (count) count.textContent = i >= total ? 'Your result' : 'Question ' + (i + 1) + ' of ' + total;
  }
  function show(i, focus) {
    cur = Math.max(0, Math.min(total - 1, i));
    steps.forEach(function (s, k) { s.hidden = k !== cur; });
    var err = $('.q-error', steps[cur]); if (err) err.hidden = true;
    setMeter(cur);
    if (focus) { var lg = $('legend', steps[cur]); if (lg) { lg.setAttribute('tabindex', '-1'); lg.focus({ preventScroll: true }); } quiz.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); }
  }
  function next() {
    var step = steps[cur], v = valuesOf(step), optional = step.hasAttribute('data-optional');
    if (!v.picked.length && !optional) { var err = $('.q-error', step); if (err) { err.hidden = false; } var first = $('input', step); if (first) first.focus(); return; }
    answers[v.id] = v.type === 'checkbox' ? v.picked : (v.picked[0] || '');
    save(answers);
    if (cur === 0) track('quiz_start');
    if (cur < total - 1) show(cur + 1, true); else finish();
  }
  // "None yet" is exclusive in the channels question
  $$('input[type="checkbox"]', quiz).forEach(function (cb) {
    cb.addEventListener('change', function () {
      var group = $$('input[name="' + cb.name + '"]', quiz);
      if (cb.value === 'none' && cb.checked) group.forEach(function (g) { if (g !== cb) g.checked = false; });
      else if (cb.checked) group.forEach(function (g) { if (g.value === 'none') g.checked = false; });
    });
  });
  $$('input[type="radio"]', quiz).forEach(function (r) {
    r.addEventListener('change', function () { var err = $('.q-error', r.closest('.qstep')); if (err) err.hidden = true; });
  });
  $$('[data-next]', quiz).forEach(function (b) { b.addEventListener('click', next); });
  $$('[data-back]', quiz).forEach(function (b) { b.addEventListener('click', function () { show(cur - 1, true); }); });
  quiz.addEventListener('keydown', function (e) { if (e.key === 'Enter' && e.target.matches('input')) { e.preventDefault(); next(); } });

  function profileKey() {
    var g = answers.goal;
    if (g === 'optimize') return FROM_FINAL[answers.final] || 'leads';
    return PROFILES[g] ? g : 'leads';
  }
  function notes() {
    var n = [], ch = [].concat(answers.channels || []);
    if (answers.goal === 'optimize') n.push('You want more from campaigns already running, so I’d start with an audit: which campaigns tie to conversions, where frequency is climbing, and which creatives carry the results.');
    if (['no', 'partly', 'unsure'].indexOf(answers.tracking) > -1) n.push('Set up conversion tracking before you scale: the Meta pixel and Conversions API, Google Ads conversions and GA4 key events, so every dollar can be tied to a result.');
    if (['one', 'none'].indexOf(answers.creative) > -1) n.push('Plan more creative before launch. Three to five pieces per offer gives the algorithms room to learn.');
    if (ch.indexOf('none') > -1) n.push('Start with one or two channels where your customers already spend time, prove the result, then expand.');
    if (answers.final === 'offline' && profileKey() !== 'attention') n.push('Your customers finish in person, so add a trackable online step, such as a form, booking or coupon, to connect ads to sales.');
    return n;
  }
  var QLABEL = { goal: 'Goal', final: 'Final step', channels: 'Channels today', tracking: 'Conversion tracking', creative: 'Creative ready', budget: 'Monthly budget', timing: 'Start' };
  function answerList() {
    return Object.keys(QLABEL).filter(function (k) { return answers[k] && [].concat(answers[k]).length; }).map(function (k) {
      return [QLABEL[k], [].concat(answers[k]).map(function (v) { return labelFor(k, v); }).join(', ')];
    });
  }
  window.wcQuizSummary = function () {
    var p = PROFILES[profileKey()];
    return 'Profile: ' + p.name + '\n' + answerList().map(function (r) { return r[0] + ': ' + r[1]; }).join('\n');
  };

  function el(tag, cls, text) { var e = doc.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  var ICON_INFO = '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M17 22v-8h-4v2h2v6h-3v2h8v-2zM16 8a1.5 1.5 0 1 0 1.5 1.5A1.5 1.5 0 0 0 16 8z"/><path d="M16 30a14 14 0 1 1 14-14 14 14 0 0 1-14 14zm0-26a12 12 0 1 0 12 12A12 12 0 0 0 16 4z"/></svg>';

  function finish() {
    steps.forEach(function (s) { s.hidden = true; });
    setMeter(total);
    resultBox.hidden = false; resultBox.innerHTML = '';
    var calc = el('div', 'calculating'); calc.setAttribute('role', 'status');
    calc.appendChild(el('div', 'loader-line')).appendChild(el('i'));
    calc.appendChild(el('p', null, 'Matching your answers to ten campaigns…'));
    resultBox.appendChild(calc);
    setTimeout(render, reduce ? 0 : 1000);
  }
  function render() {
    var key = profileKey(), p = PROFILES[key];
    resultBox.innerHTML = '';
    var wrap = el('div', 'result');
    var head = el('div', 'result__head');
    head.appendChild(el('p', 'eyebrow', 'Your growth goal'));
    var h = el('h2'); h.textContent = p.name; h.setAttribute('tabindex', '-1'); head.appendChild(h);
    head.appendChild(el('p', null, p.focus));
    wrap.appendChild(head);

    wrap.appendChild(el('h3', 'h3', 'Three moves I’d make first'));
    var ol = el('ol', 'moves');
    p.moves.forEach(function (m) {
      var li = el('li'), d = el('div');
      d.appendChild(el('b', null, m[0])); d.appendChild(el('p', null, m[1]));
      var a = el('a', 'text-link', 'See the case: ' + CASES[m[2]]); a.href = 'case-studies/' + m[2] + '.html';
      var pa = el('p'); pa.style.marginTop = '8px'; pa.appendChild(a); d.appendChild(pa);
      li.appendChild(d); ol.appendChild(li);
    });
    wrap.appendChild(ol);

    var ns = notes();
    if (ns.length) {
      wrap.appendChild(el('h3', 'h3', 'Before you scale'));
      var nb = el('div', 'notes');
      ns.forEach(function (t) { var pn = el('p'); pn.innerHTML = ICON_INFO; pn.appendChild(el('span', null, t)); nb.appendChild(pn); });
      wrap.appendChild(nb);
    }
    var dl = el('dl', 'answers');
    answerList().forEach(function (r) { var d = el('div'); d.appendChild(el('dt', null, r[0])); d.appendChild(el('dd', null, r[1])); dl.appendChild(d); });
    var ah = el('h3', 'h3', 'Your answers'); wrap.appendChild(ah); wrap.appendChild(dl);
    var redo = el('button', 'btn btn--ghost btn--sm', 'Change my answers'); redo.type = 'button';
    redo.addEventListener('click', function () { resultBox.hidden = true; formWrap.hidden = true; show(0, true); });
    var rp = el('p'); rp.appendChild(redo); wrap.appendChild(rp);
    resultBox.appendChild(wrap);

    var pf = $('input[name="quiz_profile"]', formWrap); if (pf) pf.value = p.name;
    var sum = $('textarea[name="quiz_answers"]', formWrap); if (sum) sum.value = window.wcQuizSummary();
    formWrap.hidden = false;
    track('quiz_complete', { profile: p.name });
    h.focus({ preventScroll: true });
    resultBox.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }

  restore();
  show(0, false);
})();
