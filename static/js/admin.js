/**
 * FORME JEWELRY - EXECUTIVE BACKOFFICE SCRIPT
 * Dedicated to store management, order fulfillment, inventory, and promotions.
 */

// Admin State
const adminState = {
    authenticated: false,
    token: localStorage.getItem('forme_admin_token') || null,
    username: localStorage.getItem('forme_admin_user') || 'admin',
    activeTab: 'orders',
    stats: {
        total_revenue: 0,
        total_orders: 0,
        total_products: 0,
        low_stock_products: 0,
        order_status_counts: {}
    },
    orders: [],
    products: [],
    coupons: [],
    filters: {
        status: 'all',
        search: ''
    }
};

// Initialize Admin Portal
document.addEventListener('DOMContentLoaded', () => {
    initAdminPortal();
});

async function initAdminPortal() {
    await verifyAuthentication();
}

// ----------------------------------------------------
// AUTHENTICATION LOGIC
// ----------------------------------------------------

async function verifyAuthentication() {
    // Check if token exists
    if (!adminState.token) {
        showLoginView();
        return;
    }

    try {
        const res = await fetch('/api/admin/check-auth', {
            headers: {
                'Authorization': `Bearer ${adminState.token}`,
                'X-Admin-Token': adminState.token
            }
        });
        if (res.ok) {
            const data = await res.json();
            if (data.authenticated) {
                adminState.authenticated = true;
                adminState.username = data.username || 'admin';
                showDashboardView();
                await refreshAllAdminData();
                return;
            }
        }
    } catch (e) {
        // Fallback for static GitHub Pages / offline hosting
        if (adminState.token === 'forme_token_2026_luxury_secure' || adminState.token === 'demo_admin_token') {
            adminState.authenticated = true;
            showDashboardView();
            await refreshAllAdminData();
            return;
        }
    }

    // Token invalid or expired
    adminState.authenticated = false;
    adminState.token = null;
    localStorage.removeItem('forme_admin_token');
    showLoginView();
}

async function handleAdminLogin(event) {
    if (event) event.preventDefault();

    const usernameInput = document.getElementById('adminUsername');
    const passwordInput = document.getElementById('adminPassword');
    const loginBtn = document.getElementById('adminLoginBtn');
    const errorBox = document.getElementById('adminLoginError');

    const username = (usernameInput?.value || '').trim();
    const password = (passwordInput?.value || '').trim();

    if (!username || !password) {
        if (errorBox) {
            errorBox.innerText = 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน';
            errorBox.classList.remove('hidden');
        }
        return;
    }

    if (loginBtn) {
        loginBtn.disabled = true;
        loginBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> กำลังตรวจสอบ...';
    }
    if (errorBox) errorBox.classList.add('hidden');

    try {
        const res = await fetch('/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (res.ok) {
            const data = await res.json();
            if (data.success) {
                adminState.authenticated = true;
                adminState.token = data.token;
                adminState.username = data.username;
                localStorage.setItem('forme_admin_token', data.token);
                localStorage.setItem('forme_admin_user', data.username);
                
                showToast('เข้าสู่ระบบผู้ดูแลสำเร็จ ยินดีต้อนรับ', 'success');
                showDashboardView();
                await refreshAllAdminData();
                return;
            }
        } else {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
        }
    } catch (err) {
        // Static GitHub Pages fallback
        if (username === 'admin' && password === 'forme2026') {
            const demoToken = 'forme_token_2026_luxury_secure';
            adminState.authenticated = true;
            adminState.token = demoToken;
            adminState.username = 'admin';
            localStorage.setItem('forme_admin_token', demoToken);
            localStorage.setItem('forme_admin_user', 'admin');

            showToast('เข้าสู่ระบบผู้ดูแลสำเร็จ (Static Mode)', 'success');
            showDashboardView();
            await refreshAllAdminData();
            return;
        }

        if (errorBox) {
            errorBox.innerText = err.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง';
            errorBox.classList.remove('hidden');
        }
        showToast('การเข้าสู่ระบบล้มเหลว', 'error');
    } finally {
        if (loginBtn) {
            loginBtn.disabled = false;
            loginBtn.innerHTML = 'เข้าสู่ระบบผู้ดูแล';
        }
    }
}

async function handleAdminLogout() {
    try {
        await fetch('/api/admin/logout', { method: 'POST' });
    } catch (e) {}

    adminState.authenticated = false;
    adminState.token = null;
    localStorage.removeItem('forme_admin_token');
    localStorage.removeItem('forme_admin_user');
    
    showToast('ออกจากระบบเรียบร้อยแล้ว', 'info');
    showLoginView();
}

function fillDemoCredentials() {
    const u = document.getElementById('adminUsername');
    const p = document.getElementById('adminPassword');
    if (u) u.value = 'admin';
    if (p) p.value = 'forme2026';
    showToast('กรอกข้อมูลผู้ดูแลอัตโนมัติเรียบร้อย', 'info');
}

function showLoginView() {
    document.getElementById('adminLoginSection')?.classList.remove('hidden');
    document.getElementById('adminDashboardSection')?.classList.add('hidden');
}

function showDashboardView() {
    document.getElementById('adminLoginSection')?.classList.add('hidden');
    document.getElementById('adminDashboardSection')?.classList.remove('hidden');
    const badge = document.getElementById('adminUserBadge');
    if (badge) badge.innerText = adminState.username;
}

// ----------------------------------------------------
// DATA FETCHING & STATE SYNC
// ----------------------------------------------------

function getAuthHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    if (adminState.token) {
        headers['Authorization'] = `Bearer ${adminState.token}`;
        headers['X-Admin-Token'] = adminState.token;
    }
    return headers;
}

async function refreshAllAdminData() {
    await Promise.all([
        loadStats(),
        loadOrders(),
        loadProducts(),
        loadCoupons()
    ]);
}

// 1. STATS
async function loadStats() {
    try {
        const res = await fetch('/api/admin/stats', { headers: getAuthHeaders() });
        if (res.ok) {
            const data = await res.json();
            if (data.success) {
                adminState.stats = data;
                renderStats();
                return;
            }
        }
    } catch (e) {}

    // Fallback calculation from local data
    const savedOrders = JSON.parse(localStorage.getItem('forme_orders') || '[]');
    const totalRev = savedOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    adminState.stats = {
        total_revenue: totalRev,
        total_orders: savedOrders.length,
        total_products: adminState.products.length || 12,
        low_stock_products: (adminState.products || []).filter(p => p.stock <= 3).length,
        order_status_counts: {}
    };
    renderStats();
}

function renderStats() {
    const revEl = document.getElementById('kpiRevenue');
    const ordEl = document.getElementById('kpiOrders');
    const prodEl = document.getElementById('kpiProducts');
    const lowStockEl = document.getElementById('kpiLowStock');

    if (revEl) revEl.innerText = `฿${(adminState.stats.total_revenue || 0).toLocaleString()}`;
    if (ordEl) ordEl.innerText = (adminState.stats.total_orders || 0).toLocaleString();
    if (prodEl) prodEl.innerText = (adminState.stats.total_products || 0).toLocaleString();
    if (lowStockEl) lowStockEl.innerText = (adminState.stats.low_stock_products || 0).toLocaleString();
}

// 2. ORDERS MANAGEMENT
async function loadOrders() {
    try {
        const res = await fetch('/api/admin/orders', { headers: getAuthHeaders() });
        if (res.ok) {
            const data = await res.json();
            if (data.success) {
                adminState.orders = data.orders || [];
                renderOrders();
                return;
            }
        }
    } catch (e) {}

    // Fallback: load orders from localStorage
    adminState.orders = JSON.parse(localStorage.getItem('forme_orders') || '[]');
    renderOrders();
}

function renderOrders() {
    const tbody = document.getElementById('adminOrdersTableBody');
    if (!tbody) return;

    let filtered = [...adminState.orders];

    // Filter by status
    if (adminState.filters.status !== 'all') {
        filtered = filtered.filter(o => o.order_status === adminState.filters.status);
    }

    // Filter by search query
    if (adminState.filters.search) {
        const q = adminState.filters.search.toLowerCase();
        filtered = filtered.filter(o => 
            (o.order_number || '').toLowerCase().includes(q) ||
            (o.customer_name || '').toLowerCase().includes(q) ||
            (o.customer_phone || '').includes(q) ||
            (o.tracking_number || '').toLowerCase().includes(q)
        );
    }

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="py-12 text-center text-neutral-400 font-light text-xs">
                    <i class="fa-solid fa-inbox text-2xl mb-2 block opacity-40"></i>
                    ไม่พบคำสั่งซื้อที่ตรงกับเงื่อนไข
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filtered.map(o => {
        const items = o.items || [];
        const itemsSummary = items.map(it => 
            `<div class="text-[11px] text-neutral-700">
                • ${it.name} <span class="text-neutral-400">x${it.qty || 1} (${it.size || 'One Size'})</span>
                ${it.engraving ? `<span class="block text-[10px] text-neutral-500 italic">สลัก: "${it.engraving}"</span>` : ''}
            </div>`
        ).join('');

        return `
            <tr class="border-b border-neutral-100 hover:bg-neutral-50/70 transition text-xs">
                <td class="py-3 px-3 font-mono font-medium text-neutral-900 align-top">
                    <span class="block">${o.order_number}</span>
                    <span class="text-[10px] text-neutral-400 font-sans block">${o.created_at || 'เมื่อสักครู่'}</span>
                </td>
                <td class="py-3 px-3 align-top">
                    <p class="font-medium text-neutral-900">${o.customer_name || 'ลูกค้า'}</p>
                    <p class="text-[11px] text-neutral-500 font-mono">${o.customer_phone || '-'}</p>
                    <p class="text-[10px] text-neutral-400 truncate max-w-[180px]" title="${o.shipping_address || ''}, ${o.province || ''} ${o.postal_code || ''}">
                        ${o.shipping_address || ''}, ${o.province || ''}
                    </p>
                </td>
                <td class="py-3 px-3 align-top max-w-xs">
                    ${itemsSummary}
                    ${o.gift_wrap ? `<span class="inline-block mt-1 text-[10px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full"><i class="fa-solid fa-gift mr-1"></i>ห่อของขวัญ</span>` : ''}
                </td>
                <td class="py-3 px-3 align-top font-medium text-neutral-900 whitespace-nowrap">
                    ฿${(o.total || 0).toLocaleString()}
                    <span class="block text-[10px] text-neutral-400 font-light uppercase">${o.payment_method || 'PromptPay'}</span>
                </td>
                <td class="py-3 px-3 align-top">
                    <select onchange="handleOrderStatusChange(${o.id || 0}, '${o.order_number}', this.value)" 
                        class="bg-white border border-neutral-300 rounded px-2 py-1 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900">
                        <option value="processing" ${o.order_status === 'processing' ? 'selected' : ''}>รอดำเนินการ</option>
                        <option value="preparing" ${o.order_status === 'preparing' ? 'selected' : ''}>เตรียมสินค้า</option>
                        <option value="quality_check" ${o.order_status === 'quality_check' ? 'selected' : ''}>ตรวจสอบ GIA</option>
                        <option value="shipped" ${o.order_status === 'shipped' ? 'selected' : ''}>กำลังจัดส่ง</option>
                        <option value="delivered" ${o.order_status === 'delivered' ? 'selected' : ''}>จัดส่งสำเร็จ</option>
                        <option value="cancelled" ${o.order_status === 'cancelled' ? 'selected' : ''}>ยกเลิก</option>
                    </select>
                </td>
                <td class="py-3 px-3 align-top">
                    <div class="flex items-center gap-1">
                        <input type="text" id="trackInput_${o.id || o.order_number}" 
                            value="${o.tracking_number || ''}" 
                            placeholder="THP..." 
                            class="w-28 bg-white border border-neutral-300 rounded px-2 py-1 text-xs text-neutral-800 font-mono">
                        <button onclick="saveTrackingNumber(${o.id || 0}, '${o.order_number}')" 
                            title="บันทึกเลขพัสดุ"
                            class="p-1.5 rounded bg-neutral-900 text-white hover:bg-black transition text-xs">
                            <i class="fa-solid fa-check"></i>
                        </button>
                    </div>
                </td>
                <td class="py-3 px-3 text-center align-top whitespace-nowrap">
                    <button onclick="viewCustomerOrderDetails('${o.order_number}')" class="text-neutral-700 hover:text-black underline text-xs">
                        ดูใบเสร็จ
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function filterOrdersByStatus(status, el) {
    adminState.filters.status = status;
    document.querySelectorAll('.order-status-tab').forEach(b => b.classList.remove('active'));
    if (el) el.classList.add('active');
    renderOrders();
}

function handleOrderSearch(term) {
    adminState.filters.search = term.trim();
    renderOrders();
}

async function handleOrderStatusChange(orderId, orderNumber, newStatus) {
    try {
        if (orderId) {
            const res = await fetch(`/api/admin/orders/${orderId}/status`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                showToast(`อัปเดตคำสั่งซื้อ ${orderNumber} เป็น "${getStatusLabel(newStatus)}"`, 'success');
                await loadStats();
                return;
            }
        }
    } catch (e) {}

    // Local storage fallback
    const savedOrders = JSON.parse(localStorage.getItem('forme_orders') || '[]');
    const target = savedOrders.find(o => o.order_number === orderNumber || o.id === orderId);
    if (target) {
        target.order_status = newStatus;
        localStorage.setItem('forme_orders', JSON.stringify(savedOrders));
        showToast(`อัปเดตคำสั่งซื้อ ${orderNumber} เรียบร้อย (บันทึกในระบบ)`, 'success');
        await loadStats();
        renderOrders();
    }
}

async function saveTrackingNumber(orderId, orderNumber) {
    const input = document.getElementById(`trackInput_${orderId || orderNumber}`);
    const tracking = (input?.value || '').trim();

    try {
        if (orderId) {
            const res = await fetch(`/api/admin/orders/${orderId}/status`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ tracking_number: tracking, status: tracking ? 'shipped' : undefined })
            });
            if (res.ok) {
                showToast(`บันทึกเลขพัสดุ ${tracking} สำเร็จ`, 'success');
                await loadOrders();
                return;
            }
        }
    } catch (e) {}

    // Local storage fallback
    const savedOrders = JSON.parse(localStorage.getItem('forme_orders') || '[]');
    const target = savedOrders.find(o => o.order_number === orderNumber || o.id === orderId);
    if (target) {
        target.tracking_number = tracking;
        if (tracking && target.order_status === 'processing') {
            target.order_status = 'shipped';
        }
        localStorage.setItem('forme_orders', JSON.stringify(savedOrders));
        showToast(`บันทึกเลขพัสดุ ${tracking} เรียบร้อย`, 'success');
        renderOrders();
    }
}

function getStatusLabel(s) {
    const labels = {
        'processing': 'รอดำเนินการ',
        'preparing': 'เตรียมสินค้า',
        'quality_check': 'ตรวจสอบ GIA',
        'shipped': 'กำลังจัดส่ง',
        'delivered': 'จัดส่งสำเร็จ',
        'cancelled': 'ยกเลิก'
    };
    return labels[s] || s;
}

function viewCustomerOrderDetails(orderNumber) {
    const order = adminState.orders.find(o => o.order_number === orderNumber);
    if (!order) return;

    alert(`ใบสั่งซื้อ: ${order.order_number}\nลูกค้า: ${order.customer_name}\nเบอร์โทร: ${order.customer_phone}\nที่อยู่: ${order.shipping_address}, ${order.province} ${order.postal_code}\nยอดชำระ: ฿${(order.total || 0).toLocaleString()}\nสถานะ: ${getStatusLabel(order.order_status)}\nเลขพัสดุ: ${order.tracking_number || 'ยังไม่มี'}`);
}

// 3. INVENTORY & PRODUCTS MANAGEMENT
async function loadProducts() {
    try {
        const res = await fetch('/api/products');
        if (res.ok) {
            const data = await res.json();
            if (data.success) {
                adminState.products = data.products || [];
                renderInventory();
                return;
            }
        }
    } catch (e) {}

    adminState.products = JSON.parse(localStorage.getItem('forme_custom_products') || '[]');
    renderInventory();
}

function renderInventory() {
    const tbody = document.getElementById('adminInventoryTableBody');
    if (!tbody) return;

    if (adminState.products.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="py-8 text-center text-neutral-400 text-xs font-light">ไม่มีรายการสินค้า</td></tr>`;
        return;
    }

    tbody.innerHTML = adminState.products.map(p => `
        <tr class="border-b border-neutral-100 hover:bg-neutral-50/70 transition text-xs">
            <td class="py-2.5 px-3">
                <img src="${p.image_url}" alt="${p.name}" class="w-12 h-12 object-cover rounded border border-neutral-200">
            </td>
            <td class="py-2.5 px-3">
                <p class="font-medium text-neutral-900">${p.name}</p>
                <p class="text-[11px] text-neutral-400 font-light">${p.material || ''} • ${p.gemstone || ''}</p>
            </td>
            <td class="py-2.5 px-3 uppercase tracking-wider text-[11px] text-neutral-500">${p.category}</td>
            <td class="py-2.5 px-3 font-medium text-neutral-900">฿${(p.price || 0).toLocaleString()}</td>
            <td class="py-2.5 px-3">
                <div class="flex items-center gap-1.5">
                    <button onclick="adjustStock(${p.id}, -1)" class="w-6 h-6 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold flex items-center justify-center text-xs">-</button>
                    <span id="stockCount_${p.id}" class="w-8 text-center font-medium ${p.stock <= 3 ? 'text-amber-600 font-bold' : 'text-neutral-900'}">${p.stock}</span>
                    <button onclick="adjustStock(${p.id}, 1)" class="w-6 h-6 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold flex items-center justify-center text-xs">+</button>
                </div>
            </td>
            <td class="py-2.5 px-3 text-center">
                <button onclick="deleteProductById(${p.id})" class="text-neutral-400 hover:text-red-600 transition" title="ลบสินค้า">
                    <i class="fa-regular fa-trash-can"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

async function adjustStock(productId, delta) {
    try {
        const res = await fetch(`/api/admin/products/${productId}/stock`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ delta })
        });
        if (res.ok) {
            const data = await res.json();
            if (data.success) {
                const el = document.getElementById(`stockCount_${productId}`);
                if (el) el.innerText = data.stock;
                showToast(`อัปเดตสต็อกสินค้าสำเร็จ`, 'success');
                await loadStats();
                return;
            }
        }
    } catch (e) {}

    // Fallback in-memory
    const p = adminState.products.find(item => item.id === productId);
    if (p) {
        p.stock = Math.max(0, (p.stock || 0) + delta);
        const el = document.getElementById(`stockCount_${productId}`);
        if (el) el.innerText = p.stock;
        showToast('อัปเดตสต็อกเรียบร้อย', 'success');
        renderStats();
    }
}

async function deleteProductById(productId) {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบสินค้านี้ออกจากระบบ?')) return;

    try {
        const res = await fetch(`/api/products/${productId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (res.ok) {
            showToast('ลบสินค้าเรียบร้อยแล้ว', 'info');
            await loadProducts();
            await loadStats();
            return;
        }
    } catch (e) {}

    adminState.products = adminState.products.filter(p => p.id !== productId);
    showToast('ลบสินค้าออกจากมุมมองเรียบร้อย', 'info');
    renderInventory();
}

async function handleAddNewProduct(event) {
    if (event) event.preventDefault();

    const name = document.getElementById('adminNewProdName')?.value.trim();
    const category = document.getElementById('adminNewProdCat')?.value;
    const material = document.getElementById('adminNewProdMaterial')?.value.trim();
    const gemstone = document.getElementById('adminNewProdGem')?.value.trim();
    const carat = document.getElementById('adminNewProdCarat')?.value.trim();
    const price = parseFloat(document.getElementById('adminNewProdPrice')?.value || 0);
    const stock = parseInt(document.getElementById('adminNewProdStock')?.value || 5);
    const imageUrl = document.getElementById('adminNewProdImage')?.value.trim();
    const badge = document.getElementById('adminNewProdBadge')?.value.trim();
    const desc = document.getElementById('adminNewProdDesc')?.value.trim();

    if (!name || !price || !imageUrl) {
        showToast('กรุณากรอกชื่อสินค้า ราคา และ URL รูปภาพให้ครบถ้วน', 'warning');
        return;
    }

    const payload = {
        name,
        category,
        material: material || 'ทองคำขาว 18K',
        gemstone: gemstone || 'เพชรแท้',
        carat: carat || '0.50 กะรัต',
        price,
        original_price: price,
        stock,
        badge: badge || 'สินค้าใหม่',
        image_url: imageUrl,
        gallery: [imageUrl],
        description: desc || 'เครื่องประดับเพชรแท้ล้ำค่า ผลิตด้วยความประณีตระดับชั้นสูง',
        details: ["เพชรแท้ธรรมชาติ", "ตัวเรือนทองแท้ 18K", "รับประกันตลอดอายุการใช้งาน"],
        sizes: ["48", "50", "52", "54", "56"],
        can_engrave: 1,
        is_featured: 1
    };

    try {
        const res = await fetch('/api/products', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(payload)
        });
        if (res.ok) {
            showToast('เพิ่มสินค้าใหม่ลงในระบบสำเร็จ', 'success');
            document.getElementById('adminAddProductForm')?.reset();
            await loadProducts();
            await loadStats();
            return;
        }
    } catch (e) {}

    // Static fallback
    payload.id = Date.now();
    adminState.products.unshift(payload);
    showToast('เพิ่มสินค้าใหม่เรียบร้อย (บันทึกในเครื่อง)', 'success');
    document.getElementById('adminAddProductForm')?.reset();
    renderInventory();
}

// 4. COUPONS MANAGEMENT
async function loadCoupons() {
    try {
        const res = await fetch('/api/admin/coupons', { headers: getAuthHeaders() });
        if (res.ok) {
            const data = await res.json();
            if (data.success) {
                adminState.coupons = data.coupons || [];
                renderCoupons();
                return;
            }
        }
    } catch (e) {}

    adminState.coupons = [
        { id: 1, code: 'WELCOME10', discount_type: 'percentage', discount_value: 10, min_spend: 1000, description: 'ส่วนลด 10% ลูกค้าใหม่' },
        { id: 2, code: 'SPARKLE500', discount_type: 'fixed', discount_value: 500, min_spend: 3000, description: 'ส่วนลด 500 บาท เมื่อครบ 3,000' },
        { id: 3, code: 'LUXE20', discount_type: 'percentage', discount_value: 20, min_spend: 10000, description: 'ส่วนลด 20% สำหรับยอด 10,000+' }
    ];
    renderCoupons();
}

function renderCoupons() {
    const list = document.getElementById('adminCouponsList');
    if (!list) return;

    list.innerHTML = adminState.coupons.map(c => `
        <div class="p-3.5 rounded-lg border border-neutral-200 bg-white flex justify-between items-center text-xs">
            <div>
                <span class="font-mono font-bold text-neutral-900 tracking-wider bg-neutral-100 px-2.5 py-1 rounded border border-neutral-200">
                    ${c.code}
                </span>
                <p class="text-[11px] text-neutral-500 font-light mt-1.5">${c.description || ''}</p>
                <p class="text-[10px] text-neutral-400">ยอดช้อปขั้นต่ำ ฿${(c.min_spend || 0).toLocaleString()}</p>
            </div>
            <div class="text-right">
                <span class="font-serif text-base font-medium text-neutral-900 block">
                    ${c.discount_type === 'percentage' ? `${c.discount_value}%` : `฿${c.discount_value}`}
                </span>
                <span class="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-light">เปิดใช้งาน</span>
            </div>
        </div>
    `).join('');
}

async function handleCreateCoupon(event) {
    if (event) event.preventDefault();

    const code = document.getElementById('couponCode')?.value.trim().toUpperCase();
    const type = document.getElementById('couponType')?.value;
    const value = parseFloat(document.getElementById('couponValue')?.value || 0);
    const minSpend = parseFloat(document.getElementById('couponMinSpend')?.value || 0);
    const desc = document.getElementById('couponDesc')?.value.trim();

    if (!code || !value) {
        showToast('กรุณากรอกรหัสคูปองและมูลค่าส่วนลด', 'warning');
        return;
    }

    const payload = {
        code,
        discount_type: type,
        discount_value: value,
        min_spend: minSpend,
        description: desc
    };

    try {
        const res = await fetch('/api/admin/coupons', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(payload)
        });
        if (res.ok) {
            showToast(`สร้างคูปอง ${code} เรียบร้อยแล้ว`, 'success');
            document.getElementById('newCouponForm')?.reset();
            await loadCoupons();
            return;
        }
    } catch (e) {}

    adminState.coupons.unshift(payload);
    showToast(`สร้างคูปอง ${code} เรียบร้อย (บันทึกในเครื่อง)`, 'success');
    document.getElementById('newCouponForm')?.reset();
    renderCoupons();
}

// ----------------------------------------------------
// UI TABS & NAVIGATION
// ----------------------------------------------------

function switchAdminTab(tabName) {
    adminState.activeTab = tabName;

    // Update Tab Buttons
    document.querySelectorAll('.admin-nav-tab').forEach(btn => {
        if (btn.dataset.tab === tabName) {
            btn.classList.add('bg-neutral-900', 'text-white');
            btn.classList.remove('text-neutral-600', 'hover:bg-neutral-100');
        } else {
            btn.classList.remove('bg-neutral-900', 'text-white');
            btn.classList.add('text-neutral-600', 'hover:bg-neutral-100');
        }
    });

    // Update Content Panes
    document.querySelectorAll('.admin-pane').forEach(pane => pane.classList.add('hidden'));
    const activePane = document.getElementById(`pane_${tabName}`);
    if (activePane) activePane.classList.remove('hidden');
}

// ----------------------------------------------------
// TOAST NOTIFICATIONS
// ----------------------------------------------------

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    const bgColors = {
        success: 'bg-neutral-900 text-white border-neutral-800',
        error: 'bg-red-950 text-white border-red-800',
        warning: 'bg-amber-900 text-white border-amber-800',
        info: 'bg-white text-neutral-900 border-neutral-300'
    };

    toast.className = `p-3.5 rounded-xl border text-xs shadow-lg transition-all duration-300 transform translate-y-2 opacity-0 flex items-center justify-between gap-3 ${bgColors[type] || bgColors.info}`;
    toast.innerHTML = `
        <div class="flex items-center gap-2">
            <i class="fa-solid ${type === 'success' ? 'fa-check' : type === 'error' ? 'fa-triangle-exclamation' : 'fa-circle-info'} text-xs"></i>
            <span>${message}</span>
        </div>
        <button onclick="this.parentElement.remove()" class="opacity-60 hover:opacity-100"><i class="fa-solid fa-xmark text-xs"></i></button>
    `;

    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.remove('translate-y-2', 'opacity-0');
    }, 10);

    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}
