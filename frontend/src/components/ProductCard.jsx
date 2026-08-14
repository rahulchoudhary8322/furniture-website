import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star } from 'lucide-react';

export default function ProductCard({ product, cart, wishlist, onAddToCart, onToggleWishlist }) {
  const isWishlisted = wishlist.some(id => id === product.id);
  const isInCart = cart.some(item => item.product_id === product.id);

  const price = parseFloat(product.price);
  const salePrice = product.sale_price ? parseFloat(product.sale_price) : null;
  const discountPercent = salePrice ? Math.round(((price - salePrice) / price) * 100) : 0;

  const imageUrl = product.primary_image 
    ? (product.primary_image.startsWith('/') ? `${window.API_URL}${product.primary_image}` : product.primary_image)
    : 'https://placehold.co/300x300?text=Product+Image';

  return (
    <div className="product-card" style={{
      backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-md)',
      border: '1px solid var(--border)', position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column', height: '100%', transition: 'var(--transition)'
    }}>
      
      {/* Product Badges */}
      <div style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {product.is_new_arrival === 1 && <span className="badge badge-new">New</span>}
        {product.is_best_seller === 1 && <span className="badge badge-featured">Best Seller</span>}
        {salePrice && <span className="badge badge-sale">-{discountPercent}%</span>}
        {product.stock <= 0 && <span className="badge badge-out">Sold Out</span>}
      </div>

      {/* Wishlist Button */}
      <button 
        onClick={(e) => { e.preventDefault(); onToggleWishlist(product.id); }} 
        style={{
          position: 'absolute', top: '12px', right: '12px', zIndex: 10,
          backgroundColor: 'rgba(255,255,255,0.9)', padding: '8px', borderRadius: '50%',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)', color: isWishlisted ? '#C84B31' : 'var(--text-muted)'
        }}
      >
        <Heart size={16} fill={isWishlisted ? '#C84B31' : 'none'} style={{ transition: 'var(--transition)' }} />
      </button>

      {/* Product Image Section */}
      <Link to={`/product/${product.slug}`} className="product-card-img-container">
        <img 
          src={imageUrl} 
          alt={product.name} 
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
          className="prod-card-img"
        />
      </Link>

      {/* Details Section */}
      <div className="product-card-details">
        
        {/* Category label */}
        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: '600', letterSpacing: '0.5px' }}>
          {product.category_name || 'SDC Quality'}
        </span>

        {/* Product Title */}
        <Link to={`/product/${product.slug}`} className="product-card-title">
          {product.name}
        </Link>

        {/* Rating */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ display: 'flex', color: 'var(--accent)' }}>
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={13} fill={i < Math.floor(product.rating || 5) ? 'var(--accent)' : 'none'} />
            ))}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '500' }}>
            ({product.rating || '5.0'})
          </span>
        </div>

        {/* Pricing & Add to Cart Footer */}
        <div className="product-card-footer">
          <div className="product-card-price">
            {salePrice ? (
              <>
                <span className="price-amount" style={{ fontSize: '1.1rem', fontWeight: '700', color: '#C84B31' }}>
                  ₹{salePrice.toLocaleString('en-IN')}
                </span>
                <span className="sale-amount" style={{ fontSize: '0.8rem', textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                  ₹{price.toLocaleString('en-IN')}
                </span>
              </>
            ) : (
              <span className="price-amount" style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--primary)' }}>
                ₹{price.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {/* Cart trigger button */}
          <button 
            disabled={product.stock <= 0}
            onClick={() => onAddToCart(product.id, 1)}
            style={{
              padding: '8px 12px', borderRadius: '8px',
              backgroundColor: isInCart ? 'var(--primary)' : 'var(--accent)',
              color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: '500',
              opacity: product.stock <= 0 ? 0.6 : 1
            }}
          >
            <ShoppingCart size={14} />
            {isInCart ? 'Added' : 'Buy'}
          </button>
        </div>

      </div>

      <style>{`
        .product-card:hover {
          transform: translateY(-5px);
          border-color: var(--accent) !important;
          box-shadow: var(--shadow-hover);
        }
        .product-card:hover .prod-card-img {
          transform: scale(1.08);
        }
      `}</style>

    </div>
  );
}
