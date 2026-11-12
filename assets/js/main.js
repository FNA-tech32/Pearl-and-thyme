/* assets/js/main.js
   Clean, robust interactions for Pearl&Thyme
   - WhatsApp links
   - Order modal (quantity, order type, extra info)
   - Smooth reveal helpers (simple IntersectionObserver)
   - Hero parallax (gentle)
   - Mobile/nav toggles
   - Dynamic collapsing header (apple-style)
*/

(() => {
  "use strict";

  // ---------- CONFIG ----------
  // Put the full phone (country code + number) here (no plus)
  const PHONE = "919876543210"; // Primary & WhatsApp
  const ALT_PHONE = "919876543211"; // Alternative line
  const WA_BASE = `https://wa.me/${PHONE}`;

  // ---------- UTILITIES ----------
  const clampInt = (v, min = 1) => {
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? Math.max(min, n) : min;
  };

  const debounce = (fn, wait = 100) => {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  };

  // use rAF for scroll throttling
  const rafThrottle = (fn) => {
    let scheduled = false;
    return (...args) => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        fn(...args);
        scheduled = false;
      });
    };
  };

  // ---------- DOM helpers ----------
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from((ctx || document).querySelectorAll(sel));

  // ---------- WhatsApp wiring ----------
  const setWhatsAppLinks = () => {
    // floating WA button
    const floatWA = $("#floatWA");
    if (floatWA) floatWA.setAttribute("href", WA_BASE);

    // any contact bubble / other link with id/selector
    const waContact = $("#whatsappContact");
    if (waContact) waContact.setAttribute("href", WA_BASE);

    // generic links with data-wa (optional)
    $$("[data-wa]").forEach(a => {
      a.setAttribute("href", WA_BASE);
    });
  };

  // ---------- ORDER MODAL ----------
  const setupOrderModal = () => {
    const modal = $("#orderModal");
    const orderTitle = $("#orderDishTitle");
    const qtyInput = $("#orderQty");
    const extraField = $("#extraField");
    const confirmBtn = $("#confirmOrder");
    const cancelBtn = $("#cancelOrder");

    if (!modal || !orderTitle || !qtyInput) return;

    let selectedDish = "";
    let orderType = "dinein"; // default

    const openModal = (dish) => {
      selectedDish = dish || "Item";
      orderTitle.textContent = selectedDish;
      qtyInput.value = 1;
      extraField.innerHTML = ""; // reset
      // set default active type
      $$(".type-btn").forEach(b => b.classList.remove("active"));
      const dineBtn = $$(".type-btn").find(b => b.dataset.type === "dinein");
      if (dineBtn) dineBtn.classList.add("active");
      orderType = "dinein";
      modal.classList.add("active");
      // focus quantity after small delay (ensure modal visible)
      setTimeout(() => qtyInput.focus(), 120);
    };

    const closeModal = () => {
      modal.classList.remove("active");
    };

    // attach to order buttons (they carry data-dish)
    $$(".order-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const dish = btn.dataset.dish || btn.getAttribute("aria-label") || btn.textContent.trim();
        openModal(dish);
      });
    });

    // type buttons
    $$(".type-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        $$(".type-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        orderType = btn.dataset.type || "dinein";

        if (orderType === "dinein") {
          extraField.innerHTML = `
            <label>Table Number</label>
            <input type="text" id="extraInput" placeholder="Enter table number">
          `;
        } else if (orderType === "delivery") {
          extraField.innerHTML = `
            <label>Delivery Address</label>
            <input type="text" id="extraInput" placeholder="Enter delivery address">
          `;
        } else {
          extraField.innerHTML = "";
        }
      });
    });

    // cancel & confirm
    if (cancelBtn) cancelBtn.addEventListener("click", closeModal);

    if (confirmBtn) {
      confirmBtn.addEventListener("click", () => {
        const qty = clampInt(qtyInput.value, 1);
        const extra = $("#extraInput") ? $("#extraInput").value.trim() : "";

        const formattedType = orderType === "dinein" ? "Dine-in"
          : orderType === "delivery" ? "Home Delivery" : "Takeaway";

        let message = `Hello, I would like to order:\n\n`;
        message += `Item: ${selectedDish}\n`;
        message += `Quantity: ${qty}\n`;
        message += `Order Type: ${formattedType}\n`;
        if (extra) message += `Details: ${extra}\n`;

        const waUrl = `${WA_BASE}?text=${encodeURIComponent(message)}`;
        // open new tab to WhatsApp
        window.open(waUrl, "_blank", "noopener,noreferrer");
        closeModal();
      });
    }

    // keyboard and outside click handling
    document.addEventListener("keydown", (ev) => {
      if (ev.key === "Escape" && modal.classList.contains("active")) closeModal();
    });

    modal.addEventListener("click", (ev) => {
      if (ev.target === modal) closeModal();
    });
  };

  // ---------- Scroll reveal (simple) ----------
  const setupReveal = () => {
    if (!("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14 });
    $$(".fade-up").forEach(el => observer.observe(el));
  };

  // ---------- Hero parallax (gentle) ----------
  const setupHeroParallax = () => {
    const heroImg = document.querySelector(".hero-visual img");
    if (!heroImg) return;

    const onScroll = () => {
      const rect = heroImg.getBoundingClientRect();
      const offset = rect.top * 0.05;
      heroImg.style.transform = `translateY(${offset}px) scale(1.02)`;
    };
    window.addEventListener("scroll", debounce(onScroll, 14));
  };

  // ---------- Mobile-specific tweaks ----------
  const enforceMobileLogoRule = () => {
    // when width < 768 add body class to hide page logos (CSS can target .mobile-logo-hidden)
    const MOBILE_CUTOFF = 768;
    const apply = () => {
      if (window.innerWidth < MOBILE_CUTOFF) document.body.classList.add("mobile-logo-hidden");
      else document.body.classList.remove("mobile-logo-hidden");
    };
    apply();
    window.addEventListener("resize", debounce(apply, 220));
  };

  // ---------- Mobile nav toggle ----------
  const setupMobileNavToggle = () => {
    const toggle = $("#mobileToggle");
    const nav = $(".main-nav");
    if (!toggle || !nav) return;
    toggle.addEventListener("click", () => nav.classList.toggle("active"));
  };

  // ---------- Dynamic collapsing header ----------
  const setupCollapsingHeader = () => {
    const header = document.querySelector(".site-header");
    if (!header) return;

    let lastY = window.scrollY || 0;
    let ticking = false;

    const onScroll = () => {
      const current = window.scrollY || 0;

      // small threshold for adding 'scrolled' class
      if (current > 50) header.classList.add("scrolled");
      else header.classList.remove("scrolled");

      // hide on scroll down / show on scroll up
      if (current > lastY && current > 120) {
        header.classList.add("hidden");
      } else {
        header.classList.remove("hidden");
      }

      lastY = current;
      ticking = false;
    };

    window.addEventListener("scroll", () => {
      if (!ticking) {
        requestAnimationFrame(onScroll);
        ticking = true;
      }
    }, { passive: true });
  };

  // ---------- Init ----------
  document.addEventListener("DOMContentLoaded", () => {
    /* =========================
   HERO OFFSET FIX
========================= */

    function adjustHeroOffset() {
      const header = document.getElementById("mainHeader");
      const hero = document.querySelector(".hero");

      if (!header || !hero) return;

      const headerHeight = header.offsetHeight;
      hero.style.marginTop = headerHeight + 20 + "px";
    }

    adjustHeroOffset();
    window.addEventListener("resize", adjustHeroOffset);
    try {
      setWhatsAppLinks();
      setupOrderModal();
      setupReveal();
      setupHeroParallax();
      setupMobileNavToggle();
      setupCollapsingHeader();
      enforceMobileLogoRule();
    } catch (err) {
      // fail gracefully
      // eslint-disable-next-line no-console
      console.error("main.js init error:", err);
    }
  });

  // Expose a tiny API (optional) for debugging in dev console
  window._pearlAndThyme = window._delight = {
    WA_BASE,
    openOrderModal: (dish = "Item") => {
      const btn = document.querySelector('.order-btn');
      if (btn) btn.click(); // best-effort
      else {
        const modal = document.getElementById("orderModal");
        if (modal) modal.classList.add("active");
        const title = document.getElementById("orderDishTitle");
        if (title) title.textContent = dish;
      }
    }
  };

})();
(function () {
    function getBaseWA() {
      const floatWA = document.getElementById('floatWA');
      return floatWA ? floatWA.href : null;
    }

    const reserveBtn = document.getElementById('reserveBtn');
  const rSend = document.getElementById('r_send');
  const offerWA = document.getElementById('offerWA');

  function openWhatsAppWith(text) {
      const base = getBaseWA();
  if (!base || base === '#') {
        try {navigator.clipboard.writeText(text); alert('WhatsApp not configured — reservation text copied to clipboard.'); }
  catch (e) {alert('WhatsApp not configured. Reservation text:\n\n' + text); }
  return;
      }
  const url = base + '?text=' + encodeURIComponent(text);
  window.open(url, '_blank', 'noopener');
    }

  if (reserveBtn) {
    reserveBtn.addEventListener('click', () => {
      const text = 'Hello, I would like to make a reservation.\\n\\nDate/time:\\nGuests:\\nName:\\nPhone:\\nSpecial requests:';
      openWhatsAppWith(text);
    });
    }

  if (rSend) {
    rSend.addEventListener('click', () => {
      const name = document.getElementById('r_name').value.trim();
      const datetime = document.getElementById('r_datetime').value;
      const guests = document.getElementById('r_guests').value || '2';
      let text = 'Reservation request:\\n';
      text += datetime ? ('When: ' + datetime + '\\n') : '';
      text += 'Guests: ' + guests + '\\n';
      if (name) text += 'Name: ' + name + '\\n';
      text += '\\nPlease confirm. Thanks!';
      openWhatsAppWith(text);
    });
    }

  // wire the Offer WA button to a simple order message
  if (offerWA) {
    offerWA.addEventListener('click', (e) => {
      e.preventDefault();
      const text = 'Hi — I want to order the weekend pizza offer (PIZZA15). Please assist.';
      openWhatsAppWith(text);
    });
    }
  })();
