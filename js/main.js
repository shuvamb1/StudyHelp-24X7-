document.addEventListener('DOMContentLoaded', () => {
  // Mobile Navigation Toggle
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      const isExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
      mobileMenuBtn.setAttribute('aria-expanded', !isExpanded);
      
      // Toggle only nav-links (login/signup buttons are now inside it on mobile)
      navLinks.classList.toggle('mobile-visible');
      
      // Toggle icon between bars and X
      const icon = mobileMenuBtn.querySelector('i');
      if (icon.classList.contains('fa-bars')) {
        icon.classList.replace('fa-bars', 'fa-times');
      } else {
        icon.classList.replace('fa-times', 'fa-bars');
      }
    });
  }

  // Header Scroll Effect
  const navbar = document.querySelector('nav.navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.remove('border-transparent', 'bg-transparent');
      navbar.classList.add('border-outline-variant/30', 'bg-surface/85', 'md:backdrop-blur-xl', 'shadow-sm');
    } else {
      navbar.classList.remove('border-outline-variant/30', 'bg-surface/85', 'md:backdrop-blur-xl', 'shadow-sm');
      navbar.classList.add('border-transparent', 'bg-transparent');
    }
  });

  // Current year for footer
  const currentYearElement = document.getElementById('current-year');
  if (currentYearElement) {
    currentYearElement.textContent = new Date().getFullYear();
  }

  // Scroll Reveal Animation
  const reveals = document.querySelectorAll('.reveal');
  const revealOnScroll = () => {
    const windowHeight = window.innerHeight;
    const elementVisible = 100;
    
    reveals.forEach(reveal => {
      const elementTop = reveal.getBoundingClientRect().top;
      if (elementTop < windowHeight - elementVisible) {
        reveal.classList.add('active');
      }
    });
  };
  
  window.addEventListener('scroll', revealOnScroll);
  revealOnScroll(); // trigger once on load

  // FAQ Accordion Toggle
  document.querySelectorAll('.faq-item, .faq-item-dark').forEach(item => {
    item.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      // Close all open items
      document.querySelectorAll('.faq-item.open, .faq-item-dark.open').forEach(openItem => {
        openItem.classList.remove('open');
      });
      // Open clicked one if it was closed
      if (!isOpen) {
        item.classList.add('open');
      }
    });
  });

  // Animated Counters
  const counters = document.querySelectorAll('.counter');
  let animationTriggered = false;
  
  const animateCounters = () => {
    counters.forEach(counter => {
      const target = +counter.getAttribute('data-target');
      const speed = 200; // adjust speed here
      
      const updateCount = () => {
        const current = +counter.innerText.replace(/\+/g, '');
        const increment = target / speed;
        
        if (current < target) {
          counter.innerText = Math.ceil(current + increment) + (target > 1000 ? '+' : '');
          setTimeout(updateCount, 15);
        } else {
          counter.innerText = target + (target > 1000 ? '+' : '');
        }
      };
      
      updateCount();
    });
  };

    // Trigger counters when stats section is in view
    const statsSection = document.querySelector('.stats-section');
    if (statsSection) {
      window.addEventListener('scroll', () => {
        if (!animationTriggered) {
          const elementTop = statsSection.getBoundingClientRect().top;
          if (elementTop < window.innerHeight) {
            animateCounters();
            animationTriggered = true;
          }
        }
      });
    }
  });

  // JWT Authentication & UI Logic
  window.checkLogin = function(e) {
      if (!localStorage.getItem('token')) {
          if (e) e.preventDefault();
          const currentPath = window.location.pathname.split('/').pop() || 'index.html';
          window.location.href = `login.html?redirect=${currentPath}`;
          return false;
      }
      return true;
  };

  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  if (token && userStr) {
      const user = JSON.parse(userStr);
      const initial = user.name ? user.name.charAt(0).toUpperCase() : 'U';
      
      const profileHtmlDesktop = `
          <div class="profile-dropdown-container" style="position: relative;">
              <div class="profile-icon" style="width: 40px; height: 40px; border-radius: 50%; background: var(--primary-color); color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; cursor: pointer; font-size: 1.2rem;">
                  ${initial}
              </div>
              <div class="profile-dropdown" style="display: none; position: absolute; top: 50px; right: 0; background: white; box-shadow: var(--shadow-lg); border-radius: var(--border-radius); padding: 15px; width: 250px; z-index: 1000; border: 1px solid #E2E8F0;">
                  <div style="font-weight: 600; font-size: 1.1rem; margin-bottom: 5px; color: var(--primary-color);">${user.name}</div>
                  <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 15px;">CIN: ${user.cin}</div>
                  <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 0.9rem;">
                      <span>Downloads:</span>
                      <span style="font-weight: bold;" id="nav-downloads-count">${user.downloadsCount || 0}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 0.9rem;">
                      <span>Contributions:</span>
                      <span style="font-weight: bold;" id="nav-contributions-count">${user.contributionsCount || 0}</span>
                  </div>
                  ${user.role === 'admin' ? '<a href="admin-dashboard.html" class="btn btn-outline" style="width: 100%; margin-bottom: 10px; text-align: center; padding: 8px;">Admin Dashboard</a>' : ''}
                  <button id="logoutBtn" class="btn btn-primary" style="width: 100%; padding: 8px;">Logout</button>
              </div>
          </div>
      `;

      const profileHtmlMobile = `
          <div style="padding: 15px 0; border-top: 1px solid #E2E8F0; margin-top: 10px;">
              <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
                  <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--primary-color); color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.2rem;">
                      ${initial}
                  </div>
                  <div>
                      <div style="font-weight: 600; color: var(--primary-color);">${user.name}</div>
                      <div style="font-size: 0.8rem; color: var(--text-muted);">CIN: ${user.cin}</div>
                  </div>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 0.9rem;">
                  <span>Downloads:</span> <span style="font-weight: bold;" id="mob-nav-downloads-count">${user.downloadsCount || 0}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 0.9rem;">
                  <span>Contributions:</span> <span style="font-weight: bold;" id="mob-nav-contributions-count">${user.contributionsCount || 0}</span>
              </div>
              ${user.role === 'admin' ? '<a href="admin-dashboard.html" class="btn btn-outline" style="width: 100%; margin-bottom: 16px; text-align: center; padding: 10px;">Admin Dashboard</a>' : ''}
              <button id="mobLogoutBtn" class="btn btn-primary" style="width: 100%; padding: 10px;">Logout</button>
          </div>
      `;

      const desktopLi = document.createElement('li');
      desktopLi.innerHTML = profileHtmlDesktop;
      
      const navLinks = document.querySelector('.nav-links');
      const mobileActionsNode = document.querySelector('.mobile-only-actions');
      
      if (navLinks && mobileActionsNode) {
          navLinks.insertBefore(desktopLi, mobileActionsNode);
      } else if (navLinks) {
          navLinks.appendChild(desktopLi);
      }

      const navActions = document.querySelector('.nav-actions');
      if (navActions) navActions.style.display = 'none';

      const mobileActions = document.querySelector('.mobile-only-actions');
      if (mobileActions) mobileActions.innerHTML = profileHtmlMobile;

      const profileIcon = document.querySelector('.profile-icon');
      const profileDropdown = document.querySelector('.profile-dropdown');
      if (profileIcon && profileDropdown) {
          profileIcon.addEventListener('click', (e) => {
              e.stopPropagation();
              profileDropdown.style.display = profileDropdown.style.display === 'none' ? 'block' : 'none';
          });
          document.addEventListener('click', () => {
              profileDropdown.style.display = 'none';
          });
          profileDropdown.addEventListener('click', (e) => e.stopPropagation());
      }

      const logout = () => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = 'login.html';
      };
      
      const logoutBtn = document.getElementById('logoutBtn');
      if (logoutBtn) logoutBtn.addEventListener('click', logout);
      
      const mobLogoutBtn = document.getElementById('mobLogoutBtn');
      if (mobLogoutBtn) mobLogoutBtn.addEventListener('click', logout);

      fetch(`${API_BASE_URL}/api/user/profile`, {
          headers: { 'Authorization': 'Bearer ' + token }
      }).then(res => {
          const ct = res.headers.get('content-type') || '';
          if (!res.ok || !ct.includes('application/json')) return null;
          return res.json();
      }).then(data => {
          if (data && !data.error) {
              localStorage.setItem('user', JSON.stringify(data));
              const dC = document.getElementById('nav-downloads-count');
              const cC = document.getElementById('nav-contributions-count');
              const mDc = document.getElementById('mob-nav-downloads-count');
              const mCc = document.getElementById('mob-nav-contributions-count');
              if (dC) dC.innerText = data.downloadsCount || 0;
              if (cC) cC.innerText = data.contributionsCount || 0;
              if (mDc) mDc.innerText = data.downloadsCount || 0;
              if (mCc) mCc.innerText = data.contributionsCount || 0;
          }
      }).catch(err => console.error('Profile fetch failed:', err));
  }

  if (window.location.pathname.includes('contribute.html')) {
      window.checkLogin();
  }
  
  // Notice Fetcher
  if (!sessionStorage.getItem('noticeShown')) {
      fetch(`${API_BASE_URL}/api/notices/active`)
        .then(res => {
            const ct = res.headers.get('content-type') || '';
            if (!res.ok || !ct.includes('application/json')) return null;
            return res.json();
        })
        .then(data => {
            if (data && data.message) {
                const noticeHtml = `
                    <div id="siteNoticeModal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.3s ease;">
                        <div class="notice-content" style="background: white; padding: 30px; border-radius: 12px; max-width: 500px; width: 90%; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.2); transform: translateY(-20px); transition: transform 0.3s ease;">
                            <i class="fas fa-bullhorn" style="font-size: 2.5rem; color: var(--primary-color); margin-bottom: 15px;"></i>
                            <h3 style="margin-bottom: 15px;">Important Notice</h3>
                            <p style="color: var(--text-muted); font-size: 1.05rem; line-height: 1.6;">${data.message}</p>
                            <button id="closeNoticeBtn" class="btn btn-primary" style="margin-top: 20px; padding: 10px 30px;">Got it</button>
                        </div>
                    </div>
                `;
                document.body.insertAdjacentHTML('beforeend', noticeHtml);
                
                const modal = document.getElementById('siteNoticeModal');
                const content = modal.querySelector('.notice-content');
                const closeBtn = document.getElementById('closeNoticeBtn');
                
                // Show modal
                setTimeout(() => {
                    modal.style.opacity = '1';
                    content.style.transform = 'translateY(0)';
                    sessionStorage.setItem('noticeShown', 'true');
                }, 500);
                
                const closeModal = () => {
                    modal.style.opacity = '0';
                    content.style.transform = 'translateY(-20px)';
                    setTimeout(() => modal.remove(), 300);
                };
                
                closeBtn.addEventListener('click', closeModal);
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) closeModal();
                });
            }
        }).catch(err => console.log('No notice or server error'));
  }

document.addEventListener('DOMContentLoaded', () => {

  // Department Carousel Logic
  const deptSlides = document.querySelectorAll('.dept-slide');
  if (deptSlides.length > 0) {
      let currentSlide = 0;
      let isAnimating = false;

      const goToSlide = (nextIndex) => {
          if (isAnimating || nextIndex === currentSlide) return;
          isAnimating = true;

          const outgoing = deptSlides[currentSlide];
          const incoming = deptSlides[nextIndex];

          // Snap incoming slide to off-right (no transition) before activating
          incoming.style.transition = 'none';
          incoming.classList.remove('slide-out', 'active');
          // Force reflow so the transition-none takes effect
          incoming.offsetWidth;
          incoming.style.transition = '';

          // Slide current out to the left
          outgoing.classList.add('slide-out');
          outgoing.classList.remove('active');

          // Slide next in from the right
          incoming.classList.add('active');

          currentSlide = nextIndex;

          // Clean up slide-out class after animation finishes.
          // Disable transition first so removing 'slide-out' snaps the slide
          // instantly back to its default off-right position without animating.
          const cleanUp = () => {
              outgoing.style.transition = 'none';
              outgoing.classList.remove('slide-out');
              outgoing.offsetWidth; // force reflow
              outgoing.style.transition = '';
              isAnimating = false;
          };

          // Use transitionend for desktop, but add a timeout fallback
          // because in mobile the outgoing slide becomes display:none
          // immediately, so the transitionend event never fires.
          outgoing.addEventListener('transitionend', cleanUp, { once: true });
          setTimeout(() => {
              if (isAnimating) cleanUp();
          }, 800);
      };

      // Auto-advance every 4 seconds
      setInterval(() => {
          goToSlide((currentSlide + 1) % deptSlides.length);
      }, 4000);
  }
});
