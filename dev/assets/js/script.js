// block F12 keypress and other dev tool shortcuts
window.addEventListener('keydown', function (e) {
  // Block F12
  if (e.key === 'F12') {
    e.preventDefault();
    return false;
  }
  // Block Ctrl+Shift+I (Inspect)
  if (e.ctrlKey && e.shiftKey && e.key === 'I') {
    e.preventDefault();
    return false;
  }
  // Block Ctrl+Shift+C (Inspect element)
  if (e.ctrlKey && e.shiftKey && e.key === 'C') {
    e.preventDefault();
    return false;
  }
  // Block Ctrl+Shift+J (Console)
  if (e.ctrlKey && e.shiftKey && e.key === 'J') {
    e.preventDefault();
    return false;
  }
  // Block Ctrl+U (View source)
  if (e.ctrlKey && e.key === 'u') {
    e.preventDefault();
    return false;
  }
});

// disable right-click context menu
document.addEventListener('contextmenu', function (e) {
  e.preventDefault();
});
function setBlur(shouldBlur) {
  document.body.classList.toggle('popup-blur', shouldBlur);
}

// create popup overlay/iframe
function openPopup(url) {
  // if an existing popup is open, don't open another
  if (document.getElementById('external-popup-overlay')) {
    return;
  }

  setBlur(true);

  const overlay = document.createElement('div');
  overlay.id = 'external-popup-overlay';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = 'rgba(0,0,0,0.7)';
  overlay.style.display = 'flex';
  overlay.style.justifyContent = 'center';
  overlay.style.alignItems = 'center';
  overlay.style.zIndex = '9999';

  // container for iframe and button
  const popupContainer = document.createElement('div');
  popupContainer.style.position = 'relative';
  // adjust width for mobile devices
  const isMobile = window.innerWidth <= 768;
  popupContainer.style.width = isMobile ? '95%' : '80%';
  popupContainer.style.maxHeight = '90vh';
  popupContainer.style.height = '90vh';

  const iframe = document.createElement('iframe');
  iframe.src = url;
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.border = 'none';
  iframe.style.borderRadius = '4px';
  iframe.style.boxShadow = '0 2px 12px rgba(0,0,0,0.3)';
  iframe.style.overflow = 'auto';
  iframe.style.display = 'flex';
  iframe.style.justifyContent = 'center';
  iframe.style.alignItems = 'center';
  iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-popups allow-forms');

  // create fallback button
  const fallbackBtn = document.createElement('button');
  fallbackBtn.textContent = 'Open externally';
  fallbackBtn.style.position = 'absolute';
  fallbackBtn.style.top = '10px';
  fallbackBtn.style.right = '10px';
  fallbackBtn.style.padding = '10px 16px';
  fallbackBtn.style.backgroundColor = '#06A77D';
  fallbackBtn.style.color = 'white';
  fallbackBtn.style.border = 'none';
  fallbackBtn.style.borderRadius = '4px';
  fallbackBtn.style.cursor = 'pointer';
  fallbackBtn.style.fontSize = '14px';
  fallbackBtn.style.fontWeight = '600';
  fallbackBtn.style.zIndex = '10000';
  fallbackBtn.style.opacity = '0';
  fallbackBtn.style.transition = 'opacity 0.3s ease';
  fallbackBtn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';

  fallbackBtn.addEventListener('click', function() {
    closePopup();
    window.open(url, '_blank');
  });

  // show button on hover
  fallbackBtn.addEventListener('mouseenter', function() {
    fallbackBtn.style.opacity = '1';
  });

  // create close button
  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'Fermer';
  closeBtn.style.position = 'absolute';
  closeBtn.style.top = '10px';
  closeBtn.style.left = '10px';
  closeBtn.style.padding = '10px 16px';
  closeBtn.style.backgroundColor = '#052F5F';
  closeBtn.style.color = 'white';
  closeBtn.style.border = 'none';
  closeBtn.style.borderRadius = '4px';
  closeBtn.style.cursor = 'pointer';
  closeBtn.style.fontSize = '14px';
  closeBtn.style.fontWeight = '600';
  closeBtn.style.zIndex = '10000';
  closeBtn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';

  closeBtn.addEventListener('click', function() {
    closePopup();
  });

  popupContainer.appendChild(iframe);
  popupContainer.appendChild(fallbackBtn);
  popupContainer.appendChild(closeBtn);
  overlay.appendChild(popupContainer);

  // close when clicking outside
  overlay.addEventListener('click', function (event) {
    if (event.target === overlay) {
      closePopup();
    }
  });

  document.body.appendChild(overlay);

  // show button after 3 seconds
  let showTimeout = setTimeout(function() {
    fallbackBtn.style.opacity = '1';
  }, 3000);

  // hide button after 5 seconds
  let hideTimeout = setTimeout(function() {
    fallbackBtn.style.opacity = '0';
  }, 5000);

  // show button on hover
  popupContainer.addEventListener('mouseenter', function() {
    if (fallbackBtn.style.opacity !== '1') {
      fallbackBtn.style.opacity = '1';
    }
  });

  fallbackBtn.addEventListener('click', function() {
    closePopup();
    window.open(url, '_blank');
  });
}

function closePopup() {
  const overlay = document.getElementById('external-popup-overlay');
  if (overlay) {
    overlay.parentNode.removeChild(overlay);
  }
  setBlur(false);
}

// intercept external link clicks
function isExternalLink(anchor) {
  try {
    const href = anchor.href;
    if (!href) return false;
    const linkUrl = new URL(href, location.href);
    return linkUrl.origin !== location.origin;
  } catch (err) {
    return false;
  }
}

document.addEventListener('click', function (e) {
  const target = e.target.closest('a');
  if (!target) return;
  // only open links with class 'to-externe' externally
  if (target.classList.contains('to-externe') && isExternalLink(target)) {
    e.preventDefault();
    openPopup(target.href);
  }
});

// optional: remove blur when escape pressed or popup loses focus
window.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    closePopup();
  }
});
