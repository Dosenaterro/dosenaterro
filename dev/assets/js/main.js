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
 * - Validation formulaire
 * - Contact form → Node.js backend
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

  setTimeout(() => {
    loader.classList.add('hidden');
    setTimeout(() => {
      document.body.classList.add('loaded');
    }, 600);
  }, 1800);
}

// ============================================
// CURSEUR PERSONNALISÉ
// ============================================
function initCustomCursor() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const cursor = document.querySelector('.custom-cursor');
  const cursorDot = document.querySelector('.custom-cursor-dot');

  if (!cursor || !cursorDot) return;

  let mouseX = 0, mouseY = 0;
  let cursorX = 0, cursorY = 0;
  let dotX = 0, dotY = 0;
  let isActive = true;
  let rafId = null;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!isActive) {
      isActive = true;
      animateCursor();
    }
  }, { passive: true });

  function animateCursor() {
    if (!isActive) return;

    cursorX += (mouseX - cursorX) * 0.15;
    cursorY += (mouseY - cursorY) * 0.15;
    dotX += (mouseX - dotX) * 0.35;
    dotY += (mouseY - dotY) * 0.35;

    cursor.style.left = cursorX + 'px';
    cursor.style.top = cursorY + 'px';
    cursorDot.style.left = dotX + 'px';
    cursorDot.style.top = dotY + 'px';

    rafId = requestAnimationFrame(animateCursor);
  }

  animateCursor();

  const interactiveElements = document.querySelectorAll(
    'a, button, [role="button"], .project-card, .blog-card, .service-card'
  );
  interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
  });

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

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        if (window.pageYOffset > 50) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
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
    const isExpanded = toggle.classList.toggle('active');
    menu.classList.toggle('active');
    toggle.setAttribute('aria-expanded', isExpanded);
    menu.setAttribute('aria-hidden', !isExpanded);
  });

  menu.querySelectorAll('.navbar-link').forEach(link => {
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
  const revealElements = document.querySelectorAll(
    '.reveal, .reveal-left, .reveal-right, .reveal-scale, .fade-in'
  );
  if (revealElements.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, { root: null, rootMargin: '0px 0px -50px 0px', threshold: 0.1 });

  revealElements.forEach(el => observer.observe(el));
}

// ============================================
// COMPTEURS ANIMÉS
// ============================================
function initCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  if (counters.length === 0) return;

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
  }, { threshold: 0.5 });

  counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element, target, suffix, duration) {
  const startTime = performance.now();

  function updateCounter(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const currentValue = Math.floor(target * easeOut);
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
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (!targetElement) return;

      e.preventDefault();

      const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 0;
      const targetPosition =
        targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight - 20;

      window.scrollTo({ top: targetPosition, behavior: 'smooth' });
    });
  });
}

// ============================================
// VALIDATION FORMULAIRE
// ============================================
function initFormValidation() {
  const forms = document.querySelectorAll('form[data-validate]');

  forms.forEach(form => {
    // Note: contact-form submit is handled by initEmailJS, skip it here
    if (form.id === 'contact-form') return;

    form.addEventListener('submit', handleFormSubmit);

    form.querySelectorAll('input, textarea, select').forEach(input => {
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

  clearError(field);

  if (required && type === 'checkbox' && !field.checked) {
    isValid = false;
    errorMessage = 'Vous devez accepter pour continuer';
  } else if (required && !value) {
    isValid = false;
    errorMessage = 'Ce champ est requis';
  }

  if (isValid && type === 'email' && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      isValid = false;
      errorMessage = 'Veuillez entrer une adresse email valide';
    }
  }

  if (!isValid) showError(field, errorMessage);
  return isValid;
}

function showError(field, message) {
  field.classList.add('error');
  field.setAttribute('aria-invalid', 'true');

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
  let isFormValid = true;

  form.querySelectorAll('input, textarea, select').forEach(input => {
    if (!validateField(input)) isFormValid = false;
  });

  if (!isFormValid) {
    e.preventDefault();
    const firstError = form.querySelector('.error');
    if (firstError) firstError.focus();
  }
}

// ============================================
// ANIMATIONS AVANCÉES (après loader)
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    initParallax();
    initTiltEffect();
    initTypingEffect();
    initEmailJS();
  }, 2000);
});

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
          el.style.transform = `translateY(${scrollY * speed}px)`;
        });
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

function initTiltEffect() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  document.querySelectorAll('.project-card, .service-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rotateX = (y - rect.height / 2) / 20;
      const rotateY = (rect.width / 2 - x) / 20;
      card.style.transform =
        `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

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

  setTimeout(type, 2000);
}

// ============================================
// ENVOI DU FORMULAIRE DE CONTACT
// ============================================
function initEmailJS() {
  const contactForm = document.getElementById('contact-form');
  if (!contactForm) return;

  // Real-time validation on this form too
  contactForm.querySelectorAll('input, textarea, select').forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => clearError(input));
  });

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validate all fields
    let isFormValid = true;
    contactForm.querySelectorAll('input, textarea, select').forEach(input => {
      if (!validateField(input)) isFormValid = false;
    });

    if (!isFormValid) {
      const firstError = contactForm.querySelector('.error');
      if (firstError) firstError.focus();
      return;
    }

    // Loading state
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalHTML = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span>Envoi en cours...</span>';
    submitBtn.disabled = true;

    try {
      // FIX: use querySelector with name attribute instead of form.fieldName
      // to avoid conflicts with element IDs and built-in form properties
      const getValue = (name) => {
        const el = contactForm.querySelector(`[name="${name}"]`);
        return el ? el.value : '';
      };
      const getChecked = (name) => {
        const el = contactForm.querySelector(`[name="${name}"]`);
        return el ? el.checked : false;
      };

      const formData = {
        name: getValue('name'),
        email: getValue('email'),
        project_type: getValue('project_type'),
        budget: getValue('budget'),
        message: getValue('message'),
        privacy: getChecked('privacy'),
      };

      // Determine backend URL — works for both dev and production
      // Always use the deployed Vercel API — works from localhost too
      const backendUrl = window.BACKEND_URL || 'https://dosenaterro.vercel.app';

      const response = await fetch(`${backendUrl}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showFormFeedback(contactForm, 'success', data.message);
        contactForm.reset();
        // Clear any residual error states
        contactForm.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
      } else {
        showFormFeedback(
          contactForm,
          'error',
          data.message || 'Une erreur est survenue. Veuillez réessayer.'
        );
      }
    } catch (error) {
      console.error('Contact form error:', error);
      showFormFeedback(
        contactForm,
        'error',
        'Erreur de connexion au serveur. Vérifiez votre connexion et réessayez.'
      );
    } finally {
      submitBtn.innerHTML = originalHTML;
      submitBtn.disabled = false;
    }
  });
}

function showFormFeedback(form, type, message) {
  // Remove any existing feedback
  form.querySelectorAll('.form-feedback').forEach(el => el.remove());

  const feedback = document.createElement('div');
  feedback.className = `form-feedback ${type}`;
  feedback.setAttribute('role', 'alert');

  // Icon + message
  const icon = type === 'success' ? '✅' : '❌';
  feedback.innerHTML = `<span style="margin-right:0.5rem">${icon}</span>${message}`;

  // Insert at the top of the form (before first child)
  form.insertBefore(feedback, form.firstChild);

  // Smooth scroll to feedback
  feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  // Auto-remove success message after 6 seconds
  if (type === 'success') {
    setTimeout(() => {
      feedback.style.transition = 'opacity 0.4s ease';
      feedback.style.opacity = '0';
      setTimeout(() => feedback.remove(), 400);
    }, 6000);
  }
}

// ============================================
// GESTION DES ERREURS GLOBALES
// ============================================
window.addEventListener('error', (e) => {
  console.error('Portfolio Error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled Promise Rejection:', e.reason);
});