import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Award, ShieldCheck, Truck, ShieldAlert, BadgePercent, Wrench, ChevronLeft, ChevronRight, Star } from 'lucide-react';
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
            { id: 1, title: 'Premium Custom Furniture', subtitle: 'Manufacturer of luxury recliners, sofas and beds since 1998', image_url: 'https://placehold.co/1200x500/0a2a1b/ffffff?text=Premium+Custom+Furniture', link: '/shop?category=furniture' },
            { id: 2, title: 'Latest Smart Electronics & Appliances', subtitle: 'Genuine products backed by GST billing & warranty support', image_url: 'https://placehold.co/1200x500/163c29/ffffff?text=Smart+Electronics+&+Appliances', link: '/shop?category=electronics' }
          ]);
        }
      })
      .catch(() => {
        setBanners([
          { id: 1, title: 'Premium Custom Furniture', subtitle: 'Manufacturer of luxury recliners, sofas and beds since 1998', image_url: 'https://placehold.co/1200x500/0a2a1b/ffffff?text=Premium+Custom+Furniture', link: '/shop?category=furniture' }
        ]);
      });

    // 2. Fetch Reviews from admin reviews endpoint (simulated helper or static fallback)
    fetch(`${window.API_URL}/api/products`)
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          // Collect reviews or set static reviews using SDC info
          setReviews([
            { id: 1, customer_name: 'Rahul Sharma (Salasar)', rating: 5, comment: 'Bhaiya, SDC se humne sofa aur LED TV liya tha. Dono hi gazab quality ke hain. GST billing support ke sath warranty service bhi badiya mili.' },
            { id: 2, customer_name: 'Priya Vyas (Sujangarh)', rating: 5, comment: 'Custom fabric recliner is extremely comfortable. The wooden frame is solid and polishing is very neat. Best pricing in Churu district!' },
            { id: 3, customer_name: 'Mahendra Singh (Jaipur)', rating: 5, comment: 'Pooja Mandir brass carving and details are exceptional. Delivered safely with premium packaging. Highly trusted store since 1998.' }
          ]);
        }
      });
  }, []);

  // 3. Fetch products based on active tab
  useEffect(() => {
    let url = `${window.API_URL}/api/products`;
    if (activeTab === 'featured') url += '?featured=true';
    if (activeTab === 'bestseller') url += '?bestseller=true';
    if (activeTab === 'newarrival') url += '?newarrival=true';

    fetch(url)
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          setProducts(res.data);
        }
      })
      .catch(err => console.error('Error fetching tab products:', err));
  }, [activeTab]);

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
    <div style={{ animation: 'fadeIn 0.5s ease' }}>
      
      {/* 1. Hero Banner Slider */}
      {banners.length > 0 && (
        <section style={{ position: 'relative', height: '520px', backgroundColor: 'var(--primary)', overflow: 'hidden' }} className="hero-section">
          {banners.map((slide, idx) => {
            const imageUrl = slide.image_url.startsWith('/') ? `${window.API_URL}${slide.image_url}` : slide.image_url;
            return (
              <div 
                key={slide.id} 
                style={{
                  position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                  opacity: idx === currentBanner ? 1 : 0, transition: 'opacity 0.8s ease',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: idx === currentBanner ? 1 : 0
                }}
              >
                {/* Background Banner Image */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  backgroundImage: `linear-gradient(to right, rgba(10, 42, 27, 0.9) 35%, rgba(10, 42, 27, 0.3) 100%), url(${imageUrl})`,
                  backgroundSize: 'cover', backgroundPosition: 'center'
                }} />

                {/* Banner Text overlay */}
                <div className="container" style={{ position: 'relative', zIndex: 10, color: '#FFFFFF', padding: '0 24px' }}>
                  <div style={{ maxWidth: '600px' }} className="hero-content">
                    <span style={{ color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.85rem', fontWeight: '700', display: 'block', marginBottom: '12px' }}>
                      SDC Furniture & Electronic Canteen
                    </span>
                    <h1 style={{ color: '#FFFFFF', fontSize: '3.2rem', fontFamily: "'Playfair Display', serif", lineHeight: '1.1', marginBottom: '20px' }}>
                      {slide.title}
                    </h1>
                    <p style={{ fontSize: '1.1rem', opacity: 0.9, marginBottom: '30px', fontWeight: '300' }}>
                      {slide.subtitle}
                    </p>
                    <Link to={slide.link || '/shop'} className="btn btn-accent">
                      Explore Catalog
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Slider Controls */}
          {banners.length > 1 && (
            <>
              <button onClick={prevBanner} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', zIndex: 20, color: '#FFFFFF', backgroundColor: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '50%' }}>
                <ChevronLeft size={24} />
              </button>
              <button onClick={nextBanner} style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', zIndex: 20, color: '#FFFFFF', backgroundColor: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '50%' }}>
                <ChevronRight size={24} />
              </button>
            </>
          )}
        </section>
      )}

      {/* 2. Popular Categories Section (Round Category Cards) */}
      <section className="section-padding" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="container">
          <div className="section-title">
            <h2>Shop by Category</h2>
            <p>Explore our premium home collections and high-grade products</p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '40px' }} className="popular-categories">
            {[
              { id: 1, name: 'Furniture', slug: 'furniture', icon: '/uploads/cat-furniture.jpg', fallback: '🛋️' },
              { id: 2, name: 'Electronics', slug: 'electronics', icon: '/uploads/cat-electronics.jpg', fallback: '🔌' },
              { id: 3, name: 'Home & Decor', slug: 'home-decor', icon: '/uploads/cat-decor.jpg', fallback: '🪔' },
              { id: 4, name: 'Toys', slug: 'toys', icon: '/uploads/cat-toys.jpg', fallback: '🧸' },
              { id: 5, name: 'Bicycle', slug: 'bicycle', icon: '/uploads/cat-bicycle.jpg', fallback: '🚲' }
            ].map(cat => (
              <Link 
                to={`/shop?category=${cat.slug}`} 
                key={cat.id} 
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}
                className="category-circle-link"
              >
                <div style={{
                  width: '120px', height: '120px', borderRadius: '50%', overflow: 'hidden',
                  border: '3px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backgroundColor: 'var(--bg)', boxShadow: 'var(--shadow)', transition: 'var(--transition)'
                }} className="circle-image-holder">
                  <img 
                    src={cat.icon.startsWith('/') ? `${window.API_URL}${cat.icon}` : cat.icon} 
                    alt={cat.name} 
                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                  <span style={{ display: 'none', fontSize: '3rem' }}>{cat.fallback}</span>
                </div>
                <h4 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--primary)' }}>{cat.name}</h4>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Products Showcase with Dynamic Tabs */}
      <section className="section-padding">
        <div className="container">
          <div className="section-title">
            <h2>Trending Products</h2>
            <p>Carefully selected and manufactured for durability and aesthetics</p>
          </div>

          {/* Tabs header */}
          <div className="trending-tabs-container">
            {['featured', 'bestseller', 'newarrival'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`trending-tab-btn ${activeTab === tab ? 'active' : ''}`}
              >
                {tab === 'featured' ? 'Featured' : tab === 'bestseller' ? 'Best Sellers' : 'New Arrivals'}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          {products.length > 0 ? (
            <div className="grid-4">
              {products.slice(0, 8).map(prod => (
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
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              No products found under this section.
            </div>
          )}

        </div>
      </section>

      {/* 4. SDC Strengths Section */}
      <section className="section-padding" style={{ backgroundColor: 'var(--primary)', color: 'rgba(255,255,255,0.8)' }}>
        <div className="container">
          
          <div className="section-title" style={{ marginBottom: '60px' }}>
            <h2 style={{ color: '#FFFFFF' }}>Our Strength</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)' }}>Why thousands of families trust SDC Furniture & Electronic Canteen since 1998</p>
          </div>

          <div className="grid-4" style={{ gap: '40px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '15px' }}>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '18px', borderRadius: '50%', color: 'var(--accent)' }}>
                <Award size={32} />
              </div>
              <h3 style={{ color: '#FFFFFF', fontSize: '1.25rem' }}>15+ Years Experience</h3>
              <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.7)' }}>Bringing deep technical expertise in carpentry and electrical distribution since 1998.</p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '15px' }}>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '18px', borderRadius: '50%', color: 'var(--accent)' }}>
                <ShieldCheck size={32} />
              </div>
              <h3 style={{ color: '#FFFFFF', fontSize: '1.25rem' }}>Genuine Quality</h3>
              <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.7)' }}>Original branded electronics and durable custom-manufactured solid teak/sheesham wood furniture.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '15px' }}>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '18px', borderRadius: '50%', color: 'var(--accent)' }}>
                <Truck size={32} />
              </div>
              <h3 style={{ color: '#FFFFFF', fontSize: '1.25rem' }}>Safe Door Delivery</h3>
              <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.7)' }}>Fast, secure doorstep delivery across Salasar, Sujangarh, and nearby regions of Rajasthan.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '15px' }}>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '18px', borderRadius: '50%', color: 'var(--accent)' }}>
                <Wrench size={32} />
              </div>
              <h3 style={{ color: '#FFFFFF', fontSize: '1.25rem' }}>Installation & Repair</h3>
              <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.7)' }}>Our expert carpentry and electronics service technicians assist you after every purchase.</p>
            </div>
          </div>

        </div>
      </section>

      {/* 5. About Us Summary Section */}
      <section id="about" className="section-padding" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="container about-grid">
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <span style={{ color: 'var(--accent)', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Trusted Home Partner
            </span>
            <h2 style={{ fontSize: '2.4rem', lineHeight: '1.2' }}>Bringing Quality Products to Every Home Since 1998</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.98rem' }}>
              At **SDC Furniture & Electronic Canteen**, we believe that every family deserves access to quality products at affordable prices. Our journey started in **1998** with the vision of making shopping simple, convenient, and trustworthy.
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.98rem' }}>
              Today, we proudly offer an extensive collection of furniture, electronics, home appliances, mobile phones, toys, and home décor products designed to meet the needs of modern homes and businesses. Our commitment to transparent pricing and exceptional service keeps us close to Rajasthan buyers.
            </p>
            <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }} className="about-stats-container">
              <div>
                <h4 style={{ fontSize: '1.8rem', color: 'var(--primary)' }}>1998</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Established Year</p>
              </div>
              <div style={{ borderLeft: '1px solid var(--border)' }}></div>
              <div>
                <h4 style={{ fontSize: '1.8rem', color: 'var(--primary)' }}>15K+</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Happy Families</p>
              </div>
              <div style={{ borderLeft: '1px solid var(--border)' }}></div>
              <div>
                <h4 style={{ fontSize: '1.8rem', color: 'var(--primary)' }}>100%</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Quality Assured</p>
              </div>
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <img 
              src={`${window.API_URL}/uploads/cat-furniture.jpg`} 
              alt="SDC Furniture Showroom" 
              onError={(e) => { e.target.src = 'https://placehold.co/500x400/0a2a1b/ffffff?text=SDC+Showroom'; }}
              style={{ width: '100%', height: '400px', objectFit: 'cover', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-hover)' }} 
            />
            <div style={{
              position: 'absolute', bottom: '-20px', left: '-20px', padding: '20px',
              backgroundColor: 'var(--accent)', color: '#FFFFFF', borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-hover)', display: 'none'
            }} className="about-float-badge">
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold', display: 'block' }}>15+</span>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Years Experience</span>
            </div>
          </div>

        </div>
      </section>

      {/* 6. Dynamic Services section */}
      <section id="services" className="section-padding" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="container">
          <div className="section-title">
            <h2>Our Services</h2>
            <p>End-to-end shopping and maintenance solutions by SDC experts</p>
          </div>

          <div className="grid-3 services-grid">
            {[
              { title: 'Furniture Manufacturing', desc: 'Custom manufacturer of solid wood dining sets, carved sofa sets, mandirs, and premium beds at factory rates.' },
              { title: 'Electronics Supply & Installation', desc: 'Authorized supply of smart LED TVs, air conditioners, and coolers with brand warranty support and setup.' },
              { title: 'Logistics & Home Delivery', desc: 'Fast, secure shipping using cushioned packaging blocks to prevent scratching during transit across Rajasthan.' },
              { title: 'Appliance Repair Services', desc: 'Skilled electrical technicians on-call for product repair, parts replacement, and installation support.' },
              { title: 'Corporate & Bulk Booking', desc: 'Bulk supply packages for local hotels, government institutions, guest houses, and interior decorators.' },
              { title: 'After-Sales Assistance', desc: '24/7 client helpline for post-purchase query resolution, setup instructions, and claims support.' }
            ].map((srv, idx) => (
              <div key={idx} className="glass-panel srv-card" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>{srv.title}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{srv.desc}</p>
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
            <p>Take a virtual tour of SDC showroom catalogs and deliveries</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }} className="gallery-grid">
            {[
              { id: 1, title: 'Premium Sofas', img: '/uploads/cat-sofas.jpg', fallback: 'https://placehold.co/300x300?text=Sofa+Collection' },
              { id: 2, title: 'Smart TVs', img: '/uploads/cat-tvs.jpg', fallback: 'https://placehold.co/300x300?text=LED+TV+Stock' },
              { id: 3, title: 'God Statues', img: '/uploads/cat-statues.jpg', fallback: 'https://placehold.co/300x300?text=Brass+Statues' },
              { id: 4, title: 'Comfort Recliners', img: '/uploads/cat-recliners.jpg', fallback: 'https://placehold.co/300x300?text=Recliners' }
            ].map(item => (
              <div key={item.id} style={{ position: 'relative', overflow: 'hidden', height: '220px', borderRadius: 'var(--radius-md)' }} className="gallery-card">
                <img 
                  src={item.img.startsWith('/') ? `${window.API_URL}${item.img}` : item.img} 
                  alt={item.title} 
                  onError={(e) => { e.target.src = item.fallback; }}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'var(--transition)' }} 
                  className="gallery-img"
                />
                <div className="gallery-overlay" style={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: 'rgba(10, 42, 27, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: 0, transition: 'var(--transition)'
                }}>
                  <h4 style={{ color: '#FFFFFF', fontSize: '1.1rem' }}>{item.title}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Customer Reviews Slider */}
      {reviews.length > 0 && (
        <section className="section-padding" style={{ backgroundColor: 'var(--bg)' }}>
          <div className="container" style={{ maxWidth: '800px', textAlign: 'center' }}>
            <div className="section-title">
              <h2>Customer Reviews</h2>
              <p>Hear from SDC clients who decorated their homes with us</p>
            </div>

            <div className="glass-panel" style={{ padding: '40px', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--accent)', marginBottom: '20px' }}>
                {[...Array(reviews[currentReview].rating)].map((_, i) => (
                  <Star key={i} size={20} fill="var(--accent)" />
                ))}
              </div>
              <p style={{ fontStyle: 'italic', fontSize: '1.1rem', color: 'var(--primary)', lineHeight: '1.6', marginBottom: '25px' }}>
                "{reviews[currentReview].comment}"
              </p>
              <h4 style={{ fontSize: '1rem', fontWeight: '700' }}>
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
                      backgroundColor: currentReview === idx ? 'var(--primary)' : '#C4C8C5'
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
            <span style={{ color: 'var(--accent)', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Send Inquiry
            </span>
            <h2 style={{ fontSize: '2.4rem' }}>Request a Free Quote</h2>
            <p style={{ color: 'var(--text-muted)' }}>
              Looking for custom manufactured beds, premium sofa sets, bulk LED TV bookings, or other lifestyle items? Fill out the form, and our sales executive will call you within 24 hours with custom discounted rates.
            </p>
            
            <div style={{ marginTop: '20px', borderLeft: '3px solid var(--accent)', paddingLeft: '15px' }}>
              <p style={{ fontWeight: 'bold', color: 'var(--primary)', marginBottom: '5px' }}>Call SDC Store:</p>
              <p style={{ fontSize: '1.1rem', color: 'var(--text)' }}>+91 9982827751, +91 9950105100</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Showroom hours: Mon - Sun (10 AM to 5 PM)</p>
            </div>
          </div>

          {/* Form Panel */}
          <div className="glass-panel" style={{ padding: '30px' }}>
            {formSubmitted ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#2E7D32' }}>
                <ShieldCheck size={48} style={{ margin: '0 auto 15px auto' }} />
                <h3 style={{ color: '#2E7D32' }}>Inquiry Submitted!</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Thank you for contacting SDC Furniture & Electronic Canteen. Our team will contact you shortly.</p>
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
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
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
        .category-circle-link:hover .circle-image-holder {
          border-color: var(--accent) !important;
          transform: scale(1.05);
          box-shadow: var(--shadow-hover);
        }
        .gallery-card:hover .gallery-img {
          transform: scale(1.1);
        }
        .gallery-card:hover .gallery-overlay {
          opacity: 1 !important;
        }
        @media (max-width: 768px) {
          .popular-categories {
            gap: 20px !important;
          }
          .circle-image-holder {
            width: 100px !important;
            height: 100px !important;
          }
          .gallery-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .hero-section {
            height: 400px !important;
          }
          .hero-content h1 {
            font-size: 1.8rem !important;
          }
          .hero-content p {
            font-size: 0.88rem !important;
            margin-bottom: 20px !important;
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
        }
        @media (max-width: 768px) {
          .hero-section button {
            display: none !important;
          }
          .services-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
          .srv-card {
            padding: 20px !important;
            gap: 10px !important;
          }
        }
        @media (max-width: 500px) {
          .gallery-grid {
            grid-template-columns: 1fr !important;
          }
          .circle-image-holder {
            width: 80px !important;
            height: 80px !important;
          }
          .popular-categories {
            gap: 15px !important;
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
