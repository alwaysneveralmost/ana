// ===========================
// Header Scroll Effect
// ===========================
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
});

// ===========================
// Auto-Scroll to Products on Scroll
// ===========================
let hasAutoScrolled = false;
let hasAutoScrolledToSecond = false;
let isAutoScrolling = false;
let lastScrollPosition = 0;

// Helper function to determine scroll block based on screen size
function getScrollBlock() {
    return window.innerWidth <= 768 ? 'center' : 'start';
}

window.addEventListener('scroll', () => {
    if (isAutoScrolling) return;
    
    const currentScroll = window.pageYOffset;
    const firstProduct = document.getElementById('first-product');
    const secondProduct = document.getElementById('second-product');
    
    if (!firstProduct) return;
    
    const firstProductTop = firstProduct.offsetTop;
    const firstProductBottom = firstProductTop + firstProduct.offsetHeight;
    const secondProductTop = secondProduct ? secondProduct.offsetTop : 0;
    const isScrollingDown = currentScroll > lastScrollPosition;
    const isScrollingUp = currentScroll < lastScrollPosition;
    
    // Auto-scroll DOWN to first product when user scrolls down from hero
    if (currentScroll > 150 && !hasAutoScrolled && isScrollingDown) {
        hasAutoScrolled = true;
        isAutoScrolling = true;
        
        firstProduct.scrollIntoView({ 
            behavior: 'smooth',
            block: getScrollBlock()
        });
        
        setTimeout(() => {
            isAutoScrolling = false;
        }, 1000);
    }
    
    // Auto-scroll DOWN to second product when user scrolls down from first product
    if (secondProduct && hasAutoScrolled && !hasAutoScrolledToSecond && isScrollingDown && 
        currentScroll > firstProductBottom - 300 && currentScroll < secondProductTop) {
        hasAutoScrolledToSecond = true;
        isAutoScrolling = true;
        
        secondProduct.scrollIntoView({ 
            behavior: 'smooth',
            block: getScrollBlock()
        });
        
        setTimeout(() => {
            isAutoScrolling = false;
        }, 1000);
    }
    
    // Auto-scroll UP to first product when scrolling up from second product
    if (hasAutoScrolledToSecond && isScrollingUp && currentScroll < secondProductTop - 100 && currentScroll > firstProductTop) {
        hasAutoScrolledToSecond = false;
        isAutoScrolling = true;
        
        firstProduct.scrollIntoView({ 
            behavior: 'smooth',
            block: getScrollBlock()
        });
        
        setTimeout(() => {
            isAutoScrolling = false;
        }, 1000);
    }
    
    // Auto-scroll UP to top when user scrolls up from first product area
    if (hasAutoScrolled && !hasAutoScrolledToSecond && isScrollingUp && currentScroll > 100 && currentScroll < firstProductTop + 500) {
        hasAutoScrolled = false;
        isAutoScrolling = true;
        
        window.scrollTo({ 
            top: 0, 
            behavior: 'smooth' 
        });
        
        setTimeout(() => {
            isAutoScrolling = false;
        }, 1000);
    }
    
    // Reset if at the very top
    if (currentScroll < 50) {
        hasAutoScrolled = false;
        hasAutoScrolledToSecond = false;
    }
    
    lastScrollPosition = currentScroll;
});

// ===========================
// Smooth Scroll to Products
// ===========================
function scrollToProducts() {
    const firstProduct = document.getElementById('first-product');
    if (firstProduct) {
        firstProduct.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// ===========================
// Cart Management
// ===========================
let cart = [];

// Load cart from localStorage on page load
function loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartBadge();
    }
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
}

// Update cart badge count
function updateCartBadge() {
    const cartIcon = document.querySelector('.cart-icon');
    if (!cartIcon) return;
    
    let badge = cartIcon.querySelector('.cart-badge');
    
    if (cart.length > 0) {
        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'cart-badge';
            cartIcon.appendChild(badge);
        }
        badge.textContent = cart.length;
    } else {
        if (badge) {
            badge.remove();
        }
    }
}

// Open cart drawer
function openCart() {
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('cartOverlay');
    
    if (drawer && overlay) {
        drawer.classList.add('active');
        overlay.classList.add('active');
        renderCart();
    }
}

// Close cart drawer
function closeCartDrawer() {
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('cartOverlay');
    
    if (drawer && overlay) {
        drawer.classList.remove('active');
        overlay.classList.remove('active');
    }
}

// Render cart items
function renderCart() {
    const cartItems = document.getElementById('cartItems');
    const cartFooter = document.getElementById('cartFooter');
    const cartTotal = document.getElementById('cartTotal');
    
    if (!cartItems) return;
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart-message">Your cart is empty</p>';
        if (cartFooter) cartFooter.style.display = 'none';
        return;
    }
    
    let html = '';
    let total = 0;
    
    cart.forEach((item, index) => {
        const itemQuantity = item.quantity || 1;
        const itemTotal = item.price * itemQuantity;
        html += `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-color">Color: ${item.color}</div>
                    <div class="cart-item-size">Size: ${item.size}</div>
                </div>
                <div class="cart-item-right">
                    <div class="cart-item-quantity">
                        <button class="qty-btn" onclick="updateQuantity(${index}, -1)">−</button>
                        <span class="qty-value">${itemQuantity}</span>
                        <button class="qty-btn" onclick="updateQuantity(${index}, 1)">+</button>
                    </div>
                    <div class="cart-item-price">$${itemTotal.toFixed(2)}</div>
                </div>
            </div>
        `;
        total += itemTotal;
    });
    
    cartItems.innerHTML = html;
    if (cartTotal) cartTotal.textContent = `$${total.toFixed(2)}`;
    if (cartFooter) cartFooter.style.display = 'block';
}

// Add item to cart
function addToCart() {
    const selectedSize = document.querySelector('.size-option.selected');
    
    if (!selectedSize) {
        alert('Please select a size');
        return;
    }
    
    const sizeCode = selectedSize.textContent;
    // Convert size code to full name
    const sizeMap = {
        'S': 'Small',
        'M': 'Medium',
        'L': 'Large'
    };
    const size = sizeMap[sizeCode] || sizeCode;
    
    const isSunMoon = window.location.pathname.includes('sun-moon');
    const productName = isSunMoon ? 'Sun/Moon' : 'Moon/Star';
    const productImage = isSunMoon ? 'assets/images/sun-moon.jpg' : 'assets/images/moon_star_cart.JPG';
    
    // Check if item already exists in cart
    const existingItemIndex = cart.findIndex(item => 
        item.name === productName && item.size === size
    );
    
    if (existingItemIndex !== -1) {
        // Item exists, increase quantity
        cart[existingItemIndex].quantity = (cart[existingItemIndex].quantity || 1) + 1;
    } else {
        // Add new item to cart
        cart.push({
            name: productName,
            size: size,
            price: 45,
            color: 'Black',
            image: productImage,
            quantity: 1
        });
    }
    
    saveCart();
    
    // Show feedback
    const button = document.querySelector('.add-to-cart-btn');
    const originalText = button.textContent;
    button.textContent = 'Added to Cart!';
    button.style.backgroundColor = '#4CAF50';
    button.disabled = true;
    
    setTimeout(() => {
        button.textContent = originalText;
        button.style.backgroundColor = '';
        button.disabled = false;
        
        // Open cart drawer
        openCart();
    }, 800);
}

// Remove item from cart
function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    renderCart();
}

// Update item quantity
function updateQuantity(index, change) {
    if (!cart[index]) return;
    
    cart[index].quantity = (cart[index].quantity || 1) + change;
    
    // Remove item if quantity is 0
    if (cart[index].quantity <= 0) {
        removeFromCart(index);
        return;
    }
    
    saveCart();
    renderCart();
}

// Go to checkout
function goToCheckout() {
    if (cart.length === 0) {
        alert('Your cart is empty');
        return;
    }
    
    // Shopify variant IDs
    const variantIds = {
        'Sun/Moon': {
            'Small': '43792336879731',
            'Medium': '43792336912499',
            'Large': '43792336945267'
        },
        'Moon/Star': {
            'Small': '43792345530483',
            'Medium': '43792345563251',
            'Large': '43792345596019'
        }
    };
    
    // Build cart URL with all items
    let cartItems = [];
    cart.forEach(item => {
        const variantId = variantIds[item.name][item.size];
        const quantity = item.quantity || 1;
        cartItems.push(`${variantId}:${quantity}`);
    });
    
    // Redirect directly to Shopify checkout (skip cart page)
    window.location.href = `https://91teer-01.myshopify.com/checkout?line_items=${cartItems.join(',')}`;
}

// ===========================
// Size Guide Modal
// ===========================
function openSizeGuide() {
    const modal = document.getElementById('sizeGuideModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeSizeGuide() {
    const modal = document.getElementById('sizeGuideModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeSizeGuide();
        closeCartDrawer();
    }
});

// ===========================
// Size Selection
// ===========================
function selectSize(button) {
    const sizeButtons = document.querySelectorAll('.size-option');
    sizeButtons.forEach(btn => btn.classList.remove('selected'));
    button.classList.add('selected');
}

// ===========================
// Initialize
// ===========================
document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    
    // Video loading optimization
    const videos = document.querySelectorAll('.product-video, .product-video-detail');
    
    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const video = entry.target;
                if (video.paused) {
                    video.play().catch(e => console.log('Video autoplay prevented:', e));
                }
            }
        });
    }, {
        threshold: 0.5
    });
    
    videos.forEach(video => {
        videoObserver.observe(video);
    });
});

// Smooth navigation links
document.addEventListener('DOMContentLoaded', () => {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#' || href === '' || href.length <= 1) {
                return;
            }
            
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// ===========================
// Product Image Gallery
// ===========================
function changeProductImage(imageSrc, thumbnailElement) {
    // Update main image
    const mainImage = document.getElementById('mainProductImage');
    if (mainImage) {
        mainImage.src = imageSrc;
    }
    
    // Update active thumbnail
    const thumbnails = document.querySelectorAll('.product-thumbnail');
    thumbnails.forEach(thumb => thumb.classList.remove('active'));
    thumbnailElement.classList.add('active');
}

// ===========================
// Fullscreen Image Lightbox
// ===========================
let currentLightboxIndex = 0;
let lightboxImages = [];

function openImageLightbox(imageSrc) {
    const lightbox = document.getElementById('imageLightbox');
    const lightboxImg = document.getElementById('lightboxImage');
    
    if (lightbox && lightboxImg) {
        // Get all product image sources
        const mainImage = document.getElementById('mainProductImage');
        const thumbnails = document.querySelectorAll('.product-thumbnail');
        lightboxImages = Array.from(thumbnails).map(thumb => thumb.src);
        
        // Find current image index
        currentLightboxIndex = lightboxImages.findIndex(img => img === imageSrc);
        if (currentLightboxIndex === -1) currentLightboxIndex = 0;
        
        lightboxImg.src = imageSrc;
        lightbox.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeImageLightbox() {
    const lightbox = document.getElementById('imageLightbox');
    if (lightbox) {
        lightbox.style.display = 'none';
        document.body.style.overflow = '';
    }
}

function nextLightboxImage() {
    currentLightboxIndex = (currentLightboxIndex + 1) % lightboxImages.length;
    const lightboxImg = document.getElementById('lightboxImage');
    if (lightboxImg) {
        lightboxImg.src = lightboxImages[currentLightboxIndex];
    }
}

function previousLightboxImage() {
    currentLightboxIndex = (currentLightboxIndex - 1 + lightboxImages.length) % lightboxImages.length;
    const lightboxImg = document.getElementById('lightboxImage');
    if (lightboxImg) {
        lightboxImg.src = lightboxImages[currentLightboxIndex];
    }
}

// Close lightbox on escape key, navigate with arrow keys
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeImageLightbox();
    } else if (e.key === 'ArrowRight') {
        nextLightboxImage();
    } else if (e.key === 'ArrowLeft') {
        previousLightboxImage();
    }
});

