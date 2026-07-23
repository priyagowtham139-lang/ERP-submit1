/* =========================================================
   COREVO — shared interactions
   ========================================================= */
(function(){
  "use strict";

  /* ---------- Sticky header shrink ---------- */
  var header = document.querySelector('.site-header');
  function onScroll(){ if(header) header.classList.toggle('is-scrolled', window.scrollY > 30); }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  /* ---------- Hero background image ---------- */
  var heroBgImg = document.getElementById('heroBgImg');
  if(heroBgImg && heroBgImg.getAttribute('src')){
    heroBgImg.addEventListener('load', function(){ heroBgImg.classList.add('loaded'); });
    if(heroBgImg.complete){ heroBgImg.classList.add('loaded'); }
  }

  /* ---------- Mobile nav (hamburger) ---------- */
  var hamburger = document.querySelector('.hamburger');
  var overlay = document.querySelector('.mobile-nav-overlay');
  var mobileNav = document.querySelector('.mobile-nav');

  function openMobileNav(){
    hamburger && hamburger.classList.add('is-open');
    overlay && overlay.classList.add('is-open');
    mobileNav && mobileNav.classList.add('is-open');
    hamburger && hamburger.setAttribute('aria-expanded','true');
    document.body.style.overflow = 'hidden';
  }
  function closeMobileNav(){
    hamburger && hamburger.classList.remove('is-open');
    overlay && overlay.classList.remove('is-open');
    mobileNav && mobileNav.classList.remove('is-open');
    hamburger && hamburger.setAttribute('aria-expanded','false');
    document.body.style.overflow = '';
  }
  if(hamburger){
    hamburger.addEventListener('click', function(){
      if(hamburger.classList.contains('is-open')){ closeMobileNav(); } else { openMobileNav(); }
    });
  }
  overlay && overlay.addEventListener('click', closeMobileNav);
  var mobileNavClose = document.querySelector('.mobile-nav-close');
  mobileNavClose && mobileNavClose.addEventListener('click', closeMobileNav);
  if(mobileNav){ mobileNav.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', closeMobileNav); }); }
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape') closeMobileNav(); });

  /* ---------- Dashboard sidebar (mobile) ---------- */
  var dashHamBtns = document.querySelectorAll('.dash-hamburger');
  var dashSidebar = document.querySelector('.dash-sidebar');
  var dashOverlay = document.querySelector('.dash-overlay');
  var dashClose = document.querySelector('.dash-sidebar-close');
  function toggleDashSidebar(){
    dashSidebar && dashSidebar.classList.toggle('is-open');
    dashOverlay && dashOverlay.classList.toggle('is-open');
    dashHamBtns.forEach(function(h){ h.classList.toggle('is-open'); });
  }
  dashHamBtns.forEach(function(h){ h.addEventListener('click', toggleDashSidebar); });
  dashOverlay && dashOverlay.addEventListener('click', toggleDashSidebar);
  dashClose && dashClose.addEventListener('click', toggleDashSidebar);

  /* ---------- Active nav link highlight ---------- */
  var here = (location.pathname.split('/').pop() || 'index.html');
  document.querySelectorAll('.main-nav a, .mobile-nav-links a').forEach(function(a){
    var href = a.getAttribute('href');
    if(href === here || (here === '' && href === 'index.html')){ a.classList.add('active'); }
  });

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll('.reveal, .reveal-stagger, .draw, .timeline-step, .bars');
  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){ entry.target.classList.add('in-view'); io.unobserve(entry.target); }
      });
    }, {threshold:0.18, rootMargin:'0px 0px -60px 0px'});
    revealEls.forEach(function(el){ io.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add('in-view'); });
  }

  /* ---------- Video autoplay on scroll ---------- */
  var showcaseVideos = document.querySelectorAll('.media-showcase video');
  if(showcaseVideos.length && 'IntersectionObserver' in window){
    var vio = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){ entry.target.play().catch(function(){}); } else { entry.target.pause(); }
      });
    }, {threshold:0.3});
    showcaseVideos.forEach(function(v){ vio.observe(v); });
  }

  var heroBgVideo = document.querySelector('.page-hero-bg');
  if(heroBgVideo){ heroBgVideo.play().catch(function(){}); }

  /* ---------- Animated counters ---------- */
  var counters = document.querySelectorAll('[data-count]');
  function animateCounter(el){
    var target = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-suffix') || '';
    var dur = 1600, start = null;
    function step(ts){
      if(!start) start = ts;
      var progress = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var val = target * eased;
      el.textContent = (target % 1 !== 0 ? val.toFixed(1) : Math.floor(val)) + suffix;
      if(progress < 1) requestAnimationFrame(step); else el.textContent = target + suffix;
    }
    requestAnimationFrame(step);
  }
  if(counters.length){
    if('IntersectionObserver' in window){
      var cio = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){ if(entry.isIntersecting){ animateCounter(entry.target); cio.unobserve(entry.target); } });
      }, {threshold:0.5});
      counters.forEach(function(el){ cio.observe(el); });
    } else { counters.forEach(animateCounter); }
  }

  /* ---------- Footer accordion (mobile) ---------- */
  document.querySelectorAll('.footer-toggle').forEach(function(btn){
    btn.addEventListener('click', function(){ btn.closest('.footer-col').classList.toggle('open'); });
  });

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.faq-q').forEach(function(btn){
    btn.addEventListener('click', function(){
      var item = btn.closest('.faq-item');
      var wasOpen = item.classList.contains('open');
      item.parentElement.querySelectorAll('.faq-item').forEach(function(i){ i.classList.remove('open'); });
      if(!wasOpen) item.classList.add('open');
    });
  });

  /* ---------- Social icons -> 404 ---------- */
  document.querySelectorAll('.js-social-link').forEach(function(a){
    a.addEventListener('click', function(e){ e.preventDefault(); window.location.href = a.getAttribute('data-target') || '404.html'; });
  });

  /* ---------- Update bag count badge on load ---------- */
  function refreshBagBadge(){
    var badgeEls = document.querySelectorAll('.bag-count');
    if(!badgeEls.length) return;
    var count = 0;
    try{
      var cart = JSON.parse(localStorage.getItem('corevo_cart') || '[]');
      cart.forEach(function(i){ count += i.qty; });
    }catch(e){}
    badgeEls.forEach(function(b){ b.textContent = count; b.style.display = count > 0 ? 'flex' : 'none'; });
  }
  refreshBagBadge();
  window.refreshBagBadge = refreshBagBadge;

  /* =========================================================
     PASSWORD EYE TOGGLE — cross-browser safe, single toggle
     Works whether the field was rendered on load or added later.
     Prevents the double-icon issue seen across browsers by:
       1) Hiding native MS/Edge reveal buttons via CSS (see style.css)
       2) Using one delegated click handler (no duplicate bindings)
       3) Toggling a data-attribute so state survives re-renders
     ========================================================= */
  document.addEventListener('click', function(e){
    var btn = e.target.closest('.password-toggle');
    if(!btn) return;
    var field = btn.closest('.password-field');
    if(!field) return;
    var input = field.querySelector('input');
    if(!input) return;
    var showing = input.getAttribute('type') === 'text';
    input.setAttribute('type', showing ? 'password' : 'text');
    var icon = btn.querySelector('i');
    if(icon){
      icon.classList.toggle('fa-eye', showing);
      icon.classList.toggle('fa-eye-slash', !showing);
    }
    btn.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
  });

})();

/* =========================================================
   HERO SLIDER — autoplay, dots, arrows, swipe, pause on hover
   ========================================================= */
(function(){
  "use strict";
  var slider = document.querySelector('[data-hero-slider]');
  if(!slider) return;

  var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
  var prevBtn = slider.querySelector('.hero-arrow.prev');
  var nextBtn = slider.querySelector('.hero-arrow.next');
  if(!slides.length) return;

  var idx = 0, timer = null, AUTOPLAY_MS = 1000;

  var heroBg = slider.querySelector('.hero-bg');

  function show(i){
    idx = (i + slides.length) % slides.length;
    slides.forEach(function(s, n){ s.classList.toggle('active', n === idx); });
    dots.forEach(function(d, n){ d.classList.toggle('active', n === idx); });
    if(heroBg){
      var bg = slides[idx].getAttribute('data-bg');
      if(bg) heroBg.style.background = 'url(\'' + bg + '\') center/cover no-repeat';
    }
  }
  function next(){ show(idx + 1); }
  function prev(){ show(idx - 1); }
  function restart(){
    if(timer) clearInterval(timer);
    timer = setInterval(next, AUTOPLAY_MS);
  }

  nextBtn && nextBtn.addEventListener('click', function(){ next(); restart(); });
  prevBtn && prevBtn.addEventListener('click', function(){ prev(); restart(); });
  dots.forEach(function(d, n){ d.addEventListener('click', function(){ show(n); restart(); }); });

  slider.addEventListener('mouseenter', function(){ if(timer) clearInterval(timer); });
  slider.addEventListener('mouseleave', restart);

  var touchStartX = null;
  slider.addEventListener('touchstart', function(e){ touchStartX = e.touches[0].clientX; }, {passive:true});
  slider.addEventListener('touchend', function(e){
    if(touchStartX === null) return;
    var dx = e.changedTouches[0].clientX - touchStartX;
    if(Math.abs(dx) > 40){ dx < 0 ? next() : prev(); restart(); }
    touchStartX = null;
  }, {passive:true});

  show(0);
  restart();
})();
