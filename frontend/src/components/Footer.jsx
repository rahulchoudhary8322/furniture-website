import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ 
      backgroundColor: '#FFFFFF', 
      color: '#475569', 
      padding: '60px 0 20px 0', 
      borderTop: '1px solid #E2E8F0',
      marginTop: '40px'
    }}>
      <div className="container">
        
        {/* Footer Top Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1.2fr', gap: '40px', marginBottom: '50px' }} className="footer-grid">
          
          {/* Col 1: About Brand */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h3 style={{ 
              color: '#0F172A', 
              fontFamily: "'Outfit', sans-serif", 
              fontSize: '1.5rem', 
              fontWeight: '800', 
              letterSpacing: '-0.5px'
            }}>
              Anjana
            </h3>
            <p style={{ fontSize: '0.88rem', lineHeight: '1.6', color: '#64748B' }}>
              **Anjana** is a premium e-commerce platform offering a curated collection of state-of-the-art furniture, smart electronics, mobile devices, home decor, and kids accessories. Experience comfort, style, and quality combined.
            </p>
            <p style={{ fontStyle: 'italic', color: '#E11D48', fontSize: '0.85rem', fontWeight: '600' }}>
              "Style, Comfort & Quality • Just For You"
            </p>
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <h4 style={{ color: '#0F172A', fontSize: '1rem', fontWeight: '700', marginBottom: '18px', position: 'relative', paddingBottom: '8px', borderBottom: '1px solid #F1F5F9' }}>
              Quick Links
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', padding: 0 }}>
              <li><Link to="/" style={{ fontSize: '0.88rem' }} className="footer-link">Home</Link></li>
              <li><Link to="/shop" style={{ fontSize: '0.88rem' }} className="footer-link">Shop Catalog</Link></li>
              <li><Link to="/contact" style={{ fontSize: '0.88rem' }} className="footer-link">Contact Us</Link></li>
            </ul>
          </div>

          {/* Col 3: Shopping Categories */}
          <div>
            <h4 style={{ color: '#0F172A', fontSize: '1rem', fontWeight: '700', marginBottom: '18px', position: 'relative', paddingBottom: '8px', borderBottom: '1px solid #F1F5F9' }}>
              Categories
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', padding: 0 }}>
              <li><Link to="/shop?category=furniture" style={{ fontSize: '0.88rem' }} className="footer-link">Premium Furniture</Link></li>
              <li><Link to="/shop?category=electronics" style={{ fontSize: '0.88rem' }} className="footer-link">Smart Electronics</Link></li>
              <li><Link to="/shop?category=home-decor" style={{ fontSize: '0.88rem' }} className="footer-link">Home & Decor</Link></li>
              <li><Link to="/shop?category=toys" style={{ fontSize: '0.88rem' }} className="footer-link">Kids Toys</Link></li>
            </ul>
          </div>

          {/* Col 4: Contact Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h4 style={{ color: '#0F172A', fontSize: '1rem', fontWeight: '700', marginBottom: '18px', position: 'relative', paddingBottom: '8px', borderBottom: '1px solid #F1F5F9' }}>
              Get In Touch
            </h4>
            <div style={{ display: 'flex', gap: '10px', fontSize: '0.85rem' }}>
              <MapPin size={18} style={{ color: '#E11D48', flexShrink: 0 }} />
              <span>Near Balaji Goshala, Salasar, Rajasthan – 331506</span>
            </div>
            <div style={{ display: 'flex', gap: '10px', fontSize: '0.85rem', alignItems: 'center' }}>
              <Phone size={16} style={{ color: '#E11D48', flexShrink: 0 }} />
              <span>+91 9982827751, +91 9950105100</span>
            </div>
            <div style={{ display: 'flex', gap: '10px', fontSize: '0.85rem', alignItems: 'center' }}>
              <MessageCircle size={16} style={{ color: '#E11D48', flexShrink: 0 }} />
              <a href="https://wa.me/919982827751" target="_blank" rel="noreferrer" style={{ textDecoration: 'underline' }}>WhatsApp Support</a>
            </div>
            <div style={{ display: 'flex', gap: '10px', fontSize: '0.85rem', alignItems: 'center' }}>
              <Mail size={16} style={{ color: '#E11D48', flexShrink: 0 }} />
              <span>support@anjana.com</span>
            </div>
          </div>

        </div>

        {/* Footer Bottom */}
        <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', fontSize: '0.82rem', color: '#94A3B8' }}>
          <div>
            &copy; {new Date().getFullYear()} Anjana E-Commerce. All Rights Reserved.
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <span>Style & Speed</span>
            <span>Secure checkout</span>
            <span>Made with Care</span>
          </div>
        </div>

      </div>

      {/* Footer Local CSS Hover overrides */}
      <style>{`
        .footer-link {
          color: #64748B;
          transition: all 0.2s ease;
        }
        .footer-link:hover {
          color: #E11D48 !important;
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
