import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Trash2, ShieldCheck, CreditCard, ChevronRight, Printer, CheckCircle } from 'lucide-react';

export default function CartPage({ cart, userToken, user, onUpdateQuantity, onRemoveFromCart, onClearCart }) {
  const [products, setProducts] = useState([]);
  const [checkoutStep, setCheckoutStep] = useState('cart'); // 'cart', 'checkout', 'receipt'
  
  // Checkout form details
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '');
  const [shippingAddress, setShippingAddress] = useState(() => {
    if (!user) return '';
    return [user.address, user.city, user.state, user.pincode].filter(Boolean).join(', ');
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');

  // Receipt details
  const [orderId, setOrderId] = useState('');
  const [orderSubtotal, setOrderSubtotal] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync profile details if user loads asynchronously
  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setPhoneNumber(user.phone || '');
      const parts = [user.address, user.city, user.state, user.pincode].filter(Boolean);
      setShippingAddress(parts.join(', '));
    }
  }, [user]);

  // Load product details for items in cart
  useEffect(() => {
    if (cart.length === 0) {
      setProducts([]);
      return;
    }
    // Fetch all products to match IDs
    fetch(`${window.API_URL}/api/products`)
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          const matched = cart.map(item => {
            const prod = res.data.find(p => p.id === item.product_id);
            return prod ? { ...prod, quantity: item.quantity } : null;
          }).filter(Boolean);
          setProducts(matched);
        }
      })
      .catch(err => console.error(err));
  }, [cart]);

  const subtotal = products.reduce((acc, p) => {
    const activePrice = p.sale_price ? parseFloat(p.sale_price) : parseFloat(p.price);
    return acc + (activePrice * p.quantity);
  }, 0);

  const gst = subtotal * 0.18; // GST 18%
  const total = subtotal + gst;

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    if (!fullName || !phoneNumber || !shippingAddress) return;
    setIsSubmitting(true);
    setErrorMessage('');

    // Prepare items to match backend requirements
    const items = cart.map(item => ({
      product_id: item.product_id,
      quantity: item.quantity
    }));

    fetch(`${window.API_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        full_name: fullName,
        phone: phoneNumber,
        address: shippingAddress,
        payment_method: paymentMethod,
        items
      })
    })
      .then(res => res.json())
      .then(res => {
        setIsSubmitting(false);
        if (res.success) {
          setOrderId(res.data.order_number);
          setOrderSubtotal(res.data.total);

          // Trigger Confetti
          if (window.confetti) {
            window.confetti({ particleCount: 100, spread: 60, origin: { y: 0.6 } });
          }

          setCheckoutStep('receipt');
          onClearCart();
        } else {
          setErrorMessage(res.message || 'Order place karne me problem aayi. Please review stock or details.');
        }
      })
      .catch(err => {
        console.error(err);
        setIsSubmitting(false);
        setErrorMessage('Server connection fail. Please check if backend is running.');
      });
  };

  const handleProceedToCheckout = () => {
    if (!userToken) {
      alert('Checkout karne ke liye please login karein! (To complete your purchase, please log in first)');
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    setCheckoutStep('checkout');
  };

  const handlePrint = () => {
    window.print();
  };

  // STEP 1: RENDER CART ITEMS LIST
  if (checkoutStep === 'cart') {
    return (
      <div className="container section-padding" style={{ animation: 'fadeIn 0.4s ease', minHeight: '60vh', padding: '40px 20px' }}>
        <h1 style={{ fontSize: '2rem', fontFamily: "'Outfit', sans-serif", fontWeight: '800', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '12px', color: '#0F172A' }}>
          <ShoppingBag size={28} /> Your Shopping Cart
        </h1>

        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', border: '1px solid #E2E8F0', borderRadius: '24px', backgroundColor: '#FFFFFF' }}>
            <h3 style={{ fontWeight: '700' }}>Your cart is empty.</h3>
            <p style={{ margin: '15px 0', fontSize: '0.9rem', color: '#64748B' }}>Explore our catalog to find premium furniture and electronics!</p>
            <Link to="/shop" className="btn btn-primary">Continue Shopping</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '40px' }} className="grid-2">
            
            {/* Products List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {products.map(p => {
                const activePrice = p.sale_price ? parseFloat(p.sale_price) : parseFloat(p.price);
                 const imageUrl = p.primary_image 
                   ? (p.primary_image.startsWith('/') ? `${window.API_URL}${p.primary_image}` : p.primary_image)
                   : 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=150&q=80';

                return (
                  <div key={p.id} style={{ display: 'flex', gap: '20px', padding: '16px', border: '1px solid #F1F5F9', borderRadius: '16px', backgroundColor: '#FFF', boxShadow: '0 4px 12px rgba(15,23,42,0.01)' }} className="cart-item-row">
                    <img src={imageUrl} alt="" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '12px' }} />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <Link to={`/product/${p.slug}`} style={{ fontWeight: '700', color: '#0F172A', fontSize: '0.9rem' }}>{p.name}</Link>
                      <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Price: ₹{activePrice.toLocaleString('en-IN')}/-</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: 'auto' }}>
                        
                        {/* Quantity Counter */}
                        <div style={{ display: 'flex', border: '1px solid #E2E8F0', borderRadius: '9999px', overflow: 'hidden' }}>
                          <button onClick={() => onUpdateQuantity(p.id, p.quantity - 1)} style={{ padding: '4px 12px', backgroundColor: '#F8FAFC', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>-</button>
                          <span style={{ padding: '4px 10px', fontSize: '0.8rem', minWidth: '20px', textAlign: 'center', alignSelf: 'center', fontWeight: '600' }}>{p.quantity}</span>
                          <button onClick={() => onUpdateQuantity(p.id, p.quantity + 1)} style={{ padding: '4px 12px', backgroundColor: '#F8FAFC', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>+</button>
                        </div>

                        <button onClick={() => onRemoveFromCart(p.id)} style={{ color: '#E11D48', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', fontWeight: '700', border: 'none', cursor: 'pointer' }}>
                          <Trash2 size={13} /> Remove
                        </button>
                      </div>
                    </div>
                    <div style={{ fontWeight: '800', color: '#0F172A', alignSelf: 'center', fontSize: '0.95rem' }}>
                      ₹{(activePrice * p.quantity).toLocaleString('en-IN')}/-
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cart Summary */}
            <div style={{ padding: '30px', backgroundColor: '#FFFFFF', borderRadius: '24px', border: '1px solid #E2E8F0', height: 'fit-content' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '20px', borderBottom: '1px solid #F1F5F9', paddingBottom: '12px', color: '#0F172A' }}>Order Summary</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                  <span>Subtotal:</span>
                  <span style={{ fontWeight: '600', color: '#0F172A' }}>₹{subtotal.toLocaleString('en-IN')}/-</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                  <span>GST (18%):</span>
                  <span style={{ fontWeight: '600', color: '#0F172A' }}>₹{gst.toLocaleString('en-IN')}/-</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669', fontWeight: '600' }}>
                  <span>Delivery Charges:</span>
                  <span>FREE</span>
                </div>
                <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: '800', color: '#0F172A' }}>
                  <span>Total Amount:</span>
                  <span style={{ color: '#E11D48' }}>₹{total.toLocaleString('en-IN')}/-</span>
                </div>
              </div>

              <button onClick={handleProceedToCheckout} className="btn btn-primary" style={{ width: '100%', marginTop: '25px', padding: '14px', borderRadius: '9999px', justifyContent: 'center' }}>
                Proceed to Checkout <ChevronRight size={16} />
              </button>
            </div>

          </div>
        )}
      </div>
    );
  }

  // STEP 2: RENDER CHECKOUT BILLING FORM
  if (checkoutStep === 'checkout') {
    return (
      <div className="container section-padding" style={{ animation: 'fadeIn 0.4s ease', maxWidth: '580px', minHeight: '60vh', padding: '40px 20px' }}>
        <div style={{ padding: '40px 30px', backgroundColor: '#FFFFFF', borderRadius: '24px', border: '1px solid #E2E8F0' }}>
          <h2 style={{ fontSize: '1.8rem', fontFamily: "'Outfit', sans-serif", fontWeight: '800', marginBottom: '8px', textAlign: 'center', color: '#0F172A' }}>Billing & Delivery Info</h2>
          <p style={{ fontSize: '0.85rem', color: '#64748B', textAlign: 'center', marginBottom: '30px' }}>Please complete your shipping address to generate order receipt</p>
          
          <form onSubmit={handleCheckoutSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {errorMessage && (
              <div style={{ display: 'flex', gap: '8px', padding: '12px 16px', backgroundColor: '#FEE2E2', color: '#DC2626', borderRadius: '12px', fontSize: '0.85rem', alignItems: 'center' }}>
                <ShieldCheck size={16} />
                <span>{errorMessage}</span>
              </div>
            )}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="chk-name">Full Name *</label>
              <input 
                type="text" 
                id="chk-name" 
                required 
                placeholder="Enter recipient full name" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="form-control" 
              />
            </div>
            
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="chk-phone">Phone Number *</label>
              <input 
                type="tel" 
                id="chk-phone" 
                required 
                placeholder="e.g. +91 9982827751" 
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="form-control" 
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="chk-addr">Shipping Address *</label>
              <textarea 
                id="chk-addr" 
                rows="3" 
                required 
                placeholder="House name/flat no., street, city, pin code" 
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                className="form-control"
              ></textarea>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px', color: '#0F172A' }}>Payment Mode</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.88rem', cursor: 'pointer', color: '#334155' }}>
                  <input type="radio" name="pay" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} style={{ accentColor: '#E11D48' }} />
                  <span>Cash on Delivery (COD) / Pay upon assembly</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.88rem', cursor: 'pointer', color: '#334155' }}>
                  <input type="radio" name="pay" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} style={{ accentColor: '#E11D48' }} />
                  <span>Scan UPI upon arrival / Mobile transfer</span>
                </label>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button type="button" onClick={() => setCheckoutStep('cart')} style={{ fontSize: '0.88rem', fontWeight: '600', color: '#64748B', border: 'none', background: 'none', cursor: 'pointer' }}>Back to Cart</button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>{isSubmitting ? 'Placing Order...' : 'Confirm & Place Order'}</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // STEP 3: RENDER PRINTABLE INVOICE RECEIPT
  if (checkoutStep === 'receipt') {
    return (
      <div className="container section-padding" style={{ animation: 'fadeIn 0.5s ease', maxWidth: '750px', minHeight: '80vh', padding: '40px 20px' }}>
        
        {/* Success Banner */}
        <div style={{ textAlign: 'center', color: '#059669', marginBottom: '40px' }} className="no-print">
          <CheckCircle size={56} style={{ margin: '0 auto 10px auto' }} />
          <h2 style={{ fontWeight: '800' }}>Order Placed Successfully!</h2>
          <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: '6px' }}>Your simulated order has been registered. You can print the commercial receipt below.</p>
        </div>

        {/* Invoice Container */}
        <div style={{ border: '1px solid #E2E8F0', borderRadius: '24px', padding: '40px', backgroundColor: '#FFFFFF', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }} id="printable-invoice">
          
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0F172A', paddingBottom: '20px', marginBottom: '24px' }}>
            <div>
              <h1 style={{ fontSize: '1.8rem', fontFamily: "'Outfit', sans-serif", fontWeight: '800', color: '#0F172A' }}>Anjana</h1>
              <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#E11D48', fontWeight: '700', letterSpacing: '0.5px' }}>Premium E-Commerce Store</p>
              <p style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '4px', maxWidth: '300px' }}>
                Near Balaji Goshala, Salasar, Rajasthan – 331506
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <h2 style={{ fontSize: '1.4rem', color: '#0F172A', fontWeight: '800' }}>TAX INVOICE</h2>
              <p style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Receipt ID: {orderId}</p>
              <p style={{ fontSize: '0.8rem', color: '#64748B' }}>Date: {new Date().toLocaleDateString()}</p>
              <p style={{ fontSize: '0.75rem', color: '#059669', fontWeight: '700', marginTop: '6px' }}>Status: PAID / COD VERIFIED</p>
            </div>
          </div>

          {/* Customer info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px', fontSize: '0.82rem' }}>
            <div>
              <h4 style={{ color: '#0F172A', fontWeight: '700', marginBottom: '6px' }}>Billed To:</h4>
              <p style={{ fontWeight: 'bold', color: '#0F172A' }}>{fullName}</p>
              <p>Phone: {phoneNumber}</p>
              <p style={{ whiteSpace: 'pre-line' }}>Address: {shippingAddress}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <h4 style={{ color: '#0F172A', fontWeight: '700', marginBottom: '6px' }}>Supplier Information:</h4>
              <p style={{ fontWeight: 'bold', color: '#0F172A' }}>Anjana E-Commerce</p>
              <p>GSTIN: 08AAAAA1111A1Z0 (Mock)</p>
              <p>Support Helpdesk: 9982827751</p>
            </div>
          </div>

          {/* Bill breakdown */}
          <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '20px' }}>
            <h4 style={{ color: '#0F172A', fontWeight: '700', marginBottom: '10px' }}>Bill Details</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                <span>Simulated Order Subtotal</span>
                <span>₹{(orderSubtotal / 1.18).toFixed(2)}/-</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                <span>Simulated CGST + SGST (18%)</span>
                <span>₹{(orderSubtotal - (orderSubtotal / 1.18)).toFixed(2)}/-</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669', fontWeight: '600' }}>
                <span>Shipping & Assembly</span>
                <span>FREE</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: '800', borderTop: '2px solid #0F172A', paddingTop: '10px', color: '#0F172A' }}>
                <span>Final Billing Amount</span>
                <span style={{ color: '#E11D48' }}>₹{orderSubtotal.toLocaleString('en-IN')}/-</span>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div style={{ borderTop: '1px solid #F1F5F9', marginTop: '30px', paddingTop: '15px', textAlign: 'center', fontSize: '0.78rem', color: '#94A3B8' }}>
            <p>Thank you for shopping at **Anjana**!</p>
            <p style={{ fontStyle: 'italic', marginTop: '2px' }}>This is a simulated sales receipt. For actual shipments, our team will call you on your provided phone number.</p>
          </div>

        </div>

        {/* Printable actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }} className="no-print">
          <Link to="/" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '9999px' }}>
            Back to Home
          </Link>
          <button onClick={handlePrint} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '9999px' }}>
            <Printer size={18} /> Print Receipt / Save PDF
          </button>
        </div>

        {styleForPrinting}
      </div>
    );
  }
}

const styleForPrinting = (
  <style>{`
    @media print {
      body {
        background-color: #FFFFFF !important;
        color: #000000 !important;
      }
      .no-print {
        display: none !important;
      }
      #printable-invoice {
        border: none !important;
        box-shadow: none !important;
        padding: 0 !important;
      }
      header, footer, .sticky-header, #mcp-badge, #ai-assistant {
        display: none !important;
      }
    }
  `}</style>
);
