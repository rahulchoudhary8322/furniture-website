import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star } from 'lucide-react';

export default function ProductCard({ product, cart, wishlist, onAddToCart, onToggleWishlist }) {
  const isWishlisted = wishlist.some(id => id === product.id);
  const isInCart = cart.some(item => item.product_id === product.id);

  const price = parseFloat(product.price);
  const salePrice = product.sale_price ? parseFloat(product.sale_price) : null;
  const discountPercent = salePrice ? Math.round(((price - salePrice) / price) * 100) : 0;

  const imageUrl = product.primary_image 
    ? (product.primary_image.startsWith('/') ? `${window.API_URL}${product.primary_image}` : product.primary_image)
    : 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=600&q=80';

  // Format price as Indian currency format without symbol or with clean suffix matching reference
  const formatPrice = (val) => {
    return `${val.toLocaleString('en-IN')}/-`;
  };

  return (
    <div className="product-card" style={{
      backgroundColor: '#FFFFFF',
      borderRadius: '16px',
      border: '1px solid #F1F5F9',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      boxShadow: '0 4px 16px rgba(15, 23, 42, 0.015)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    }}>
      
      {/* Product Badges */}
      <div style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {product.is_new_arrival === 1 && <span className="badge badge-new" style={{ fontSize: '0.7rem', padding: '3px 8px' }}>New</span>}
        {product.is_best_seller === 1 && <span className="badge badge-featured" style={{ fontSize: '0.7rem', padding: '3px 8px' }}>Best Seller</span>}
        {salePrice && <span className="badge badge-sale" style={{ fontSize: '0.7rem', padding: '3px 8px' }}>-{discountPercent}%</span>}
        {product.stock <= 0 && <span className="badge badge-out" style={{ fontSize: '0.7rem', padding: '3px 8px', backgroundColor: '#F1F5F9', color: '#64748B' }}>Sold Out</span>}
      </div>

      {/* Wishlist Button (Heart Icon) */}
      <button 
        onClick={(e) => { e.preventDefault(); onToggleWishlist(product.id); }} 
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          zIndex: 10,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          border: '1px solid #F1F5F9',
          padding: '8px',
          borderRadius: '50%',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
          color: isWishlisted ? '#E11D48' : '#94A3B8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease'
        }}
        className="wishlist-btn"
      >
        <Heart size={15} fill={isWishlisted ? '#E11D48' : 'none'} />
      </button>

      {/* Product Image Section */}
      <Link to={`/product/${product.slug}`} className="product-card-img-container" style={{
        display: 'block',
        overflow: 'hidden',
        height: '240px',
        backgroundColor: '#FAF9F6', // Soft warm white background
        position: 'relative'
      }}>
        <img 
          src={imageUrl} 
          alt={product.name} 
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}
          className="prod-card-img"
        />
      </Link>

      {/* Details Section */}
      <div className="product-card-details" style={{
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        gap: '6px'
      }}>
        
        {/* Product Title */}
        <Link to={`/product/${product.slug}`} className="product-card-title" style={{
          fontWeight: '500',
          fontSize: '0.85rem',
          color: '#1E293B',
          lineHeight: '1.4',
          minHeight: '38px',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textDecoration: 'none'
        }}>
          {product.name}
        </Link>

        {/* Rating Stars (Solid Yellow) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', margin: '2px 0' }}>
          <div style={{ display: 'flex', color: '#F59E0B' }}>
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={12} fill={i < Math.floor(product.rating || 5) ? '#F59E0B' : 'none'} stroke={i < Math.floor(product.rating || 5) ? '#F59E0B' : '#CBD5E1'} />
            ))}
          </div>
        </div>

        {/* Pricing & Add to Cart Action */}
        <div className="product-card-footer" style={{
          marginTop: 'auto',
          paddingTop: '10px',
          borderTop: '1px solid #F1F5F9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div className="product-card-price" style={{ display: 'flex', flexDirection: 'column' }}>
            {salePrice ? (
              <>
                <span className="price-amount" style={{ fontSize: '1rem', fontWeight: '700', color: '#E11D48' }}>
                  {formatPrice(salePrice)}
                </span>
                <span className="sale-amount" style={{ fontSize: '0.75rem', textDecoration: 'line-through', color: '#94A3B8', marginTop: '1px' }}>
                  ₹{price.toLocaleString('en-IN')}
                </span>
              </>
            ) : (
              <span className="price-amount" style={{ fontSize: '1rem', fontWeight: '700', color: '#1E293B' }}>
                {formatPrice(price)}
              </span>
            )}
          </div>

          {/* Mini Add to Cart Button (Keep function working) */}
          <button 
            disabled={product.stock <= 0}
            onClick={(e) => { e.preventDefault(); onAddToCart(product.id, 1); }}
            style={{
              padding: '6px 12px',
              borderRadius: '9999px',
              backgroundColor: isInCart ? '#0F172A' : '#FFE4E6',
              color: isInCart ? '#FFFFFF' : '#E11D48',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.75rem',
              fontWeight: '600',
              cursor: product.stock <= 0 ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              border: isInCart ? 'none' : '1px solid #FFE4E6'
            }}
            className="cart-trigger-btn"
          >
            <ShoppingBag size={12} />
            {isInCart ? 'Added' : 'Buy'}
          </button>
        </div>

      </div>

      <style>{`
        .product-card:hover {
          transform: translateY(-6px) !important;
          box-shadow: 0 12px 24px rgba(15, 23, 42, 0.05) !important;
          border-color: #E2E8F0 !important;
        }
        .product-card:hover .prod-card-img {
          transform: scale(1.04) !important;
        }
        .wishlist-btn:hover {
          transform: scale(1.1);
          background-color: #FFFFFF !important;
        }
        .cart-trigger-btn:hover {
          background-color: #0F172A !important;
          color: #FFFFFF !important;
          border-color: #0F172A !important;
        }
      `}</style>

    </div>
  );
}
