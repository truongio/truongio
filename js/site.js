/* Outbound navigation feedback.
   When a link leaves this site, we don't teleport: the chosen link
   deepens and its siblings recede, a hairline progress bar sweeps
   across the top, and only then does the browser navigate. The bar
   keeps animating during the real cross-origin load. */
(function () {
  var bar;

  function onReady(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  onReady(function () {
    bar = document.createElement('div');
    bar.className = 'page-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);
  });

  function isExternal(a) {
    return !!a.hostname && a.hostname !== location.hostname;
  }

  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 ||
        e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    var a = e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    if (a.target && a.target !== '_self') return;   // new-tab links keep default
    if (!isExternal(a)) return;                      // only outbound navigations

    e.preventDefault();
    var href = a.href;

    a.classList.add('is-loading');
    document.body.classList.add('is-navigating');
    document.body.classList.add('is-leaving');
    if (bar) requestAnimationFrame(function () { bar.classList.add('is-active'); });

    // start the departure transition and navigate immediately
    window.setTimeout(function () { window.location.href = href; }, 0);
  }, false);

  // returning via back/forward (incl. bfcache) should land on a clean page
  window.addEventListener('pageshow', function () {
    document.body.classList.remove('is-navigating');
    document.body.classList.remove('is-leaving');
    var loading = document.querySelector('.menu-link.is-loading, .is-loading');
    if (loading) loading.classList.remove('is-loading');
    if (bar) bar.classList.remove('is-active');
  });
})();
