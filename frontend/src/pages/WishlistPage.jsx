import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import ProductCard from '../components/ProductCard';

export default function WishlistPage({ wishlist, cart, onAddToCart, onToggleWishlist }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (wishlist.length === 0) {
      setProducts([]);
      return;
    }
    fetch(`${window.API_URL}/api/products`)
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          const matched = res.data.filter(p => wishlist.includes(p.id));
          setProducts(matched);
        }
      })
      .catch(err => console.error(err));
  }, [wishlist]);

  return (
    <div className="container section-padding" style={{ animation: 'fadeIn 0.4s ease', minHeight: '60vh', padding: '40px 20px' }}>
      <h1 style={{ fontSize: '2rem', fontFamily: "'Outfit', sans-serif", fontWeight: '800', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '12px', color: '#0F172A' }}>
        <Heart size={28} fill="#E11D48" stroke="#E11D48" /> Your Wishlist
      </h1>

      {products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', border: '1px solid #E2E8F0', borderRadius: '24px', backgroundColor: '#FFFFFF' }}>
          <h3 style={{ fontWeight: '700' }}>Your wishlist is empty.</h3>
          <p style={{ margin: '15px 0', fontSize: '0.9rem', color: '#64748B' }}>Tap the heart icons on products to save them in this list!</p>
          <Link to="/shop" className="btn btn-primary">Browse Catalog</Link>
        </div>
      ) : (
        <div className="grid-4">
          {products.map(prod => (
            <ProductCard 
              key={prod.id}
              product={prod}
              cart={cart}
              wishlist={wishlist}
              onAddToCart={onAddToCart}
              onToggleWishlist={onToggleWishlist}
            />
          ))}
        </div>
      )}
    </div>
  );
}
