import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Send, Shield, Truck, Star, ArrowRight, MessageSquareCode } from 'lucide-react';
import ProductCard from '../components/ProductCard';

export default function ProductPage({ cart, wishlist, onAddToCart, onToggleWishlist }) {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState('');
  const [zoomStyle, setZoomStyle] = useState({ display: 'none' });
  const [loading, setLoading] = useState(true);

  // Review states
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Load product details
  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:5000/api/products/${slug}`)
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          setProduct(res.data);
          // Set first image as active
          if (res.data.images && res.data.images.length > 0) {
            setActiveImage(res.data.images[0].image_url);
          } else {
            setActiveImage('');
          }
        } else {
          setProduct(null);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [slug]);

  // Dynamic SEO metadata update when product loads
  useEffect(() => {
    if (product) {
      document.title = `${product.name} - SDC Furniture & Electronic Canteen`;

      // Set Meta Description
      let descMeta = document.querySelector('meta[name="description"]');
      if (!descMeta) {
        descMeta = document.createElement('meta');
        descMeta.name = 'description';
        document.head.appendChild(descMeta);
      }
      descMeta.content = `${product.name} at SDC Furniture & Electronic Canteen. ${product.description ? product.description.replace(/<[^>]*>/g, '').slice(0, 150) : ''} - Premium quality furniture and appliances in Rajasthan.`;

      // Set Meta Keywords
      let keysMeta = document.querySelector('meta[name="keywords"]');
      if (!keysMeta) {
        keysMeta = document.createElement('meta');
        keysMeta.name = 'keywords';
        document.head.appendChild(keysMeta);
      }
      keysMeta.content = `${product.name}, SDC Canteen, ${product.brand_name || ''}, buy ${product.name} online, premium furniture Rajasthan`;
    }
  }, [product]);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', color: 'var(--primary)' }}>Loading SDC premium details...</div>;
  }

  if (!product) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 24px', minHeight: '60vh' }}>
        <h2>Product details could not be found.</h2>
        <p style={{ margin: '15px 0' }}>It might have been removed or changed by the administrator.</p>
        <Link to="/shop" className="btn btn-primary">Go to Catalog</Link>
      </div>
    );
  }

  // Calculate discount percentage
  const price = parseFloat(product.price);
  const salePrice = product.sale_price ? parseFloat(product.sale_price) : null;
  const discountPercent = salePrice ? Math.round(((price - salePrice) / price) * 100) : 0;

  // Format specifications and features (stored as JSON string)
  let specsObj = {};
  let featuresArr = [];

  try {
    specsObj = typeof product.specifications === 'string' ? JSON.parse(product.specifications) : product.specifications || {};
  } catch (e) {
    specsObj = {};
  }

  try {
    featuresArr = typeof product.features === 'string' ? JSON.parse(product.features) : product.features || [];
  } catch (e) {
    featuresArr = [];
  }

  // Zoom magnifier mouse move handler
  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.target.getBoundingClientRect();
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;
    
    setZoomStyle({
      display: 'block',
      backgroundImage: `url(${activeImage.startsWith('/') ? `http://localhost:5000${activeImage}` : activeImage})`,
      backgroundPosition: `${x}% ${y}%`,
      backgroundSize: '200%'
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: 'none' });
  };

  // Submit dynamic review
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewName || !reviewComment) return;

    try {
      const response = await fetch(`http://localhost:5000/api/products/${product.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: reviewName,
          rating: reviewRating,
          comment: reviewComment
        })
      });
      const data = await response.json();
      if (data.success) {
        setReviewSuccess(true);
        setReviewName('');
        setReviewComment('');
        setReviewRating(5);
        // Refresh reviews
        const res = await fetch(`http://localhost:5000/api/products/${slug}`);
        const fresh = await res.json();
        if (fresh.success) {
          setProduct(fresh.data);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Buy Now trigger with Confetti animation
  const handleBuyNow = () => {
    onAddToCart(product.id, 1);
    // Trigger Canvas Confetti
    if (window.confetti) {
      window.confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
    setTimeout(() => {
      navigate('/cart');
    }, 800);
  };

  const currentActiveImgUrl = activeImage.startsWith('/') ? `http://localhost:5000${activeImage}` : activeImage;

  // WhatsApp click template builder
  const whatsappUrl = `https://wa.me/919982827751?text=${encodeURIComponent(
    `Hello SDC Canteen, I am interested in purchasing this product:\n\n*Product:* ${product.name}\n*SKU:* ${product.sku}\n*Price:* ₹${(salePrice || price).toLocaleString('en-IN')}\n\nPlease guide me with the billing, availability and delivery options.`
  )}`;

  return (
    <div className="container section-padding" style={{ animation: 'fadeIn 0.5s ease' }}>
      
      {/* Breadcrumbs */}
      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '30px' }}>
        <Link to="/">Home</Link> &gt; <Link to={`/shop?category=${product.category_slug}`}>{product.category_name}</Link> &gt; <span style={{ color: 'var(--primary)', fontWeight: '600' }}>{product.name}</span>
      </div>

      {/* Main product card panels */}
      <div className="pdp-main-grid">
        
        {/* Left column: Image Gallery with Zoom */}
        <div style={{ display: 'flex', gap: '16px' }} className="pdp-images-layout">
          
          {/* Thumbnails strip */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }} className="pdp-thumbs-vertical">
            {product.images && product.images.map((img, i) => {
              const thumbUrl = img.image_url.startsWith('/') ? `http://localhost:5000${img.image_url}` : img.image_url;
              return (
                <button 
                  key={img.id}
                  onClick={() => setActiveImage(img.image_url)}
                  style={{
                    width: '64px', height: '64px', borderRadius: '4px', overflow: 'hidden',
                    border: activeImage === img.image_url ? '2px solid var(--accent)' : '1px solid var(--border)',
                    backgroundColor: '#FFF'
                  }}
                >
                  <img src={thumbUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              );
            })}
          </div>

          {/* Large image and magnifier window */}
          <div style={{ flex: 1, position: 'relative', height: '420px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', backgroundColor: '#F0F2F1' }}>
            <img 
              src={currentActiveImgUrl || 'https://placehold.co/600x600?text=Product'}
              alt={product.name}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'zoom-in' }} 
            />

            {/* Magnifier Viewport */}
            <div style={{
              ...zoomStyle,
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              pointerEvents: 'none', zIndex: 10
            }} />
          </div>

        </div>

        {/* Right column: Details and Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: '700', letterSpacing: '1px' }}>
              {product.brand_name || 'SDC Custom'}
            </span>
            <h1 style={{ fontSize: '2.2rem', fontFamily: "'Playfair Display', serif", fontWeight: '700', marginTop: '4px' }}>
              {product.name}
            </h1>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>SKU: {product.sku}</span>
          </div>

          {/* Rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', color: 'var(--accent)' }}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill={i < Math.floor(product.rating || 5) ? 'var(--accent)' : 'none'} />
              ))}
            </div>
            <span style={{ fontSize: '0.88rem', fontWeight: '600' }}>({product.rating || '5.0'})</span>
            <span style={{ color: 'var(--border)' }}>|</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{product.reviews ? product.reviews.length : 0} Reviews</span>
          </div>

          {/* Pricing */}
          <div style={{ padding: '16px', backgroundColor: 'var(--bg)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '20px' }}>
            {salePrice ? (
              <>
                <span style={{ fontSize: '2rem', fontWeight: '800', color: '#C84B31' }}>
                  ₹{salePrice.toLocaleString('en-IN')}
                </span>
                <span style={{ fontSize: '1.2rem', textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                  ₹{price.toLocaleString('en-IN')}
                </span>
                <span className="badge badge-sale" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
                  Save {discountPercent}%
                </span>
              </>
            ) : (
              <span style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary)' }}>
                ₹{price.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {/* Short description */}
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.5' }}>
            {product.description}
          </p>

          {/* Stock state */}
          <div style={{ fontSize: '0.88rem' }}>
            <span>Availability: </span>
            {product.stock > 0 ? (
              <span style={{ color: '#2E7D32', fontWeight: '600' }}>In Stock ({product.stock} left)</span>
            ) : (
              <span style={{ color: '#C84B31', fontWeight: '600' }}>Out of Stock</span>
            )}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '10px' }} className="pdp-actions">
            <button 
              disabled={product.stock <= 0}
              onClick={() => onAddToCart(product.id, 1)}
              className="btn btn-outline"
              style={{ padding: '14px', borderRadius: '8px' }}
            >
              <ShoppingCart size={18} /> Add to Cart
            </button>
            <button 
              disabled={product.stock <= 0}
              onClick={handleBuyNow}
              className="btn btn-primary"
              style={{ padding: '14px', borderRadius: '8px' }}
            >
              Buy Now
            </button>
          </div>

          {/* WhatsApp Direct order button */}
          <a 
            href={whatsappUrl} 
            target="_blank" 
            rel="noreferrer"
            className="btn whatsapp-btn"
            style={{ width: '100%', padding: '14px', borderRadius: '8px', gap: '8px' }}
          >
            <MessageSquareCode size={18} /> Order Directly on WhatsApp
          </a>

          {/* External Amazon / Flipkart buttons */}
          {(product.amazon_link || product.flipkart_link) && (
            <div style={{ display: 'grid', gridTemplateColumns: product.amazon_link && product.flipkart_link ? '1fr 1fr' : '1fr', gap: '16px', marginTop: '10px' }} className="pdp-actions">
              {product.amazon_link && (
                <a 
                  href={product.amazon_link} 
                  target="_blank" 
                  rel="noreferrer"
                  className="btn"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    backgroundColor: '#FF9900', color: '#000000', fontWeight: '750',
                    padding: '12px 14px', borderRadius: '8px', border: 'none', transition: 'all 0.3s ease',
                    boxShadow: '0 4px 12px rgba(255, 153, 0, 0.2)', textDecoration: 'none', cursor: 'pointer'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.opacity = 0.9; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.opacity = 1; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <img src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" alt="Amazon" style={{ height: '14px' }} />
                  <span style={{ fontSize: '0.82rem' }}>Buy on Amazon</span>
                </a>
              )}
              {product.flipkart_link && (
                <a 
                  href={product.flipkart_link} 
                  target="_blank" 
                  rel="noreferrer"
                  className="btn"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    backgroundColor: '#2874F0', color: '#FFFFFF', fontWeight: '750',
                    padding: '12px 14px', borderRadius: '8px', border: 'none', transition: 'all 0.3s ease',
                    boxShadow: '0 4px 12px rgba(40, 116, 240, 0.2)', textDecoration: 'none', cursor: 'pointer'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.opacity = 0.9; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.opacity = 1; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <img src="https://upload.wikimedia.org/wikipedia/commons/7/7a/Flipkart_logo.svg" alt="Flipkart" style={{ height: '16px' }} />
                  <span style={{ fontSize: '0.82rem' }}>Buy on Flipkart</span>
                </a>
              )}
            </div>
          )}

          {/* Trust points */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '20px', marginTop: '10px' }}>
            <div style={{ display: 'flex', gap: '10px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <Shield size={16} style={{ color: 'var(--accent)' }} />
              <span>**Warranty Support:** {product.warranty || '1 Year Store Warranty'}</span>
            </div>
            <div style={{ display: 'flex', gap: '10px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <Truck size={16} style={{ color: 'var(--accent)' }} />
              <span>**Delivery Timeline:** {product.delivery_info}</span>
            </div>
          </div>

        </div>
      </div>

      {/* Tabs / Specifications grid */}
      <section style={{ marginBottom: '80px' }}>
        <h3 style={{ fontSize: '1.4rem', borderBottom: '2px solid var(--primary)', paddingBottom: '10px', marginBottom: '24px' }}>
          Specifications & Key Features
        </h3>
        
        <div className="pdp-specs-grid">
          
          {/* Spec details list */}
          <div>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Specifications</h4>
            {Object.keys(specsObj).length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <tbody>
                  {Object.entries(specsObj).map(([key, val]) => (
                    <tr key={key} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '10px 0', fontWeight: '600', color: 'var(--primary)', width: '40%' }}>{key}</td>
                      <td style={{ padding: '10px 0', color: 'var(--text-muted)' }}>{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No technical specs listed.</p>
            )}
          </div>

          {/* Features check list */}
          <div>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Features</h4>
            {featuresArr.length > 0 ? (
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', padding: 0 }}>
                {featuresArr.map((feat, idx) => (
                  <li key={idx} style={{ display: 'flex', gap: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>✓</span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Quality assured by SDC team.</p>
            )}
          </div>

        </div>
      </section>

      {/* 8. Amazon-Style Premium A+ Content */}
      <section style={{ marginBottom: '80px', borderTop: '1px solid var(--border)', paddingTop: '50px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span style={{ color: 'var(--accent)', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Premium Showcase</span>
          <h2 style={{ fontSize: '2rem', fontFamily: "'Playfair Display', serif", marginTop: '5px' }}>Product A+ Rich Details</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '600px', margin: '8px auto 0 auto' }}>Explore the build quality, materials, and specialized engineering behind SDC Furniture & Electronics.</p>
        </div>

        {/* A+ Content Blocks */}
        {(() => {
          let aplusData = null;
          try {
            if (product.aplus_content) {
              aplusData = typeof product.aplus_content === 'string' ? JSON.parse(product.aplus_content) : product.aplus_content;
            }
          } catch (e) {
            console.error("Failed to parse product A+ Content JSON:", e);
          }

          // Fallback dummy A+ content for testing / visual wow factor
          if (!aplusData) {
            aplusData = {
              banner_image: 'http://localhost:5000/uploads/cat-furniture.jpg',
              banner_title: 'Uncompromising Quality & Generational Craftsmanship',
              banner_subtitle: 'Artisanal Teak Wood Furniture Built to Stay in Your Family for Generations',
              story_title: 'Sustainably Harvested. Kiln-Dried. Expertly Hand-Carved.',
              story_desc: 'At SDC Canteen, we select only the finest grade of Indian Sheesham (Rosewood) and seasoned Teak Wood. Our lumber goes through a multi-stage seasoning process in modern kiln chambers to lower moisture contents to 8-12%, preventing seasonal warping, cracking, or joint split. Every contour is hand-carved by local traditional artisans in Churu, keeping heritage alive.',
              story_image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
              features: [
                {
                  title: 'Heavy Duty Structural Durability',
                  desc: 'Reinforced with double-tenon mortise joint blocks and industrial grade German adhesives. Supports up to 450kg load without structural squeaking.',
                  image: 'https://images.unsplash.com/photo-1581428982868-e410dd047a90?auto=format&fit=crop&w=400&q=80'
                },
                {
                  title: 'Eco-Friendly Non-Toxic VOC Finish',
                  desc: 'Finished with organic, lead-free Italian polyurethane sealers. Safe for children, pets, and indoor allergen safety guidelines.',
                  image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=400&q=80'
                },
                {
                  title: 'Authorised Multi-Brand Electronics',
                  desc: 'Equipped with heavy copper coil transformers, dynamic inverter compressors, and original manufacturer warranties for electronic catalogs.',
                  image: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?auto=format&fit=crop&w=400&q=80'
                }
              ]
            };
          }

          const bannerImgUrl = aplusData.banner_image ? (aplusData.banner_image.startsWith('/') ? `http://localhost:5000${aplusData.banner_image}` : aplusData.banner_image) : 'https://placehold.co/1200x400/0a2a1b/ffffff?text=SDC+Premium+Banner';
          const storyImgUrl = aplusData.story_image ? (aplusData.story_image.startsWith('/') ? `http://localhost:5000${aplusData.story_image}` : aplusData.story_image) : 'https://placehold.co/800x500/d49b28/ffffff?text=SDC+Story';

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '50px' }} className="aplus-wrapper">
              
              {/* 1. Large Banner Block */}
              <div style={{ position: 'relative', height: '350px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', backgroundColor: 'var(--primary)' }} className="aplus-banner">
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  backgroundImage: `linear-gradient(to bottom, rgba(10,42,27,0.85) 0%, rgba(10,42,27,0.5) 100%), url(${bannerImgUrl})`,
                  backgroundSize: 'cover', backgroundPosition: 'center'
                }} />
                <div style={{ position: 'relative', zIndex: 10, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '24px', color: '#FFFFFF' }}>
                  <h3 style={{ fontSize: '2rem', fontFamily: "'Playfair Display', serif", color: 'var(--accent)', marginBottom: '10px' }}>{aplusData.banner_title}</h3>
                  <p style={{ fontSize: '1.05rem', maxWidth: '750px', opacity: 0.95, fontWeight: '300' }}>{aplusData.banner_subtitle}</p>
                </div>
              </div>

              {/* 2. Brand Story split block */}
              <div className="aplus-story-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '40px', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <h4 style={{ fontSize: '1.5rem', color: 'var(--primary)', fontFamily: "'Playfair Display', serif" }}>{aplusData.story_title}</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.96rem', lineHeight: '1.6', whiteSpace: 'pre-line' }}>{aplusData.story_desc}</p>
                  <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 'bold' }}>
                      <span style={{ backgroundColor: 'var(--accent-light)', color: 'var(--primary)', padding: '6px 12px', borderRadius: '4px' }}>🛡️ PREMIUM LUMBER</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 'bold' }}>
                      <span style={{ backgroundColor: 'var(--accent-light)', color: 'var(--primary)', padding: '6px 12px', borderRadius: '4px' }}>⚙️ EXPERT ASSEMBLY</span>
                    </div>
                  </div>
                </div>
                <div>
                  <img src={storyImgUrl} alt="SDC Lumber Workshop" style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow)' }} />
                </div>
              </div>

              {/* 3. Three-Column Features Card Row */}
              {aplusData.features && aplusData.features.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '1.3rem', fontFamily: "'Playfair Display', serif", color: 'var(--primary)', marginBottom: '24px', textAlign: 'center' }}>Detailed Feature Highlights</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(aplusData.features.length, 3)}, 1fr)`, gap: '30px' }} className="aplus-features-grid">
                    {aplusData.features.map((feat, i) => {
                      const featImg = feat.image ? (feat.image.startsWith('/') ? `http://localhost:5000${feat.image}` : feat.image) : 'https://placehold.co/400x300?text=Feature';
                      return (
                        <div key={i} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                          <img src={featImg} alt={feat.title} style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '4px' }} />
                          <div>
                            <h5 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '8px' }}>{feat.title}</h5>
                            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>{feat.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          );
        })()}
      </section>

      {/* Reviews Section */}
      <section style={{ marginBottom: '80px' }}>
        <h3 style={{ fontSize: '1.4rem', borderBottom: '2px solid var(--primary)', paddingBottom: '10px', marginBottom: '24px' }}>
          Customer Reviews ({product.reviews ? product.reviews.length : 0})
        </h3>

        <div className="pdp-reviews-grid">
          
          {/* Reviews List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {product.reviews && product.reviews.length > 0 ? (
              product.reviews.map(rev => (
                <div key={rev.id} style={{ borderBottom: '1px solid var(--border)', paddingBottom: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: '700' }}>{rev.customer_name}</h4>
                    <div style={{ display: 'flex', color: 'var(--accent)' }}>
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} size={12} fill="var(--accent)" />
                      ))}
                    </div>
                  </div>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>"{rev.comment}"</p>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', opacity: 0.8, display: 'block', marginTop: '6px' }}>
                    {new Date(rev.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No reviews yet for this product. Be the first to share your experience!</p>
            )}
          </div>

          {/* Submit Review Form */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Write a Review</h4>
            {reviewSuccess ? (
              <div style={{ color: '#2E7D32', fontSize: '0.9rem', textAlign: 'center', padding: '20px 0' }}>
                Thank you! Your review has been added successfully and is now visible.
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="rev-name">Your Name</label>
                  <input 
                    type="text" 
                    id="rev-name" 
                    required 
                    placeholder="Enter your display name"
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    className="form-control" 
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px', color: 'var(--primary)' }}>Rating</label>
                  <select 
                    value={reviewRating}
                    onChange={(e) => setReviewRating(parseInt(e.target.value))}
                    className="form-control"
                  >
                    <option value="5">5 Stars (Excellent)</option>
                    <option value="4">4 Stars (Good)</option>
                    <option value="3">3 Stars (Average)</option>
                    <option value="2">2 Stars (Poor)</option>
                    <option value="1">1 Star (Very Bad)</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="rev-comm">Comment</label>
                  <textarea 
                    id="rev-comm" 
                    rows="3" 
                    required 
                    placeholder="Write your review here..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="form-control"
                    style={{ resize: 'vertical' }}
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-primary">
                  Submit Review
                </button>
              </form>
            )}
          </div>

        </div>
      </section>

      {/* Related Products Grid */}
      {product.related && product.related.length > 0 && (
        <section>
          <h3 style={{ fontSize: '1.4rem', borderBottom: '2px solid var(--primary)', paddingBottom: '10px', marginBottom: '24px' }}>
            Related Products
          </h3>
          <div className="grid-4">
            {product.related.map(prod => (
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
        </section>
      )}

      {/* Responsive media overrides */}
      <style>{`
        .pdp-main-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 50px;
          margin-bottom: 80px;
        }
        .pdp-specs-grid {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 50px;
        }
        .pdp-reviews-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 50px;
        }
        .whatsapp-btn {
          background: linear-gradient(135deg, #25D366, #128C7E) !important;
          color: #FFFFFF !important;
          box-shadow: 0 4px 15px rgba(37, 211, 102, 0.2) !important;
          border: none !important;
          transition: all 0.3s ease !important;
        }
        .whatsapp-btn:hover {
          box-shadow: 0 8px 25px rgba(37, 211, 102, 0.35) !important;
          transform: translateY(-2px) !important;
        }
        .pdp-thumbs-vertical button {
          transition: all 0.2s ease !important;
        }
        .pdp-thumbs-vertical button:hover {
          transform: scale(1.05);
          border-color: var(--accent) !important;
        }
        @media (max-width: 991px) {
          .pdp-main-grid {
            grid-template-columns: 1fr !important;
            gap: 30px !important;
          }
          .pdp-images-layout {
            flex-direction: column-reverse !important;
          }
          .pdp-thumbs-vertical {
            flex-direction: row !important;
            justify-content: center !important;
            margin-top: 15px;
          }
          .pdp-specs-grid, .pdp-reviews-grid {
            grid-template-columns: 1fr !important;
            gap: 30px !important;
          }
          .aplus-story-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
          .aplus-features-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
        }
        @media (max-width: 768px) {
          .pdp-actions {
            grid-template-columns: 1fr !important;
          }
          .pdp-main-grid h1 {
            font-size: 1.65rem !important;
          }
          .aplus-banner {
            height: 250px !important;
          }
          .aplus-banner h3 {
            font-size: 1.35rem !important;
          }
          .aplus-banner p {
            font-size: 0.88rem !important;
          }
          .aplus-story-grid h4 {
            font-size: 1.25rem !important;
          }
        }
      `}</style>

    </div>
  );
}
