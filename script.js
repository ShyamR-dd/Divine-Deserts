const RUPEE_SYMBOL = '\u20B9';
const WHATSAPP_NUMBER = '919944077908';
const CART_STORAGE_KEY = 'cloudBakesCart';

const defaultProducts = [
    { id: 'cheese-cake', name: 'Cheese Cake', category: 'Cakes', price: 650, unit: '/500g', image_url: 'cheesecake.jpg', discount: 0, in_stock: true, quote_only: false, sort_order: 1 },
    { id: 'cup-cakes-muffins', name: 'Cup Cakes & Muffins', category: 'Cakes', price: 50, unit: '/piece', image_url: 'cupcakes.jpg', discount: 0, in_stock: true, quote_only: false, sort_order: 2 },
    { id: 'black-forest', name: 'Black Forest', category: 'Cakes', price: 650, unit: '/500g', image_url: 'blackforest.jpg', discount: 0, in_stock: true, quote_only: false, sort_order: 3 },
    { id: 'chocolate-cake', name: 'Chocolate Cake', category: 'Cakes', price: 650, unit: '/500g', image_url: 'chocolatecake.jpg', discount: 0, in_stock: true, quote_only: false, sort_order: 4 },
    { id: 'red-velvet-cake', name: 'Red Velvet Cake', category: 'Cakes', price: 900, unit: '/500g', image_url: 'redvelvet.jpg', discount: 0, in_stock: true, quote_only: false, sort_order: 5 },
    { id: 'vanilla-cake', name: 'Vanilla Cake', category: 'Cakes', price: 550, unit: '/500g', image_url: 'vanilla.jpg', discount: 0, in_stock: true, quote_only: false, sort_order: 6 },
    { id: 'brownies', name: 'Brownies', category: 'Brownies', price: 700, unit: '/500g', image_url: 'brownies.jpg', discount: 0, in_stock: true, quote_only: false, sort_order: 7 },
    { id: 'korean-cheese-bun', name: 'Korean Cheese Bun', category: 'Buns', price: 90, unit: '/piece', image_url: 'korean-cheesebun.jpg', discount: 0, in_stock: true, quote_only: false, sort_order: 8 },
    { id: 'donuts', name: 'Donuts', category: 'Desserts', price: 75, unit: '/piece', image_url: 'donuts.jpg', discount: 0, in_stock: true, quote_only: false, sort_order: 9 },
    { id: 'custom-cakes', name: 'Custom Cakes', category: 'Custom Orders', price: 0, unit: '', image_url: 'customcake.jpg', discount: 0, in_stock: true, quote_only: true, sort_order: 10 },
    { id: 'vanilla-chocolate-ice-cream', name: 'Vanilla Chocolate Ice Cream', category: 'Ice Cream', price: 210, unit: '/250ml', image_url: 'vanillaice.jpg', discount: 0, in_stock: true, quote_only: false, sort_order: 11 },
    { id: 'death-by-chocolate', name: 'Death by Chocolate', category: 'Ice Cream', price: 375, unit: '/250ml', image_url: 'deathbychoc.jpg', discount: 0, in_stock: true, quote_only: false, sort_order: 12 },
    { id: 'chocolate-hazelnut-butter', name: 'Chocolate Hazelnut Butter', category: 'Spreads', price: 500, unit: '/250g', image_url: 'chochazelnut.jpg', discount: 0, in_stock: true, quote_only: false, sort_order: 13 },
    { id: 'cashew-chocolate-butter', name: 'Cashew Chocolate Butter', category: 'Spreads', price: 350, unit: '/250g', image_url: 'cashewchoc.jpg', discount: 0, in_stock: true, quote_only: false, sort_order: 14 },
    { id: 'peanut-butter', name: 'Peanut Butter', category: 'Spreads', price: 200, unit: '/250g', image_url: 'peanutbutter.jpg', discount: 0, in_stock: true, quote_only: false, sort_order: 15 },
    { id: 'osmania-biscuits', name: 'Osmania Biscuits', category: 'Biscuits', price: 150, unit: '/200g', image_url: 'Osmania.jpg', discount: 0, in_stock: true, quote_only: false, sort_order: 16 }
];

const supabaseClient = window.supabaseClient;
const supabaseConfig = window.SUPABASE_CONFIG || {};
const hasSupabase = Boolean(supabaseClient);
const productsTable = supabaseConfig.productsTable || 'products';
const storageBucket = supabaseConfig.storageBucket || 'product-images';

let cart = normalizeCart(JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || []);
let itemCount = cart.reduce((sum, item) => sum + item.qty, 0);
let products = defaultProducts.map(mapProductRecord);
let uploadedImageFile = null;
let uploadedImagePreview = '';

function slugify(value) {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function mapProductRecord(product) {
    return {
        id: product.id,
        name: product.name,
        category: product.category || 'Menu',
        price: Number(product.price) || 0,
        unit: product.unit || '',
        image: product.image_url || product.image || '',
        discount: Number(product.discount) || 0,
        inStock: product.in_stock !== false,
        quoteOnly: Boolean(product.quote_only),
        sortOrder: Number(product.sort_order) || 0
    };
}

function toProductRecord(product) {
    return {
        id: product.id,
        name: product.name,
        category: product.category,
        price: Number(product.price) || 0,
        unit: product.unit || '',
        image_url: product.image || '',
        discount: Number(product.discount) || 0,
        in_stock: Boolean(product.inStock),
        quote_only: Boolean(product.quoteOnly),
        sort_order: Number(product.sortOrder) || 0
    };
}

function normalizeCart(items) {
    return items
        .filter(item => item && item.name && item.qty)
        .map(item => ({
            id: item.id || slugify(item.name),
            name: item.name,
            qty: Number(item.qty) || 1,
            price: Number(item.price) || 0,
            unit: item.unit || '',
            quoteOnly: Boolean(item.quoteOnly)
        }));
}

function persistCart() {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    itemCount = cart.reduce((sum, item) => sum + item.qty, 0);
}

function getProductById(productId) {
    return products.find(product => product.id === productId);
}

function getEffectivePrice(product) {
    if (!product || product.quoteOnly) return 0;
    const price = Number(product.price) || 0;
    const discount = Math.min(100, Math.max(0, Number(product.discount) || 0));
    return Math.round(price * (1 - discount / 100));
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function openWhatsApp(message) {
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
}

function updateCartCounter() {
    const existingCounter = document.querySelector('.cart-counter');
    if (existingCounter) existingCounter.remove();

    const cartHTML = `
        <div class="cart-counter" onclick="window.location.href='cart.html'">
            Cart (${itemCount})
        </div>
    `;
    document.body.insertAdjacentHTML('afterbegin', cartHTML);
}

function showInlineMessage(targetId, message, isError) {
    const element = document.getElementById(targetId);
    if (!element) return;
    element.textContent = message;
    element.style.color = isError ? '#b42318' : '#8B4513';
}

function renderImagePreview(src) {
    const preview = document.getElementById('imagePreviewBox');
    if (!preview) return;
    if (!src) {
        preview.innerHTML = '<span>No image selected</span>';
        return;
    }
    preview.innerHTML = `<img src="${escapeHtml(src)}" alt="Product preview">`;
}

async function loadProducts() {
    if (!hasSupabase) {
        products = defaultProducts.map(mapProductRecord);
        return products;
    }

    const { data, error } = await supabaseClient
        .from(productsTable)
        .select('*')
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true });

    if (error) {
        console.error(error);
        products = defaultProducts.map(mapProductRecord);
        return products;
    }

    products = (data || []).map(mapProductRecord);
    return products;
}

function renderProducts() {
    const menuGrid = document.getElementById('menuGrid');
    if (!menuGrid) return;

    if (!products.length) {
        menuGrid.innerHTML = '<div class="admin-empty">No menu items available right now.</div>';
        return;
    }

    menuGrid.innerHTML = products.map(product => {
        const effectivePrice = getEffectivePrice(product);
        const categoryBadge = `<span class="menu-badge category">${escapeHtml(product.category)}</span>`;
        const stockBadge = product.inStock
            ? '<span class="menu-badge stock">In Stock</span>'
            : '<span class="menu-badge out">Out of Stock</span>';
        const discountBadge = product.discount > 0
            ? `<span class="menu-badge discount">${product.discount}% Off</span>`
            : '';
        const priceBlock = product.quoteOnly
            ? '<div class="price-stack"><span class="quote-text">Price on request</span></div>'
            : `
                <div class="price-stack">
                    <span>${RUPEE_SYMBOL}${effectivePrice}${escapeHtml(product.unit || '')}</span>
                    ${product.discount > 0 ? `<span class="original-price">${RUPEE_SYMBOL}${product.price}${escapeHtml(product.unit || '')}</span>` : ''}
                </div>
            `;
        const disabledAttr = product.inStock ? '' : 'disabled';
        const buttonText = product.quoteOnly ? 'Request Quote' : (product.inStock ? 'Add to Cart' : 'Unavailable');

        return `
            <div class="menu-item ${product.inStock ? '' : 'out-of-stock'}" data-product-id="${escapeHtml(product.id)}">
                <img src="${escapeHtml(product.image || 'hero-bake.jpg')}" alt="${escapeHtml(product.name)}">
                <div class="menu-meta">${categoryBadge}${discountBadge}${stockBadge}</div>
                <h3>${escapeHtml(product.name)}</h3>
                ${priceBlock}
                <div class="quantity-controls">
                    <button class="qty-minus" ${disabledAttr}>-</button>
                    <span class="qty-display">0</span>
                    <button class="qty-plus" ${disabledAttr}>+</button>
                </div>
                <button class="add-cart" ${disabledAttr}>${buttonText}</button>
            </div>
        `;
    }).join('');
}

function attachSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

async function initStorefront() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => navMenu.classList.toggle('active'));
    }

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('qty-plus')) {
            const menuItem = e.target.closest('.menu-item');
            const product = getProductById(menuItem.dataset.productId);
            if (!product || !product.inStock) return;
            const qtyDisplay = e.target.parentElement.querySelector('.qty-display');
            const current = parseInt(qtyDisplay.textContent, 10);
            qtyDisplay.textContent = current + 1;
        }

        if (e.target.classList.contains('qty-minus')) {
            const qtyDisplay = e.target.parentElement.querySelector('.qty-display');
            const current = parseInt(qtyDisplay.textContent, 10);
            if (current > 0) qtyDisplay.textContent = current - 1;
        }

        if (e.target.classList.contains('add-cart')) {
            const menuItem = e.target.closest('.menu-item');
            const product = getProductById(menuItem.dataset.productId);
            if (!product || !product.inStock) return;

            const qty = parseInt(menuItem.querySelector('.qty-display').textContent, 10);
            if (qty === 0) {
                alert('Please select quantity first.');
                return;
            }

            if (product.quoteOnly) {
                const quoteMessage = [
                    'Hello, I would like a custom cake quote.',
                    `Item: ${product.name}`,
                    `Quantity: ${qty}`
                ].join('\n');
                openWhatsApp(quoteMessage);
                menuItem.querySelector('.qty-display').textContent = '0';
                return;
            }

            const price = getEffectivePrice(product);
            const existingItemIndex = cart.findIndex(item => item.id === product.id);
            if (existingItemIndex >= 0) {
                cart[existingItemIndex].qty += qty;
                cart[existingItemIndex].price = price;
                cart[existingItemIndex].unit = product.unit || '';
            } else {
                cart.push({ id: product.id, name: product.name, qty, price, unit: product.unit || '', quoteOnly: false });
            }

            persistCart();
            updateCartCounter();
            menuItem.querySelector('.qty-display').textContent = '0';
            const button = e.target;
            const originalText = button.textContent;
            button.textContent = 'Added!';
            button.style.background = '#28a745';
            setTimeout(() => {
                button.textContent = originalText;
                button.style.background = '';
            }, 1500);
        }
    });

    attachSmoothScrolling();
    await loadProducts();
    renderProducts();
    updateCartCounter();
}

function getCartLineDetails(item) {
    const product = getProductById(item.id);
    return {
        name: item.name,
        unit: item.unit || (product ? product.unit : '') || '',
        price: Number(item.price) || (product ? getEffectivePrice(product) : 0)
    };
}

function renderCart() {
    const cartItems = document.getElementById('cartItems');
    const cartFooter = document.getElementById('cartFooter');
    const emptyMsg = document.getElementById('cartEmptyMsg');
    if (!cartItems || !cartFooter || !emptyMsg) return;

    if (cart.length === 0) {
        cartItems.innerHTML = '';
        cartFooter.style.display = 'none';
        emptyMsg.style.display = 'block';
        return;
    }

    emptyMsg.style.display = 'none';
    cartFooter.style.display = 'flex';

    let totalPrice = 0;
    let html = '';

    cart.forEach((item, index) => {
        const details = getCartLineDetails(item);
        const itemTotal = details.price * item.qty;
        totalPrice += itemTotal;

        html += `
            <div class="cart-item">
                <div class="cart-item-details">
                    <h4>${escapeHtml(details.name)}</h4>
                    <p>${RUPEE_SYMBOL}${details.price.toFixed(0)}${escapeHtml(details.unit)}</p>
                </div>
                <div class="quantity-controls-cart">
                    <button class="qty-btn-cart qty-minus-cart" onclick="updateQty(${index}, -1)">-</button>
                    <span class="qty-display-cart">${item.qty}</span>
                    <button class="qty-btn-cart qty-plus-cart" onclick="updateQty(${index}, 1)">+</button>
                </div>
                <button class="delete-item" onclick="deleteItem(${index})">x</button>
                <div class="item-total">${RUPEE_SYMBOL}${itemTotal.toFixed(0)}</div>
            </div>
        `;
    });

    cartItems.innerHTML = html;
    document.getElementById('cartItemCount').textContent = itemCount;
    document.getElementById('cartTotalPrice').textContent = totalPrice.toFixed(0);
}

window.updateQty = function(index, change) {
    cart[index].qty = Math.max(1, cart[index].qty + change);
    persistCart();
    renderCart();
};

window.deleteItem = function(index) {
    if (confirm(`Remove ${cart[index].name}?`)) {
        cart.splice(index, 1);
        persistCart();
        renderCart();
    }
};

window.checkout = function() {
    if (cart.length === 0) {
        alert('Cart is empty.');
        return;
    }

    let message = 'Divine Desserts - NEW ORDER\n\n';
    let totalPrice = 0;

    cart.forEach(item => {
        const details = getCartLineDetails(item);
        const itemTotal = details.price * item.qty;
        totalPrice += itemTotal;
        message += `- ${details.name} x${item.qty}\n  ${RUPEE_SYMBOL}${itemTotal.toFixed(0)} ${details.unit}\n\n`;
    });

    message += `Grand total: ${RUPEE_SYMBOL}${totalPrice.toFixed(0)}\n\nDelivery: Coimbatore`;
    openWhatsApp(message);
};

function resetProductForm() {
    const form = document.getElementById('productForm');
    if (!form) return;
    form.reset();
    document.getElementById('productId').value = '';
    document.getElementById('productDiscount').value = '0';
    document.getElementById('productPrice').value = '0';
    document.getElementById('productSortOrder').value = String(products.length + 1 || 1);
    document.getElementById('productInStock').checked = true;
    uploadedImageFile = null;
    uploadedImagePreview = '';
    renderImagePreview('');
    document.getElementById('editorTitle').textContent = 'Create Product';
    document.getElementById('editorModeLabel').textContent = 'Use this form to add a new product.';
    document.getElementById('saveProductBtn').textContent = 'Add Item';
    document.getElementById('cancelEditBtn').classList.add('hidden');
    showInlineMessage('productMessage', '', false);
}

function fillProductForm(product) {
    document.getElementById('productId').value = product.id;
    document.getElementById('productName').value = product.name;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productUnit').value = product.unit || '';
    document.getElementById('productDiscount').value = product.discount || 0;
    document.getElementById('productSortOrder').value = product.sortOrder || 0;
    document.getElementById('productQuoteOnly').checked = Boolean(product.quoteOnly);
    document.getElementById('productInStock').checked = product.inStock !== false;
    document.getElementById('productImageUrl').value = product.image && !product.image.startsWith('data:') ? product.image : '';
    uploadedImageFile = null;
    uploadedImagePreview = product.image || '';
    renderImagePreview(product.image || '');
    document.getElementById('editorTitle').textContent = `Edit ${product.name}`;
    document.getElementById('editorModeLabel').textContent = 'You are editing an existing item. Save when finished or stop editing to return to add mode.';
    document.getElementById('saveProductBtn').textContent = 'Save Changes';
    document.getElementById('cancelEditBtn').classList.remove('hidden');
}

function renderAdminProducts() {
    const list = document.getElementById('adminProductList');
    const countLabel = document.getElementById('productCountLabel');
    if (!list || !countLabel) return;

    countLabel.textContent = `${products.length} item${products.length === 1 ? '' : 's'}`;

    if (!products.length) {
        list.innerHTML = '<div class="admin-empty">No menu items available yet.</div>';
        return;
    }

    list.innerHTML = products.map(product => {
        const effectivePrice = getEffectivePrice(product);
        return `
            <article class="admin-product-item">
                <img class="admin-thumb" src="${escapeHtml(product.image || 'hero-bake.jpg')}" alt="${escapeHtml(product.name)}">
                <div class="admin-product-meta">
                    <h3>${escapeHtml(product.name)}</h3>
                    <p>${escapeHtml(product.category)}${product.quoteOnly ? ' � Quote only' : ` � ${RUPEE_SYMBOL}${effectivePrice}${escapeHtml(product.unit || '')}`}</p>
                    <div class="admin-tags">
                        <span class="admin-pill">${product.inStock ? 'In stock' : 'Out of stock'}</span>
                        ${product.discount > 0 ? `<span class="admin-pill">${product.discount}% off</span>` : ''}
                        <span class="admin-pill">Order ${product.sortOrder}</span>
                    </div>
                </div>
                <div class="admin-product-actions">
                    <button class="admin-action-btn" type="button" data-admin-action="edit" data-product-id="${escapeHtml(product.id)}">Edit</button>
                    <button class="admin-action-btn" type="button" data-admin-action="toggle-stock" data-product-id="${escapeHtml(product.id)}">${product.inStock ? 'Mark Out of Stock' : 'Mark In Stock'}</button>
                    <button class="admin-action-btn" type="button" data-admin-action="delete" data-product-id="${escapeHtml(product.id)}">Delete</button>
                </div>
            </article>
        `;
    }).join('');
}

function toggleAdminView(isLoggedIn) {
    const loginView = document.getElementById('adminLoginView');
    const dashboardView = document.getElementById('adminDashboardView');
    if (!loginView || !dashboardView) return;
    loginView.classList.toggle('hidden', isLoggedIn);
    dashboardView.classList.toggle('hidden', !isLoggedIn);
    if (isLoggedIn) {
        renderAdminProducts();
        resetProductForm();
    }
}

async function uploadProductImage(productId) {
    if (!uploadedImageFile || !hasSupabase) return uploadedImagePreview || '';

    const safeName = uploadedImageFile.name.replace(/[^a-zA-Z0-9.-]/g, '-');
    const path = `${productId}-${Date.now()}-${safeName}`;
    const { error } = await supabaseClient.storage
        .from(storageBucket)
        .upload(path, uploadedImageFile, { upsert: true });

    if (error) throw error;

    const { data } = supabaseClient.storage.from(storageBucket).getPublicUrl(path);
    return data.publicUrl;
}

async function replaceAllProducts(records) {
    const { error: deleteError } = await supabaseClient.from(productsTable).delete().neq('id', '');
    if (deleteError) throw deleteError;

    const { error: insertError } = await supabaseClient.from(productsTable).insert(records);
    if (insertError) throw insertError;
}

async function ensureAdminSession() {
    if (!hasSupabase) return false;
    const { data, error } = await supabaseClient.auth.getSession();
    if (error) {
        console.error(error);
        return false;
    }
    return Boolean(data.session);
}

async function initAdminPage() {
    const loginForm = document.getElementById('staffLoginForm');
    const productForm = document.getElementById('productForm');
    const logoutBtn = document.getElementById('logoutBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const resetMenuBtn = document.getElementById('resetMenuBtn');
    const productImage = document.getElementById('productImage');
    const adminList = document.getElementById('adminProductList');

    if (!hasSupabase) {
        showInlineMessage('loginMessage', 'Add your Supabase URL and anon key in supabase-config.js first.', true);
        return;
    }

    await loadProducts();
    const loggedIn = await ensureAdminSession();
    toggleAdminView(loggedIn);

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        showInlineMessage('loginMessage', 'Signing in...', false);
        const email = document.getElementById('staffUsername').value.trim();
        const password = document.getElementById('staffPassword').value;
        const { error } = await supabaseClient.auth.signInWithPassword({ email, password });

        if (error) {
            showInlineMessage('loginMessage', error.message, true);
            return;
        }

        await loadProducts();
        toggleAdminView(true);
        showInlineMessage('loginMessage', '', false);
    });

    logoutBtn.addEventListener('click', async () => {
        await supabaseClient.auth.signOut();
        toggleAdminView(false);
        showInlineMessage('loginMessage', 'Logged out.', false);
    });

    cancelEditBtn.addEventListener('click', resetProductForm);

    resetMenuBtn.addEventListener('click', async () => {
        if (!confirm('Reset the full menu back to the default items?')) return;
        try {
            showInlineMessage('productMessage', 'Resetting menu...', false);
            await replaceAllProducts(defaultProducts);
            await loadProducts();
            renderAdminProducts();
            resetProductForm();
            showInlineMessage('productMessage', 'Menu reset to default items.', false);
        } catch (error) {
            console.error(error);
            showInlineMessage('productMessage', error.message || 'Could not reset menu.', true);
        }
    });

    productImage.addEventListener('change', () => {
        const file = productImage.files && productImage.files[0];
        if (!file) {
            uploadedImageFile = null;
            uploadedImagePreview = '';
            renderImagePreview('');
            return;
        }

        uploadedImageFile = file;
        const reader = new FileReader();
        reader.onload = () => {
            uploadedImagePreview = reader.result;
            renderImagePreview(uploadedImagePreview);
        };
        reader.readAsDataURL(file);
    });

    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        showInlineMessage('productMessage', 'Saving item...', false);

        const idField = document.getElementById('productId').value.trim();
        const name = document.getElementById('productName').value.trim();
        const category = document.getElementById('productCategory').value.trim() || 'Menu';
        const price = Number(document.getElementById('productPrice').value) || 0;
        const unit = document.getElementById('productUnit').value.trim();
        const discount = Math.min(100, Math.max(0, Number(document.getElementById('productDiscount').value) || 0));
        const sortOrder = Number(document.getElementById('productSortOrder').value) || products.length + 1;
        const quoteOnly = document.getElementById('productQuoteOnly').checked;
        const inStock = document.getElementById('productInStock').checked;
        const imageUrlFallback = document.getElementById('productImageUrl').value.trim();

        if (!name) {
            showInlineMessage('productMessage', 'Item name is required.', true);
            return;
        }

        const productId = idField || slugify(name);
        const duplicateIndex = products.findIndex(product => product.name.toLowerCase() === name.toLowerCase() && product.id !== productId);
        if (duplicateIndex >= 0) {
            showInlineMessage('productMessage', 'An item with this name already exists.', true);
            return;
        }

        try {
            const uploadedImageUrl = await uploadProductImage(productId);
            const finalImage = uploadedImageUrl || uploadedImagePreview || imageUrlFallback;
            if (!finalImage) {
                showInlineMessage('productMessage', 'Please upload an image or provide an image URL.', true);
                return;
            }

            const nextProduct = {
                id: productId,
                name,
                category,
                price: quoteOnly ? 0 : price,
                unit: quoteOnly ? '' : unit,
                image: finalImage,
                discount: quoteOnly ? 0 : discount,
                inStock,
                quoteOnly,
                sortOrder
            };

            const { error } = await supabaseClient
                .from(productsTable)
                .upsert(toProductRecord(nextProduct));

            if (error) throw error;

            await loadProducts();
            renderAdminProducts();
            resetProductForm();
            showInlineMessage('productMessage', 'Menu item saved.', false);
        } catch (error) {
            console.error(error);
            showInlineMessage('productMessage', error.message || 'Could not save item.', true);
        }
    });

    adminList.addEventListener('click', async (e) => {
        const button = e.target.closest('[data-admin-action]');
        if (!button) return;
        const productId = button.dataset.productId;
        const action = button.dataset.adminAction;
        const product = getProductById(productId);
        if (!product) return;

        if (action === 'edit') {
            fillProductForm(product);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        try {
            if (action === 'toggle-stock') {
                const { error } = await supabaseClient
                    .from(productsTable)
                    .update({ in_stock: !product.inStock })
                    .eq('id', productId);
                if (error) throw error;
                await loadProducts();
                renderAdminProducts();
                return;
            }

            if (action === 'delete') {
                if (!confirm(`Delete ${product.name}?`)) return;
                const { error } = await supabaseClient.from(productsTable).delete().eq('id', productId);
                if (error) throw error;
                await loadProducts();
                renderAdminProducts();
                if (document.getElementById('productId').value === productId) {
                    resetProductForm();
                }
            }
        } catch (error) {
            console.error(error);
            showInlineMessage('productMessage', error.message || 'Could not update item.', true);
        }
    });

    supabaseClient.auth.onAuthStateChange(async (_event, session) => {
        toggleAdminView(Boolean(session));
        if (session) {
            await loadProducts();
            renderAdminProducts();
        }
    });
}

async function initCartPage() {
    await loadProducts();
    renderCart();
}

if (window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/')) {
    initStorefront();
}

if (window.location.pathname.includes('cart.html')) {
    document.addEventListener('DOMContentLoaded', initCartPage);
}

if (window.location.pathname.includes('admin.html')) {
    document.addEventListener('DOMContentLoaded', initAdminPage);
}


