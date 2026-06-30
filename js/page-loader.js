(function () {
  var LOADER_ID = 'page-loader';

  function createLoader() {
    var loader = document.createElement('div');
    loader.id = LOADER_ID;
    loader.innerHTML =
      '<div class="page-loader-spinner" aria-hidden="true">' +
      '<div class="glow-ring"></div>' +
      '<img src="assets/images/logo_load.svg" alt="StudyHelp 24x7" class="page-loader-logo">' +
      '</div>' +
      '<div class="page-loader-text">Loading<span class="dot">.</span><span class="dot">.</span><span class="dot">.</span></div>' +
      '<div class="page-loader-progress" aria-hidden="true"></div>';
    return loader;
  }

  function getLoader() {
    return document.getElementById(LOADER_ID);
  }

  function showLoader() {
    var loader = getLoader();
    if (!loader) {
      loader = createLoader();
      document.documentElement.appendChild(loader);
    }
    loader.classList.remove('page-loader-hidden');
  }

  function hideLoader() {
    var loader = getLoader();
    if (!loader) return;
    loader.classList.add('page-loader-hidden');
  }

  if (!getLoader()) {
    document.documentElement.appendChild(createLoader());
  }

  window.addEventListener('load', function () {
    hideLoader();
  });

  // Fix back-button infinite loading: hide loader when page is restored from bfcache
  window.addEventListener('pageshow', function (event) {
    if (event.persisted) {
      hideLoader();
    }
  });

  document.addEventListener('click', function (event) {
    var link = event.target.closest('a');
    if (!link || link.target === '_blank' || link.hasAttribute('download')) return;

    var href = link.getAttribute('href');
    if (!href || href.charAt(0) === '#' || href.indexOf('javascript:') === 0) return;

    if (href.indexOf('http') === 0) {
      try {
        if (new URL(href).origin !== location.origin) return;
      } catch (error) {
        return;
      }
    }

    showLoader();
  });
})();
