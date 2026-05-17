const API_URL = (typeof CONFIG !== 'undefined' && CONFIG.API_URL) ? CONFIG.API_URL : 'http://localhost:5000/api';

// State
const state = {
  cart: JSON.parse(localStorage.getItem('wildAuraCart')) || [],
  wishlist: [],
  user: JSON.parse(localStorage.getItem('wildAuraUser')) || null,
  token: localStorage.getItem('wildAuraToken') || null
};

// DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initLoadingScreen();
  initNavbar();
  initScrollReveal();
  initTestimonialSlider();

  const page = document.body.dataset.page;
  if (page === 'home') initHomePage();
  if (page === 'shop') initShopPage();
  if (page === 'product') initProductPage();
  if (page === 'about') initAboutPage();
  if (page === 'ingredients') initIngredientsPage();
  if (page === 'contact') initContactPage();
  if (page === 'auth') initAuthPage();
  if (page === 'cart') initCartPage();
  if (page === 'checkout') initCheckoutPage();
  if (page === 'dashboard') initDashboardPage();
  if (page === 'admin') initAdminPage();

  initNewsletterForm();
  initFAQ();
  updateCartBadge();
  updateAuthUI();
});

// Loading Screen
function initLoadingScreen() {
  const screen = document.querySelector('.loading-screen');
  if (!screen) return;
  const fill = screen.querySelector('.loading-bar-fill');
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 15;
    if (progress >= 100) { progress = 100; clearInterval(interval); }
    if (fill) fill.style.width = progress + '%';
  }, 200);
  setTimeout(() => { screen.classList.add('hidden'); }, 1500);
}

// Navbar
function initNavbar() {
  const header = document.querySelector('.navbar');
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const current = window.scrollY;
    if (current > 80) { header.classList.add('scrolled'); }
    else { header.classList.remove('scrolled'); }
    lastScroll = current;
  });

  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      navLinks.classList.toggle('active');
      document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
    });
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }
}

// Scroll Reveal
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// Testimonial Slider
function initTestimonialSlider() {
  const track = document.querySelector('.testimonials-track');
  const dots = document.querySelectorAll('.testimonial-dot');
  if (!track || !dots.length) return;
  let current = 0;
  const update = () => {
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  };
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => { current = i; update(); });
  });
  setInterval(() => { current = (current + 1) % dots.length; update(); }, 5000);
}

// Toast
function showToast(message, type = 'success') {
  const container = document.querySelector('.toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const icons = { success: '✓', error: '✗', info: 'ℹ' };
  toast.innerHTML = `<span>${icons[type] || 'ℹ'}</span> ${message}`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 3500);
}

// API Helper
async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (state.token) headers.Authorization = `Bearer ${state.token}`;
  try {
    const res = await fetch(`${API_URL}${path}`, { ...options, headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
  } catch (error) {
    showToast(error.message, 'error');
    throw error;
  }
}

// Cart
function getCart() { return state.cart; }
function saveCart() { localStorage.setItem('wildAuraCart', JSON.stringify(state.cart)); updateCartBadge(); }

function addToCart(product, quantity = 1) {
  const existing = state.cart.find(item => item.product === product._id || item.product === product.id);
  if (existing) {
    existing.quantity += quantity;
  } else {
    state.cart.push({
      product: product._id || product.id,
      name: product.name,
      image: product.images?.[0] || product.image || '',
      price: product.price,
      quantity
    });
  }
  saveCart();
  showToast(`${product.name} added to cart`, 'success');
}

function updateCartQuantity(productId, qty) {
  const item = state.cart.find(i => i.product === productId);
  if (item) { item.quantity = qty; if (item.quantity <= 0) removeFromCart(productId); else saveCart(); }
}

function removeFromCart(productId) {
  state.cart = state.cart.filter(i => i.product !== productId);
  saveCart();
  if (document.body.dataset.page === 'cart') renderCartPage();
}

function getCartTotal() {
  return state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function updateCartBadge() {
  const badges = document.querySelectorAll('.cart-badge');
  const count = state.cart.reduce((s, i) => s + i.quantity, 0);
  badges.forEach(b => { b.textContent = count; b.style.display = count > 0 ? 'flex' : 'none'; });
}

function updateAuthUI() {
  const loginLinks = document.querySelectorAll('.nav-login');
  const userLinks = document.querySelectorAll('.nav-user');
  const adminLinks = document.querySelectorAll('.nav-admin');
  const dashboardLinks = document.querySelectorAll('.nav-dashboard');
  if (state.user) {
    loginLinks.forEach(l => l.style.display = 'none');
    userLinks.forEach(l => { l.style.display = 'flex'; l.querySelector('span').textContent = state.user.name; });
    dashboardLinks.forEach(l => l.style.display = 'block');
    if (state.user.role === 'admin') adminLinks.forEach(l => l.style.display = 'block');
    document.body.classList.add('user-logged-in');
    if (state.user.role === 'admin') document.body.classList.add('admin-logged-in');
  } else {
    loginLinks.forEach(l => l.style.display = 'flex');
    userLinks.forEach(l => l.style.display = 'none');
    dashboardLinks.forEach(l => l.style.display = 'none');
    adminLinks.forEach(l => l.style.display = 'none');
  }
}

function logout() {
  state.user = null;
  state.token = null;
  localStorage.removeItem('wildAuraUser');
  localStorage.removeItem('wildAuraToken');
  updateAuthUI();
  showToast('Logged out successfully', 'info');
  window.location.href = '/';
}

// ===== HOME PAGE =====
function initHomePage() {
  loadFeaturedProducts();
  loadTestimonials();
}

async function loadFeaturedProducts() {
  try {
    const data = await api('/products/featured');
    const container = document.querySelector('.featured-grid');
    if (!container) return;
    container.innerHTML = data.slice(0, 4).map(p => createProductCardHTML(p)).join('');
    attachProductCardEvents(container);
  } catch (e) { console.log('Could not load featured products'); }
}

function createProductCardHTML(p) {
  const img = p.images?.[0] || 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400';
  const stars = Math.round(p.ratings || 0);
  const emptyStars = 5 - stars;
  const badge = p.isNewArrival ? '<span class="product-card-badge badge-new">New</span>'
    : p.comparePrice > p.price ? '<span class="product-card-badge badge-sale">Sale</span>'
    : p.isBestSeller ? '<span class="product-card-badge badge-bestseller">Best Seller</span>' : '';
  const compare = p.comparePrice > p.price ? `<span class="compare-price">KES ${p.comparePrice.toLocaleString()}</span>` : '';
  return `
    <div class="product-card" data-id="${p._id}" data-slug="${p.slug}">
      ${badge}
      <div class="product-card-image">
        <img src="${img}" alt="${p.name}" loading="lazy">
        <div class="product-card-actions">
          <button class="add-wishlist" data-id="${p._id}" title="Add to wishlist"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg></button>
          <button class="quick-add" data-id="${p._id}" title="Quick add"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.6a2 2 0 0 0 2-1.6L23 6H6"/></svg></button>
        </div>
      </div>
      <div class="product-card-body">
        <div class="product-card-category">${p.category?.replace('-', ' ') || 'Skincare'}</div>
        <h3 class="product-card-title">${p.name}</h3>
        <div class="product-card-rating">
          <span class="stars">${'★'.repeat(stars)}${'☆'.repeat(emptyStars)}</span>
          <span class="rating-text">(${p.numReviews || 0})</span>
        </div>
        <div class="product-card-price">
          <span class="current-price">KES ${p.price.toLocaleString()}</span>
          ${compare}
        </div>
      </div>
    </div>`;
}

function attachProductCardEvents(container) {
  container.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('button')) return;
      const slug = card.dataset.slug;
      if (slug) window.location.href = `/pages/product.html?slug=${slug}`;
    });
  });
  container.querySelectorAll('.quick-add').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      try {
        const data = await api(`/products/id/${btn.dataset.id}`);
        addToCart(data, 1);
      } catch (e) { /* handled */ }
    });
  });
}

function loadTestimonials() {
  const testimonials = [
    { name: 'Amina W.', location: 'Nairobi, Kenya', text: 'I have struggled with hyperpigmentation for years. After three weeks of using Wild Aura Radiance Oil, my skin started to glow in a way I did not think was possible. This is not just skincare — this is transformation.', rating: 5, avatar: '' },
    { name: 'Grace M.', location: 'Lagos, Nigeria', text: 'The Ritual Set changed everything about my skincare routine. The way the oils layer together is magic. My husband noticed before I did. He said, "You\'re glowing." I said, "I know."', rating: 5, avatar: '' },
    { name: 'Zara K.', location: 'London, UK', text: 'I have tried every luxury brand from Paris to Seoul. Wild Aura is different. The ingredients are intentional, the results are real, and the packaging is so beautiful I display it on my dresser.', rating: 5, avatar: '' },
    { name: 'Chioma O.', location: 'Abuja, Nigeria', text: 'Turmeric has always been part of my culture. To see it formulated in such a luxurious, effective product makes me so proud. This brand understands African beauty at a molecular level.', rating: 5, avatar: '' }
  ];
  const track = document.querySelector('.testimonials-track');
  const nav = document.querySelector('.testimonial-nav');
  if (!track) return;
  track.innerHTML = testimonials.map(t => `
    <div class="testimonial-card">
      <div class="testimonial-inner">
        <div class="testimonial-quote">"</div>
        <div class="testimonial-stars">${'★'.repeat(t.rating)}</div>
        <p class="testimonial-text">"${t.text}"</p>
        <div class="testimonial-author">
          <div class="testimonial-avatar" style="background:var(--gold);color:var(--white);display:flex;align-items:center;justify-content:center;font-weight:700;">${t.name[0]}</div>
          <div>
            <div class="testimonial-name">${t.name}</div>
            <div class="testimonial-title">${t.location}</div>
          </div>
        </div>
      </div>
    </div>
  `).join('');
  if (nav) {
    nav.innerHTML = testimonials.map((_, i) => `<button class="testimonial-dot ${i === 0 ? 'active' : ''}"></button>`).join('');
    initTestimonialSlider();
  }
}

// ===== SHOP PAGE =====
async function initShopPage() {
  const params = new URLSearchParams(window.location.search);
  const category = params.get('category') || '';
  const search = params.get('search') || '';
  const sort = params.get('sort') || '';

  if (category) document.getElementById('categoryFilter')?.value && (document.getElementById('categoryFilter').value = category);
  if (search) document.getElementById('searchInput')?.value && (document.getElementById('searchInput').value = search);
  if (sort) document.getElementById('sortFilter')?.value && (document.getElementById('sortFilter').value = sort);

  await loadProducts();

  document.getElementById('categoryFilter')?.addEventListener('change', loadProducts);
  document.getElementById('sortFilter')?.addEventListener('change', loadProducts);
  document.getElementById('searchBtn')?.addEventListener('click', loadProducts);
  document.getElementById('searchInput')?.addEventListener('keyup', (e) => { if (e.key === 'Enter') loadProducts(); });
}

async function loadProducts() {
  const container = document.getElementById('productGrid');
  const count = document.getElementById('productCount');
  if (!container) return;
  const category = document.getElementById('categoryFilter')?.value || '';
  const sort = document.getElementById('sortFilter')?.value || '';
  const search = document.getElementById('searchInput')?.value || '';
  const params = new URLSearchParams({ limit: '50', ...(category && { category }), ...(search && { search }), ...(sort && { sort }) });
  try {
    const data = await api(`/products?${params}`);
    container.innerHTML = data.products.length
      ? data.products.map(p => createProductCardHTML(p)).join('')
      : '<div style="grid-column:1/-1;text-align:center;padding:4rem;color:var(--text-muted)"><p>No products found. Try adjusting your filters.</p></div>';
    if (count) count.textContent = `${data.total} products`;
    attachProductCardEvents(container);
  } catch (e) { /* handled */ }
}

// ===== PRODUCT DETAIL =====
async function initProductPage() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');
  if (!slug) return;
  try {
    const product = await api(`/products/${slug}`);
    renderProductDetail(product);
    renderProductReviews(product);
    loadRelatedProducts(product.category, product._id);
  } catch (e) { showToast('Product not found', 'error'); }
}

function renderProductDetail(p) {
  document.title = `${p.name} - Wild Aura`;
  const container = document.getElementById('productDetail');
  if (!container) return;
  const img = p.images?.[0] || '';
  const compare = p.comparePrice > p.price ? `<span class="product-detail-compare">KES ${p.comparePrice.toLocaleString()}</span>` : '';
  container.innerHTML = `
    <div class="product-detail-grid">
      <div class="product-detail-gallery">
        <div class="product-detail-main-image">
          <img src="${img}" alt="${p.name}" id="mainImage">
        </div>
        <div class="product-detail-thumbs">
          ${(p.images || [img]).map((im, i) => `<div class="product-detail-thumb ${i === 0 ? 'active' : ''}" data-img="${im}"><img src="${im}" alt=""></div>`).join('')}
        </div>
      </div>
      <div class="product-detail-info">
        <div class="product-card-category">${p.category?.replace('-', ' ') || 'Skincare'}</div>
        <h1>${p.name}</h1>
        <div class="product-detail-price">KES ${p.price.toLocaleString()} ${compare}</div>
        <div class="product-card-rating" style="margin:0.5rem 0">
          <span class="stars">${'★'.repeat(Math.round(p.ratings || 0))}${'☆'.repeat(5 - Math.round(p.ratings || 0))}</span>
          <span class="rating-text">${p.ratings?.toFixed(1) || '0.0'} (${p.numReviews || 0} reviews)</span>
        </div>
        <p class="product-detail-description">${p.description}</p>
        <div class="product-detail-attributes">
          <div class="attribute"><span class="attribute-label">Size</span><span class="attribute-value">${p.size || '30ml'}</span></div>
          <div class="attribute"><span class="attribute-label">Skin Type</span><span class="attribute-value">${p.usageFor || 'All skin types'}</span></div>
          <div class="attribute"><span class="attribute-label">Stock</span><span class="attribute-value">${p.stock > 0 ? 'In Stock' : 'Out of Stock'}</span></div>
        </div>
        <div class="product-detail-qty">
          <span style="font-size:0.85rem;font-weight:600;">Quantity:</span>
          <div class="quantity-control">
            <button onclick="updateQtyDisplay(-1)">−</button>
            <span id="qtyDisplay">1</span>
            <button onclick="updateQtyDisplay(1)">+</button>
          </div>
        </div>
        <div class="product-detail-actions">
          <button class="btn btn-primary btn-lg" onclick="addFromDetail('${p._id}')">Add to Cart — KES ${p.price.toLocaleString()}</button>
          <button class="btn btn-secondary btn-lg" onclick="addToWishlist('${p._id}')"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg> Wishlist</button>
        </div>
        <div style="margin-top:2rem;padding:1rem;background:var(--cream);border-radius:var(--radius-sm)">
          <p style="font-size:0.8rem;margin:0;color:var(--text-muted)">Free shipping on orders over KES 5,000 • 30-day satisfaction guarantee</p>
        </div>
      </div>
    </div>
    <div style="margin-top:4rem">
      <h3>Key Ingredients</h3>
      <div style="display:flex;flex-wrap:wrap;gap:0.8rem;margin-top:1rem">
        ${(p.ingredients || []).map(i => `<span style="padding:0.5rem 1.2rem;background:var(--cream);border-radius:50px;font-size:0.85rem;color:var(--green-deep);font-weight:500">${i}</span>`).join('')}
      </div>
      ${p.howToUse ? `
        <h3 style="margin-top:2rem">How to Use</h3>
        <p style="margin-top:0.5rem">${p.howToUse}</p>
      ` : ''}
      ${p.benefits?.length ? `
        <h3 style="margin-top:2rem">Benefits</h3>
        <ul style="margin-top:0.5rem;display:grid;grid-template-columns:1fr 1fr;gap:0.5rem">
          ${p.benefits.map(b => `<li style="display:flex;align-items:center;gap:0.5rem;font-size:0.9rem;color:var(--text-muted)"><span style="color:var(--gold)">✓</span> ${b}</li>`).join('')}
        </ul>
      ` : ''}
    </div>
    <div style="margin-top:4rem">
      <h3>Customer Reviews</h3>
      <div id="reviewsContainer" style="margin-top:1.5rem"></div>
      <div id="reviewForm" style="margin-top:2rem;padding:2rem;background:var(--cream);border-radius:var(--radius-md)">
        <h4 style="font-family:var(--font-sans);font-size:1rem;margin-bottom:1rem">Write a Review</h4>
        <div class="form-group"><label>Rating</label><div id="ratingStars" style="font-size:1.5rem;color:#ddd;cursor:pointer">★★★★★</div></div>
        <div class="form-group"><label>Title</label><input type="text" id="reviewTitle" placeholder="Summary of your review"></div>
        <div class="form-group"><label>Review</label><textarea id="reviewComment" rows="4" placeholder="Share your experience..."></textarea></div>
        <button class="btn btn-primary" onclick="submitReview('${getProductId()}')">Submit Review</button>
      </div>
    </div>
  `;
  let selectedRating = 0;
  const stars = document.getElementById('ratingStars');
  if (stars) {
    const setStars = (r) => { selectedRating = r; stars.textContent = '★'.repeat(r) + '☆'.repeat(5 - r); stars.style.color = 'var(--gold)'; };
    stars.addEventListener('click', (e) => { const rect = stars.getBoundingClientRect(); const x = e.clientX - rect.left; const star = Math.ceil((x / rect.width) * 5); setStars(star); });
    stars.addEventListener('mouseover', (e) => { const rect = stars.getBoundingClientRect(); const x = e.clientX - rect.left; const star = Math.ceil((x / rect.width) * 5); stars.textContent = '★'.repeat(star) + '☆'.repeat(5 - star); stars.style.color = 'var(--gold)'; });
    stars.addEventListener('mouseleave', () => { stars.textContent = '★'.repeat(selectedRating) + '☆'.repeat(5 - selectedRating); stars.style.color = selectedRating ? 'var(--gold)' : '#ddd'; });
  }
  window.submitReview = async (productId) => {
    const title = document.getElementById('reviewTitle')?.value;
    const comment = document.getElementById('reviewComment')?.value;
    if (!selectedRating || !title || !comment) { showToast('Please fill all fields', 'error'); return; }
    try {
      await api(`/products/${productId}/reviews`, { method: 'POST', body: JSON.stringify({ rating: selectedRating, title, comment }) });
      showToast('Review submitted!', 'success');
      setTimeout(() => location.reload(), 1000);
    } catch (e) { /* handled */ }
  };
  // Thumbnail switching
  document.querySelectorAll('.product-detail-thumb').forEach(el => {
    el.addEventListener('click', () => {
      document.querySelectorAll('.product-detail-thumb').forEach(t => t.classList.remove('active'));
      el.classList.add('active');
      document.getElementById('mainImage').src = el.dataset.img;
    });
  });
  window.addFromDetail = (id) => {
    const qty = parseInt(document.getElementById('qtyDisplay')?.textContent || '1');
    addToCart({ _id: id, name: p.name, images: p.images, price: p.price }, qty);
  };
}

function updateQtyDisplay(delta) {
  const el = document.getElementById('qtyDisplay');
  if (!el) return;
  let val = parseInt(el.textContent) + delta;
  if (val < 1) val = 1;
  if (val > 99) val = 99;
  el.textContent = val;
}

function renderProductReviews(product) {
  const container = document.getElementById('reviewsContainer');
  if (!container || !product.reviews?.length) {
    if (container) container.innerHTML = '<p style="color:var(--text-muted)">No reviews yet. Be the first!</p>';
    return;
  }
  container.innerHTML = product.reviews.map(r => `
    <div style="padding:1.5rem 0;border-bottom:1px solid var(--cream)">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem">
        <strong style="font-size:0.95rem">${r.name}</strong>
        <span class="stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
      </div>
      <strong style="font-size:0.9rem;color:var(--charcoal)">${r.title}</strong>
      <p style="font-size:0.85rem;margin:0.3rem 0 0;color:var(--text-muted)">${r.comment}</p>
      <span style="font-size:0.7rem;color:var(--text-light)">${new Date(r.createdAt).toLocaleDateString()}</span>
    </div>
  `).join('');
}

let _currentProductId = '';
function getProductId() { return _currentProductId; }

async function loadRelatedProducts(category, excludeId) {
  try {
    const data = await api(`/products?category=${category}&limit=4`);
    const related = data.products.filter(p => p._id !== excludeId).slice(0, 4);
    const container = document.getElementById('relatedProducts');
    if (!container || !related.length) return;
    container.innerHTML = related.map(p => createProductCardHTML(p)).join('');
    attachProductCardEvents(container);
  } catch (e) { /* handled */ }
}

// ===== WISHLIST =====
async function addToWishlist(productId) {
  if (!state.token) { showToast('Please log in to use wishlist', 'info'); window.location.href = '/pages/auth.html'; return; }
  try { await api('/wishlist', { method: 'POST', body: JSON.stringify({ productId }) }); showToast('Added to wishlist!', 'success'); }
  catch (e) { /* handled */ }
}

// ===== CART PAGE =====
function initCartPage() {
  renderCartPage();
}

function renderCartPage() {
  const container = document.getElementById('cartItems');
  const summary = document.getElementById('cartSummary');
  const empty = document.getElementById('cartEmpty');
  if (!container) return;
  if (!state.cart.length) {
    if (container) container.style.display = 'none';
    if (summary) summary.style.display = 'none';
    if (empty) empty.style.display = 'block';
    return;
  }
  if (empty) empty.style.display = 'none';
  if (container) container.style.display = 'flex';
  if (summary) summary.style.display = 'block';
  container.innerHTML = state.cart.map((item, idx) => `
    <div class="cart-item">
      <div class="cart-item-image"><img src="${item.image}" alt="${item.name}"></div>
      <div class="cart-item-details">
        <h4 class="cart-item-name">${item.name}</h4>
        <div class="cart-item-price">KES ${(item.price * item.quantity).toLocaleString()}</div>
        <div class="cart-item-actions">
          <div class="quantity-control">
            <button onclick="updateCartQuantity('${item.product}', ${item.quantity - 1}); renderCartPage();">−</button>
            <span>${item.quantity}</span>
            <button onclick="updateCartQuantity('${item.product}', ${item.quantity + 1}); renderCartPage();">+</button>
          </div>
          <span class="cart-item-remove" onclick="removeFromCart('${item.product}')">Remove</span>
        </div>
      </div>
      <div style="text-align:right">
        <div style="font-family:var(--font-serif);font-size:1.2rem;font-weight:700;color:var(--green-deep)">KES ${(item.price * item.quantity).toLocaleString()}</div>
      </div>
    </div>
  `).join('');
  if (summary) {
    const subtotal = getCartTotal();
    const shipping = subtotal > 5000 ? 0 : 350;
    const tax = subtotal * 0.16;
    const total = subtotal + shipping + tax;
    summary.innerHTML = `
      <h3>Order Summary</h3>
      <div class="summary-row"><span>Subtotal</span><span>KES ${subtotal.toLocaleString()}</span></div>
      <div class="summary-row"><span>Shipping</span><span>${shipping === 0 ? 'Free' : 'KES ' + shipping.toLocaleString()}</span></div>
      <div class="summary-row"><span>Tax (16%)</span><span>KES ${Math.round(tax).toLocaleString()}</span></div>
      <div class="summary-row total"><span>Total</span><span>KES ${Math.round(total).toLocaleString()}</span></div>
      <div class="coupon-input">
        <input type="text" id="couponInput" placeholder="Coupon code">
        <button class="btn btn-secondary btn-sm" onclick="applyCoupon()">Apply</button>
      </div>
      <div id="couponResult"></div>
      <button class="btn btn-primary" style="width:100%;margin-top:1rem" onclick="proceedToCheckout()">Proceed to Checkout</button>
    `;
  }
}

async function applyCoupon() {
  const input = document.getElementById('couponInput');
  const result = document.getElementById('couponResult');
  if (!input?.value) return;
  try {
    const data = await api('/coupons/validate', { method: 'POST', body: JSON.stringify({ code: input.value, orderAmount: getCartTotal() }) });
    if (data.valid) {
      result.innerHTML = `<div class="coupon-applied">✓ ${input.value.toUpperCase()} applied — KES ${Math.round(data.discount).toLocaleString()} off <button onclick="this.parentElement.remove();document.getElementById('couponInput').value=''">×</button></div>`;
      showToast(`Coupon applied: KES ${Math.round(data.discount).toLocaleString()} off!`, 'success');
    }
  } catch (e) { result.innerHTML = `<p style="color:var(--red);font-size:0.8rem;margin-top:0.5rem">${e.message}</p>`; }
}

function proceedToCheckout() {
  if (!state.token) { showToast('Please log in to checkout', 'info'); return; }
  window.location.href = '/pages/checkout.html';
}

// ===== CHECKOUT =====
function initCheckoutPage() {
  if (!state.token) { window.location.href = '/pages/auth.html'; return; }
  renderCheckoutSummary();
  document.getElementById('checkoutForm')?.addEventListener('submit', placeOrder);
}

function renderCheckoutSummary() {
  const container = document.getElementById('checkoutSummary');
  if (!container) return;
  const subtotal = getCartTotal();
  const shipping = subtotal > 5000 ? 0 : 350;
  const tax = subtotal * 0.16;
  const total = subtotal + shipping + tax;
  container.innerHTML = `
    <h3 style="font-size:1.1rem;margin-bottom:1rem">Order Summary (${state.cart.reduce((s,i) => s + i.quantity, 0)} items)</h3>
    ${state.cart.slice(0, 3).map(i => `
      <div style="display:flex;justify-content:space-between;padding:0.5rem 0;font-size:0.85rem">
        <span>${i.name} × ${i.quantity}</span>
        <span>KES ${(i.price * i.quantity).toLocaleString()}</span>
      </div>
    `).join('')}
    ${state.cart.length > 3 ? `<p style="font-size:0.8rem;color:var(--text-muted);text-align:center">+${state.cart.length - 3} more items</p>` : ''}
    <div style="border-top:1px solid var(--cream);margin-top:0.5rem;padding-top:0.5rem">
      <div class="summary-row"><span>Subtotal</span><span>KES ${subtotal.toLocaleString()}</span></div>
      <div class="summary-row"><span>Shipping</span><span>${shipping === 0 ? 'Free' : 'KES ' + shipping.toLocaleString()}</span></div>
      <div class="summary-row"><span>Tax</span><span>KES ${Math.round(tax).toLocaleString()}</span></div>
      <div class="summary-row total"><span>Total</span><span>KES ${Math.round(total).toLocaleString()}</span></div>
    </div>
  `;
}

async function placeOrder(e) {
  e.preventDefault();
  const form = e.target;
  const data = new FormData(form);
  const orderData = {
    orderItems: state.cart,
    shippingAddress: {
      street: data.get('street'),
      city: data.get('city'),
      state: data.get('state'),
      zip: data.get('zip'),
      country: data.get('country')
    },
    paymentMethod: data.get('paymentMethod') || 'mpesa',
    mpesaPhone: data.get('mpesaPhone') || ''
  };
  try {
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Processing...';
    const order = await api('/orders', { method: 'POST', body: JSON.stringify(orderData) });
    state.cart = [];
    saveCart();
    if (orderData.paymentMethod === 'mpesa' && order.mpesaResponseCode === '0') {
      showToast('STK push sent! Check your phone to complete payment.', 'success');
      const poll = setInterval(async () => {
        try {
          const status = await api(`/orders/${order._id}/mpesa/status`);
          if (status.status === 'paid') {
            clearInterval(poll);
            showToast('Payment received! Order confirmed.', 'success');
            setTimeout(() => { window.location.href = `/pages/dashboard.html?order=${order._id}`; }, 1500);
          }
        } catch (e) { /* handled */ }
      }, 3000);
      setTimeout(() => clearInterval(poll), 120000);
    } else {
      showToast('Order placed successfully!', 'success');
      setTimeout(() => { window.location.href = `/pages/dashboard.html?order=${order._id}`; }, 1000);
    }
    btn.disabled = false;
    btn.textContent = originalText;
  } catch (e) {
    const btn = form.querySelector('button[type="submit"]');
    if (btn) { btn.disabled = false; btn.textContent = 'Place Order'; }
  }
}

// ===== AUTH =====
function initAuthPage() {
  const form = document.getElementById('authForm');
  const toggle = document.getElementById('authToggle');
  if (!form) return;
  let isLogin = window.location.hash === '#register' ? false : true;
  const updateForm = () => {
    form.querySelector('h2').textContent = isLogin ? 'Welcome Back' : 'Create Account';
    form.querySelector('.subtitle').textContent = isLogin ? 'Sign in to continue your glow journey' : 'Begin your transformation';
    document.getElementById('authName').style.display = isLogin ? 'none' : 'block';
    form.querySelector('button[type="submit"]').textContent = isLogin ? 'Sign In' : 'Create Account';
    if (toggle) toggle.innerHTML = isLogin ? `Don't have an account? <a href="#">Register</a>` : `Already have an account? <a href="#">Sign In</a>`;
    document.getElementById('authMode').value = isLogin ? 'login' : 'register';
  };
  updateForm();
  toggle?.addEventListener('click', (e) => { e.preventDefault(); isLogin = !isLogin; updateForm(); });
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const mode = form.querySelector('#authMode').value;
    const name = form.querySelector('#authName input')?.value || '';
    const email = form.querySelector('#authEmail').value;
    const password = form.querySelector('#authPassword').value;
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const body = mode === 'login' ? { email, password } : { name, email, password };
      const data = await api(endpoint, { method: 'POST', body: JSON.stringify(body) });
      state.user = data.user;
      state.token = data.token;
      localStorage.setItem('wildAuraUser', JSON.stringify(data.user));
      localStorage.setItem('wildAuraToken', data.token);
      updateAuthUI();
      showToast(mode === 'login' ? 'Welcome back!' : 'Account created!', 'success');
      setTimeout(() => { window.location.href = '/'; }, 800);
    } catch (e) { /* handled */ }
  });
}

// ===== CONTACT =====
function initContactPage() {
  document.getElementById('contactForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    try {
      await api('/contact', { method: 'POST', body: JSON.stringify(Object.fromEntries(data)) });
      showToast('Message sent successfully!', 'success');
      e.target.reset();
    } catch (e) { /* handled */ }
  });
}

// ===== NEWSLETTER =====
function initNewsletterForm() {
  document.querySelectorAll('.newsletter-form').forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = form.querySelector('input')?.value;
      if (!email) return;
      try {
        await api('/contact/newsletter', { method: 'POST', body: JSON.stringify({ email }) });
        showToast('Subscribed successfully! Welcome to the Wild Aura family.', 'success');
        form.querySelector('input').value = '';
      } catch (e) { /* handled */ }
    });
  });
}

// ===== FAQ =====
function initFAQ() {
  document.querySelectorAll('.faq-question').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.closest('.faq-item');
      const wasActive = item.classList.contains('active');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
      if (!wasActive) item.classList.add('active');
    });
  });
}

// ===== DASHBOARD =====
async function initDashboardPage() {
  if (!state.token) { window.location.href = '/pages/auth.html'; return; }
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get('order');
  if (orderId) viewOrder(orderId);
  await loadDashboardOrders();
}

async function loadDashboardOrders() {
  const container = document.getElementById('dashboardOrders');
  if (!container) return;
  try {
    const orders = await api('/orders');
    if (!orders.length) {
      container.innerHTML = '<div style="text-align:center;padding:2rem"><p style="color:var(--text-muted)">No orders yet. Start your glow journey!</p><a href="/pages/shop.html" class="btn btn-primary" style="margin-top:1rem">Shop Now</a></div>';
      return;
    }
    container.innerHTML = orders.map(o => `
      <div style="padding:1.2rem;border:1px solid var(--cream);border-radius:var(--radius-sm);margin-bottom:1rem">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.5rem">
          <div>
            <strong style="font-size:0.9rem">Order #${o._id.slice(-8).toUpperCase()}</strong>
            <span style="font-size:0.75rem;color:var(--text-muted);margin-left:0.8rem">${new Date(o.createdAt).toLocaleDateString()}</span>
          </div>
          <div style="display:flex;align-items:center;gap:0.8rem">
            <span style="padding:0.2rem 0.8rem;border-radius:50px;font-size:0.7rem;font-weight:600;text-transform:uppercase;background:${o.status === 'delivered' ? 'rgba(5,150,105,0.1)' : o.status === 'cancelled' ? 'rgba(220,38,38,0.1)' : 'rgba(212,175,55,0.1)'};color:${o.status === 'delivered' ? 'var(--green-success)' : o.status === 'cancelled' ? 'var(--red)' : 'var(--gold)'}">${o.status}</span>
            <strong style="font-family:var(--font-serif);color:var(--green-deep)">KES ${o.totalPrice.toLocaleString()}</strong>
          </div>
        </div>
        <div style="margin-top:0.8rem;display:flex;gap:0.5rem;flex-wrap:wrap">
          ${o.orderItems.slice(0, 3).map(i => `<span style="font-size:0.8rem;color:var(--text-muted)">${i.name} ×${i.quantity}</span>`).join('')}
        </div>
      </div>
    `).join('');
  } catch (e) { /* handled */ }
}

async function viewOrder(id) {
  try { const order = await api(`/orders/${id}`); showToast(`Order placed! Total: KES ${order.totalPrice.toLocaleString()}`, 'success'); }
  catch (e) { /* handled */ }
}

// ===== ABOUT =====
function initAboutPage() {
  // Already rendered in HTML, just trigger animations
}

// ===== INGREDIENTS =====
function initIngredientsPage() {
  // Static content rendered in HTML
}

// ===== ADMIN =====
async function initAdminPage() {
  if (!state.token || state.user?.role !== 'admin') { window.location.href = '/'; return; }
  await loadAdminStats();
  await loadAdminProducts();
  await loadAdminOrders();
  initAdminTabs();
  initAdminProductForm();
  initAdminCouponForm();
}

function initAdminTabs() {
  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.tab)?.classList.add('active');
    });
  });
}

async function loadAdminStats() {
  const container = document.getElementById('adminStats');
  if (!container) return;
  try {
    const revenue = await api('/orders/revenue');
    container.innerHTML = `
      <div class="stat-card"><div class="stat-label">Total Revenue</div><div class="stat-value">KES ${(revenue.totalRevenue || 0).toLocaleString()}</div></div>
      <div class="stat-card"><div class="stat-label">Orders</div><div class="stat-value">${revenue.totalOrders || 0}</div></div>
      <div class="stat-card"><div class="stat-label">Avg. Order Value</div><div class="stat-value">KES ${Math.round(revenue.avgOrderValue || 0).toLocaleString()}</div></div>
      <div class="stat-card"><div class="stat-label">Products</div><div class="stat-value" id="adminProductCount">0</div></div>
    `;
  } catch (e) { /* handled */ }
}

async function loadAdminProducts() {
  const container = document.getElementById('adminProductsList');
  if (!container) return;
  try {
    const data = await api('/products?limit=100');
    document.getElementById('adminProductCount') && (document.getElementById('adminProductCount').textContent = data.total);
    container.innerHTML = data.products.map(p => `
      <tr>
        <td><img src="${p.images?.[0] || ''}" style="width:40px;height:40px;object-fit:cover;border-radius:4px" alt=""></td>
        <td>${p.name}</td>
        <td>KES ${p.price.toLocaleString()}</td>
        <td>${p.stock}</td>
        <td>${p.category}</td>
        <td>
          <button class="btn btn-sm btn-outline" onclick="editProduct('${p._id}')">Edit</button>
          <button class="btn btn-sm btn-outline" style="color:var(--red);border-color:var(--red);margin-left:0.3rem" onclick="deleteProduct('${p._id}')">Delete</button>
        </td>
      </tr>
    `).join('');
  } catch (e) { /* handled */ }
}

async function loadAdminOrders() {
  const container = document.getElementById('adminOrdersList');
  if (!container) return;
  try {
    const orders = await api('/orders/all');
    container.innerHTML = orders.map(o => `
      <tr>
        <td>#${o._id.slice(-8).toUpperCase()}</td>
        <td>${o.user?.name || 'N/A'}</td>
        <td>KES ${o.totalPrice.toLocaleString()}</td>
        <td><span style="padding:0.2rem 0.6rem;border-radius:50px;font-size:0.7rem;font-weight:600;background:${o.isPaid ? 'rgba(5,150,105,0.1)' : 'rgba(220,38,38,0.1)'};color:${o.isPaid ? 'var(--green-success)' : 'var(--red)'}">${o.isPaid ? 'Paid' : 'Unpaid'}</span></td>
        <td><span style="padding:0.2rem 0.6rem;border-radius:50px;font-size:0.7rem;font-weight:600;text-transform:capitalize;background:${o.status === 'delivered' ? 'rgba(5,150,105,0.1)' : o.status === 'cancelled' ? 'rgba(220,38,38,0.1)' : 'rgba(212,175,55,0.1)'};color:${o.status === 'delivered' ? 'var(--green-success)' : o.status === 'cancelled' ? 'var(--red)' : 'var(--gold)'}">${o.status}</span></td>
        <td>${new Date(o.createdAt).toLocaleDateString()}</td>
        <td>
          <button class="btn btn-sm btn-green" onclick="markDelivered('${o._id}')">Deliver</button>
        </td>
      </tr>
    `).join('');
  } catch (e) { /* handled */ }
}

window.markDelivered = async (id) => {
  try { await api(`/orders/${id}/deliver`, { method: 'PUT' }); showToast('Order marked delivered', 'success'); loadAdminOrders(); }
  catch (e) { /* handled */ }
};

window.deleteProduct = async (id) => {
  if (!confirm('Delete this product?')) return;
  try { await api(`/products/${id}`, { method: 'DELETE' }); showToast('Product deleted', 'success'); loadAdminProducts(); }
  catch (e) { /* handled */ }
};

window.editProduct = async (id) => {
  try {
    const p = await api(`/products/id/${id}`);
    const form = document.getElementById('adminProductForm');
    if (!form) return;
    form.dataset.editId = id;
    ['name', 'price', 'stock', 'category', 'description', 'shortDescription', 'size'].forEach(f => {
      const el = form.querySelector(`[name="${f}"]`);
      if (el) el.value = p[f] || '';
    });
    document.getElementById('adminFormTitle').textContent = 'Edit Product';
    document.getElementById('adminProductPanel').scrollIntoView({ behavior: 'smooth' });
  } catch (e) { /* handled */ }
};

function initAdminProductForm() {
  const form = document.getElementById('adminProductForm');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    data.price = Number(data.price);
    data.stock = Number(data.stock);
    data.images = [data.image1, data.image2].filter(Boolean);
    delete data.image1; delete data.image2;
    try {
      const editId = form.dataset.editId;
      if (editId) { await api(`/products/${editId}`, { method: 'PUT', body: JSON.stringify(data) }); showToast('Product updated!', 'success'); }
      else { await api('/products', { method: 'POST', body: JSON.stringify(data) }); showToast('Product created!', 'success'); }
      form.reset(); delete form.dataset.editId; document.getElementById('adminFormTitle').textContent = 'Add Product';
      loadAdminProducts();
    } catch (e) { /* handled */ }
  });
}

async function loadAdminCoupons() {
  const container = document.getElementById('adminCouponsList');
  if (!container) return;
  try {
    const coupons = await api('/coupons');
    container.innerHTML = coupons.map(c => `
      <tr>
        <td><strong>${c.code}</strong></td>
        <td>${c.type === 'percentage' ? c.value + '%' : 'KES ' + c.value}</td>
        <td>${c.usedCount}/${c.usageLimit || '∞'}</td>
        <td>${c.isActive ? '<span style="color:var(--green-success)">Active</span>' : '<span style="color:var(--red)">Inactive</span>'}</td>
        <td>${new Date(c.expiresAt).toLocaleDateString()}</td>
        <td><button class="btn btn-sm btn-outline" style="color:var(--red);border-color:var(--red)" onclick="deleteCoupon('${c._id}')">Delete</button></td>
      </tr>
    `).join('');
  } catch (e) { /* handled */ }
}

function initAdminCouponForm() {
  const form = document.getElementById('adminCouponForm');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    data.value = Number(data.value);
    data.minOrderAmount = Number(data.minOrderAmount) || 0;
    data.usageLimit = Number(data.usageLimit) || 0;
    data.maxDiscount = Number(data.maxDiscount) || 0;
    try {
      await api('/coupons', { method: 'POST', body: JSON.stringify(data) });
      showToast('Coupon created!', 'success');
      form.reset();
      loadAdminCoupons();
    } catch (e) { /* handled */ }
  });
}

window.deleteCoupon = async (id) => {
  if (!confirm('Delete this coupon?')) return;
  try { await api(`/coupons/${id}`, { method: 'DELETE' }); showToast('Coupon deleted', 'success'); loadAdminCoupons(); }
  catch (e) { /* handled */ }
};

// Hero particles
document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.hero-particles');
  if (!container) return;
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.className = 'hero-particle';
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDelay = Math.random() * 8 + 's';
    p.style.animationDuration = (6 + Math.random() * 8) + 's';
    p.style.width = p.style.height = (2 + Math.random() * 4) + 'px';
    container.appendChild(p);
  }
});
