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
    fetch('http://localhost:5000/api/products')
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
    <div className="container section-padding" style={{ animation: 'fadeIn 0.4s ease', minHeight: '60vh' }}>
      <h1 style={{ fontSize: '2rem', fontFamily: "'Playfair Display', serif", marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Heart size={28} fill="var(--primary)" /> Your Wishlist
      </h1>

      {products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
          <h3>Your wishlist is empty.</h3>
          <p style={{ margin: '15px 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Tap the heart icons on products to save them in this list!</p>
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
