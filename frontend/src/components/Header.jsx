import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Heart, ShoppingBag, User, Menu, X, ChevronDown, ChevronRight, Phone } from 'lucide-react';

export default function Header({ cart, wishlist, adminToken, onLogout, userToken, user, onUserLogout }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [categoriesTree, setCategoriesTree] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDropdowns, setOpenDropdowns] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${window.API_URL}/api/categories/tree`)
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          setCategoriesTree(res.data);
        }
      })
      .catch(err => console.error('Error fetching categories:', err));
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsMobileMenuOpen(false);
    }
  };

  const toggleDropdown = (id) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <header className="sticky-header">
      {/* 1. Announcement Bar */}
      <div style={{ backgroundColor: 'var(--primary)', color: 'var(--text-light)', fontSize: '0.8rem', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div>Har Ghar Ki Pehchaan, Quality Ke Saath • Trusted Since 1998</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Phone size={12} /> Call: +91 9982827751
            </span>
            <span style={{ opacity: 0.8 }}>GST Billing Available</span>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <div style={{ padding: '16px 0', backgroundColor: '#FFFFFF' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
          
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--primary)', fontFamily: "'Playfair Display', serif", lineHeight: 1.1 }} className="logo-title">
              SDC CANTEEN
            </span>
            <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--accent)', fontWeight: '600' }} className="logo-subtitle">
              Furniture & Electronics
            </span>
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearchSubmit} className="desktop-search" style={{ flex: 1, maxWidth: '450px', position: 'relative' }}>
            <input
              type="text"
              placeholder="Search sofa, recliners, smart TV, god statues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-control"
              style={{ paddingRight: '45px', borderRadius: '24px', fontSize: '0.9rem' }}
            />
            <button type="submit" style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }}>
              <Search size={18} />
            </button>
          </form>

          {/* Action Icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }} className="header-actions">
            {/* Wishlist */}
            <Link to="/wishlist" style={{ position: 'relative', color: 'var(--primary)' }}>
              <Heart size={22} />
              {wishlist.length > 0 && (
                <span style={{
                  position: 'absolute', top: '-6px', right: '-8px', backgroundColor: 'var(--accent)',
                  color: '#FFF', fontSize: '0.7rem', width: '18px', height: '18px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                }}>
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link to="/cart" style={{ position: 'relative', color: 'var(--primary)' }}>
              <ShoppingBag size={22} />
              {cart.length > 0 && (
                <span style={{
                  position: 'absolute', top: '-6px', right: '-8px', backgroundColor: '#C84B31',
                  color: '#FFF', fontSize: '0.7rem', width: '18px', height: '18px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                }}>
                  {cart.length}
                </span>
              )}
            </Link>

            {/* Customer User Profile / Login */}
            {userToken ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Link to="/profile" style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: '600' }} title="View Profile">
                  <User size={18} />
                  <span className="desktop-search">Hi, {user?.full_name?.split(' ')[0] || user?.username}</span>
                </Link>
                <button onClick={onUserLogout} style={{ fontSize: '0.8rem', color: '#C84B31', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer' }} title="Logout">
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login" style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }} title="Login / Register">
                <User size={22} />
              </Link>
            )}

            {/* Hamburger menu - Mobile */}
            <button className="mobile-menu-toggle" onClick={() => setIsMobileMenuOpen(true)} style={{ display: 'none', color: 'var(--primary)' }}>
              <Menu size={24} />
            </button>
          </div>

        </div>
      </div>      {/* 3. Mega Navigation Menu (Desktop Only) */}
      <nav className="desktop-nav" style={{ backgroundColor: 'var(--primary)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="container" style={{ position: 'relative' }}>
          <ul style={{ display: 'flex', listStyle: 'none', gap: '30px', padding: '0 0' }}>
            <li className="nav-item">
              <Link to="/" style={{ display: 'block', padding: '14px 0', color: 'var(--text-light)', fontWeight: '500', fontSize: '0.9rem' }}>
                Home
              </Link>
            </li>

            <li className="nav-item mega-dropdown-trigger">
              <Link to="/shop" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '14px 0', color: 'var(--text-light)', fontWeight: '500', fontSize: '0.9rem' }}>
                Category
                <ChevronDown size={14} />
              </Link>

              {/* Mega Menu Dropdown */}
              {categoriesTree.length > 0 && (
                <div className="mega-menu" style={{
                  position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#FFFFFF',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)', border: '1px solid var(--border)',
                  borderRadius: '0 0 var(--radius-md) var(--radius-md)', padding: '24px 30px', display: 'none',
                  gridTemplateColumns: 'repeat(5, 1fr)', gap: '20px', zIndex: 1000
                }}>
                  {categoriesTree.map(cat => (
                    <div key={cat.id}>
                      <Link to={`/shop?category=${cat.slug}`} style={{ fontWeight: '700', color: 'var(--primary)', display: 'block', marginBottom: '10px', fontSize: '0.9rem', borderBottom: '2px solid var(--accent)', paddingBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {cat.name}
                      </Link>
                      {cat.children && cat.children.length > 0 && (
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {cat.children.map(subcat => (
                            <li key={subcat.id}>
                              <Link to={`/shop?category=${subcat.slug}`} style={{ color: 'var(--text-muted)', fontSize: '0.85rem', transition: 'var(--transition)' }} className="subcat-link">
                                {subcat.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </li>

            <li className="nav-item">
              <Link to="/about" style={{ display: 'block', padding: '14px 0', color: 'var(--text-light)', fontWeight: '500', fontSize: '0.9rem' }}>
                About Us
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/services" style={{ display: 'block', padding: '14px 0', color: 'var(--text-light)', fontWeight: '500', fontSize: '0.9rem' }}>
                Our Services
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/contact" style={{ display: 'block', padding: '14px 0', color: 'var(--text-light)', fontWeight: '500', fontSize: '0.9rem' }}>
                Contact Us
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* 4. Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1100 }}>
          <div style={{ width: '80%', maxWidth: '320px', height: '100%', backgroundColor: '#FFFFFF', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--primary)' }}>SDC CANTEEN</span>
              <button onClick={() => setIsMobileMenuOpen(false)} style={{ color: 'var(--primary)' }}>
                <X size={24} />
              </button>
            </div>

            {/* Mobile Search */}
            <form onSubmit={handleSearchSubmit} style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-control"
                style={{ paddingRight: '40px' }}
              />
              <button type="submit" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }}>
                <Search size={16} />
              </button>
            </form>

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <li>
                <Link to="/" onClick={() => setIsMobileMenuOpen(false)} style={{ display: 'block', fontSize: '1rem', fontWeight: '500', color: 'var(--primary)' }}>
                  Home
                </Link>
              </li>

              <li>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Link to="/shop" onClick={() => setIsMobileMenuOpen(false)} style={{ fontSize: '1rem', fontWeight: '500', color: 'var(--primary)' }}>
                    Category
                  </Link>
                  <button onClick={() => toggleDropdown('mobile-categories')} style={{ padding: '4px' }}>
                    <ChevronDown size={18} style={{ transform: openDropdowns['mobile-categories'] ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                  </button>
                </div>

                {openDropdowns['mobile-categories'] && (
                  <ul style={{ listStyle: 'none', paddingLeft: '15px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '12px', borderLeft: '1px solid var(--border)' }}>
                    {categoriesTree.map(cat => (
                      <li key={cat.id}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Link to={`/shop?category=${cat.slug}`} onClick={() => setIsMobileMenuOpen(false)} style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--primary)' }}>
                            {cat.name}
                          </Link>
                          {cat.children && cat.children.length > 0 && (
                            <button onClick={() => toggleDropdown(`cat-${cat.id}`)} style={{ padding: '4px' }}>
                              <ChevronDown size={16} style={{ transform: openDropdowns[`cat-${cat.id}`] ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                            </button>
                          )}
                        </div>

                        {cat.children && cat.children.length > 0 && openDropdowns[`cat-${cat.id}`] && (
                          <ul style={{ listStyle: 'none', paddingLeft: '15px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {cat.children.map(subcat => (
                              <li key={subcat.id}>
                                <Link to={`/shop?category=${subcat.slug}`} onClick={() => setIsMobileMenuOpen(false)} style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block' }}>
                                  {subcat.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </li>

              <li style={{ borderTop: '1px solid var(--border)', paddingTop: '15px' }}>
                <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} style={{ display: 'block', fontSize: '1rem', fontWeight: '500', color: 'var(--primary)' }}>
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/services" onClick={() => setIsMobileMenuOpen(false)} style={{ display: 'block', fontSize: '1rem', fontWeight: '500', color: 'var(--primary)' }}>
                  Our Services
                </Link>
              </li>
              <li>
                <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} style={{ display: 'block', fontSize: '1rem', fontWeight: '500', color: 'var(--primary)' }}>
                  Contact Us
                </Link>
              </li>
            </ul>

          </div>
        </div>
      )}

      {/* Styled tags injected locally since Tailwind is disabled and we use Vanilla CSS */}
      <style>{`
        .desktop-nav .nav-item:hover .mega-menu {
          display: grid !important;
        }
        @media (max-width: 991px) {
          .desktop-search { display: none !important; }
          .desktop-nav { display: none !important; }
          .mobile-menu-toggle { display: block !important; }
        }
        @media (max-width: 500px) {
          .logo-title {
            font-size: 1.15rem !important;
          }
          .logo-subtitle {
            font-size: 0.55rem !important;
            letter-spacing: 0.5px !important;
          }
          .header-actions {
            gap: 12px !important;
          }
        }
      `}</style>
    </header>
  );
}
