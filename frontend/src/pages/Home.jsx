import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Award, ShieldCheck, Truck, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import ProductCard from '../components/ProductCard';

export default function Home({ cart, wishlist, onAddToCart, onToggleWishlist }) {
  const location = useLocation();
  const [banners, setBanners] = useState([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [activeTab, setActiveTab] = useState('featured');
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [currentReview, setCurrentReview] = useState(0);
  const [contactForm, setContactForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [formSubmitted, setFormSubmitted] = useState(false);

  useEffect(() => {
    let targetId = '';
    if (location.pathname === '/about') targetId = 'about';
    else if (location.pathname === '/services') targetId = 'services';
    else if (location.pathname === '/contact') targetId = 'contact';

    if (targetId) {
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

  useEffect(() => {
    // 1. Fetch Banners
    fetch(`${window.API_URL}/api/admin/banners`)
      .then(res => res.json())
      .then(res => {
        if (res.success && res.data.length > 0) {
          setBanners(res.data);
        } else {
          // Fallback static banners
          setBanners([
            { id: 1, title: 'Premium Custom Furniture', subtitle: 'Manufacturer of luxury recliners, sofas and beds since 1998', image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80', link: '/shop?category=furniture' },
            { id: 2, title: 'Latest Smart Electronics & Appliances', subtitle: 'Genuine products backed by GST billing & warranty support', image_url: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=1200&q=80', link: '/shop?category=electronics' }
          ]);
        }
      })
      .catch(() => {
        setBanners([
          { id: 1, title: 'Premium Custom Furniture', subtitle: 'Manufacturer of luxury recliners, sofas and beds since 1998', image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80', link: '/shop?category=furniture' }
        ]);
      });

    // 2. Fetch Reviews
    fetch(`${window.API_URL}/api/products`)
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          setReviews([
            { id: 1, customer_name: 'Rahul Sharma (Salasar)', rating: 5, comment: 'Bhaiya, SDC se humne sofa aur LED TV liya tha. Dono hi gazab quality ke hain. GST billing support ke sath warranty service bhi badiya mili.' },
            { id: 2, customer_name: 'Priya Vyas (Sujangarh)', rating: 5, comment: 'Custom fabric recliner is extremely comfortable. The wooden frame is solid and polishing is very neat. Best pricing in Churu district!' },
            { id: 3, customer_name: 'Mahendra Singh (Jaipur)', rating: 5, comment: 'Pooja Mandir brass carving and details are exceptional. Delivered safely with premium packaging. Highly trusted store since 1998.' }
          ]);
        }
      });
  }, []);

  // 3. Fetch products
  useEffect(() => {
    let url = `${window.API_URL}/api/products`;
    // We want to fetch all products for the most loved slider
    fetch(url)
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          setProducts(res.data);
        }
      })
      .catch(err => console.error('Error fetching products:', err));
  }, []);

  const nextBanner = () => {
    setCurrentBanner((prev) => (prev + 1) % banners.length);
  };

  const prevBanner = () => {
    setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
  };

  // Auto scroll banners
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(nextBanner, 6000);
    return () => clearInterval(interval);
  }, [banners]);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (contactForm.name && contactForm.phone) {
      setFormSubmitted(true);
      setTimeout(() => {
        setContactForm({ name: '', phone: '', email: '', message: '' });
        setFormSubmitted(false);
      }, 4000);
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease', backgroundColor: '#FFFFFF' }}>
      
      {/* 1. Category Bar Row (Below navbar) */}
      <section style={{ backgroundColor: '#FAF4ED', padding: '24px 0', borderBottom: '1px solid #FFEBE4' }} className="categories-header-row">
        <div className="container">
          <div style={{ display: 'flex', gap: '30px', overflowX: 'auto', paddingBottom: '10px', justifyContent: 'space-between', scrollbarWidth: 'none' }} className="category-scroll-list">
            {[
              { id: 1, name: 'Furniture', slug: 'furniture', icon: '/uploads/cat-furniture.jpg', fallback: '🛋️' },
              { id: 2, name: 'Electronics', slug: 'electronics', icon: '/uploads/cat-electronics.jpg', fallback: '🔌' },
              { id: 3, name: 'Mobiles', slug: 'mobile-phones', icon: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=150&q=80', fallback: '📱' },
              { id: 4, name: 'Accessories', slug: 'electronics', icon: '/uploads/cat-earbuds.jpg', fallback: '🎧' },
              { id: 5, name: 'Kidz Cars', slug: 'toys', icon: '/uploads/cat-toy-cars.jpg', fallback: '🚗' },
              { id: 6, name: 'Home & Decor', slug: 'home-decor', icon: '/uploads/cat-decor.jpg', fallback: '🪔' },
              { id: 7, name: 'Others', slug: '', icon: '', isOthers: true }
            ].map(cat => {
              if (cat.isOthers) {
                return (
                  <Link to="/shop" key="others" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', minWidth: '85px', textAlign: 'center' }}>
                    <div style={{
                      width: '74px', height: '74px', borderRadius: '50%', backgroundColor: '#FFFFFF',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700',
                      fontSize: '0.85rem', border: '1px solid #E2E8F0', color: '#0F172A',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.02)', transition: 'all 0.25s ease'
                    }} className="category-circle-item">
                      Others
                    </div>
                    <span style={{ fontSize: '0.78rem', fontWeight: '500', color: '#0F172A' }}>Others</span>
                  </Link>
                );
              }
              const imageUrl = cat.icon.startsWith('/') ? `${window.API_URL}${cat.icon}` : cat.icon;
              return (
                <Link to={`/shop?category=${cat.slug}`} key={cat.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', minWidth: '85px', textAlign: 'center' }}>
                  <div style={{
                    width: '74px', height: '74px', borderRadius: '50%', overflow: 'hidden',
                    border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                    transition: 'all 0.25s ease'
                  }} className="category-circle-item">
                    <img
                      src={imageUrl}
                      alt={cat.name}
                      onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <span style={{ display: 'none', fontSize: '1.5rem' }}>{cat.fallback}</span>
                  </div>
                  <span style={{ fontSize: '0.78rem', fontWeight: '500', color: '#0F172A' }}>{cat.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. Hero Promotional Layout (Main banner + 4 side cards) */}
      <section style={{ padding: '30px 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '20px' }} className="hero-grid-layout">
            
            {/* Left: Main Slider */}
            <div style={{ 
              backgroundColor: '#FFEBE7', // Peach background
              borderRadius: '24px',
              padding: '40px',
              position: 'relative',
              height: '420px',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.01)'
            }} className="hero-main-card">
              {banners.map((slide, idx) => {
                const imageUrl = slide.image_url.startsWith('/') ? `${window.API_URL}${slide.image_url}` : slide.image_url;
                return (
                  <div 
                    key={slide.id} 
                    style={{
                      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                      opacity: idx === currentBanner ? 1 : 0, transition: 'opacity 0.6s ease',
                      display: 'flex', alignItems: 'center', padding: '40px', zIndex: idx === currentBanner ? 1 : 0,
                      boxSizing: 'border-box'
                    }}
                  >
                    <div style={{ width: '55%', display: 'flex', flexDirection: 'column', gap: '15px', zIndex: 5 }}>
                      <h2 style={{ fontSize: '2.4rem', fontWeight: '800', lineHeight: '1.1', color: '#0F172A', fontFamily: "'Outfit', sans-serif" }}>
                        {slide.title || "Style and Speed"}
                      </h2>
                      <p style={{ fontSize: '0.95rem', color: '#475569', fontWeight: '400', maxWidth: '300px' }}>
                        {slide.subtitle || "Latest Trends. Best Prices. Just for You!"}
                      </p>
                      <div>
                        <Link to={slide.link || "/shop"} className="btn btn-primary" style={{ padding: '10px 24px', backgroundColor: '#000000', color: '#FFFFFF' }}>
                          Shop Now
                        </Link>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: '500', marginTop: '10px' }}>@anjana</span>
                    </div>

                    <div style={{ width: '45%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img 
                        src={imageUrl} 
                        alt="Hero Slide" 
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=600&q=80'; }}
                        style={{ width: '100%', height: '85%', objectFit: 'contain', borderRadius: '16px' }}
                      />
                    </div>
                  </div>
                );
              })}

              {/* Slider Controls */}
              {banners.length > 1 && (
                <div style={{ position: 'absolute', bottom: '20px', left: '40px', display: 'flex', gap: '8px', zIndex: 10 }}>
                  {banners.map((_, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setCurrentBanner(idx)}
                      style={{
                        width: '8px', height: '8px', borderRadius: '50%',
                        backgroundColor: currentBanner === idx ? '#0F172A' : '#CBD5E1',
                        border: 'none', cursor: 'pointer'
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right: 4 Promo Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }} className="hero-promo-grid">
              
              {/* Card 1: Smart Watch */}
              <Link to="/shop?search=watch" style={{ 
                backgroundColor: '#E6F2FF', 
                borderRadius: '20px', 
                padding: '20px', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between',
                height: '202px',
                position: 'relative',
                overflow: 'hidden'
              }} className="hero-promo-card">
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0F172A' }}>Smart Watch</h3>
                  <span style={{ fontSize: '0.8rem', color: '#475569', display: 'block', marginTop: '4px' }}>From 499/-</span>
                </div>
                <img 
                  src="https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=300&q=80" 
                  alt="Smart Watch" 
                  style={{ width: '65%', height: '65%', objectFit: 'contain', alignSelf: 'flex-end', zIndex: 2 }}
                />
              </Link>

              {/* Card 2: Wall Clock */}
              <Link to="/shop?search=clock" style={{ 
                backgroundColor: '#F5EFFF', 
                borderRadius: '20px', 
                padding: '20px', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between',
                height: '202px',
                position: 'relative',
                overflow: 'hidden'
              }} className="hero-promo-card">
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0F172A' }}>Wall Clock</h3>
                  <span style={{ fontSize: '0.8rem', color: '#475569', display: 'block', marginTop: '4px' }}>From 299/-</span>
                </div>
                <img 
                  src="https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=300&q=80" 
                  alt="Wall Clock" 
                  style={{ width: '65%', height: '65%', objectFit: 'contain', alignSelf: 'flex-end', zIndex: 2 }}
                />
              </Link>

              {/* Card 3: Cars For Kidz */}
              <Link to="/shop?category=toys" style={{ 
                backgroundColor: '#FFF0F2', 
                borderRadius: '20px', 
                padding: '20px', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between',
                height: '202px',
                position: 'relative',
                overflow: 'hidden'
              }} className="hero-promo-card">
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0F172A' }}>Cars For Kidz</h3>
                  <span style={{ fontSize: '0.75rem', color: '#475569', display: 'block', marginTop: '4px' }}>From @anjana</span>
                </div>
                <img 
                  src="https://images.unsplash.com/photo-1559251606-c623743a6d76?auto=format&fit=crop&w=300&q=80" 
                  alt="Toy Cars" 
                  style={{ width: '65%', height: '65%', objectFit: 'contain', alignSelf: 'flex-end', zIndex: 2 }}
                />
              </Link>

              {/* Card 4: Style Comfort & Quality */}
              <Link to="/shop?search=earbuds" style={{ 
                backgroundColor: '#EBF4FF', 
                borderRadius: '20px', 
                padding: '20px', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between',
                height: '202px',
                position: 'relative',
                overflow: 'hidden'
              }} className="hero-promo-card">
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0F172A', lineHeight: '1.2' }}>Style Comfort & Quality</h3>
                </div>
                <img 
                  src="https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=300&q=80" 
                  alt="Earbuds" 
                  style={{ width: '65%', height: '65%', objectFit: 'contain', alignSelf: 'flex-end', zIndex: 2 }}
                />
              </Link>

            </div>

          </div>
        </div>
      </section>

      {/* 3. Product Showcase - Customer Most Loved */}
      <section style={{ padding: '40px 0' }} className="most-loved-section">
        <div className="container">
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>Coustomer Most Loved</h2>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              {/* Arrow navigation buttons for horizontal scrolling */}
              <div style={{ display: 'flex', gap: '8px' }} className="scroll-buttons-wrapper">
                <button 
                  onClick={() => {
                    const el = document.getElementById('most-loved-scroll-container');
                    if (el) el.scrollBy({ left: -300, behavior: 'smooth' });
                  }}
                  style={{
                    width: '38px', height: '38px', borderRadius: '50%', border: '1px solid #E2E8F0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF',
                    color: '#0F172A', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                  }}
                  className="scroll-arrow-btn"
                >
                  <ChevronLeft size={18} />
                </button>
                <button 
                  onClick={() => {
                    const el = document.getElementById('most-loved-scroll-container');
                    if (el) el.scrollBy({ left: 300, behavior: 'smooth' });
                  }}
                  style={{
                    width: '38px', height: '38px', borderRadius: '50%', border: '1px solid #E2E8F0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF',
                    color: '#0F172A', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                  }}
                  className="scroll-arrow-btn"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              <Link to="/shop" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: '700', color: '#E11D48', textDecoration: 'none' }} className="view-all-link">
                View All Products <span style={{ fontSize: '1.1rem' }}>&rarr;</span>
              </Link>
            </div>
          </div>

          {/* Scrolling Flex row of cards */}
          <div 
            id="most-loved-scroll-container"
            style={{ 
              display: 'flex', 
              gap: '20px', 
              overflowX: 'auto', 
              paddingBottom: '15px', 
              scrollbarWidth: 'none',
              scrollSnapType: 'x mandatory',
              scrollBehavior: 'smooth'
            }}
          >
            {products.length > 0 ? (
              products.map(prod => (
                <div key={prod.id} style={{ minWidth: '260px', width: '260px', scrollSnapAlign: 'start' }}>
                  <ProductCard 
                    product={prod}
                    cart={cart}
                    wishlist={wishlist}
                    onAddToCart={onAddToCart}
                    onToggleWishlist={onToggleWishlist}
                  />
                </div>
              ))
            ) : (
              <div style={{ padding: '40px', color: '#64748B', width: '100%', textAlign: 'center' }}>
                Loading customer choices...
              </div>
            )}
          </div>

        </div>
      </section>

      {/* 4. Benefits Section (At bottom of core details) */}
      <section style={{ padding: '30px 0' }} className="benefits-section">
        <div className="container">
          <div style={{ 
            backgroundColor: '#F8FAFC', 
            borderRadius: '24px', 
            border: '1px solid #E2E8F0', 
            padding: '30px 24px', 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr 1fr', 
            gap: '30px',
            textAlign: 'center'
          }} className="benefits-layout">
            
            {/* Delivery */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }} className="benefit-item">
              <div style={{ color: '#0F172A', backgroundColor: '#E2E8F0', padding: '12px', borderRadius: '50%' }}>
                <Truck size={24} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#0F172A' }}>Fast Delivery</h4>
                <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '2px' }}>On All Orders</p>
              </div>
            </div>

            {/* Payment */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', borderLeft: '1px solid #E2E8F0', borderRight: '1px solid #E2E8F0' }} className="benefit-item">
              <div style={{ color: '#0F172A', backgroundColor: '#E2E8F0', padding: '12px', borderRadius: '50%' }}>
                <ShieldCheck size={24} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#0F172A' }}>Secure Payment</h4>
                <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '2px' }}>100% Protected</p>
              </div>
            </div>

            {/* Quality */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }} className="benefit-item">
              <div style={{ color: '#0F172A', backgroundColor: '#E2E8F0', padding: '12px', borderRadius: '50%' }}>
                <Award size={24} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#0F172A' }}>Quality Assured</h4>
                <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '2px' }}>100% Genuine Products</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. About Us Summary Section */}
      <section id="about" className="section-padding" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="container about-grid">
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <span style={{ color: '#E11D48', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Trusted Partner
            </span>
            <h2 style={{ fontSize: '2.4rem', lineHeight: '1.2' }}>Bringing Quality Products to Every Home Since 1998</h2>
            <p style={{ color: '#64748B', fontSize: '0.98rem' }}>
              At **Anjana**, we believe that every family deserves access to quality products at affordable prices. We source and customize high-quality home furniture, smart electronics, mobiles, and home decor items.
            </p>
            <p style={{ color: '#64748B', fontSize: '0.98rem' }}>
              Our commitment to transparent pricing, secure shipping, and professional customer service helps us stay close to thousands of happy families who trust us for their daily lifestyle and home setup needs.
            </p>
            <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }} className="about-stats-container">
              <div>
                <h4 style={{ fontSize: '1.8rem', color: '#0F172A' }}>1998</h4>
                <p style={{ fontSize: '0.8rem', color: '#64748B' }}>Established Year</p>
              </div>
              <div style={{ borderLeft: '1px solid #E2E8F0' }}></div>
              <div>
                <h4 style={{ fontSize: '1.8rem', color: '#0F172A' }}>15K+</h4>
                <p style={{ fontSize: '0.8rem', color: '#64748B' }}>Happy Families</p>
              </div>
              <div style={{ borderLeft: '1px solid #E2E8F0' }}></div>
              <div>
                <h4 style={{ fontSize: '1.8rem', color: '#0F172A' }}>100%</h4>
                <p style={{ fontSize: '0.8rem', color: '#64748B' }}>Quality Assured</p>
              </div>
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <img 
              src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80" 
              alt="Anjana Showroom" 
              style={{ width: '100%', height: '400px', objectFit: 'cover', borderRadius: '24px', boxShadow: '0 10px 35px rgba(0,0,0,0.05)' }} 
            />
          </div>

        </div>
      </section>

      {/* 6. Dynamic Services section */}
      <section id="services" className="section-padding" style={{ backgroundColor: '#F8FAFC' }}>
        <div className="container">
          <div className="section-title">
            <h2>Our Services</h2>
            <p>End-to-end shopping and maintenance solutions by experts</p>
          </div>

          <div className="grid-3 services-grid">
            {[
              { title: 'Furniture Design', desc: 'Custom manufacturer of solid wood dining sets, carved sofa sets, mandirs, and premium beds at factory rates.' },
              { title: 'Electronics Supply', desc: 'Authorized supply of smart LED TVs, air conditioners, and coolers with brand warranty support and setup.' },
              { title: 'Logistics & Home Delivery', desc: 'Fast, secure shipping using cushioned packaging blocks to prevent damage during transit.' },
              { title: 'Appliance Repair Support', desc: 'Skilled electrical technicians on-call for product repair, parts replacement, and installation support.' },
              { title: 'Corporate & Bulk Booking', desc: 'Bulk supply packages for local hotels, government institutions, guest houses, and decorators.' },
              { title: 'After-Sales Assistance', desc: 'Client helpline for post-purchase query resolution, setup instructions, and claims support.' }
            ].map((srv, idx) => (
              <div key={idx} className="srv-card" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '15px', backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' }}>
                <h3 style={{ fontSize: '1.25rem', color: '#0F172A', fontWeight: '700' }}>{srv.title}</h3>
                <p style={{ fontSize: '0.9rem', color: '#64748B' }}>{srv.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Image Gallery Section */}
      <section className="section-padding" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="container">
          <div className="section-title">
            <h2>Our Gallery</h2>
            <p>Take a virtual tour of our showroom collections and designs</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }} className="gallery-grid">
            {[
              { id: 1, title: 'Premium Sofas', img: '/uploads/cat-sofas.jpg', fallback: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80' },
              { id: 2, title: 'Smart TVs', img: '/uploads/cat-tvs.jpg', fallback: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=400&q=80' },
              { id: 3, title: 'God Statues', img: '/uploads/cat-statues.jpg', fallback: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=400&q=80' },
              { id: 4, title: 'Comfort Recliners', img: '/uploads/cat-recliners.jpg', fallback: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&w=400&q=80' }
            ].map(item => (
              <div key={item.id} style={{ position: 'relative', overflow: 'hidden', height: '220px', borderRadius: '16px' }} className="gallery-card">
                <img 
                  src={item.img.startsWith('/') ? `${window.API_URL}${item.img}` : item.img} 
                  alt={item.title} 
                  onError={(e) => { e.target.src = item.fallback; }}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'var(--transition)' }} 
                  className="gallery-img"
                />
                <div className="gallery-overlay" style={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: 'rgba(15, 23, 42, 0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: 0, transition: 'var(--transition)', zIndex: 5
                }}>
                  <h4 style={{ color: '#FFFFFF', fontSize: '1.1rem', fontWeight: '700' }}>{item.title}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Customer Reviews Section */}
      {reviews.length > 0 && (
        <section className="section-padding" style={{ backgroundColor: '#F8FAFC' }}>
          <div className="container" style={{ maxWidth: '800px', textAlign: 'center' }}>
            <div className="section-title" style={{ textAlign: 'center' }}>
              <h2 style={{ textAlign: 'center' }}>Customer Reviews</h2>
              <p>Hear from clients who decorated their homes with us</p>
            </div>

            <div style={{ padding: '40px', backgroundColor: '#FFFFFF', borderRadius: '24px', border: '1px solid #E2E8F0', position: 'relative' }} className="reviews-card">
              <div style={{ display: 'flex', justifyContent: 'center', color: '#F59E0B', marginBottom: '20px' }}>
                {[...Array(reviews[currentReview].rating)].map((_, i) => (
                  <Star key={i} size={20} fill="#F59E0B" stroke="#F59E0B" />
                ))}
              </div>
              <p style={{ fontStyle: 'italic', fontSize: '1.1rem', color: '#334155', lineHeight: '1.6', marginBottom: '25px' }}>
                "{reviews[currentReview].comment}"
              </p>
              <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#0F172A' }}>
                {reviews[currentReview].customer_name}
              </h4>

              {/* Slider Dots */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '30px' }}>
                {reviews.map((_, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setCurrentReview(idx)}
                    style={{
                      width: '8px', height: '8px', borderRadius: '50%',
                      backgroundColor: currentReview === idx ? '#0F172A' : '#CBD5E1',
                      border: 'none', cursor: 'pointer'
                    }}
                  />
                ))}
              </div>
            </div>

          </div>
        </section>
      )}

      {/* 9. Contact Us Section & Form */}
      <section id="contact" className="section-padding" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="container contact-grid">
          
          {/* Business Details Text */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <span style={{ color: '#E11D48', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Send Inquiry
            </span>
            <h2 style={{ fontSize: '2.4rem' }}>Request a Free Quote</h2>
            <p style={{ color: '#64748B' }}>
              Looking for custom manufactured beds, premium sofa sets, bulk LED TV bookings, or other lifestyle items? Fill out the form, and our sales executive will call you within 24 hours with custom discounted rates.
            </p>
            
            <div style={{ marginTop: '20px', borderLeft: '3px solid #E11D48', paddingLeft: '15px' }}>
              <p style={{ fontWeight: 'bold', color: '#0F172A', marginBottom: '5px' }}>Call Store Helpline:</p>
              <p style={{ fontSize: '1.2rem', fontWeight: '800', color: '#E11D48' }}>+91 9982827751, +91 9950105100</p>
              <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '3px' }}>Showroom hours: Mon - Sun (10 AM to 5 PM)</p>
            </div>
          </div>

          {/* Form Panel */}
          <div style={{ padding: '30px', backgroundColor: '#FFFFFF', borderRadius: '24px', border: '1px solid #E2E8F0', boxShadow: '0 4px 15px rgba(0,0,0,0.01)' }}>
            {formSubmitted ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#059669' }}>
                <ShieldCheck size={48} style={{ margin: '0 auto 15px auto' }} />
                <h3 style={{ color: '#059669', fontWeight: '800' }}>Inquiry Submitted!</h3>
                <p style={{ fontSize: '0.9rem', color: '#64748B', marginTop: '5px' }}>Thank you for contacting Anjana. Our team will contact you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit}>
                <div className="form-group">
                  <label htmlFor="contact-name">Your Name *</label>
                  <input 
                    type="text" 
                    id="contact-name" 
                    required 
                    placeholder="Enter your name" 
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="form-control" 
                  />
                </div>
                <div className="grid-2" style={{ gap: '20px', marginBottom: '20px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label htmlFor="contact-phone">Phone Number *</label>
                    <input 
                      type="tel" 
                      id="contact-phone" 
                      required 
                      placeholder="e.g. +91 998282..." 
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                      className="form-control" 
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label htmlFor="contact-email">Email Address</label>
                    <input 
                      type="email" 
                      id="contact-email" 
                      placeholder="Optional" 
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="form-control" 
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="contact-message">What products are you looking for? *</label>
                  <textarea 
                    id="contact-message" 
                    rows="4" 
                    required
                    placeholder="Describe sofa details, TV requirements, or other furniture size request..." 
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="form-control"
                    style={{ resize: 'vertical' }}
                  ></textarea>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  Submit Inquiry / Request Callback
                </button>
              </form>
            )}
          </div>

        </div>
      </section>

      {/* Local hover effects */}
      <style>{`
        .about-grid {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 50px;
          align-items: center;
        }
        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 50px;
        }
        .category-circle-item:hover {
          border-color: #FFEBE4 !important;
          transform: scale(1.05);
          box-shadow: 0 4px 15px rgba(225, 29, 72, 0.08) !important;
        }
        .gallery-card:hover .gallery-img {
          transform: scale(1.06);
        }
        .gallery-card:hover .gallery-overlay {
          opacity: 1 !important;
        }
        .scroll-arrow-btn:hover {
          background-color: #F8FAFC !important;
          border-color: #CBD5E1 !important;
          transform: scale(1.05);
        }
        .view-all-link:hover {
          color: #BE123C !important;
        }
        .hero-promo-card {
          transition: all 0.3s ease;
          box-shadow: 0 2px 10px rgba(0,0,0,0.01);
        }
        .hero-promo-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 20px rgba(15, 23, 42, 0.04);
        }
        .category-scroll-list::-webkit-scrollbar {
          display: none !important;
        }
        @media (max-width: 991px) {
          .hero-grid-layout {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
          .hero-main-card {
            height: 380px !important;
          }
        }
        @media (max-width: 768px) {
          .gallery-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .about-grid h2, .contact-grid h2 {
            font-size: 1.6rem !important;
          }
          .about-grid img {
            height: 300px !important;
          }
          .about-grid, .contact-grid {
            grid-template-columns: 1fr !important;
            gap: 30px !important;
          }
          .benefits-layout {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
          .benefit-item {
            border-left: none !important;
            border-right: none !important;
            border-bottom: 1px solid #E2E8F0;
            padding-bottom: 15px;
          }
          .benefit-item:last-child {
            border-bottom: none;
            padding-bottom: 0;
          }
        }
        @media (max-width: 600px) {
          .services-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
          .srv-card {
            padding: 20px !important;
            gap: 10px !important;
          }
          .scroll-buttons-wrapper {
            display: none !important;
          }
        }
        @media (max-width: 500px) {
          .gallery-grid {
            grid-template-columns: 1fr !important;
          }
          .about-stats-container {
            flex-direction: row !important;
            flex-wrap: wrap !important;
            gap: 15px !important;
          }
        }
      `}</style>

    </div>
  );
}
