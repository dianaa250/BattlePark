// ========== КОРЗИНА С МОДАЛЬНЫМ ОКНОМ ДЛЯ ВЫБОРА КОЛИЧЕСТВА ==========

const CART_STORAGE_KEY = 'battlepark_cart';

// Конфигурация минимального количества
const MIN_QUANTITY_CONFIG = {
    'paintball_adult': 8,
    'paintball_child': 8,
    'lasertag_1hour': 8,
    'lasertag_next_hour': 8,
    'obstacle_course': 8,
    'first_aid': 8,
    'knife_throwing': 8,
    'grenade_throwing_sport': 8,
    'grenade_throwing_piro': 8,
    'shooting_range': 8,
    'rope_course': 8,
    'tug_of_war': 8,
    'ak_assembly': 8,
    'tent_setup': 8,
    'orientation': 8,
    'tactics': 8,
    'gto': 8,
    'safety_school': 8,
    'kvest_1hour': 8,
    'kvest_2_4hours': 8,
    'field_kitchen': 30,
    'armor_vest': 1,
    'balls_2000': 1,
    'smoke_grenade': 1,
    'long_barrel': 1,
    'grenade': 1,
    'tea': 1,
    'kebab': 1,
    'catering': 1,
    'guest_area': 1,
    'tent': 1,
    'veranda': 1,
    'army_tent': 1,
    'default': 1,
    'tactics_training': 8,
    'equipment_upgrade': 1,
};

function getItemMinQuantity(itemId) {
    return MIN_QUANTITY_CONFIG[itemId] !== undefined ? MIN_QUANTITY_CONFIG[itemId] : 1;
}

function getCart() {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    try {
        return stored ? JSON.parse(stored) : [];
    } catch(e) {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    updateCartCountIcon();
}

function addToCart(product) {
    if (!product || !product.id) return false;
    
    let cart = getCart();
    const existingIndex = cart.findIndex(item => item.id === product.id);
    
    if (existingIndex !== -1) {
        cart[existingIndex].quantity += product.quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: product.quantity,
            minQuantity: product.minQuantity,
            image: product.image || ''
        });
    }
    
    saveCart(cart);
    showNotification(product.name, product.quantity);
    return true;
}

function removeFromCart(itemId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== itemId);
    saveCart(cart);
    updateCartCountIcon();
}

function clearCart() {
    if (confirm('Очистить корзину?')) {
        saveCart([]);
        showNotification('Корзина', 0, 'cleared');
    }
}

function updateCartCountIcon() {
    const cart = getCart();
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll('.cart-count').forEach(el => {
        if (total > 0) {
            el.textContent = total;
            el.style.display = 'inline-block';
        } else {
            el.style.display = 'none';
        }
    });
}

function showNotification(name, qty, action = 'added') {
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    const unit = qty > 1 ? (qty >= 30 ? 'человек' : 'человек') : '';
    const text = action === 'added' ? `${name} — ${qty} ${unit}` : 'Корзина очищена';
    notification.innerHTML = `<i class="fas fa-check-circle"></i><span>${text}</span>`;
    notification.style.cssText = `
        position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%) translateY(100px);
        background: #4CAF50; color: white; padding: 12px 24px; border-radius: 50px;
        font-weight: 600; z-index: 10000; display: flex; align-items: center; gap: 10px;
        transition: transform 0.3s ease; font-size: 14px;
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.style.transform = 'translateX(-50%) translateY(0)', 10);
    setTimeout(() => {
        notification.style.transform = 'translateX(-50%) translateY(100px)';
        setTimeout(() => notification.remove(), 300);
    }, 2500);
}

// ========== МОДАЛЬНОЕ ОКНО ДЛЯ ВЫБОРА КОЛИЧЕСТВА ==========
let currentProduct = null;
let currentQty = 8;

function openQtyModal(product) {
    currentProduct = product;
    currentQty = product.minQuantity;
    
    const modal = document.getElementById('qtyModal');
    const productNameSpan = document.getElementById('modalProductName');
    const qtyNumberSpan = document.getElementById('modalQtyNumber');
    const minNoticeSpan = document.getElementById('modalMinNotice');
    const unitSpan = document.getElementById('modalQtyUnit');
    
    productNameSpan.textContent = product.name;
    qtyNumberSpan.textContent = currentQty;
    
    const unit = product.minQuantity >= 30 ? 'человек' : (product.minQuantity > 1 ? 'человек' : 'шт');
    unitSpan.textContent = unit;
    minNoticeSpan.textContent = `Минимальное количество: ${product.minQuantity} ${unit}`;
    
    modal.classList.add('active');
}

function closeQtyModal() {
    document.getElementById('qtyModal').classList.remove('active');
    currentProduct = null;
}

function updateModalQty(delta) {
    if (!currentProduct) return;
    let newQty = currentQty + delta;
    if (newQty >= currentProduct.minQuantity) {
        currentQty = newQty;
        document.getElementById('modalQtyNumber').textContent = currentQty;
    }
}

function confirmAddToCart() {
    if (currentProduct) {
        addToCart({
            id: currentProduct.id,
            name: currentProduct.name,
            price: currentProduct.price,
            quantity: currentQty,
            minQuantity: currentProduct.minQuantity
        });
        closeQtyModal();
    }
}

// Создаём модальное окно и добавляем его в body
function createQtyModal() {
    const modalHTML = `
        <div id="qtyModal" class="qty-modal">
            <div class="qty-modal-content">
                <h3>Выберите количество</h3>
                <div class="product-name" id="modalProductName">Товар</div>
                <div class="qty-controls">
                    <button id="modalQtyDecr">-</button>
                    <span class="qty-number" id="modalQtyNumber">1</span>
                    <span class="qty-unit" id="modalQtyUnit">чел</span>
                    <button id="modalQtyIncr">+</button>
                </div>
                <div class="qty-min-notice" id="modalMinNotice"></div>
                <div class="modal-buttons">
                    <button class="btn-modal-cancel" id="modalCancel">Отмена</button>
                    <button class="btn-modal-add" id="modalAdd">В корзину</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    document.getElementById('modalQtyDecr').addEventListener('click', () => updateModalQty(-1));
    document.getElementById('modalQtyIncr').addEventListener('click', () => updateModalQty(1));
    document.getElementById('modalCancel').addEventListener('click', closeQtyModal);
    document.getElementById('modalAdd').addEventListener('click', confirmAddToCart);
    document.getElementById('qtyModal').addEventListener('click', (e) => {
        if (e.target.id === 'qtyModal') closeQtyModal();
    });
}

// Инициализация кнопок
function initAddToCartButtons() {
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.removeEventListener('click', handleAddClick);
        btn.addEventListener('click', handleAddClick);
    });
}

function handleAddClick(e) {
    const btn = e.currentTarget;
    const itemId = btn.getAttribute('data-id');
    const itemName = btn.getAttribute('data-name') || 'Товар';
    const itemPrice = parseInt(btn.getAttribute('data-price')) || 0;
    const minQty = parseInt(btn.getAttribute('data-min')) || getItemMinQuantity(itemId);
    
    openQtyModal({
        id: itemId,
        name: itemName,
        price: itemPrice,
        minQuantity: minQty
    });
}

// Запуск при загрузке
document.addEventListener('DOMContentLoaded', () => {
    createQtyModal();
    initAddToCartButtons();
    updateCartCountIcon();
});

// Глобальные функции
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.clearCart = clearCart;
window.getCart = getCart;
window.getItemMinQuantity = getItemMinQuantity;