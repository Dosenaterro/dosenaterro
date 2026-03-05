/**
 * PORTFOLIO PREMIUM - MAIN.JS
 * Architecte Digital Full-Stack SaaS
 * 
 * Fonctionnalités:
 * - Loader global animé
 * - Curseur personnalisé
 * - Navigation sticky avec glassmorphism
 * - Intersection Observer pour animations scroll
 * - Compteurs animés
 * - Smooth scroll
 * - Validation formulaire HTMX
 * - Transitions Alpine.js
 */

// ============================================
// INITIALISATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  initLoader();
  initCustomCursor();
  initNavbar();
  initScrollReveal();
  initCounters();
  initSmoothScroll();
  initMobileMenu();
  initFormValidation();
});

// ============================================
// LOADER GLOBAL
// ============================================
function initLoader() {
  const loader = document.querySelector('.page-loader');
  if (!loader) return;

  // Simuler le chargement
  setTimeout(() => {
    loader.classList.add('hidden');
    
    // Déclencher les animations d'entrée après le loader
    setTimeout(() => {
      document.body.classList.add('loaded');
    }, 600);
  }, 1800);
}

// ============================================
// CURSEUR PERSONNALISÉ
// ============================================
function initCustomCursor() {
  // Ne pas activer sur mobile/touch
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const cursor = document.querySelector('.custom-cursor');
  const cursorDot = document.querySelector('.custom-cursor-dot');
  
  if (!cursor || !cursorDot) return;

  let mouseX = 0, mouseY = 0;
  let cursorX = 0, cursorY = 0;
  let dotX = 0, dotY = 0;
  let isActive = true;
  let rafId = null;

  // Suivi de la souris
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!isActive) {
      isActive = true;
      animateCursor();
    }
  }, { passive: true });

  // Animation fluide avec requestAnimationFrame
  function animateCursor() {
    if (!isActive) return;

    // Interpolation pour le grand cercle (plus lent)
    cursorX += (mouseX - cursorX) * 0.15;
    cursorY += (mouseY - cursorY) * 0.15;
    
    // Interpolation pour le point (plus rapide)
    dotX += (mouseX - dotX) * 0.35;
    dotY += (mouseY - dotY) * 0.35;

    cursor.style.left = cursorX + 'px';
    cursor.style.top = cursorY + 'px';
    cursorDot.style.left = dotX + 'px';
    cursorDot.style.top = dotY + 'px';

    rafId = requestAnimationFrame(animateCursor);
  }

  animateCursor();

  // Effet hover sur les éléments interactifs
  const interactiveElements = document.querySelectorAll('a, button, [role="button"], .project-card, .blog-card, .service-card');
  
  interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
  });

  // Pause quand l'onglet n'est pas visible
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      isActive = false;
      if (rafId) cancelAnimationFrame(rafId);
    }
  });
}

// ============================================
// NAVIGATION STICKY
// ============================================
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  let lastScroll = 0;
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const currentScroll = window.pageYOffset;
        
        // Ajouter/retirer la classe scrolled
        if (currentScroll > 50) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

// ============================================
// MENU MOBILE
// ============================================
function initMobileMenu() {
  const toggle = document.querySelector('.navbar-toggle');
  const menu = document.querySelector('.navbar-menu');
  
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    menu.classList.toggle('active');
    
    // Accessibilité
    const isExpanded = toggle.classList.contains('active');
    toggle.setAttribute('aria-expanded', isExpanded);
    menu.setAttribute('aria-hidden', !isExpanded);
  });

  // Fermer le menu au clic sur un lien
  const links = menu.querySelectorAll('.navbar-link');
  links.forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('active');
      menu.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
      menu.setAttribute('aria-hidden', 'true');
    });
  });
}

// ============================================
// ANIMATIONS SCROLL - INTERSECTION OBSERVER
// ============================================
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
  
  if (revealElements.length === 0) return;

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -50px 0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // Optionnel: arrêter d'observer une fois animé
        // observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach(el => observer.observe(el));
}

// ============================================
// COMPTERS ANIMÉS
// ============================================
function initCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  
  if (counters.length === 0) return;

  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.5
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counter = entry.target;
        const target = parseInt(counter.dataset.counter);
        const suffix = counter.dataset.suffix || '';
        const duration = parseInt(counter.dataset.duration) || 2000;
        
        animateCounter(counter, target, suffix, duration);
        observer.unobserve(counter);
      }
    });
  }, observerOptions);

  counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element, target, suffix, duration) {
  const startTime = performance.now();
  const startValue = 0;

  function updateCounter(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing ease-out
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const currentValue = Math.floor(startValue + (target - startValue) * easeOut);
    
    element.textContent = currentValue + suffix;
    
    if (progress < 1) {
      requestAnimationFrame(updateCounter);
    } else {
      element.textContent = target + suffix;
    }
  }

  requestAnimationFrame(updateCounter);
}

// ============================================
// SMOOTH SCROLL
// ============================================
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (!targetElement) return;

      e.preventDefault();
      
      const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 0;
      const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight - 20;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    });
  });
}

// ============================================
// VALIDATION FORMULAIRE
// ============================================
function initFormValidation() {
  const forms = document.querySelectorAll('form[data-validate]');
  
  forms.forEach(form => {
    form.addEventListener('submit', handleFormSubmit);
    
    // Validation en temps réel
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      input.addEventListener('blur', () => validateField(input));
      input.addEventListener('input', () => clearError(input));
    });
  });
}

function validateField(field) {
  const value = field.value.trim();
  const type = field.type;
  const required = field.required;
  let isValid = true;
  let errorMessage = '';

  // Vider les erreurs précédentes
  clearError(field);

  // Validation required
  if (required && !value) {
    isValid = false;
    errorMessage = 'Ce champ est requis';
  }

  // Validation email
  if (isValid && type === 'email' && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      isValid = false;
      errorMessage = 'Veuillez entrer une adresse email valide';
    }
  }

  // Afficher l'erreur si invalide
  if (!isValid) {
    showError(field, errorMessage);
  }

  return isValid;
}

function showError(field, message) {
  field.classList.add('error');
  field.setAttribute('aria-invalid', 'true');
  
  // Créer ou mettre à jour le message d'erreur
  let errorId = field.getAttribute('aria-describedby');
  let errorElement = errorId ? document.getElementById(errorId) : null;
  
  if (!errorElement) {
    errorId = `error-${field.id || Math.random().toString(36).substr(2, 9)}`;
    errorElement = document.createElement('span');
    errorElement.id = errorId;
    errorElement.className = 'form-error';
    errorElement.setAttribute('role', 'alert');
    field.setAttribute('aria-describedby', errorId);
    field.parentNode.appendChild(errorElement);
  }
  
  errorElement.textContent = message;
}

function clearError(field) {
  field.classList.remove('error');
  field.removeAttribute('aria-invalid');
  
  const errorId = field.getAttribute('aria-describedby');
  if (errorId) {
    const errorElement = document.getElementById(errorId);
    if (errorElement && errorElement.classList.contains('form-error')) {
      errorElement.textContent = '';
    }
  }
}

function handleFormSubmit(e) {
  const form = e.target;
  const inputs = form.querySelectorAll('input, textarea, select');
  let isFormValid = true;

  inputs.forEach(input => {
    if (!validateField(input)) {
      isFormValid = false;
    }
  });

  if (!isFormValid) {
    e.preventDefault();
    
    // Focus sur le premier champ en erreur
    const firstError = form.querySelector('.error');
    if (firstError) {
      firstError.focus();
    }
  }
}

// ============================================
// UTILITAIRES HTMX
// ============================================
// Gestion des réponses HTMX pour le formulaire de contact
document.addEventListener('htmx:afterRequest', (e) => {
  const form = e.detail.elt;
  if (!form.matches('form[hx-post]')) return;

  const feedback = form.querySelector('.form-feedback');
  if (!feedback) return;

  if (e.detail.successful) {
    feedback.className = 'form-feedback success';
    feedback.textContent = 'Message envoyé avec succès ! Je vous répondrai dans les plus brefs délais.';
    form.reset();
  } else {
    feedback.className = 'form-feedback error';
    feedback.textContent = 'Une erreur est survenue. Veuillez réessayer ou me contacter directement par email.';
  }
  
  feedback.style.display = 'block';
});

// ============================================
// ANIMATIONS SUPPLÉMENTAIRES
// ============================================

// Parallax subtil pour les éléments décoratifs
function initParallax() {
  const parallaxElements = document.querySelectorAll('[data-parallax]');
  if (parallaxElements.length === 0) return;

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollY = window.pageYOffset;
        
        parallaxElements.forEach(el => {
          const speed = parseFloat(el.dataset.parallax) || 0.1;
          const yPos = scrollY * speed;
          el.style.transform = `translateY(${yPos}px)`;
        });
        
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

// Animation des cartes au survol (tilt effect)
function initTiltEffect() {
  const cards = document.querySelectorAll('.project-card, .service-card');
  
  if (window.matchMedia('(pointer: coarse)').matches) return;

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = (y - centerY) / 20;
      const rotateY = (centerX - x) / 20;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

// Typing effect pour le hero
function initTypingEffect() {
  const element = document.querySelector('[data-typing]');
  if (!element) return;

  const text = element.dataset.typing;
  const speed = parseInt(element.dataset.typingSpeed) || 50;
  let index = 0;

  element.textContent = '';
  
  function type() {
    if (index < text.length) {
      element.textContent += text.charAt(index);
      index++;
      setTimeout(type, speed);
    }
  }

  // Démarrer après le loader
  setTimeout(type, 2000);
}

// ============================================
// INITIALISATION DES EFFETS AVANCÉS
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  // Délai pour laisser le loader finir
  setTimeout(() => {
    initParallax();
    initTiltEffect();
    initTypingEffect();
  }, 2000);
});

// ============================================
// GESTION DES ERREURS
// ============================================
window.addEventListener('error', (e) => {
  console.error('Portfolio Error:', e.error);
});

// Gestion des promesses non catchées
window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled Promise Rejection:', e.reason);
});
