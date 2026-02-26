// =====================
// BOOKINEST - main.js
// =====================

// ── CART (localStorage) ──
let cart = JSON.parse(localStorage.getItem('bookinest_cart') || '[]');

function saveCart() {
  localStorage.setItem('bookinest_cart', JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  document.querySelectorAll('#cart-count').forEach(el => {
    el.textContent = count;
  });
}

function addToCart(product) {
  const existing = cart.find(i => i.id === product.id && i.variant === product.variant);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  saveCart();
  showCartNotification(product.name);
}

function showCartNotification(name) {
  let notif = document.getElementById('cart-notif');
  if (!notif) {
    notif = document.createElement('div');
    notif.id = 'cart-notif';
    notif.style.cssText = `
      position: fixed; top: 84px; right: 24px; z-index: 9999;
      background: #2761B3; color: white; padding: 12px 24px;
      border-radius: 8px; font-weight: 700; font-size: 0.9rem;
      box-shadow: 0 4px 16px rgba(0,0,0,0.2);
      transform: translateY(-20px); opacity: 0;
      transition: all .3s ease;
    `;
    document.body.appendChild(notif);
  }
  notif.textContent = `✓ "${name}" agregado al carrito`;
  setTimeout(() => { notif.style.transform = 'translateY(0)'; notif.style.opacity = '1'; }, 10);
  setTimeout(() => { notif.style.transform = 'translateY(-20px)'; notif.style.opacity = '0'; }, 3000);
}

function removeFromCart(id, variant) {
  cart = cart.filter(i => !(i.id === id && i.variant === variant));
  saveCart();
  renderCart();
}

function changeQty(id, variant, delta) {
  const item = cart.find(i => i.id === id && i.variant === variant);
  if (item) {
    item.qty += delta;
    if (item.qty <= 0) removeFromCart(id, variant);
    else { saveCart(); renderCart(); }
  }
}

// ── SLIDER ──
let currentSlide = 0;
let slideTimer;

function goToSlide(n) {
  currentSlide = n;
  const wrapper = document.getElementById('slidesWrapper');
  if (wrapper) wrapper.style.transform = `translateX(-${n * 100}%)`;
  document.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === n));
  clearInterval(slideTimer);
  startSlider();
}

function startSlider() {
  slideTimer = setInterval(() => {
    const slides = document.querySelectorAll('.slide');
    if (!slides.length) return;
    currentSlide = (currentSlide + 1) % slides.length;
    goToSlide(currentSlide);
  }, 5000);
}

// ── FAQ ──
function toggleFaq(item) {
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(fi => {
    fi.classList.remove('open');
    fi.querySelector('.faq-icon').textContent = '+';
  });
  if (!isOpen) {
    item.classList.add('open');
    item.querySelector('.faq-icon').textContent = '−';
  }
}

// ── SEARCH ──
function toggleSearch() {
  const bar = document.getElementById('search-bar');
  if (bar) {
    bar.classList.toggle('open');
    if (bar.classList.contains('open')) {
      document.getElementById('search-input')?.focus();
    }
  }
}

// ── CART PAGE RENDER ──
function renderCart() {
  const container = document.getElementById('cart-container');
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <p>Tu carrito está vacío.</p>
        <a href="libros.html" class="btn-add-cart" style="display:inline-block;text-decoration:none;">Ver nuestros libros</a>
      </div>
    `;
    return;
  }

  const total = cart.reduce((s, i) => s + (i.price * i.qty), 0);
  const fmt = n => '$ ' + n.toLocaleString('es-AR');

  container.innerHTML = `
    <table class="cart-table">
      <thead>
        <tr>
          <th>Producto</th>
          <th>Precio</th>
          <th>Cantidad</th>
          <th>Subtotal</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        ${cart.map(item => `
          <tr>
            <td>
              <div class="cart-product">
                <img src="${item.image}" alt="${item.name}">
                <div>
                  <strong>${item.name}</strong><br>
                  <small style="color:#999">${item.variant}</small>
                </div>
              </div>
            </td>
            <td>${fmt(item.price)}</td>
            <td>
              <div class="qty-control">
                <button class="qty-btn" onclick="changeQty('${item.id}','${item.variant}',-1)">−</button>
                <input class="qty-input" type="number" value="${item.qty}" min="1" readonly>
                <button class="qty-btn" onclick="changeQty('${item.id}','${item.variant}',1)">+</button>
              </div>
            </td>
            <td>${fmt(item.price * item.qty)}</td>
            <td><button onclick="removeFromCart('${item.id}','${item.variant}')" style="background:none;border:none;cursor:pointer;font-size:1.2rem;color:#ccc">✕</button></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    <div style="display:flex;justify-content:flex-end;">
      <div class="cart-totals">
        <h3>Total del carrito</h3>
        <div class="totals-row">
          <span>Subtotal</span><span>${fmt(total)}</span>
        </div>
        <div class="totals-row">
          <span>Envío</span><span>A calcular</span>
        </div>
        <div class="totals-row total">
          <span>Total</span><span>${fmt(total)}</span>
        </div>
        <a href="checkout.html" class="btn-checkout">Finalizar compra</a>
      </div>
    </div>
  `;
}

// ── PRODUCT PAGE ──
function initProductPage() {
  // Tab switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab)?.classList.add('active');
    });
  });

  // Thumbnail switching
  document.querySelectorAll('.thumb-grid img').forEach(thumb => {
    thumb.addEventListener('click', () => {
      document.querySelectorAll('.thumb-grid img').forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
      const main = document.getElementById('main-product-img');
      if (main) main.src = thumb.src.replace('-80x80', '-scaled').replace('-150x150', '-scaled');
    });
  });
}

// ── ADD TO CART BUTTON ──
function initAddToCart() {
  const btn = document.getElementById('btn-add-cart');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const variant = document.getElementById('product-variant')?.value || 'Libro Físico';
    addToCart({
      id: btn.dataset.id,
      name: btn.dataset.name,
      price: parseInt(btn.dataset.price),
      image: btn.dataset.image,
      variant
    });
  });
}

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
  startSlider();
  renderCart();
  initProductPage();
  initAddToCart();

  // Mobile menu toggle
  const menuToggle = document.getElementById('menu-toggle');
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      document.querySelector('.main-nav')?.classList.toggle('open');
    });
  }
});
