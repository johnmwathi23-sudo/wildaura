const API_URL = 'http://localhost:5000/api';

const state = {
  user: JSON.parse(localStorage.getItem('wildAuraUser')) || null,
  token: localStorage.getItem('wildAuraToken') || null
};

if (!state.token || state.user?.role !== 'admin') {
  window.location.href = '/pages/auth.html';
}

document.addEventListener('DOMContentLoaded', () => {
  initAdminApp();
  initTabs();
  initLogout();
});

function initAdminApp() {
  document.querySelector('.admin-user span').textContent = state.user?.name || 'Admin';
  document.querySelector('.admin-avatar').textContent = state.user?.name?.[0] || 'A';
  loadStats();
  loadProducts();
  loadOrders();
  loadCoupons();
  initProductForm();
  initCouponForm();
}

function initTabs() {
  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const panel = document.getElementById(tab.dataset.tab);
      if (panel) panel.classList.add('active');
    });
  });
}

function initLogout() {
  document.getElementById('adminLogout')?.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('wildAuraUser');
    localStorage.removeItem('wildAuraToken');
    window.location.href = '/';
  });
}

async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (state.token) headers.Authorization = `Bearer ${state.token}`;
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

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

// Stats
async function loadStats() {
  try {
    const rev = await api('/orders/revenue');
    const prod = await api('/products?limit=1');
    document.getElementById('statRevenue').textContent = `KES ${(rev.totalRevenue || 0).toLocaleString()}`;
    document.getElementById('statOrders').textContent = rev.totalOrders || 0;
    document.getElementById('statAvgOrder').textContent = `KES ${Math.round(rev.avgOrderValue || 0).toLocaleString()}`;
    document.getElementById('statProducts').textContent = prod.total || 0;
  } catch (e) { /* handle */ }
}

// Products
async function loadProducts() {
  const tbody = document.querySelector('#productsTable tbody');
  if (!tbody) return;
  try {
    const data = await api('/products?limit=100');
    tbody.innerHTML = data.products.map(p => `
      <tr>
        <td><img src="${p.images?.[0] || ''}" style="width:40px;height:40px;object-fit:cover;border-radius:4px" alt="" onerror="this.style.display='none'"></td>
        <td><strong>${p.name}</strong></td>
        <td>KES ${p.price.toLocaleString()}</td>
        <td><span style="color:${p.stock > 10 ? 'var(--green-success)' : 'var(--red)'}">${p.stock}</span></td>
        <td>${p.category || '—'}</td>
        <td>${'★'.repeat(Math.round(p.ratings || 0))} (${p.numReviews || 0})</td>
        <td>
          <button class="btn btn-sm btn-outline" onclick="editProduct('${p._id}')">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteProduct('${p._id}')">Delete</button>
        </td>
      </tr>
    `).join('');
  } catch (e) { showToast('Failed to load products', 'error'); }
}

window.editProduct = async (id) => {
  try {
    const p = await api(`/products/id/${id}`);
    const form = document.getElementById('productForm');
    form.dataset.editId = id;
    ['name', 'price', 'stock', 'category', 'description', 'shortDescription', 'size', 'comparePrice'].forEach(f => {
      const el = form.querySelector(`[name="${f}"]`);
      if (el) el.value = p[f] ?? '';
    });
    document.getElementById('productFormTitle').textContent = 'Edit Product';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (e) { showToast('Failed to load product', 'error'); }
};

window.deleteProduct = async (id) => {
  if (!confirm('Delete this product permanently?')) return;
  try {
    await api(`/products/${id}`, { method: 'DELETE' });
    showToast('Product deleted');
    loadProducts();
  } catch (e) { showToast('Failed to delete', 'error'); }
};

function initProductForm() {
  const form = document.getElementById('productForm');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    data.price = Number(data.price);
    data.stock = Number(data.stock);
    data.comparePrice = Number(data.comparePrice) || 0;
    data.images = [data.image1, data.image2].filter(Boolean);
    delete data.image1; delete data.image2;
    try {
      const editId = form.dataset.editId;
      if (editId) {
        await api(`/products/${editId}`, { method: 'PUT', body: JSON.stringify(data) });
        showToast('Product updated!');
        delete form.dataset.editId;
      } else {
        await api('/products', { method: 'POST', body: JSON.stringify(data) });
        showToast('Product created!');
      }
      form.reset();
      document.getElementById('productFormTitle').textContent = 'Add New Product';
      loadProducts();
      loadStats();
    } catch (e) { showToast(e.message, 'error'); }
  });
}

// Orders
async function loadOrders() {
  const tbody = document.querySelector('#ordersTable tbody');
  if (!tbody) return;
  try {
    const orders = await api('/orders/all');
    tbody.innerHTML = orders.map(o => `
      <tr>
        <td>#${o._id.slice(-8).toUpperCase()}</td>
        <td>${o.user?.name || 'N/A'}<br><small style="color:var(--text-light)">${o.user?.email || ''}</small></td>
        <td>KES ${o.totalPrice.toLocaleString()}</td>
        <td>
          <span style="padding:0.2rem 0.6rem;border-radius:50px;font-size:0.65rem;font-weight:600;
            background:${o.isPaid ? 'rgba(5,150,105,0.1)' : 'rgba(220,38,38,0.1)'};
            color:${o.isPaid ? 'var(--green-success)' : 'var(--red)'}">
            ${o.isPaid ? 'Paid' : 'Unpaid'}
          </span>
        </td>
        <td>
          <span style="padding:0.2rem 0.6rem;border-radius:50px;font-size:0.65rem;font-weight:600;text-transform:capitalize;
            background:${o.status === 'delivered' ? 'rgba(5,150,105,0.1)' : o.status === 'cancelled' ? 'rgba(220,38,38,0.1)' : 'rgba(212,175,55,0.1)'};
            color:${o.status === 'delivered' ? 'var(--green-success)' : o.status === 'cancelled' ? 'var(--red)' : 'var(--gold)'}">
            ${o.status}
          </span>
        </td>
        <td>${o.paymentMethod || '—'}</td>
        <td>${new Date(o.createdAt).toLocaleDateString()}</td>
        <td>
          <button class="btn btn-sm ${o.isDelivered ? 'btn-outline' : 'btn-green'}" onclick="markDelivered('${o._id}')" ${o.isDelivered ? 'disabled' : ''}>
            ${o.isDelivered ? '✓ Delivered' : 'Mark Delivered'}
          </button>
        </td>
      </tr>
    `).join('');
  } catch (e) { showToast('Failed to load orders', 'error'); }
}

window.markDelivered = async (id) => {
  try {
    await api(`/orders/${id}/deliver`, { method: 'PUT' });
    showToast('Order marked as delivered');
    loadOrders();
  } catch (e) { showToast(e.message, 'error'); }
};

// Coupons
async function loadCoupons() {
  const tbody = document.querySelector('#couponsTable tbody');
  if (!tbody) return;
  try {
    const coupons = await api('/coupons');
    tbody.innerHTML = coupons.map(c => `
      <tr>
        <td><strong style="color:var(--gold)">${c.code}</strong></td>
        <td>${c.type === 'percentage' ? c.value + '%' : 'KES ' + c.value.toLocaleString()}</td>
        <td>KES ${c.minOrderAmount.toLocaleString()}</td>
        <td>${c.usedCount}${c.usageLimit ? ' / ' + c.usageLimit : ' / ∞'}</td>
        <td><span style="color:${c.isActive ? 'var(--green-success)' : 'var(--red)'}">${c.isActive ? 'Active' : 'Inactive'}</span></td>
        <td>${new Date(c.expiresAt).toLocaleDateString()}</td>
        <td><button class="btn btn-sm btn-danger" onclick="deleteCoupon('${c._id}')">Delete</button></td>
      </tr>
    `).join('');
  } catch (e) { showToast('Failed to load coupons', 'error'); }
}

window.deleteCoupon = async (id) => {
  if (!confirm('Delete this coupon?')) return;
  try {
    await api(`/coupons/${id}`, { method: 'DELETE' });
    showToast('Coupon deleted');
    loadCoupons();
  } catch (e) { showToast('Failed to delete', 'error'); }
};

function initCouponForm() {
  const form = document.getElementById('couponForm');
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
      showToast('Coupon created!');
      form.reset();
      loadCoupons();
    } catch (e) { showToast(e.message, 'error'); }
  });
}
