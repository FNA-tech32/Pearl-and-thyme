/* assets/js/menu.js
   Cart + Order logic for menu page.
   Requires: main.js sets floating WA link (#floatWA) to the correct wa.me URL.
*/

(function () {
    'use strict';

    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from((ctx || document).querySelectorAll(sel));

    // CART STORAGE helpers
    const CART_KEY = 'dr_cart_v1';
    const loadCart = () => {
        try {
            const raw = localStorage.getItem(CART_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    };
    const saveCart = (cart) => {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
    };

    // find floating WA base from main.js
    const getWABase = () => {
        const el = document.getElementById('floatWA');
        if (!el) return null;
        const href = el.getAttribute('href') || '';
        return href && href !== '#' ? href : null;
    };

    // format helpers
    const formatRupee = n => '₹' + n;

    // update cart UI
    const updateCartBar = () => {
        const cart = loadCart();
        const count = cart.reduce((s, it) => s + (it.qty || 0), 0);
        const total = cart.reduce((s, it) => s + (Number(it.price) * (it.qty || 1)), 0);
        const bar = $('#cartBar');
        if (!bar) return;
        if (count === 0) {
            bar.classList.add('hidden');
        } else {
            bar.classList.remove('hidden');
            $('#cartCount').textContent = `${count} item${count > 1 ? 's' : ''}`;
            $('#cartTotal').textContent = formatRupee(total);
            $('#drawerCount') && ($('#drawerCount').textContent = `${count} item${count > 1 ? 's' : ''}`);
            $('#drawerTotal') && ($('#drawerTotal').textContent = `Total: ${formatRupee(total)}`);
        }
    };

    // add item to cart (merges by id)
    const addToCart = (item) => {
        const cart = loadCart();
        const existing = cart.find(i => i.id === item.id);
        if (existing) existing.qty = (existing.qty || 1) + (item.qty || 1);
        else cart.push(Object.assign({ qty: 1 }, item));
        saveCart(cart);
        updateCartBar();
    };

    // remove item
    const removeFromCart = (id) => {
        const cart = loadCart().filter(i => i.id !== id);
        saveCart(cart);
        renderCartDrawer();
        updateCartBar();
    };

    const setQty = (id, qty) => {
        qty = Math.max(1, parseInt(qty) || 1);
        const cart = loadCart();
        const it = cart.find(i => i.id === id);
        if (it) it.qty = qty;
        saveCart(cart);
        renderCartDrawer();
        updateCartBar();
    };

    // render cart drawer
    const renderCartDrawer = () => {
        const container = $('#cartItems');
        if (!container) return;

        const cart = loadCart();

        if (cart.length === 0) {
            container.innerHTML = '<p class="muted">Your cart is empty.</p>';

            // 🔥 RESET DRAWER TOTALS
            const drawerCount = $('#drawerCount');
            const drawerTotal = $('#drawerTotal');

            if (drawerCount) drawerCount.textContent = '0 items';
            if (drawerTotal) drawerTotal.textContent = 'Total: ₹0';

            return;
        }

        container.innerHTML = '';

        cart.forEach(item => {
            const row = document.createElement('div');
            row.className = 'drawer-item';
            row.innerHTML = `
            <div class="drawer-left">
                <img src="${item.img || 'assets/images/dish1.jpg'}" alt="${escapeHtml(item.name)}" />
            </div>
            <div class="drawer-mid">
                <strong>${escapeHtml(item.name)}</strong>
                <div class="muted">Price: ₹${item.price}</div>
            </div>
            <div class="drawer-right">
                <div class="qty-controls">
                    <button class="qty-decrease" data-id="${item.id}">−</button>
                    <input type="number" min="1" class="qty-input" data-id="${item.id}" value="${item.qty}" />
                    <button class="qty-increase" data-id="${item.id}">+</button>
                </div>
                <button class="btn remove-item" data-id="${item.id}">Remove</button>
            </div>
        `;
            container.appendChild(row);
        });

        // 🔥 Recalculate totals properly
        const count = cart.reduce((s, it) => s + it.qty, 0);
        const total = cart.reduce((s, it) => s + (it.price * it.qty), 0);

        const drawerCount = $('#drawerCount');
        const drawerTotal = $('#drawerTotal');

        if (drawerCount) drawerCount.textContent = `${count} item${count > 1 ? 's' : ''}`;
        if (drawerTotal) drawerTotal.textContent = `Total: ₹${total}`;

        attachDrawerEvents();
    };

    // checkout: compose message and open WA
    const checkoutToWhatsApp = () => {
        const cart = loadCart();
        if (!cart || cart.length === 0) {
            alert('Cart is empty.');
            return;
        }
        const total = cart.reduce((s, it) => s + (Number(it.price) * (it.qty || 1)), 0);
        let message = `New order from website:\n\n`;
        cart.forEach((it, idx) => {
            message += `${idx + 1}. ${it.name} — ${it.qty} × ₹${it.price} = ₹${Number(it.price) * it.qty}\n`;
        });
        message += `\nTotal: ₹${total}\n\nPlease confirm.`;
        const base = getWABase();
        if (!base) {
            try {
                navigator.clipboard.writeText(message);
            } catch (err) {
                console.warn('Clipboard failed');
            }

            // silently clear cart
            localStorage.setItem('dr_cart_v1', JSON.stringify([]));
            renderCartDrawer();
            updateCartBar();
            closeCheckoutModal();

            return;
        }
        const url = `${base}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank', 'noopener');
    };

    // utility: escape for safe alt/text
    function escapeHtml(s) {
        return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }

    // wire page actions
    function initCatalog() {
        // Order now buttons -> open existing order modal with qty default 1
        $$('.order-now').forEach(btn => btn.addEventListener('click', e => {
            const card = e.currentTarget.closest('.dish-card');
            if (!card) return;
            // reuse modal if available
            const dishName = card.dataset.name || card.querySelector('.card-body h4')?.textContent || 'Item';
            // if your main.js exposes _delight.openOrderModal use it, else fallback to simple modal
            if ((window._pearlAndThyme || window._delight) && typeof ((window._pearlAndThyme || window._delight).openOrderModal) === 'function') {
                (window._pearlAndThyme || window._delight).openOrderModal(dishName);
            } else {
                // populate local order modal if present
                const orderModal = $('#orderModal');
                const title = $('#orderDishTitle');
                const qty = $('#orderQty');
                if (orderModal && title && qty) {
                    title.textContent = dishName;
                    qty.value = 1;
                    orderModal.classList.add('active');
                } else {
                    // fallback: open wa with single item
                    const base = getWABase();
                    const text = `Hello, I'd like to order 1 x ${dishName}. Please confirm.`;
                    if (!base) {
                        try { navigator.clipboard.writeText(text); alert('WhatsApp not configured — text copied to clipboard.'); }
                        catch (err) { alert(text); }
                        return;
                    }
                    window.open(base + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
                }
            }
        }));

        // Add to cart
        $$('.add-to-cart').forEach(btn => btn.addEventListener('click', e => {
            const card = e.currentTarget.closest('.dish-card');
            if (!card) return;
            const item = {
                id: card.dataset.id,
                name: card.dataset.name,
                price: Number(card.dataset.price || 0),
                img: card.querySelector('img') ? card.querySelector('img').getAttribute('src') : ''
            };
            addToCart(item);
            // small visual feedback
            e.currentTarget.textContent = 'Added';
            setTimeout(() => e.currentTarget.textContent = 'Add to cart', 900);
        }));

        // cart bar view / checkout
        $('#viewCartBtn') && $('#viewCartBtn').addEventListener('click', () => {
            renderCartDrawer();
            $('#cartDrawer').classList.remove('hidden');
        });
        $('#closeCart') && $('#closeCart').addEventListener('click', () => $('#cartDrawer').classList.add('hidden'));
        $('#clearCart') && $('#clearCart').addEventListener('click', () => {
            if (!confirm('Clear cart?')) return;
            saveCart([]);
            renderCartDrawer();
            updateCartBar();
        });
        $('#drawerCheckout') && $('#drawerCheckout').addEventListener('click', () => {
            checkoutToWhatsApp();
        });
        $('#checkoutBtn') && $('#checkoutBtn').addEventListener('click', () => checkoutToWhatsApp());

        // initial render
        updateCartBar();
        renderCartDrawer();
    }

    // init on DOM ready
    document.addEventListener('DOMContentLoaded', () => {
        initCatalog();
    });

})();
/* Checkout confirmation modal behavior — append to menu.js */
(function () {
    'use strict';

    const $ = (s, ctx = document) => (ctx || document).querySelector(s);
    const $$ = (s, ctx = document) => Array.from((ctx || document).querySelectorAll(s));

    const checkoutModal = $('#checkoutModal');
    const extraInputs = $('#extraInputs');
    const checkoutTypes = $$('.checkout-type');
    const cancelBtn = $('#checkoutCancel');
    const confirmBtn = $('#checkoutConfirm');

    // default
    let selectedType = 'pick_up';

    function showCheckoutModal() {
        // pre-select default type pick_up
        selectedType = 'pick_up';
        updateTypeUI();
        // clear inputs
        $('#customerName').value = '';
        $('#customerPhone').value = '';
        $('#customerNote').value = '';
        checkoutModal.classList.remove('hidden');
        // accessibility focus
        setTimeout(() => confirmBtn.focus(), 120);
    }

    function closeCheckoutModal() {
        checkoutModal.classList.add('hidden');
    }

    function updateTypeUI() {
        // highlight btns
        checkoutTypes.forEach(b => b.classList.toggle('active', b.dataset.type === selectedType));
        // render extra inputs
        renderExtraInputs(selectedType);
    }

    function renderExtraInputs(type) {
        extraInputs.innerHTML = '';
        if (type === 'home_delivery') {
            extraInputs.innerHTML = `
        <div class="field-row">
          <label>Delivery address <small style="color:var(--accent); font-weight:600">(required)</small></label>
          <input id="inputAddress" placeholder="Full delivery address with landmark" />
        </div>
      `;
        } else if (type === 'pick_up') {
            extraInputs.innerHTML = `
        <div class="field-row">
          <label>Pick-up time (optional)</label>
          <input id="inputPickupTime" placeholder="E.g. 19:15 or 'ASAP'" />
        </div>
      `;
        } else if (type === 'dine_in') {
            extraInputs.innerHTML = `
        <div class="field-row">
          <label>Already seated?</label>
          <select id="inputSeated">
            <option value="no">No — will arrive soon</option>
            <option value="yes">Yes — already seated</option>
          </select>
        </div>
        <div class="field-row" id="tableRow" style="display:none;">
          <label>Table number (if seated)</label>
          <input id="inputTable" placeholder="Enter table number" />
        </div>
      `;
            // attach change handler to show table number
            const sel = $('#inputSeated');
            if (sel) {
                sel.addEventListener('change', () => {
                    const tr = $('#tableRow');
                    if (!tr) return;
                    tr.style.display = sel.value === 'yes' ? 'block' : 'none';
                });
            }
        }
    }

    // wire type buttons
    checkoutTypes.forEach(btn => {
        btn.addEventListener('click', () => {
            selectedType = btn.dataset.type;
            updateTypeUI();
        });
    });

    // open modal when clicking checkout buttons
    const openCheckoutButtons = [$('#checkoutBtn'), $('#drawerCheckout')].filter(Boolean);
    openCheckoutButtons.forEach(b => {
        b.addEventListener('click', (e) => {
            e.preventDefault();
            // ensure cart not empty
            const cart = (function () {
                try { return JSON.parse(localStorage.getItem('dr_cart_v1') || '[]'); } catch (e) { return []; }
            })();
            if (!cart || cart.length === 0) {
                alert('Your cart is empty.');
                return;
            }
            showCheckoutModal();
        });
    });

    // Cancel
    if (cancelBtn) cancelBtn.addEventListener('click', closeCheckoutModal);

    // close on outside click or ESC
    if (checkoutModal) {
        checkoutModal.addEventListener('click', (ev) => {
            if (ev.target === checkoutModal) closeCheckoutModal();
        });
    }
    document.addEventListener('keydown', (ev) => {
        if (ev.key === 'Escape' && checkoutModal && !checkoutModal.classList.contains('hidden')) closeCheckoutModal();
    });

    // Confirm -> validate, compose message and send to WA
    if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
            // validation + gather inputs
            const name = $('#customerName') ? $('#customerName').value.trim() : '';
            const phone = $('#customerPhone') ? $('#customerPhone').value.trim() : '';
            const note = $('#customerNote') ? $('#customerNote').value.trim() : '';

            let extraText = '';
            if (selectedType === 'home_delivery') {
                const address = $('#inputAddress') ? $('#inputAddress').value.trim() : '';
                if (!address) {
                    alert('Please enter delivery address.');
                    $('#inputAddress').focus();
                    return;
                }
                extraText += `Delivery address: ${address}\n`;
            } else if (selectedType === 'pick_up') {
                const t = $('#inputPickupTime') ? $('#inputPickupTime').value.trim() : '';
                if (t) extraText += `Pick-up time: ${t}\n`;
            } else if (selectedType === 'dine_in') {
                const seated = $('#inputSeated') ? $('#inputSeated').value : 'no';
                if (seated === 'yes') {
                    const tbl = $('#inputTable') ? $('#inputTable').value.trim() : '';
                    if (tbl) extraText += `Seated — Table: ${tbl}\n`;
                    else extraText += `Seated — Table: not provided\n`;
                } else {
                    extraText += `Dine-in — will arrive shortly\n`;
                }
            }

            // build order message using existing cart
            let cart = [];
            try { cart = JSON.parse(localStorage.getItem('dr_cart_v1') || '[]'); } catch (e) { cart = []; }
            if (!cart || cart.length === 0) {
                alert('Cart is empty.');
                closeCheckoutModal();
                return;
            }

            const total = cart.reduce((s, it) => s + (Number(it.price) * (it.qty || 1)), 0);
            let message = `New order from website:\n\n`;
            if (name) message += `Customer: ${name}\n`;
            if (phone) message += `Phone: ${phone}\n`;
            message += `Order type: ${selectedType.replace('_', ' ')}\n`;
            message += extraText ? `${extraText}\n` : '\n';
            message += `Items:\n`;
            cart.forEach((it, idx) => {
                message += `${idx + 1}. ${it.name} — ${it.qty || 1} × ₹${it.price} = ₹${Number(it.price) * (it.qty || 1)}\n`;
            });
            message += `\nTotal: ₹${total}\n\n`;
            if (note) message += `Instructions: ${note}\n\n`;
            message += `Please confirm.`;

            // open WA or copy to clipboard
            const base = (function () {
                const el = document.getElementById('floatWA');
                if (!el) return null;
                const href = el.getAttribute('href') || '';
                return href && href !== '#' ? href : null;
            })();

            if (!base) {
                // fallback: copy to clipboard and alert
                try {
                    navigator.clipboard.writeText(message);
                    alert('WhatsApp not configured — order text copied to clipboard. Paste into WhatsApp to send.');
                    // optionally clear cart after copy
                    localStorage.setItem('dr_cart_v1', JSON.stringify([]));
                    renderCartDrawer();
                    updateCartBar();
                    closeCheckoutModal();
                } catch (err) {
                    alert('WhatsApp not configured and clipboard failed. Order text:\n\n' + message);
                }
                return;
            }

            // open WA in new tab
            const url = `${base}?text=${encodeURIComponent(message)}`;
            window.open(url, '_blank', 'noopener');

            // clear cart (best-effort) and update UI
            localStorage.setItem('dr_cart_v1', JSON.stringify([]));
            renderCartDrawer();
            updateCartBar();

            closeCheckoutModal();
        });
    }

})();