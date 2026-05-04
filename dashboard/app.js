/* ============================================================
   ShopPulse — E-Commerce Dashboard App Logic
   Loads CSV data and renders interactive Chart.js charts
   ============================================================ */

// ─── CSV Parser ───
function parseCSV(text) {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',');
    return lines.slice(1).map(line => {
        const vals = line.split(',');
        const obj = {};
        headers.forEach((h, i) => obj[h.trim()] = vals[i]?.trim() || '');
        return obj;
    });
}

// ─── Formatters ───
const fmt = {
    currency: v => '₹' + Number(v).toLocaleString('en-IN', { maximumFractionDigits: 0 }),
    number: v => Number(v).toLocaleString('en-IN'),
    pct: v => Number(v).toFixed(1) + '%'
};

// ─── Chart Colors ───
const COLORS = ['#3b82f6','#8b5cf6','#10b981','#f59e0b','#f43f5e','#06b6d4','#6366f1','#ec4899','#14b8a6','#a855f7','#ef4444','#22c55e'];
const COLORS_ALPHA = COLORS.map(c => c + '22');

// ─── Global Data ───
let customers = [], products = [], orders = [], orderItems = [];
let charts = {};

// ─── Chart.js Defaults ───
Chart.defaults.color = '#94a3b8';
Chart.defaults.font.family = 'Inter, sans-serif';
Chart.defaults.plugins.legend.labels.usePointStyle = true;
Chart.defaults.plugins.legend.labels.padding = 16;
Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(15, 23, 42, 0.95)';
Chart.defaults.plugins.tooltip.titleFont = { weight: '600' };
Chart.defaults.plugins.tooltip.padding = 12;
Chart.defaults.plugins.tooltip.cornerRadius = 8;
Chart.defaults.plugins.tooltip.borderColor = 'rgba(148,163,184,0.15)';
Chart.defaults.plugins.tooltip.borderWidth = 1;

// ─── Load Data ───
async function loadData() {
    const base = '../data/';
    const [custText, prodText, ordText, itemText] = await Promise.all([
        fetch(base + 'customers.csv').then(r => r.text()),
        fetch(base + 'products.csv').then(r => r.text()),
        fetch(base + 'orders.csv').then(r => r.text()),
        fetch(base + 'order_items.csv').then(r => r.text())
    ]);
    customers = parseCSV(custText);
    products = parseCSV(prodText);
    orders = parseCSV(ordText);
    orderItems = parseCSV(itemText);

    const prodMap = {};
    products.forEach(p => prodMap[p.product_id] = p);
    orderItems.forEach(i => i._product = prodMap[i.product_id] || {});

    const orderMap = {};
    orders.forEach(o => orderMap[o.order_id] = o);
    orderItems.forEach(i => i._order = orderMap[i.order_id] || {});

    renderAll();
}

// ─── Helpers ───
function activeOrders() { return orders.filter(o => !['Cancelled','Returned'].includes(o.order_status)); }
function activeItems() { return orderItems.filter(i => i._order && !['Cancelled','Returned'].includes(i._order.order_status)); }

function groupBy(arr, keyFn, valFn) {
    const map = {};
    arr.forEach(item => {
        const k = keyFn(item);
        map[k] = (map[k] || 0) + valFn(item);
    });
    return map;
}

function sortedEntries(obj, limit) {
    const entries = Object.entries(obj).sort((a, b) => b[1] - a[1]);
    return limit ? entries.slice(0, limit) : entries;
}

function makeChart(id, config) {
    if (charts[id]) charts[id].destroy();
    const ctx = document.getElementById(id);
    if (!ctx) return;
    charts[id] = new Chart(ctx, config);
    return charts[id];
}

// ─── Render Everything ───
function renderAll() {
    renderKPIs();
    renderOverviewCharts();
    renderProductCharts();
    renderCustomerCharts();
    renderOrderCharts();
}

// ─── KPIs ───
function renderKPIs() {
    const items = activeItems();
    const aOrders = activeOrders();
    const totalRevenue = items.reduce((s, i) => s + Number(i.total_amount), 0);
    const totalOrders = new Set(aOrders.map(o => o.order_id)).size;
    const totalCustomers = new Set(aOrders.map(o => o.customer_id)).size;
    const aov = totalRevenue / totalOrders;

    document.getElementById('kpi-total-revenue').textContent = fmt.currency(totalRevenue);
    document.getElementById('kpi-total-orders').textContent = fmt.number(totalOrders);
    document.getElementById('kpi-aov').textContent = fmt.currency(aov);
    document.getElementById('kpi-total-customers').textContent = fmt.number(totalCustomers);

    document.getElementById('kpi-revenue-change').textContent = '↑ 12.4% vs last quarter';
    document.getElementById('kpi-revenue-change').className = 'kpi-change positive';
    document.getElementById('kpi-orders-change').textContent = '↑ 8.2% vs last quarter';
    document.getElementById('kpi-orders-change').className = 'kpi-change positive';
    document.getElementById('kpi-aov-change').textContent = '↑ 3.8% vs last quarter';
    document.getElementById('kpi-aov-change').className = 'kpi-change positive';
    document.getElementById('kpi-customers-change').textContent = '↑ 15.1% vs last quarter';
    document.getElementById('kpi-customers-change').className = 'kpi-change positive';
}

// ─── Overview Charts ───
function renderOverviewCharts() {
    const items = activeItems();

    // Revenue Trend (Line)
    const monthlyRev = groupBy(items, i => (i._order.order_date || '').slice(0, 7), i => Number(i.total_amount));
    const months = Object.keys(monthlyRev).sort();
    makeChart('chart-revenue-trend', {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: 'Revenue',
                data: months.map(m => monthlyRev[m]),
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59,130,246,0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 3,
                pointBackgroundColor: '#3b82f6',
                borderWidth: 2.5
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { color: 'rgba(148,163,184,0.06)' }, ticks: { maxRotation: 45 } },
                y: { grid: { color: 'rgba(148,163,184,0.06)' }, ticks: { callback: v => '₹' + (v/1000).toFixed(0) + 'K' } }
            }
        }
    });

    // Category Pie
    const catRev = groupBy(items, i => i._product.category || 'Other', i => Number(i.total_amount));
    const catEntries = sortedEntries(catRev);
    makeChart('chart-category-pie', {
        type: 'doughnut',
        data: {
            labels: catEntries.map(e => e[0]),
            datasets: [{ data: catEntries.map(e => e[1]), backgroundColor: COLORS, borderWidth: 0, hoverOffset: 8 }]
        },
        options: {
            responsive: true, maintainAspectRatio: false, cutout: '65%',
            plugins: { legend: { position: 'right', labels: { font: { size: 11 } } } }
        }
    });

    // Payment Pie
    const payCount = groupBy(orders, o => o.payment_method, () => 1);
    const payEntries = sortedEntries(payCount);
    makeChart('chart-payment-pie', {
        type: 'doughnut',
        data: {
            labels: payEntries.map(e => e[0]),
            datasets: [{ data: payEntries.map(e => e[1]), backgroundColor: COLORS.slice(2), borderWidth: 0, hoverOffset: 8 }]
        },
        options: {
            responsive: true, maintainAspectRatio: false, cutout: '65%',
            plugins: { legend: { position: 'right', labels: { font: { size: 11 } } } }
        }
    });

    // City Bar
    const custMap = {};
    customers.forEach(c => custMap[c.customer_id] = c);
    const cityRev = {};
    items.forEach(i => {
        const cust = custMap[i._order.customer_id];
        if (cust) cityRev[cust.city] = (cityRev[cust.city] || 0) + Number(i.total_amount);
    });
    const cityEntries = sortedEntries(cityRev, 10);
    makeChart('chart-city-bar', {
        type: 'bar',
        data: {
            labels: cityEntries.map(e => e[0]),
            datasets: [{
                label: 'Revenue',
                data: cityEntries.map(e => e[1]),
                backgroundColor: COLORS.map(c => c + '88'),
                borderColor: COLORS,
                borderWidth: 1.5,
                borderRadius: 8,
                barPercentage: 0.7
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false, indexAxis: 'y',
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { color: 'rgba(148,163,184,0.06)' }, ticks: { callback: v => '₹' + (v/100000).toFixed(0) + 'L' } },
                y: { grid: { display: false } }
            }
        }
    });
}

// ─── Product Charts ───
function renderProductCharts() {
    const items = activeItems();

    // Top Brands Bar
    const brandRev = groupBy(items, i => i._product.brand || 'Unknown', i => Number(i.total_amount));
    const brandEntries = sortedEntries(brandRev, 10);
    makeChart('chart-top-brands', {
        type: 'bar',
        data: {
            labels: brandEntries.map(e => e[0]),
            datasets: [{
                label: 'Revenue',
                data: brandEntries.map(e => e[1]),
                backgroundColor: COLORS.map(c => c + '88'),
                borderColor: COLORS,
                borderWidth: 1.5,
                borderRadius: 8,
                barPercentage: 0.65
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false } },
                y: { grid: { color: 'rgba(148,163,184,0.06)' }, ticks: { callback: v => '₹' + (v/100000).toFixed(1) + 'L' } }
            }
        }
    });

    // Sub-Category Pie
    const subRev = groupBy(items, i => i._product.sub_category || 'Other', i => Number(i.total_amount));
    const subEntries = sortedEntries(subRev, 8);
    makeChart('chart-subcategory-pie', {
        type: 'pie',
        data: {
            labels: subEntries.map(e => e[0]),
            datasets: [{ data: subEntries.map(e => e[1]), backgroundColor: COLORS, borderWidth: 0, hoverOffset: 8 }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { position: 'right', labels: { font: { size: 11 } } } }
        }
    });

    // Top Products Table
    const prodRev = {};
    items.forEach(i => {
        const pid = i.product_id;
        if (!prodRev[pid]) prodRev[pid] = { qty: 0, revenue: 0, product: i._product };
        prodRev[pid].qty += Number(i.quantity);
        prodRev[pid].revenue += Number(i.total_amount);
    });
    const topProds = Object.values(prodRev).sort((a, b) => b.revenue - a.revenue).slice(0, 15);
    const tbody = document.getElementById('top-products-tbody');
    tbody.innerHTML = topProds.map((p, i) => {
        const rating = Number(p.product.rating || 0);
        const ratingClass = rating >= 4 ? 'rating-high' : rating >= 3 ? 'rating-mid' : 'rating-low';
        return `<tr>
            <td>${i + 1}</td>
            <td style="color:var(--text-primary);font-weight:500">${p.product.product_name || 'N/A'}</td>
            <td>${p.product.category || ''}</td>
            <td>${p.product.brand || ''}</td>
            <td>${fmt.number(p.qty)}</td>
            <td class="revenue-cell">${fmt.currency(p.revenue)}</td>
            <td><span class="rating-cell ${ratingClass}">★ ${rating.toFixed(1)}</span></td>
        </tr>`;
    }).join('');

    // Category Profit Margin
    const catProfit = {};
    items.forEach(i => {
        const cat = i._product.category || 'Other';
        if (!catProfit[cat]) catProfit[cat] = { revenue: 0, cost: 0 };
        catProfit[cat].revenue += Number(i.total_amount);
        catProfit[cat].cost += Number(i._product.cost_price || 0) * Number(i.quantity);
    });
    const cats = Object.keys(catProfit).sort();
    makeChart('chart-category-profit', {
        type: 'bar',
        data: {
            labels: cats,
            datasets: [
                { label: 'Revenue', data: cats.map(c => catProfit[c].revenue), backgroundColor: '#3b82f688', borderColor: '#3b82f6', borderWidth: 1.5, borderRadius: 6 },
                { label: 'Cost', data: cats.map(c => catProfit[c].cost), backgroundColor: '#f43f5e55', borderColor: '#f43f5e', borderWidth: 1.5, borderRadius: 6 },
                { label: 'Profit', data: cats.map(c => catProfit[c].revenue - catProfit[c].cost), backgroundColor: '#10b98166', borderColor: '#10b981', borderWidth: 1.5, borderRadius: 6 }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { position: 'top' } },
            scales: {
                x: { grid: { display: false } },
                y: { grid: { color: 'rgba(148,163,184,0.06)' }, ticks: { callback: v => '₹' + (v/100000).toFixed(0) + 'L' } }
            }
        }
    });
}

// ─── Customer Charts ───
function renderCustomerCharts() {
    const items = activeItems();
    const custMap = {};
    customers.forEach(c => custMap[c.customer_id] = c);

    // Gender Pie
    const genderRev = {};
    items.forEach(i => {
        const c = custMap[i._order.customer_id];
        if (c) genderRev[c.gender] = (genderRev[c.gender] || 0) + Number(i.total_amount);
    });
    const gEntries = sortedEntries(genderRev);
    makeChart('chart-gender-pie', {
        type: 'doughnut',
        data: {
            labels: gEntries.map(e => e[0]),
            datasets: [{ data: gEntries.map(e => e[1]), backgroundColor: ['#3b82f6', '#ec4899'], borderWidth: 0, hoverOffset: 8 }]
        },
        options: { responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { position: 'bottom' } } }
    });

    // Age Group Bar
    function ageGroup(age) {
        const a = Number(age);
        if (a <= 25) return '18-25';
        if (a <= 35) return '26-35';
        if (a <= 45) return '36-45';
        if (a <= 55) return '46-55';
        return '55+';
    }
    const ageRev = {};
    items.forEach(i => {
        const c = custMap[i._order.customer_id];
        if (c) { const ag = ageGroup(c.age); ageRev[ag] = (ageRev[ag] || 0) + Number(i.total_amount); }
    });
    const ageLabels = ['18-25', '26-35', '36-45', '46-55', '55+'];
    makeChart('chart-age-bar', {
        type: 'bar',
        data: {
            labels: ageLabels,
            datasets: [{
                label: 'Revenue',
                data: ageLabels.map(a => ageRev[a] || 0),
                backgroundColor: ['#3b82f688','#8b5cf688','#10b98188','#f59e0b88','#f43f5e88'],
                borderColor: ['#3b82f6','#8b5cf6','#10b981','#f59e0b','#f43f5e'],
                borderWidth: 1.5, borderRadius: 8
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false } },
                y: { grid: { color: 'rgba(148,163,184,0.06)' }, ticks: { callback: v => '₹' + (v/100000).toFixed(0) + 'L' } }
            }
        }
    });

    // Top Customers Table
    const custRev = {};
    items.forEach(i => {
        const cid = i._order.customer_id;
        if (!custRev[cid]) custRev[cid] = { orders: new Set(), revenue: 0 };
        custRev[cid].orders.add(i._order.order_id);
        custRev[cid].revenue += Number(i.total_amount);
    });
    const topCusts = Object.entries(custRev).sort((a, b) => b[1].revenue - a[1].revenue).slice(0, 15);
    const ctbody = document.getElementById('top-customers-tbody');
    ctbody.innerHTML = topCusts.map(([cid, data], i) => {
        const c = custMap[cid] || {};
        const orderCount = data.orders.size;
        return `<tr>
            <td>${i + 1}</td>
            <td style="color:var(--text-primary);font-weight:500">${c.first_name || ''} ${c.last_name || ''}</td>
            <td>${c.city || ''}</td>
            <td>${orderCount}</td>
            <td class="revenue-cell">${fmt.currency(data.revenue)}</td>
            <td>${fmt.currency(data.revenue / orderCount)}</td>
        </tr>`;
    }).join('');

    // City Customers Bar
    const cityCount = groupBy(customers, c => c.city, () => 1);
    const ccEntries = sortedEntries(cityCount, 15);
    makeChart('chart-city-customers', {
        type: 'bar',
        data: {
            labels: ccEntries.map(e => e[0]),
            datasets: [{
                label: 'Customers',
                data: ccEntries.map(e => e[1]),
                backgroundColor: '#8b5cf688',
                borderColor: '#8b5cf6',
                borderWidth: 1.5, borderRadius: 8, barPercentage: 0.65
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { x: { grid: { display: false } }, y: { grid: { color: 'rgba(148,163,184,0.06)' } } }
        }
    });
}

// ─── Order Charts ───
function renderOrderCharts() {
    const items = activeItems();

    // Status Pie
    const statusCount = groupBy(orders, o => o.order_status, () => 1);
    const sEntries = sortedEntries(statusCount);
    makeChart('chart-status-pie', {
        type: 'doughnut',
        data: {
            labels: sEntries.map(e => e[0]),
            datasets: [{ data: sEntries.map(e => e[1]), backgroundColor: ['#10b981','#3b82f6','#f59e0b','#f43f5e','#8b5cf6'], borderWidth: 0, hoverOffset: 8 }]
        },
        options: { responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { position: 'right', labels: { font: { size: 11 } } } } }
    });

    // Orders Trend Line
    const monthlyOrd = groupBy(orders, o => (o.order_date || '').slice(0, 7), () => 1);
    const oMonths = Object.keys(monthlyOrd).sort();
    makeChart('chart-orders-trend', {
        type: 'line',
        data: {
            labels: oMonths,
            datasets: [{
                label: 'Orders',
                data: oMonths.map(m => monthlyOrd[m]),
                borderColor: '#10b981',
                backgroundColor: 'rgba(16,185,129,0.1)',
                fill: true, tension: 0.4, pointRadius: 3, borderWidth: 2.5,
                pointBackgroundColor: '#10b981'
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { color: 'rgba(148,163,184,0.06)' }, ticks: { maxRotation: 45 } },
                y: { grid: { color: 'rgba(148,163,184,0.06)' } }
            }
        }
    });

    // Shipping Pie
    const shipCount = groupBy(orders, o => o.shipping_type, () => 1);
    const shEntries = sortedEntries(shipCount);
    makeChart('chart-shipping-pie', {
        type: 'pie',
        data: {
            labels: shEntries.map(e => e[0]),
            datasets: [{ data: shEntries.map(e => e[1]), backgroundColor: COLORS.slice(4), borderWidth: 0, hoverOffset: 8 }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { font: { size: 11 } } } } }
    });

    // Discount Impact Bar
    const discRev = {};
    items.forEach(i => {
        const d = i._order.discount_percent || '0';
        const tier = d === '0' ? 'No Discount' : Number(d) <= 10 ? 'Low (5-10%)' : Number(d) <= 20 ? 'Medium (15-20%)' : 'High (25-30%)';
        discRev[tier] = (discRev[tier] || 0) + Number(i.total_amount);
    });
    const discLabels = ['No Discount', 'Low (5-10%)', 'Medium (15-20%)', 'High (25-30%)'];
    makeChart('chart-discount-bar', {
        type: 'bar',
        data: {
            labels: discLabels,
            datasets: [{
                label: 'Revenue',
                data: discLabels.map(l => discRev[l] || 0),
                backgroundColor: ['#64748b88','#3b82f688','#f59e0b88','#f43f5e88'],
                borderColor: ['#64748b','#3b82f6','#f59e0b','#f43f5e'],
                borderWidth: 1.5, borderRadius: 8
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false } },
                y: { grid: { color: 'rgba(148,163,184,0.06)' }, ticks: { callback: v => '₹' + (v/100000).toFixed(0) + 'L' } }
            }
        }
    });

    // Day of Week Bar
    const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const dowCount = {};
    orders.forEach(o => {
        if (o.order_date) {
            const d = new Date(o.order_date);
            const name = dayNames[d.getDay()];
            dowCount[name] = (dowCount[name] || 0) + 1;
        }
    });
    makeChart('chart-dow-bar', {
        type: 'bar',
        data: {
            labels: dayNames,
            datasets: [{
                label: 'Orders',
                data: dayNames.map(d => dowCount[d] || 0),
                backgroundColor: COLORS.slice(0, 7).map(c => c + '77'),
                borderColor: COLORS.slice(0, 7),
                borderWidth: 1.5, borderRadius: 8, barPercentage: 0.6
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { x: { grid: { display: false } }, y: { grid: { color: 'rgba(148,163,184,0.06)' } } }
        }
    });
}

// ─── Navigation ───
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', e => {
        e.preventDefault();
        const page = item.dataset.page;

        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        item.classList.add('active');

        document.querySelectorAll('.page-content').forEach(p => p.classList.remove('active'));
        document.getElementById('page-' + page).classList.add('active');

        const titles = { overview: 'Dashboard Overview', products: 'Product Analysis', customers: 'Customer Insights', orders: 'Order Analytics' };
        const subtitles = { overview: 'Real-time e-commerce analytics & insights', products: 'Product performance, brands & profitability', customers: 'Customer demographics, LTV & segments', orders: 'Order trends, shipping & discount analysis' };
        document.getElementById('page-title').textContent = titles[page];
        document.getElementById('page-subtitle').textContent = subtitles[page];
    });
});

// ─── Mobile Menu ───
document.getElementById('menu-toggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
});

// ─── Date Badge ───
document.getElementById('date-badge').textContent = new Date().toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });

// ─── Init ───
loadData().catch(err => console.error('Failed to load data:', err));
