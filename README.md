# Pearl&Thyme — Modern Indian Cuisine

[![Website](https://img.shields.io/badge/Website-Pearl%26Thyme-C4593A?style=for-the-badge)](index.html)
[![License: MIT](https://img.shields.io/badge/License-MIT-C9A84C?style=for-the-badge)](LICENSE)
[![Vanilla JS](https://img.shields.io/badge/JavaScript-ES6+-2D4A3E?style=for-the-badge&logo=javascript&logoColor=white)](assets/js/main.js)
[![HTML5 & CSS3](https://img.shields.io/badge/Design-Warm%20Editorial%20Luxury-E07B39?style=for-the-badge)](assets/css/style.css)

A bespoke, responsive web experience crafted for **Pearl&Thyme** — an artisanal modern Indian dining destination celebrating farm-fresh ingredients, ancestral recipes, and contemporary culinary craft.

---

## 🍽️ About the Project

**Pearl&Thyme** blends time-honored Indian culinary heritage with a warm editorial luxury design aesthetic. Built with clean, accessible, zero-dependency HTML5, CSS3, and modern JavaScript, this website serves as a high-conversion digital storefront featuring online dish exploration, instant WhatsApp order dispatch, and a streamlined table reservation system.

### Visual Identity & Design Direction: *Warm Editorial Luxury*
- **Aesthetic**: Sun-drenched terracotta warmth, botanical nuances, generous whitespace, and refined typography.
- **Palette**:
  - **Cream / Canvas**: `#FAF6F0` / Warm White `#FFFDF8`
  - **Terracotta**: `#C4593A`
  - **Deep Saffron**: `#E07B39`
  - **Warm Gold**: `#C9A84C`
  - **Forest Green**: `#2D4A3E`
  - **Charcoal**: `#1C1C1C`
- **Typography**:
  - *Cormorant Garamond* — Refined display serif for headings and hero moments
  - *Playfair Display* — Editorial italic accents
  - *DM Sans* — Legible, geometric body text

---

## 📞 Brand & Contact Information

| Detail | Primary | Alternative / Secondary |
| :--- | :--- | :--- |
| **Brand Name** | **Pearl&Thyme** | Pearl&Thyme Restro |
| **Phone Number** | `+91 98765 43210` | `+91 98765 43211` |
| **WhatsApp Direct** | `+91 98765 43210` ([wa.me/919876543210](https://wa.me/919876543210)) | Available 24/7 for queries |
| **Email Address** | `hello@pearlandthyme.com` | `reservations@pearlandthyme.com` |
| **Address** | 42 Botanical Boulevard, Indiranagar | Near Heritage Park, Bangalore - 560038 |
| **Operating Hours** | Daily: 8:00 AM – 11:00 PM | Kitchen orders accepted until 10:30 PM |
| **Services** | Dine-In · Takeaway · Home Delivery | Private Dining & Corporate Catering |

---

## ✨ Key Features

### 1. Interactive Homepage (`index.html`)
- **Editorial Hero Section**: Full-screen imagery with parallax scrolling effect, dynamic guest review counters, and clear call-to-actions.
- **Category Filter & Signature Showcase**: Filter through Starters, Mains, Biryanis, Pizzas, and Desserts with dietary indicators (Vegetarian / Non-Vegetarian) and bestseller badges.
- **Direct-to-WhatsApp Ordering**: Quick "Add" and "Order Now" modal with quantity incrementer, order type toggle (Dine-in, Takeaway, Home Delivery), and instant WhatsApp message dispatch.
- **Our Story & Executive Chef Spotlight**: Engaging brand narrative and credentials featuring Executive Chef Rajesh Kumar (18+ years of culinary craft across Mumbai, Delhi, and London).
- **Interactive Reservation Form**: Table booking module with guest count, date/time picker, notes/occasion input, and instant WhatsApp confirmation (15-minute response).
- **Comprehensive Contact Section**: Dual-column layout featuring primary call, alternative line, direct WhatsApp link, email, hours, and map location card with valet and parking details.

### 2. Full Culinary Menu & Cart Experience (`menu.html`)
- **Complete Menu Catalog**: Categorized sections (Starters, Tandoor, Mains, Biryani, Naan & Breads, Desserts, Beverages).
- **Live Shopping Cart & Drawer**: Persistent cart stored via `localStorage`, quantity increment/decrement controls, real-time total recalculation in Indian Rupees (`₹`), and cart item removal.
- **WhatsApp Checkout Dispatch**: Formats user orders into clean, ready-to-send WhatsApp messages with itemized lists, pricing, order type, and address details.

### 3. Responsive & Lightweight Architecture
- **Zero Third-Party JS Frameworks**: Ultra-fast initial paint without heavy React/Vue/Angular runtimes.
- **Mobile-First Responsive Navigation**: Dynamic collapsing header with blur backdrop filter, mobile navigation drawer, and thumb-friendly touch targets.
- **Progressive Web App (PWA) Ready**: Configured `site.webmanifest` and optimized high-resolution touch icons.

---

## 📁 Repository Structure

```text
Pearl-and-Thyme/
├── index.html                   # Main landing page (Hero, Story, Menu, Chef, Reserve, Contact)
├── menu.html                    # Complete catalog page with live Cart & Drawer checkout
├── README.md                    # Project documentation & configuration guide
├── LICENSE                      # MIT Open Source License
├── assets/
│   ├── css/
│   │   └── style.css            # Base stylesheet & CSS design tokens
│   ├── js/
│   │   ├── main.js              # Interactions, modal order behavior & WhatsApp helpers
│   │   └── menu.js              # Cart management, drawer UI & checkout formatting
│   ├── images/
│   │   ├── hero.jpg             # High-res dining photography
│   │   └── icons/               # Call and WhatsApp vector icons
│   ├── site.webmanifest         # PWA web manifest file
│   ├── favicon.ico              # Multi-resolution favicon
│   ├── favicon-16x16.png        # 16x16 favicon
│   ├── favicon-32x32.png        # 32x32 favicon
│   ├── apple-touch-icon.png     # iOS home screen icon
│   ├── android-chrome-192x192.png # Android home screen icon
│   └── android-chrome-512x512.png # High-res PWA splash icon
└── .well-known/
    └── discord                  # Domain verification record
```

---

## ⚙️ Configuration & Customization Guide

### 1. Updating Phone Numbers & WhatsApp Links
To update the contact numbers across the website:
- **Homepage (`index.html`)**:
  In the inline `<script>` at the bottom of the page:
  ```javascript
  const PHONE = '919876543210'; // WhatsApp & Primary line (Country code + 10 digits, no '+')
  const ALT_PHONE = '919876543211'; // Alternative contact line
  ```
- **Menu Page (`menu.html`)**:
  In the inline `<script>` at the bottom:
  ```javascript
  var PHONE = '919876543210'; // WhatsApp order receiver
  var ALT_PHONE = '919876543211'; // Alternative helpline
  ```
- **Script Assets (`assets/js/main.js`)**:
  ```javascript
  const PHONE = "919876543210";
  const ALT_PHONE = "919876543211";
  ```

### 2. Modifying Menu Items & Pricing
In both `index.html` and `menu.html`, dishes are structured using semantic `data-*` attributes:
```html
<div class="dcard" data-f="main">
  <div class="dcard-img">
    <img src="path/to/dish.jpg" alt="Dish Name" loading="lazy" />
    <div class="dcard-price">₹299</div>
    <div class="veg-dot veg"></div> <!-- 'veg' or 'nv' for non-veg -->
  </div>
  <div class="dcard-body">
    <div class="dcard-cat">Main Course · Chef's Signature</div>
    <div class="dcard-name">Butter Chicken</div>
    <div class="dcard-desc">Rich tomato-cream gravy, slow-cooked for 6 hours.</div>
    <div class="dcard-foot">
      <button class="dcard-add" data-id="m1" data-name="Butter Chicken" data-price="299">+</button>
    </div>
  </div>
</div>
```

### 3. Customizing Color Themes
Theme variables are defined in the `:root` pseudo-class in both HTML files and `assets/css/style.css`:
```css
:root {
  --cream: #FAF6F0;
  --warm-white: #FFFDF8;
  --paper: #F3EDE3;
  --terra: #C4593A;
  --saffron: #E07B39;
  --gold: #C9A84C;
  --forest: #2D4A3E;
  --charcoal: #1C1C1C;
}
```

---

## 🚀 Running the Project Locally

No build tools, bundlers, or package installations are required!

### Option 1: Direct File Launch
Simply double-click `index.html` or drag it into any modern web browser (Google Chrome, Mozilla Firefox, Safari, Microsoft Edge).

### Option 2: Local HTTP Server (Recommended)
Using Node.js:
```bash
npx serve .
```

Or using Python 3:
```bash
python -m http.server 8000
```
Then navigate to `http://localhost:8000` in your browser.

---

## 🌐 Deployment

### GitHub Pages
1. Push this repository to GitHub.
2. In your repository settings, go to **Pages** (under Code and automation).
3. Set **Source** to `Deploy from a branch` and select `main` / `root`.
4. Your site will be live at `https://<username>.github.io/<repo-name>/`.

### Netlify / Vercel
1. Connect your GitHub repository to Netlify or Vercel.
2. Set Build Command to empty (static files).
3. Set Publish directory to `.`.
4. Deploy with one click.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) — free to use and customize for commercial and personal hospitality projects.

