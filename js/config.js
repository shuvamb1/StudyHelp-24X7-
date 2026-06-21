(function () {
  const LOCAL_API = 'http://localhost:5000';
  // Must match your live Render service URL exactly.
  const PRODUCTION_API = 'https://studyhelp-backend-czz3.onrender.com';

  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  window.API_BASE_URL = isLocal ? LOCAL_API : PRODUCTION_API;
})();
