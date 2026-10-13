/* Runs in <head> before first paint: theme choice, JS flag, first-visit preloader flag. No personal data. */
(function () {
  var root = document.documentElement;
  root.classList.add('js');
  try {
    var t = localStorage.getItem('wc-theme');
    if (t === 'light' || t === 'dark') root.setAttribute('data-theme', t);
  } catch (e) { /* storage blocked: follow the system theme */ }
  try {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var wants = root.hasAttribute('data-preloader') || (document.currentScript && document.currentScript.hasAttribute('data-preloader'));
    if (wants && !reduce && !sessionStorage.getItem('wc-seen')) {
      root.classList.add('preloading');
    }
  } catch (e) { /* no preloader without storage */ }
})();
