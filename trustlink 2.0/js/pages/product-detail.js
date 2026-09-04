// ============================================
// TrustLink — Product Detail Page
// ============================================

async function renderProductDetailPage(productId) {
  return `
    <div style="padding-top:80px;min-height:100vh">
      <div class="section" id="product-detail-content">
        <div class="page-loader"><div class="loader"></div></div>
      </div>
    </div>
  `;
}

async function initProductDetailPage(productId) {
  const container = document.getElementById('product-detail-content');
  if (!container) return;

  try {
    const product = await Products.getById(productId);
    if (!product) {
      container.innerHTML = `<div class="empty-state"><h3>Product not found</h3><p>This product may have been removed.</p><a href="#/products" class="btn btn-primary">Browse Products</a></div>`;
      return;
    }

    const { avg, count } = await Reviews.getAverageRating(productId);
    const reviews = await Reviews.getByProduct(productId);
    const vendor = product.vendors;
    const images = product.images && product.images.length > 0
      ? product.images
      : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop'];
    const discount = product.compare_at_price
      ? Math.round((1 - product.price / product.compare_at_price) * 100)
      : 0;

    container.innerHTML = `
      <!-- Breadcrumb -->
      <div style="display:flex;align-items:center;gap:0.5rem;font-size:0.85rem;color:var(--text-muted);margin-bottom:2rem">
        <a href="#/" style="color:var(--text-muted)">Home</a>
        <span>›</span>
        <a href="#/products" style="color:var(--text-muted)">Products</a>
        <span>›</span>
        <span style="color:var(--text-primary)">${sanitize(product.title)}</span>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:3rem;align-items:start" class="product-detail-grid">
        <!-- Image Gallery -->
        <div class="gallery animate-fade-in">
          <div class="gallery-main" id="gallery-main">
            <img src="${images[0]}" alt="${sanitizeAttr(product.title)}" id="gallery-main-img">
          </div>
          ${images.length > 1 ? `
            <div class="gallery-thumbnails">
              ${images.map((img, i) => `
                <div class="gallery-thumb ${i === 0 ? 'active' : ''}" data-index="${i}" onclick="switchGalleryImage('${img}', this)">
                  <img src="${img}" alt="Thumbnail ${i + 1}" loading="lazy">
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>

        <!-- Product Info -->
        <div class="animate-fade-in-up">
          ${product.categories ? `<div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:0.5rem">${sanitize(product.categories.name)}</div>` : ''}
          <h1 style="font-size:1.75rem;font-weight:800;margin-bottom:0.75rem;line-height:1.3">${sanitize(product.title)}</h1>

          <!-- Rating -->
          <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1.25rem">
            ${renderStars(avg)}
            <span style="font-size:0.85rem;color:var(--text-muted)">${avg} (${count} review${count !== 1 ? 's' : ''})</span>
          </div>

          <!-- Price -->
          <div style="display:flex;align-items:baseline;gap:0.75rem;margin-bottom:1.5rem">
            <span style="font-size:2rem;font-weight:900;color:var(--primary-light)">₵${formatPrice(product.price)}</span>
            ${product.compare_at_price ? `
              <span style="font-size:1.1rem;color:var(--text-muted);text-decoration:line-through">₵${formatPrice(product.compare_at_price)}</span>
              <span class="badge badge-error">-${discount}% OFF</span>
            ` : ''}
          </div>

          <!-- Description -->
          <p style="color:var(--text-secondary);line-height:1.8;margin-bottom:1.5rem">${sanitize(product.description)}</p>

          <!-- Stock -->
          <div style="margin-bottom:1.5rem">
            ${product.stock_quantity > 0
              ? `<span class="badge badge-success">✓ In Stock (${product.stock_quantity} available)</span>`
              : `<span class="badge badge-error">Out of Stock</span>`}
          </div>

          <!-- Quantity + Add to Cart -->
          ${product.stock_quantity > 0 ? `
            <div style="display:flex;align-items:center;gap:1rem;margin-bottom:2rem;flex-wrap:wrap">
              <div class="qty-selector">
                <button class="qty-btn" onclick="updateDetailQty(-1)">−</button>
                <span class="qty-value" id="detail-qty">1</span>
                <button class="qty-btn" onclick="updateDetailQty(1)">+</button>
              </div>
              <button class="btn btn-primary btn-lg" id="add-to-cart-btn" onclick="addDetailToCart('${product.id}')">
                <i data-lucide="shopping-cart" class="w-5 h-5"></i> Add to Cart
              </button>
              <button class="btn btn-outline btn-lg" onclick="addDetailToCart('${product.id}');App.navigate('/checkout')">
                Buy Now
              </button>
            </div>
          ` : ''}

          <!-- Vendor Card -->
          ${vendor ? `
            <div class="glass-card" style="padding:1.25rem;margin-bottom:1.5rem">
              <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1rem">
                <img src="${vendor.logo_url || 'icons/icon-192.png'}" alt="${sanitizeAttr(vendor.store_name)}" style="width:48px;height:48px;border-radius:var(--radius-md);object-fit:cover">
                <div>
                  <div style="font-weight:700">${sanitize(vendor.store_name)}</div>
                  <div style="font-size:0.8rem;color:var(--text-muted)">Verified Vendor ✓</div>
                </div>
              </div>
              ${vendor.description ? `<p style="font-size:0.85rem;color:var(--text-secondary);line-height:1.6;margin-bottom:1rem">${sanitize(vendor.description)}</p>` : ''}
              ${vendor.whatsapp_number ? `
                <a href="https://wa.me/${vendor.whatsapp_number.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hi! I\'m interested in: ' + product.title + ' on TrustLink')}"
                   target="_blank" rel="noopener" class="btn btn-whatsapp btn-sm" style="width:100%">
                  <i data-lucide="message-circle" class="w-4 h-4"></i> Contact Vendor on WhatsApp
                </a>
              ` : ''}
            </div>
          ` : ''}
        </div>
      </div>

      <!-- Reviews Section -->
      <div style="margin-top:4rem">
        <h2 style="font-size:1.5rem;font-weight:800;margin-bottom:1.5rem">Customer Reviews (${reviews.length})</h2>

        <!-- Add Review Form (if logged in) -->
        <div id="review-form-section" style="margin-bottom:2rem"></div>

        <!-- Reviews List -->
        <div id="reviews-list">
          ${reviews.length === 0
            ? '<p style="color:var(--text-muted)">No reviews yet. Be the first to review this product!</p>'
            : reviews.map(r => renderReview(r)).join('')}
        </div>
      </div>
    `;

    // Show review form if authenticated
    const state = App.getState();
    if (state.profile && state.profile.role === 'buyer') {
      const formSection = document.getElementById('review-form-section');
      if (formSection) {
        const existingReview = reviews.find(r => r.buyer_id === state.profile.id);
        if (!existingReview) {
          formSection.innerHTML = `
            <div class="glass-card" style="padding:1.5rem">
              <h3 style="font-size:1.1rem;font-weight:700;margin-bottom:1rem">Write a Review</h3>
              <div class="form-group">
                <label class="form-label">Rating</label>
                <div class="star-rating" id="review-stars" style="font-size:1.5rem">
                  ${[1,2,3,4,5].map(i => `<span class="star" data-rating="${i}" style="cursor:pointer">★</span>`).join('')}
                </div>
                <input type="hidden" id="review-rating" value="0">
              </div>
              <div class="form-group">
                <label class="form-label">Your Review</label>
                <textarea class="form-input" id="review-comment" rows="3" placeholder="Share your experience with this product..."></textarea>
              </div>
              <button class="btn btn-primary" id="submit-review-btn">Submit Review</button>
            </div>
          `;

          // Star rating interaction
          formSection.querySelectorAll('#review-stars .star').forEach(star => {
            star.addEventListener('click', () => {
              const rating = parseInt(star.dataset.rating);
              document.getElementById('review-rating').value = rating;
              formSection.querySelectorAll('#review-stars .star').forEach(s => {
                s.classList.toggle('filled', parseInt(s.dataset.rating) <= rating);
              });
            });
          });

          // Submit review
          document.getElementById('submit-review-btn')?.addEventListener('click', async () => {
            const rating = parseInt(document.getElementById('review-rating').value);
            const comment = document.getElementById('review-comment').value.trim();
            if (rating < 1) { Toast.warning('Please select a rating'); return; }
            if (!comment) { Toast.warning('Please write a comment'); return; }

            try {
              await Reviews.create({
                product_id: productId,
                buyer_id: state.profile.id,
                rating,
                comment
              });
              Toast.success('Review submitted! Thank you!');
              initProductDetailPage(productId); // Refresh
            } catch (err) {
              Toast.error('Failed to submit review: ' + err.message);
            }
          });
        }
      }
    }

    if (window.lucide) lucide.createIcons();

    // Responsive grid fix for mobile
    const style = document.createElement('style');
    style.textContent = `@media(max-width:768px){.product-detail-grid{grid-template-columns:1fr !important;gap:1.5rem !important}}`;
    document.head.appendChild(style);

  } catch (err) {
    container.innerHTML = `<div class="empty-state"><h3>Error loading product</h3><p>${sanitize(err.message)}</p><a href="#/products" class="btn btn-primary">Browse Products</a></div>`;
    console.error('Product detail error:', err);
  }
}

function renderReview(review) {
  const name = review.profiles?.name || 'Anonymous';
  return `
    <div class="glass-card" style="padding:1.25rem;margin-bottom:1rem">
      <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:0.75rem">
        <div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,var(--primary),var(--gold));display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:0.9rem">
          ${name.charAt(0).toUpperCase()}
        </div>
        <div style="flex:1">
          <div style="font-weight:600;font-size:0.9rem">${sanitize(name)}</div>
          <div style="font-size:0.75rem;color:var(--text-muted)">${formatDate(review.created_at)}</div>
        </div>
        ${renderStars(review.rating)}
      </div>
      <p style="color:var(--text-secondary);font-size:0.9rem;line-height:1.6">${sanitize(review.comment)}</p>
    </div>
  `;
}

function switchGalleryImage(src, thumb) {
  document.getElementById('gallery-main-img').src = src;
  document.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
  thumb.classList.add('active');
}

let detailQty = 1;
function updateDetailQty(delta) {
  detailQty = Math.max(1, detailQty + delta);
  const el = document.getElementById('detail-qty');
  if (el) el.textContent = detailQty;
}

function addDetailToCart(productId) {
  Cart.add(productId, detailQty);
  Toast.success(`Added ${detailQty} item${detailQty > 1 ? 's' : ''} to cart!`);
  detailQty = 1;
  const el = document.getElementById('detail-qty');
  if (el) el.textContent = '1';
}
