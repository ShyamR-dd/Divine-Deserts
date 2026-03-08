// Shared cart data (persists between pages using localStorage)
let cart = JSON.parse(localStorage.getItem('cloudBakesCart')) || [];
let itemCount = cart.reduce((sum, item) => sum + item.qty, 0);

// Helper function for units
function getUnit(name) {
    if (name.includes('Cake') || name.includes('cake')) return '/kg';
    if (name.includes('Cup') || name.includes('Cheese Bun') || name.includes('Donuts')) return '/piece';
    if (name.includes('Ice Cream')) return '/500ml';
    if (name.includes('Butter')) return '/250g';
    if (name.includes('Biscuits') || name.includes('Brownies')) return '/pack';
    return '';
}

// ===== MAIN PAGE (index.html) SCRIPT =====
if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => navMenu.classList.toggle('active'));
    }

    // Quantity controls and Add to Cart
    document.addEventListener('click', (e) => {
        // + button
        if (e.target.classList.contains('qty-plus')) {
            const qtyDisplay = e.target.parentElement.querySelector('.qty-display');
            let current = parseInt(qtyDisplay.textContent);
            qtyDisplay.textContent = current + 1;
        }
        
        // - button
        if (e.target.classList.contains('qty-minus')) {
            const qtyDisplay = e.target.parentElement.querySelector('.qty-display');
            let current = parseInt(qtyDisplay.textContent);
            if (current > 0) qtyDisplay.textContent = current - 1;
        }
        
        // Add to Cart
        if (e.target.classList.contains('add-cart')) {
            const menuItem = e.target.closest('.menu-item');
            const name = menuItem.querySelector('h3').textContent;
            const qty = parseInt(menuItem.querySelector('.qty-display').textContent);
            
            if (qty === 0) {
                alert('Please select quantity first!');
                return;
            }
            
            // Extract price: ₹450/kg → 450
            const priceText = menuItem.querySelector('p').textContent;
            const priceMatch = priceText.match(/₹(\d+)/);
            const price = priceMatch ? parseFloat(priceMatch[1]) : 0;
            
            if (price === 0) {
                alert('Price not found for this item!');
                return;
            }
            
            // Add or update cart item
            const existingItemIndex = cart.findIndex(item => item.name === name);
            if (existingItemIndex >= 0) {
                cart[existingItemIndex].qty += qty;
            } else {
                cart.push({ name, price, qty });
            }
            
            itemCount += qty;
            localStorage.setItem('cloudBakesCart', JSON.stringify(cart));
            updateCartCounter();
            
            // Reset quantity and show feedback
            menuItem.querySelector('.qty-display').textContent = '0';
            const button = e.target;
            const originalText = button.textContent;
            button.textContent = 'Added! 🎉';
            button.style.background = '#28a745';
            setTimeout(() => {
                button.textContent = originalText;
                button.style.background = '';
            }, 1500);
        }
    });

    function updateCartCounter() {
        const existingCounter = document.querySelector('.cart-counter');
        if (existingCounter) existingCounter.remove();
        
        const cartHTML = `
            <div class="cart-counter" onclick="window.location.href='cart.html'">
                🛒 Cart (${itemCount})
            </div>
        `;
        document.body.insertAdjacentHTML('afterbegin', cartHTML);
    }
    
    // Smooth scrolling for nav links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
    
    updateCartCounter();
}

// ===== CART PAGE (cart.html) SCRIPT =====
if (window.location.pathname.includes('cart.html')) {
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
            const itemTotal = item.price * item.qty;
            totalPrice += itemTotal;
            
            html += `
                <div class="cart-item">
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <p>₹${item.price.toFixed(0)}${getUnit(item.name)}</p>
                    </div>
                    <div class="quantity-controls-cart">
                        <button class="qty-btn-cart qty-minus-cart" onclick="updateQty(${index}, -1)">−</button>
                        <span class="qty-display-cart">${item.qty}</span>
                        <button class="qty-btn-cart qty-plus-cart" onclick="updateQty(${index}, 1)">+</button>
                    </div>
                    <button class="delete-item" onclick="deleteItem(${index})">✕</button>
                    <div class="item-total">₹${itemTotal.toFixed(0)}</div>
                </div>
            `;
        });
        
        cartItems.innerHTML = html;
        document.getElementById('cartItemCount').textContent = itemCount;
        document.getElementById('cartTotalPrice').textContent = totalPrice.toFixed(0);
    }
    
    window.updateQty = function(index, change) {
        cart[index].qty = Math.max(1, cart[index].qty + change);
        itemCount = cart.reduce((sum, item) => sum + item.qty, 0);
        localStorage.setItem('cloudBakesCart', JSON.stringify(cart));
        renderCart();
    };
    
    window.deleteItem = function(index) {
        if (confirm(`Remove ${cart[index].name}?`)) {
            itemCount -= cart[index].qty;
            cart.splice(index, 1);
            localStorage.setItem('cloudBakesCart', JSON.stringify(cart));
            renderCart();
        }
    };
    
    window.checkout = function() {
        if (cart.length === 0) {
            alert('Cart is empty!');
            return;
        }
        
        let message = '🍰 Divine Deserts - NEW ORDER\n\n';
        let totalPrice = 0;
        
        cart.forEach(item => {
            const itemTotal = item.price * item.qty;
            totalPrice += itemTotal;
            message += `• ${item.name} x${item.qty}\n  ₹${itemTotal.toFixed(0)} ${getUnit(item.name)}\n\n`;
        });
        message += `💰 GRAND TOTAL: ₹${totalPrice.toFixed(0)}\n\n📍 Delivery: Coimbatore`;
        
        // UPDATE THIS NUMBER WITH YOUR MUM'S WHATSAPP BUSINESS NUMBER
        const whatsappNumber = '919944077908'; 
        window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
    };
    
    // Load cart on page load
    document.addEventListener('DOMContentLoaded', renderCart);
}
