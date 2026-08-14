import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Trash2, ShieldCheck, CreditCard, ChevronRight, FileText, Printer, CheckCircle } from 'lucide-react';

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
    fetch('http://localhost:5000/api/products')
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

    fetch('http://localhost:5000/api/orders', {
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
      <div className="container section-padding" style={{ animation: 'fadeIn 0.4s ease', minHeight: '60vh' }}>
        <h1 style={{ fontSize: '2rem', fontFamily: "'Playfair Display', serif", marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShoppingCart size={28} /> Your Shopping Cart
        </h1>

        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
            <h3>Your cart is empty.</h3>
            <p style={{ margin: '15px 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Explore our catalog to find premium furniture and electronics!</p>
            <Link to="/shop" className="btn btn-primary">Continue Shopping</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '40px' }} className="grid-2">
            
            {/* Products List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {products.map(p => {
                const activePrice = p.sale_price ? parseFloat(p.sale_price) : parseFloat(p.price);
                const imageUrl = p.primary_image 
                  ? (p.primary_image.startsWith('/') ? `http://localhost:5000${p.primary_image}` : p.primary_image)
                  : 'https://placehold.co/100x100?text=Product';

                return (
                  <div key={p.id} style={{ display: 'flex', gap: '20px', padding: '16px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', backgroundColor: '#FFF' }} className="cart-item-row">
                    <img src={imageUrl} alt="" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <Link to={`/product/${p.slug}`} style={{ fontWeight: '600', color: 'var(--primary)' }}>{p.name}</Link>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Price: ₹{activePrice.toLocaleString('en-IN')}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: 'auto' }}>
                        
                        {/* Quantity Counter */}
                        <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                          <button onClick={() => onUpdateQuantity(p.id, p.quantity - 1)} style={{ padding: '4px 10px', backgroundColor: '#F0F2F1' }}>-</button>
                          <span style={{ padding: '4px 12px', fontSize: '0.85rem' }}>{p.quantity}</span>
                          <button onClick={() => onUpdateQuantity(p.id, p.quantity + 1)} style={{ padding: '4px 10px', backgroundColor: '#F0F2F1' }}>+</button>
                        </div>

                        <button onClick={() => onRemoveFromCart(p.id)} style={{ color: '#C84B31', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: '500' }}>
                          <Trash2 size={14} /> Remove
                        </button>
                      </div>
                    </div>
                    <div style={{ fontWeight: '700', color: 'var(--primary)', alignSelf: 'center' }}>
                      ₹{(activePrice * p.quantity).toLocaleString('en-IN')}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cart Summary */}
            <div className="glass-panel" style={{ padding: '35px', height: 'fit-content' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>Order Summary</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Subtotal:</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>GST (18%):</span>
                  <span>₹{gst.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#2E7D32', fontWeight: '500' }}>
                  <span>Delivery Charges:</span>
                  <span>FREE</span>
                </div>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: '700', color: 'var(--primary)' }}>
                  <span>Total Amount:</span>
                  <span>₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button onClick={handleProceedToCheckout} className="btn btn-primary" style={{ width: '100%', marginTop: '25px', padding: '14px', borderRadius: '8px' }}>
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
      <div className="container section-padding" style={{ animation: 'fadeIn 0.4s ease', maxWidth: '600px', minHeight: '60vh' }}>
        <div className="glass-panel" style={{ padding: '40px' }}>
          <h2 style={{ fontSize: '1.8rem', fontFamily: "'Playfair Display', serif", marginBottom: '10px', textAlign: 'center' }}>Billing & Delivery Info</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '30px' }}>Please complete your shipping address to generate order receipt</p>
          
          <form onSubmit={handleCheckoutSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {errorMessage && (
              <div style={{ display: 'flex', gap: '8px', padding: '12px', backgroundColor: '#FCE8E6', color: '#C84B31', borderRadius: '8px', fontSize: '0.85rem', alignItems: 'center' }}>
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
                placeholder="House name/flat no., street, city, pin code (Rajasthan or other states)" 
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                className="form-control"
              ></textarea>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px', color: 'var(--primary)' }}>Payment Mode</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', cursor: 'pointer' }}>
                  <input type="radio" name="pay" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                  <span>Cash on Delivery (COD) / Pay upon assembly</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', cursor: 'pointer' }}>
                  <input type="radio" name="pay" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} />
                  <span>Scan UPI upon arrival / Mobile transfer</span>
                </label>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button type="button" onClick={() => setCheckoutStep('cart')} style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--text-muted)' }}>Back to Cart</button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>{isSubmitting ? 'Placing Order...' : 'Confirm Order & Place'}</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // STEP 3: RENDER PRINTABLE INVOICE RECEIPT
  if (checkoutStep === 'receipt') {
    return (
      <div className="container section-padding" style={{ animation: 'fadeIn 0.5s ease', maxWidth: '750px', minHeight: '80vh' }}>
        
        {/* Success Banner */}
        <div style={{ textAlign: 'center', color: '#2E7D32', marginBottom: '40px' }} className="no-print">
          <CheckCircle size={56} style={{ margin: '0 auto 10px auto' }} />
          <h2>Order Placed Successfully!</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '6px' }}>Your simulated order has been registered. You can print the commercial receipt below.</p>
        </div>

        {/* Invoice Container */}
        <div style={{ border: '2px solid var(--primary)', borderRadius: 'var(--radius-md)', padding: '40px', backgroundColor: '#FFFFFF', boxShadow: 'var(--shadow)' }} id="printable-invoice">
          
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid var(--primary)', paddingBottom: '20px', marginBottom: '24px' }}>
            <div>
              <h1 style={{ fontSize: '1.8rem', fontFamily: "'Playfair Display', serif" }}>SDC CANTEEN</h1>
              <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 'bold' }}>Furniture & Electronics Canteen</p>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px', maxWidth: '300px' }}>
                Near Balaji Goshala, Salasar Ke Samne, Sujangarh Road, Salasar, Churu, Rajasthan – 331506
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <h2 style={{ fontSize: '1.4rem', color: 'var(--primary)' }}>TAX INVOICE</h2>
              <p style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Receipt ID: {orderId}</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Date: {new Date().toLocaleDateString()}</p>
              <p style={{ fontSize: '0.75rem', color: '#2E7D32', fontWeight: '600', marginTop: '6px' }}>Status: PAID / COD VERIFIED</p>
            </div>
          </div>

          {/* Customer info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px', fontSize: '0.82rem' }}>
            <div>
              <h4 style={{ color: 'var(--primary)', marginBottom: '6px' }}>Billed To:</h4>
              <p style={{ fontWeight: 'bold' }}>{fullName}</p>
              <p>Phone: {phoneNumber}</p>
              <p style={{ whiteSpace: 'pre-line' }}>Address: {shippingAddress}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <h4 style={{ color: 'var(--primary)', marginBottom: '6px' }}>Supplier Information:</h4>
              <p style={{ fontWeight: 'bold' }}>SDC Furniture & Electronic Canteen</p>
              <p>GSTIN: 08AAAAA1111A1Z0 (Mock)</p>
              <p>WhatsApp Helpdesk: 9982827751</p>
            </div>
          </div>

          {/* Bill breakdown */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
            <h4 style={{ color: 'var(--primary)', marginBottom: '10px' }}>Bill Details</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Simulated Order Subtotal</span>
                <span>₹{(orderSubtotal / 1.18).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Simulated CGST + SGST (18%)</span>
                <span>₹{(orderSubtotal - (orderSubtotal / 1.18)).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#2E7D32' }}>
                <span>Shipping & Assembly</span>
                <span>FREE</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 'bold', borderTop: '2px solid var(--primary)', paddingTop: '10px', color: 'var(--primary)' }}>
                <span>Final Billing Amount</span>
                <span>₹{orderSubtotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div style={{ borderTop: '1px solid var(--border)', marginTop: '30px', paddingTop: '15px', textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <p>Thank you for shopping at **SDC Furniture & Electronic Canteen**!</p>
            <p style={{ fontStyle: 'italic', marginTop: '2px' }}>This is a simulated sales receipt. For actual shipments, SDC team will call you on your provided phone number.</p>
          </div>

        </div>

        {/* Printable actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }} className="no-print">
          <Link to="/" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            Back to Home
          </Link>
          <button onClick={handlePrint} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
