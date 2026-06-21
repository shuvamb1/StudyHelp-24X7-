(function () {
  var LOADER_ID = 'page-loader';

  function createLoader() {
    var loader = document.createElement('div');
    loader.id = LOADER_ID;
    loader.innerHTML =
      '<div class="page-loader-spinner" aria-hidden="true"></div>' +
      '<p class="page-loader-text">Loading...</p>';
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
