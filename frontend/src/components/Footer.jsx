import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ backgroundColor: 'var(--primary)', color: 'rgba(255,255,255,0.8)', padding: '60px 0 20px 0', borderTop: '4px solid var(--accent)' }}>
      <div className="container">
        
        {/* Footer Top Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1.2fr', gap: '40px', marginBottom: '50px' }} className="footer-grid">
          
          {/* Col 1: About Brand */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h3 style={{ color: '#FFFFFF', fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', marginBottom: '10px' }}>
              SDC CANTEEN
            </h3>
            <p style={{ fontSize: '0.88rem', lineHeight: '1.6', color: 'rgba(255,255,255,0.7)' }}>
              **SDC Furniture & Electronic Canteen** is a trusted manufacturer and supplier of premium furniture, electronics, home appliances, mobile phones, toys, and home décor since 1998. Bringing quality to every home in Salasar & Pan India.
            </p>
            <p style={{ fontStyle: 'italic', color: 'var(--accent)', fontSize: '0.9rem', fontWeight: '500' }}>
              "Har Ghar Ki Pehchaan, Quality Ke Saath."
            </p>
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '1.1rem', marginBottom: '18px', position: 'relative', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              Quick Links
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', padding: 0 }}>
              <li><Link to="/" style={{ fontSize: '0.88rem' }} className="footer-link">Home</Link></li>
              <li><Link to="/shop" style={{ fontSize: '0.88rem' }} className="footer-link">Shop Catalog</Link></li>
              <li><Link to="/about" style={{ fontSize: '0.88rem' }} className="footer-link">About Us</Link></li>
              <li><Link to="/services" style={{ fontSize: '0.88rem' }} className="footer-link">Our Services</Link></li>
              <li><Link to="/contact" style={{ fontSize: '0.88rem' }} className="footer-link">Contact Us</Link></li>
            </ul>
          </div>

          {/* Col 3: Shopping Categories */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '1.1rem', marginBottom: '18px', position: 'relative', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              Categories
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', padding: 0 }}>
              <li><Link to="/shop?category=furniture" style={{ fontSize: '0.88rem' }} className="footer-link">Premium Furniture</Link></li>
              <li><Link to="/shop?category=electronics" style={{ fontSize: '0.88rem' }} className="footer-link">Smart Electronics</Link></li>
              <li><Link to="/shop?category=home-decor" style={{ fontSize: '0.88rem' }} className="footer-link">Home & Decor</Link></li>
              <li><Link to="/shop?category=toys" style={{ fontSize: '0.88rem' }} className="footer-link">Kids & Educational Toys</Link></li>
              <li><Link to="/shop?category=recliners" style={{ fontSize: '0.88rem' }} className="footer-link">Comfort Recliners</Link></li>
            </ul>
          </div>

          {/* Col 4: Contact Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h4 style={{ color: '#FFFFFF', fontSize: '1.1rem', marginBottom: '18px', position: 'relative', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              Get In Touch
            </h4>
            <div style={{ display: 'flex', gap: '10px', fontSize: '0.85rem' }}>
              <MapPin size={18} style={{ color: 'var(--accent)', flexShrink: 0 }} />
              <span>Near Balaji Goshala, Salasar Ke Samne, Sujangarh Road, Salasar, Churu, Rajasthan – 331506</span>
            </div>
            <div style={{ display: 'flex', gap: '10px', fontSize: '0.85rem', alignItems: 'center' }}>
              <Phone size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />
              <span>+91 9982827751, +91 9950105100</span>
            </div>
            <div style={{ display: 'flex', gap: '10px', fontSize: '0.85rem', alignItems: 'center' }}>
              <MessageCircle size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />
              <a href="https://wa.me/919982827751" target="_blank" rel="noreferrer" style={{ textDecoration: 'underline' }}>WhatsApp: 9982827751</a>
            </div>
            <div style={{ display: 'flex', gap: '10px', fontSize: '0.85rem', alignItems: 'center' }}>
              <Mail size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />
              <span>anjanamobile7751@gmail.com</span>
            </div>
            <div style={{ display: 'flex', gap: '10px', fontSize: '0.85rem', alignItems: 'center' }}>
              <Clock size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />
              <span>Monday – Sunday: 10:00 AM – 5:00 PM</span>
            </div>
          </div>

        </div>

        {/* Footer Bottom */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)' }}>
          <div>
            &copy; {new Date().getFullYear()} SDC Furniture & Electronic Canteen. All Rights Reserved.
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <span>Trusted since 1998</span>
            <span>GST Invoice Support</span>
            <span>Made in Rajasthan</span>
          </div>
        </div>

      </div>

      {/* Footer Local CSS Hover overrides */}
      <style>{`
        .footer-link:hover {
          color: var(--accent) !important;
          padding-left: 4px;
        }
        @media (max-width: 900px) {
          .footer-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 600px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
}
