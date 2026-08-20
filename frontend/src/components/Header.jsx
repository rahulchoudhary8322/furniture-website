import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Heart, ShoppingBag, User, Menu, X, ChevronDown, Phone, LogOut } from 'lucide-react';

export default function Header({ cart, wishlist, adminToken, onLogout, userToken, user, onUserLogout }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
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
      setIsSearchOpen(false);
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
    <header className="sticky-header" style={{
      backgroundColor: '#FFFFFF',
      boxShadow: '0 2px 12px rgba(0, 0, 0, 0.02)',
      borderBottom: '1px solid #F1F5F9',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      {/* Main Navbar */}
      <div style={{ padding: '16px 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          
          {/* Left: Brand Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img 
              src="/logo.png" 
              alt="Anjana Logo" 
              style={{ height: '65px', width: 'auto', objectFit: 'contain', margin: '-10px 0' }} 
              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
            />
            <span style={{ 
              fontSize: '1.8rem', 
              fontWeight: '800', 
              color: '#0F172A', 
              fontFamily: "'Outfit', sans-serif", 
              letterSpacing: '-0.5px',
              display: 'none'
            }} className="logo-title">
              Anjana
            </span>
          </Link>

          {/* Center: Navigation Links (Desktop) */}
          <nav className="desktop-nav" style={{ display: 'flex', alignItems: 'center' }}>
            <ul style={{ display: 'flex', listStyle: 'none', gap: '36px', padding: 0, margin: 0 }}>
              <li>
                <Link to="/" style={{ color: '#0F172A', fontWeight: '500', fontSize: '0.95rem' }} className="nav-link-item">
                  Home
                </Link>
              </li>

              <li className="mega-dropdown-trigger" style={{ position: 'relative' }}>
                <Link to="/shop" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#0F172A', fontWeight: '500', fontSize: '0.95rem' }} className="nav-link-item">
                  Categories
                  <ChevronDown size={14} />
                </Link>

                {/* Mega Menu Dropdown */}
                {categoriesTree.length > 0 && (
                  <div className="mega-menu" style={{
                    position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
                    backgroundColor: '#FFFFFF', width: '700px',
                    boxShadow: '0 12px 30px rgba(0,0,0,0.08)', border: '1px solid #E2E8F0',
                    borderRadius: '16px', padding: '24px', display: 'none',
                    gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', zIndex: 1000,
                    marginTop: '10px'
                  }}>
                    {categoriesTree.map(cat => (
                      <div key={cat.id}>
                        <Link to={`/shop?category=${cat.slug}`} style={{ fontWeight: '700', color: '#0F172A', display: 'block', marginBottom: '8px', fontSize: '0.85rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          {cat.name}
                        </Link>
                        {cat.children && cat.children.length > 0 && (
                          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {cat.children.slice(0, 5).map(subcat => (
                              <li key={subcat.id}>
                                <Link to={`/shop?category=${subcat.slug}`} style={{ color: '#64748B', fontSize: '0.8rem', transition: 'var(--transition)' }} className="subcat-link">
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

              <li>
                <Link to="/contact" style={{ color: '#0F172A', fontWeight: '500', fontSize: '0.95rem' }} className="nav-link-item">
                  Contact Us
                </Link>
              </li>
            </ul>
          </nav>

          {/* Right: Icons Menu */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            
            {/* Search Icon */}
            <button onClick={() => setIsSearchOpen(!isSearchOpen)} style={{ color: '#0F172A', display: 'flex', alignItems: 'center', cursor: 'pointer' }} aria-label="Search">
              <Search size={22} strokeWidth={2} />
            </button>

            {/* Profile/User Icon */}
            {userToken ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }} className="profile-container">
                <Link to="/profile" style={{ color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }} title="My Account">
                  <User size={22} strokeWidth={2} />
                  <span className="desktop-username" style={{ fontSize: '0.85rem', fontWeight: '600' }}>Hi, {user?.full_name?.split(' ')[0] || user?.username}</span>
                </Link>
                <button onClick={onUserLogout} style={{ color: '#E11D48', display: 'flex', alignItems: 'center', cursor: 'pointer' }} title="Logout">
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link to="/login" style={{ color: '#0F172A', display: 'flex', alignItems: 'center' }} title="Login / Register">
                <User size={22} strokeWidth={2} />
              </Link>
            )}

            {/* Cart Icon */}
            <Link to="/cart" style={{ position: 'relative', color: '#0F172A', display: 'flex', alignItems: 'center' }} title="Shopping Cart">
              <ShoppingBag size={22} strokeWidth={2} />
              {cart.length > 0 && (
                <span style={{
                  position: 'absolute', top: '-6px', right: '-8px', backgroundColor: '#E11D48',
                  color: '#FFF', fontSize: '0.65rem', width: '16px', height: '16px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                }}>
                  {cart.length}
                </span>
              )}
            </Link>

            {/* Hamburger menu - Mobile */}
            <button className="mobile-menu-toggle" onClick={() => setIsMobileMenuOpen(true)} style={{ display: 'none', color: '#0F172A', cursor: 'pointer' }} aria-label="Open menu">
              <Menu size={24} />
            </button>
          </div>

          {/* Slide Down Search bar (Desktop & Mobile) */}
          {isSearchOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              backgroundColor: '#FFFFFF',
              borderBottom: '1px solid #E2E8F0',
              padding: '16px 20px',
              zIndex: 999,
              boxShadow: '0 10px 20px rgba(0,0,0,0.03)',
              animation: 'slideDown 0.25s ease-out'
            }}>
              <form onSubmit={handleSearchSubmit} className="container" style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  placeholder="Search for furniture, electronics, mobile phones, clocks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-control"
                  style={{ flex: 1, borderRadius: '9999px', padding: '10px 24px', fontSize: '0.9rem' }}
                  autoFocus
                />
                <button type="submit" className="btn btn-primary">
                  Search
                </button>
              </form>
            </div>
          )}

        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,23,42,0.3)', zIndex: 1100, backdropFilter: 'blur(4px)' }}>
          <div style={{ width: '85%', maxWidth: '320px', height: '100%', backgroundColor: '#FFFFFF', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', boxShadow: '10px 0 30px rgba(0,0,0,0.1)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0F172A', fontFamily: "'Outfit', sans-serif" }}>Anjana</span>
              <button onClick={() => setIsMobileMenuOpen(false)} style={{ color: '#0F172A', cursor: 'pointer' }}>
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
                style={{ paddingRight: '40px', borderRadius: '9999px' }}
              />
              <button type="submit" style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#0F172A' }}>
                <Search size={16} />
              </button>
            </form>

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '15px', padding: 0 }}>
              <li>
                <Link to="/" onClick={() => setIsMobileMenuOpen(false)} style={{ display: 'block', fontSize: '1rem', fontWeight: '600', color: '#0F172A' }}>
                  Home
                </Link>
              </li>

              <li>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Link to="/shop" onClick={() => setIsMobileMenuOpen(false)} style={{ fontSize: '1rem', fontWeight: '600', color: '#0F172A' }}>
                    Categories
                  </Link>
                  <button onClick={() => toggleDropdown('mobile-categories')} style={{ padding: '4px', cursor: 'pointer' }}>
                    <ChevronDown size={18} style={{ transform: openDropdowns['mobile-categories'] ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                  </button>
                </div>

                {openDropdowns['mobile-categories'] && (
                  <ul style={{ listStyle: 'none', paddingLeft: '15px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '12px', borderLeft: '1px solid #E2E8F0' }}>
                    {categoriesTree.map(cat => (
                      <li key={cat.id}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Link to={`/shop?category=${cat.slug}`} onClick={() => setIsMobileMenuOpen(false)} style={{ fontSize: '0.9rem', fontWeight: '600', color: '#0F172A' }}>
                            {cat.name}
                          </Link>
                          {cat.children && cat.children.length > 0 && (
                            <button onClick={() => toggleDropdown(`cat-${cat.id}`)} style={{ padding: '4px', cursor: 'pointer' }}>
                              <ChevronDown size={16} style={{ transform: openDropdowns[`cat-${cat.id}`] ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                            </button>
                          )}
                        </div>

                        {cat.children && cat.children.length > 0 && openDropdowns[`cat-${cat.id}`] && (
                          <ul style={{ listStyle: 'none', paddingLeft: '15px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {cat.children.map(subcat => (
                              <li key={subcat.id}>
                                <Link to={`/shop?category=${subcat.slug}`} onClick={() => setIsMobileMenuOpen(false)} style={{ fontSize: '0.8rem', color: '#64748B', display: 'block' }}>
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

              <li style={{ borderTop: '1px solid #E2E8F0', paddingTop: '15px' }}>
                <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} style={{ display: 'block', fontSize: '1rem', fontWeight: '600', color: '#0F172A' }}>
                  Contact Us
                </Link>
              </li>
            </ul>

          </div>
        </div>
      )}

      {/* Styled tags injected locally since Tailwind is disabled and we use Vanilla CSS */}
      <style>{`
        .desktop-nav .nav-link-item {
          transition: color 0.2s ease;
          padding: 8px 4px;
          display: inline-flex;
          align-items: center;
        }
        .desktop-nav .nav-link-item:hover {
          color: #E11D48 !important;
        }
        .desktop-nav .nav-item:hover .mega-menu {
          display: grid !important;
        }
        .subcat-link:hover {
          color: #E11D48 !important;
          padding-left: 4px;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 1; transform: translateY(0); }
          to { opacity: 0; transform: translateY(-10px); }
        }
        @media (max-width: 991px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-toggle { display: block !important; }
          .desktop-username { display: none !important; }
        }
        @media (max-width: 500px) {
          .logo-title {
            font-size: 1.5rem !important;
          }
        }
      `}</style>
    </header>
  );
}
