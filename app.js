/* ==========================================================================
   MINDBRIDGE THERAPY & REHABILITATION CENTRE
   Interactive Application Logic & Calculators
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initHeaderScroll();
  initMobileMenu();
  initNavScrollSpy();
  initImpactCalculator();
  initModals();
});

/* --------------------------------------------------------------------------
   Header Scrolled Effect
   -------------------------------------------------------------------------- */
function initHeaderScroll() {
  const header = document.getElementById('mainHeader');
  if (!header) return;

  const onScroll = () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* --------------------------------------------------------------------------
   Mobile Navigation Toggle & Drawer Accessibility
   -------------------------------------------------------------------------- */
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobileToggle');
  const drawer = document.getElementById('mobileDrawer');

  if (!toggleBtn || !drawer) return;

  const toggleDrawer = (open) => {
    const shouldOpen = typeof open === 'boolean' ? open : !drawer.classList.contains('open');
    if (shouldOpen) {
      drawer.classList.add('open');
      drawer.setAttribute('aria-hidden', 'false');
      toggleBtn.setAttribute('aria-expanded', 'true');
      toggleBtn.setAttribute('aria-label', 'Close navigation menu');
    } else {
      drawer.classList.remove('open');
      drawer.setAttribute('aria-hidden', 'true');
      toggleBtn.setAttribute('aria-expanded', 'false');
      toggleBtn.setAttribute('aria-label', 'Open navigation menu');
    }
  };

  toggleBtn.addEventListener('click', () => toggleDrawer());

  // Close when any link or button inside the drawer is clicked
  drawer.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('click', () => {
      toggleDrawer(false);
    });
  });

  // Close drawer if clicking outside
  document.addEventListener('click', (e) => {
    if (drawer.classList.contains('open') && !drawer.contains(e.target) && !toggleBtn.contains(e.target)) {
      toggleDrawer(false);
    }
  });

  // Close drawer on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      toggleDrawer(false);
    }
  });
}

/* --------------------------------------------------------------------------
   Combined Nav ScrollSpy (Desktop Nav, Mobile Nav & Sticky Subnav)
   -------------------------------------------------------------------------- */
function initNavScrollSpy() {
  const desktopNavLinks = document.querySelectorAll('.desktop-nav .nav-item');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-item');
  const subnavLinks = document.querySelectorAll('.subnav-link');

  // Collect unique sections monitored
  const sectionIds = new Set();
  desktopNavLinks.forEach(l => {
    const href = l.getAttribute('href');
    if (href && href.startsWith('#')) sectionIds.add(href.slice(1));
  });
  subnavLinks.forEach(l => {
    const href = l.getAttribute('href');
    if (href && href.startsWith('#')) sectionIds.add(href.slice(1));
  });

  const sections = Array.from(sectionIds).map(id => document.getElementById(id)).filter(Boolean);

  const updateActiveNav = () => {
    const scrollPos = window.scrollY + 160;
    let currentId = '';

    for (let i = 0; i < sections.length; i++) {
      const sec = sections[i];
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = sec.getAttribute('id');
      }
    }

    if (!currentId && window.scrollY < 200) {
      currentId = 'hero';
    }

    // Update Desktop Nav
    desktopNavLinks.forEach(link => {
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Update Mobile Nav
    mobileNavLinks.forEach(link => {
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Update Subnav
    subnavLinks.forEach(link => {
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  };

  window.addEventListener('scroll', updateActiveNav, { passive: true });
  updateActiveNav();
}

/* --------------------------------------------------------------------------
   Interactive Impact Calculator
   -------------------------------------------------------------------------- */
const impactTiers = [
  {
    min: 0,
    max: 2000,
    tierName: "Friend of MindBridge",
    icon: "🌱",
    heading: "Provides Sensory Tactile & Visual Communication Tools",
    text: "At this level, you supply tactile sensory balls, textured grip grips, and laminated visual AAC communication cards used in daily speech therapy.",
    children: "1",
    therapyHours: "3",
    caregiverSessions: "1"
  },
  {
    min: 2001,
    max: 4999,
    tierName: "Adaptive Care Ally",
    icon: "🧩",
    heading: "Funds High-Density Positioning Wedges & Play Aids",
    text: "Your contribution provides specialized foam positioning rolls for children with cerebral palsy, assisting trunk stability and core muscle control.",
    children: "1",
    therapyHours: "6",
    caregiverSessions: "2"
  },
  {
    min: 5000,
    max: 9999,
    tierName: "Champion Anchor (#100for100)",
    icon: "🌟",
    heading: "Equips 1 Child & Family for a Full Launch Quarter",
    text: "At KES 5,000, you are one of our 100 core Champions. You directly outfit therapy mats, adaptive positioning tools, and sponsor caregiver peer circles.",
    children: "1",
    therapyHours: "12",
    caregiverSessions: "4"
  },
  {
    min: 10000,
    max: 24999,
    tierName: "Inclusive Space Builder",
    icon: "🏅",
    heading: "Funds Medical-Grade Therapy Mats & Vestibular Swings",
    text: "Supplies a full 6ft x 4ft medical wipe-clean therapy mat and supports installation of vestibular calming swing hooks.",
    children: "3",
    therapyHours: "24",
    caregiverSessions: "8"
  },
  {
    min: 25000,
    max: 1000000,
    tierName: "Centre Patron & Sustainer",
    icon: "🏆",
    heading: "Major Community Anchor: Outfits Full Therapy Gym Modules",
    text: "Generously equips major sensory therapy apparatus, tactile wall panels, and funds community school teacher training across Embakasi East.",
    children: "8+",
    therapyHours: "60+",
    caregiverSessions: "20+"
  }
];

function initImpactCalculator() {
  const slider = document.getElementById('impactSlider');
  if (!slider) return;

  slider.addEventListener('input', (e) => {
    updateImpactView(parseInt(e.target.value, 10));
  });

  // Initial call
  updateImpactView(5000);
}

function updateImpactView(amount) {
  const displayAmount = document.getElementById('sliderDisplayAmount');
  const donateBtn = document.getElementById('calcDonateBtn');
  const tierName = document.getElementById('calcTierName');
  const icon = document.getElementById('calcIcon');
  const heading = document.getElementById('calcImpactHeading');
  const text = document.getElementById('calcImpactText');
  const metricChildren = document.getElementById('metricChildren');
  const metricHours = document.getElementById('metricTherapyHours');
  const metricCaregiver = document.getElementById('metricCaregiverSessions');

  if (displayAmount) {
    displayAmount.textContent = `KES ${amount.toLocaleString()}`;
  }
  if (donateBtn) {
    donateBtn.innerHTML = `<span>Pledge KES ${amount.toLocaleString()} Now</span> <span class="btn-arrow">&rarr;</span>`;
  }

  // Update preset chip highlights
  const chips = document.querySelectorAll('.preset-chip');
  chips.forEach(chip => {
    const chipText = chip.textContent.replace(/[^0-9]/g, '');
    if (parseInt(chipText, 10) === amount) {
      chip.classList.add('active');
    } else {
      chip.classList.remove('active');
    }
  });

  // Find tier
  const tier = impactTiers.find(t => amount >= t.min && amount <= t.max) || impactTiers[2];

  if (tierName) tierName.textContent = tier.tierName;
  if (icon) icon.textContent = tier.icon;
  if (heading) heading.textContent = tier.heading;
  if (text) text.textContent = tier.text;
  if (metricChildren) metricChildren.textContent = tier.children;
  if (metricHours) metricHours.textContent = tier.therapyHours;
  if (metricCaregiver) metricCaregiver.textContent = tier.caregiverSessions;
}

window.setSliderValue = function(val) {
  const slider = document.getElementById('impactSlider');
  if (slider) {
    slider.value = val;
    updateImpactView(val);
  }
};

/* --------------------------------------------------------------------------
   Partner Share Kit Tabs
   -------------------------------------------------------------------------- */
window.switchShareTab = function(tabName) {
  const allTabs = document.querySelectorAll('.tab-btn');
  const allPanels = document.querySelectorAll('.tab-panel');

  allTabs.forEach(t => t.classList.remove('active'));
  allPanels.forEach(p => p.classList.remove('active'));

  const targetPanel = document.getElementById(`tab-${tabName}`);
  if (targetPanel) {
    targetPanel.classList.add('active');
  }

  // Highlight tab
  const activeBtn = Array.from(allTabs).find(b => {
    const clickHandler = b.getAttribute('onclick') || '';
    return clickHandler.includes(tabName);
  });
  if (activeBtn) {
    activeBtn.classList.add('active');
  }
};

/* --------------------------------------------------------------------------
   FAQ Accordions
   -------------------------------------------------------------------------- */
window.toggleFaq = function(button) {
  const faqItem = button.closest('.faq-item');
  const isActive = faqItem.classList.contains('active');

  // Close other items for neatness
  document.querySelectorAll('.faq-item').forEach(item => {
    item.classList.remove('active');
  });

  if (!isActive) {
    faqItem.classList.add('active');
  }
};

/* --------------------------------------------------------------------------
   Copy to Clipboard Helpers
   -------------------------------------------------------------------------- */
window.copyText = function(elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;

  const text = el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' ? el.value : el.innerText;
  navigator.clipboard.writeText(text).then(() => {
    showToast(`Copied "${text}" to clipboard!`);
  }).catch(() => {
    fallbackCopy(text);
  });
};

window.copyKitText = function(elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;

  const text = el.innerText;
  navigator.clipboard.writeText(text).then(() => {
    showToast("Share copy copied to clipboard! Paste into WhatsApp/X/LinkedIn.");
  }).catch(() => {
    fallbackCopy(text);
  });
};

function fallbackCopy(text) {
  const tempInput = document.createElement('textarea');
  tempInput.value = text;
  document.body.appendChild(tempInput);
  tempInput.select();
  document.execCommand('copy');
  document.body.removeChild(tempInput);
  showToast("Copied to clipboard!");
}

/* --------------------------------------------------------------------------
   Toast Notifications
   -------------------------------------------------------------------------- */
function showToast(message) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <span style="color: #F59E0B; font-weight: bold;">✓</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/* --------------------------------------------------------------------------
   Modals
   -------------------------------------------------------------------------- */
function initModals() {
  const shareBtn1 = document.getElementById('openShareModalBtn');
  const shareBtn2 = document.getElementById('openShareModalBtn2');
  const shareBtnMobile = document.getElementById('mobileShareBtn');

  if (shareBtn1) {
    shareBtn1.addEventListener('click', () => openModal('shareKitModal'));
  }
  if (shareBtn2) {
    shareBtn2.addEventListener('click', () => openModal('shareKitModal'));
  }
  if (shareBtnMobile) {
    shareBtnMobile.addEventListener('click', () => openModal('shareKitModal'));
  }

  // Close modals on clicking backdrop
  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('open');
      }
    });
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.open').forEach(modal => {
        modal.classList.remove('open');
      });
    }
  });
}

window.openModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('open');
  }
};

window.closeModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('open');
  }
};

window.openPledgeModal = function(itemName, unitPrice) {
  const pledgeInput = document.getElementById('pledgeItem');
  if (pledgeInput) {
    pledgeInput.value = `${itemName} (${unitPrice})`;
  }
  openModal('pledgeModal');
};

window.openConfirmModal = function(channelName) {
  const desc = document.getElementById('confirmModalDesc');
  if (desc) {
    desc.textContent = `Please enter your ${channelName} transaction code and email so we can verify and issue your official receipt.`;
  }
  openModal('confirmModal');
};

window.handlePledgeSubmit = async function(e) {
  e.preventDefault();

  const item  = document.getElementById('pledgeItem').value.trim();
  const name  = document.getElementById('pledgeName').value.trim();
  const phone = document.getElementById('pledgePhone').value.trim();
  const email = document.getElementById('pledgeEmail').value.trim();
  const notes = document.getElementById('pledgeNotes').value.trim();

  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending…';

  try {
    const res = await fetch('/api/pledge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item, name, phone, email, notes }),
    });

    const data = await res.json();

    if (res.ok && data.success) {
      closeModal('pledgeModal');
      showToast(`Asante sana, ${name}! Your pledge has been registered. Check ${email} for confirmation — our team will contact you within 24 hours.`);
      e.target.reset();
    } else {
      showToast(`⚠️ ${data.message || 'Something went wrong. Please try again or email info@standout4mentalhealth.org.'}`);
    }
  } catch (err) {
    console.error('[pledge] Network error:', err);
    showToast('⚠️ Could not reach the server. Please check your connection or email info@standout4mentalhealth.org directly.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
};

window.handleConfirmSubmit = async function(e) {
  e.preventDefault();

  const donorName = document.getElementById('donorName').value.trim();
  const amount    = parseInt(document.getElementById('donorAmount').value, 10) || 5000;
  const ref       = document.getElementById('donorRef').value.trim();
  const email     = document.getElementById('donorEmail').value.trim();

  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Confirming…';

  try {
    const res = await fetch('/api/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ donorName, amount, ref, email }),
    });

    const data = await res.json();

    if (res.ok && data.success) {
      closeModal('confirmModal');
      showToast(`Hongera ${donorName}! Your gift of KES ${amount.toLocaleString()} (Ref: ${ref.toUpperCase()}) is confirmed. An official receipt has been sent to ${email}. Welcome to the #100for100 Champions!`);

      // Optimistically update counters on page
      const liveAmountEl = document.getElementById('liveAmountRaised');
      const liveSupportersEl = document.getElementById('liveSupportersCount');

      if (liveAmountEl) {
        const current = parseInt(liveAmountEl.textContent.replace(/[^0-9]/g, ''), 10) || 170000;
        liveAmountEl.textContent = `KES ${(current + amount).toLocaleString()}`;
      }
      if (liveSupportersEl) {
        const current = parseInt(liveSupportersEl.textContent, 10) || 34;
        liveSupportersEl.textContent = `${current + 1}`;
      }

      e.target.reset();
    } else {
      showToast(`⚠️ ${data.message || 'Could not log your contribution. Please email info@standout4mentalhealth.org with your M-PESA reference.'}`);
    }
  } catch (err) {
    console.error('[confirm] Network error:', err);
    showToast('⚠️ Could not reach the server. Please email info@standout4mentalhealth.org with your M-PESA reference.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
};

window.viewFullPartnerKit = function(e) {
  e.preventDefault();
  openModal('shareKitModal');
};
