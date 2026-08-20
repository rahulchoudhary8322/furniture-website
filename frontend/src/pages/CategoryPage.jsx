import React, { useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, ArrowUpDown, X, Star } from 'lucide-react';
import ProductCard from '../components/ProductCard';

export default function CategoryPage({ cart, wishlist, onAddToCart, onToggleWishlist }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  // URL State values
  const currentCategorySlug = searchParams.get('category') || '';
  const searchKeyword = searchParams.get('search') || '';

  // API Data State
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [colors, setColors] = useState([]);
  
  // Filter States
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [availability, setAvailability] = useState('');
  const [minRating, setMinRating] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Mobile Filter Drawer Toggle
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // 1. Fetch Master Filter Attributes on Mount
  useEffect(() => {
    fetch(`${window.API_URL}/api/categories`)
      .then(res => res.json())
      .then(res => { if (res.success) setCategories(res.data); });

    fetch(`${window.API_URL}/api/attributes/brands`)
      .then(res => res.json())
      .then(res => { if (res.success) setBrands(res.data); });

    fetch(`${window.API_URL}/api/attributes/materials`)
      .then(res => res.json())
      .then(res => { if (res.success) setMaterials(res.data); });

    fetch(`${window.API_URL}/api/attributes/colors`)
      .then(res => res.json())
      .then(res => { if (res.success) setColors(res.data); });
  }, []);

  // Set SEO tags dynamically based on active search or category filters
  useEffect(() => {
    let title = 'Shop Premium Furniture & Electronics - Anjana';
    let desc = 'Browse premium custom furniture and home appliances catalog at Anjana. Quality products since 1998.';
    let keys = 'Anjana products, buy furniture online, buy electronics';

    if (currentCategorySlug) {
      // Find category name
      const cat = categories.find(c => c.slug === currentCategorySlug);
      const catName = cat ? cat.name : currentCategorySlug.charAt(0).toUpperCase() + currentCategorySlug.slice(1);
      title = `${catName} Collection - Anjana Premium Store`;
      desc = `Explore Anjana's premium ${catName} range. Handcrafted quality, custom sizes, and fast delivery.`;
      keys = `${catName}, buy ${catName} online, Anjana ${catName}, premium quality`;
    } else if (searchKeyword) {
      title = `Search Results for "${searchKeyword}" - Anjana`;
      desc = `Browse products matching "${searchKeyword}" at Anjana. Shop premium appliances and home decor with GST billing.`;
      keys = `search ${searchKeyword}, Anjana search, premium ${searchKeyword}`;
    }

    document.title = title;

    // Update Meta Description
    let descMeta = document.querySelector('meta[name="description"]');
    if (!descMeta) {
      descMeta = document.createElement('meta');
      descMeta.name = 'description';
      document.head.appendChild(descMeta);
    }
    descMeta.content = desc;

    // Update Meta Keywords
    let keysMeta = document.querySelector('meta[name="keywords"]');
    if (!keysMeta) {
      keysMeta = document.createElement('meta');
      keysMeta.name = 'keywords';
      document.head.appendChild(keysMeta);
    }
    keysMeta.content = keys;
  }, [currentCategorySlug, searchKeyword, categories]);

  // 2. Fetch filtered products whenever active filters or URL query changes
  useEffect(() => {
    let url = new URL(`${window.API_URL}/api/products`);

    if (currentCategorySlug) url.searchParams.append('category', currentCategorySlug);
    if (searchKeyword) url.searchParams.append('search', searchKeyword);
    if (minPrice) url.searchParams.append('minPrice', minPrice);
    if (maxPrice) url.searchParams.append('maxPrice', maxPrice);
    if (availability) url.searchParams.append('availability', availability);
    if (minRating) url.searchParams.append('rating', minRating);
    if (sortBy) url.searchParams.append('sortBy', sortBy);

    if (selectedBrands.length > 0) {
      url.searchParams.append('brand', selectedBrands.join(','));
    }
    if (selectedMaterials.length > 0) {
      url.searchParams.append('material', selectedMaterials.join(','));
    }
    if (selectedColors.length > 0) {
      url.searchParams.append('color', selectedColors.join(','));
    }

    fetch(url)
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          setProducts(res.data);
        }
      })
      .catch(err => console.error('Error fetching filtered products:', err));
  }, [
    currentCategorySlug, searchKeyword, minPrice, maxPrice,
    selectedBrands, selectedMaterials, selectedColors, availability, minRating, sortBy
  ]);

  // Collapsible category structure
  const mainCategories = categories.filter(c => c.parent_id === null);

  const handleBrandCheck = (slug) => {
    setSelectedBrands(prev => 
      prev.includes(slug) ? prev.filter(b => b !== slug) : [...prev, slug]
    );
  };

  const handleMaterialCheck = (slug) => {
    setSelectedMaterials(prev => 
      prev.includes(slug) ? prev.filter(m => m !== slug) : [...prev, slug]
    );
  };

  const handleColorCheck = (id) => {
    setSelectedColors(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const resetFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setSelectedBrands([]);
    setSelectedMaterials([]);
    setSelectedColors([]);
    setAvailability('');
    setMinRating('');
    setSortBy('newest');
  };

  const renderFilters = () => (
    <div className="filters-container">
      
      {/* Title & Clear */}
      <div className="filter-header">
        <h3 className="filter-main-title">
          <SlidersHorizontal size={18} /> Filters
        </h3>
        <button onClick={resetFilters} className="clear-filters-btn">
          Clear All
        </button>
      </div>

      {/* Category selector */}
      <div className="filter-block">
        <h4 className="filter-section-title">Categories</h4>
        <ul className="filter-category-list">
          <li>
            <button 
              onClick={() => setSearchParams({})}
              className={`filter-cat-btn ${currentCategorySlug === '' ? 'active' : ''}`}
            >
              All Categories
            </button>
          </li>
          {mainCategories.map(cat => {
            const subcats = categories.filter(c => c.parent_id === cat.id);
            const isParentActive = currentCategorySlug === cat.slug || subcats.some(s => s.slug === currentCategorySlug);
            return (
              <li key={cat.id} className="filter-cat-item-wrap">
                <button 
                  onClick={() => setSearchParams({ category: cat.slug })}
                  className={`filter-cat-btn ${currentCategorySlug === cat.slug ? 'active' : ''}`}
                >
                  {cat.name}
                </button>
                {/* Render subcategories if they exist and parent is active */}
                {subcats.length > 0 && isParentActive && (
                  <ul className="filter-subcategory-list">
                    {subcats.map(sub => (
                      <li key={sub.id}>
                        <button 
                          onClick={() => setSearchParams({ category: sub.slug })}
                          className={`filter-subcat-btn ${currentCategorySlug === sub.slug ? 'active' : ''}`}
                        >
                          — {sub.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Price filter */}
      <div className="filter-block">
        <h4 className="filter-section-title">Price Range (₹)</h4>
        <div className="price-filter-inputs">
          <input 
            type="number" 
            placeholder="Min" 
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="form-control" 
          />
          <span className="price-separator">-</span>
          <input 
            type="number" 
            placeholder="Max" 
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="form-control" 
          />
        </div>
      </div>

      {/* Brand filter */}
      <div className="filter-block">
        <h4 className="filter-section-title">Brand</h4>
        <div className="filter-options-stack">
          {brands.map(b => (
            <label key={b.id} className="filter-checkbox-label">
              <input 
                type="checkbox" 
                checked={selectedBrands.includes(b.slug)}
                onChange={() => handleBrandCheck(b.slug)} 
              />
              <span>{b.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Material filter */}
      <div className="filter-block">
        <h4 className="filter-section-title">Material</h4>
        <div className="filter-options-stack">
          {materials.map(m => (
            <label key={m.id} className="filter-checkbox-label">
              <input 
                type="checkbox" 
                checked={selectedMaterials.includes(m.slug)}
                onChange={() => handleMaterialCheck(m.slug)} 
              />
              <span>{m.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Color filter */}
      <div className="filter-block">
        <h4 className="filter-section-title">Colors</h4>
        <div className="filter-colors-grid">
          {colors.map(c => {
            const isSelected = selectedColors.includes(c.id);
            return (
              <button 
                key={c.id}
                onClick={() => handleColorCheck(c.id)}
                title={c.name}
                className={`filter-color-dot ${isSelected ? 'active' : ''}`}
                style={{ backgroundColor: c.code }}
              />
            );
          })}
        </div>
      </div>

      {/* Stock Availability */}
      <div className="filter-block">
        <h4 className="filter-section-title">Stock Availability</h4>
        <label className="filter-checkbox-label">
          <input 
            type="checkbox" 
            checked={availability === 'in_stock'}
            onChange={(e) => setAvailability(e.target.checked ? 'in_stock' : '')} 
          />
          <span>Exclude Out of Stock</span>
        </label>
      </div>

      {/* Rating Filter */}
      <div className="filter-block">
        <h4 className="filter-section-title">Minimum Rating</h4>
        <div className="filter-options-stack">
          {[4, 3, 2].map(star => (
            <label key={star} className="filter-checkbox-label">
              <input 
                type="radio" 
                name="rating" 
                checked={minRating === String(star)}
                onChange={() => setMinRating(String(star))} 
              />
              <span className="rating-stars-label">
                {star}★ & Above
              </span>
            </label>
          ))}
          <label className="filter-checkbox-label">
            <input 
              type="radio" 
              name="rating" 
              checked={minRating === ''}
              onChange={() => setMinRating('')} 
            />
            <span>All Ratings</span>
          </label>
        </div>
      </div>

    </div>
  );

  const getPageTitle = () => {
    if (searchKeyword) return `Search Results for "${searchKeyword}"`;
    if (currentCategorySlug) {
      const match = categories.find(c => c.slug === currentCategorySlug);
      return match ? match.name : 'Category Shop';
    }
    return 'All Products';
  };

  const currentCategory = categories.find(c => c.slug === currentCategorySlug);
  const activeParentId = currentCategory 
    ? (currentCategory.parent_id || currentCategory.id) 
    : null;
  const subcategories = activeParentId 
    ? categories.filter(c => c.parent_id === activeParentId) 
    : [];
  const isMainCategorySelected = currentCategory && currentCategory.parent_id === null && !searchKeyword;

  return (
    <div className="container section-padding plp-layout" style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '40px', minHeight: '80vh', padding: '40px 20px' }}>
      
      {/* 1. Left Sidebar Filters (Desktop Only) */}
      <aside className="desktop-filters" style={{ borderRight: '1px solid #E2E8F0', paddingRight: '24px' }}>
        {renderFilters()}
      </aside>

      {/* 2. Right Products Area */}
      <main style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Top bar controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontFamily: "'Outfit', sans-serif", fontWeight: '800', color: '#0F172A' }}>
              {getPageTitle()}
            </h1>
            {!isMainCategorySelected && (
              <span style={{ fontSize: '0.85rem', color: '#64748B' }}>
                Showing {products.length} products found
              </span>
            )}
          </div>

          {!isMainCategorySelected && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Mobile Filter Button */}
              <button 
                className="mobile-filter-btn" 
                onClick={() => setShowMobileFilters(true)}
                style={{
                  display: 'none', padding: '10px 18px', borderRadius: '8px',
                  border: '1px solid var(--border)', fontSize: '0.88rem', fontWeight: '500',
                  color: 'var(--primary)', alignItems: 'center', gap: '6px'
                }}
              >
                <Filter size={16} /> Filters
              </button>

              {/* Sorting */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <ArrowUpDown size={16} style={{ color: 'var(--primary)' }} />
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="form-control"
                  style={{ padding: '8px 12px', fontSize: '0.88rem', minWidth: '180px', borderRadius: '8px' }}
                >
                  <option value="newest">New Arrivals</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Average Rating</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Subcategories visual circles (Shown only when in subcategory or details mode) */}
        {subcategories.length > 0 && !isMainCategorySelected && (
          <div style={{ 
            display: 'flex', 
            gap: '20px', 
            overflowX: 'auto', 
            padding: '10px 5px 20px 5px', 
            marginBottom: '15px',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }} className="subcategory-scroll-list">
            {subcategories.map(sub => {
              const isActive = currentCategorySlug === sub.slug;
              const subImg = sub.image_url 
                ? (sub.image_url.startsWith('/') ? `${window.API_URL}${sub.image_url}` : sub.image_url)
                : 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=150&q=80';
              return (
                <button
                  key={sub.id}
                  onClick={() => setSearchParams({ category: sub.slug })}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    minWidth: '90px',
                    flexShrink: 0,
                    transition: 'var(--transition)'
                  }}
                  className="subcat-circle-btn"
                >
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: isActive ? '3px solid var(--accent)' : '1px solid var(--border)',
                    boxShadow: isActive ? '0 0 8px rgba(212, 155, 40, 0.4)' : 'var(--shadow)',
                    transition: 'var(--transition)',
                    backgroundColor: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <img 
                      src={subImg} 
                      alt={sub.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  </div>
                  <span style={{
                    fontSize: '0.8rem',
                    fontWeight: isActive ? '700' : '600',
                    color: isActive ? 'var(--accent)' : 'var(--primary)',
                    textAlign: 'center',
                    whiteSpace: 'nowrap'
                  }}>
                    {sub.name}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Dynamic products list grid OR subcategories cards grid */}
        {isMainCategorySelected ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <p style={{ color: '#64748B', fontSize: '0.92rem', marginBottom: '10px' }}>
              Select a subcategory below to explore Anjana's premium inventory:
            </p>
            <div className="grid-3" style={{ gap: '20px' }}>
              {subcategories.map(sub => {
                const subImg = sub.image_url 
                  ? (sub.image_url.startsWith('/') ? `${window.API_URL}${sub.image_url}` : sub.image_url)
                  : 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=400&q=80';
                return (
                  <div 
                    key={sub.id} 
                    onClick={() => setSearchParams({ category: sub.slug })}
                    style={{
                      cursor: 'pointer',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      border: '1px solid var(--border)',
                      backgroundColor: '#FFFFFF',
                      boxShadow: 'var(--shadow)',
                      transition: 'var(--transition)'
                    }}
                    className="subcat-grid-card"
                  >
                    <div style={{ height: '180px', overflow: 'hidden', backgroundColor: '#F0F2F1' }}>
                      <img 
                        src={subImg} 
                        alt={sub.name} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                        className="subcat-card-img"
                      />
                    </div>
                    <div style={{ padding: '16px', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'capitalize' }}>
                        {sub.name}
                      </h3>
                      <span style={{ fontSize: '0.78rem', color: 'var(--accent)', fontWeight: '600', textTransform: 'uppercase', marginTop: '6px', display: 'block' }}>
                        Browse Collection &rarr;
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          products.length > 0 ? (
            <div className="grid-3" style={{ animation: 'fadeIn 0.4s ease' }}>
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
          ) : (
            <div style={{
              textAlign: 'center', padding: '80px 20px', border: '2px dashed var(--border)',
              borderRadius: 'var(--radius-lg)', color: 'var(--text-muted)'
            }}>
              <h3>No products match your criteria.</h3>
              <p style={{ marginTop: '8px', fontSize: '0.9rem' }}>Try adjusting price sliders, color blocks, or click "Clear All" to start fresh.</p>
            </div>
          )
        )}

      </main>

      {/* 3. Mobile Filter Drawer */}
      {showMobileFilters && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1200 }}>
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: '80vh',
            backgroundColor: '#FFFFFF', borderTopLeftRadius: '20px', borderTopRightRadius: '20px',
            padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Filters</span>
              <button onClick={() => setShowMobileFilters(false)} style={{ color: 'var(--primary)' }}>
                <X size={24} />
              </button>
            </div>
            
            {renderFilters()}

            <button 
              onClick={() => setShowMobileFilters(false)}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '30px', padding: '14px' }}
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Responsive media rules */}
      <style>{`
        @media (max-width: 900px) {
          .plp-layout {
            grid-template-columns: 1fr !important;
          }
          .desktop-filters {
            display: none !important;
          }
          .mobile-filter-btn {
            display: inline-flex !important;
          }
        }
      `}</style>

    </div>
  );
}
