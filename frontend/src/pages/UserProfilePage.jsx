import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Save, LogOut, CheckCircle, ShieldAlert } from 'lucide-react';

export default function UserProfilePage({ userToken, user, onUserLogout, onUpdateUserProfile }) {
  const navigate = useNavigate();

  // Redirect to login if user details or token are missing
  useEffect(() => {
    if (!userToken) {
      navigate('/login');
    }
  }, [userToken, navigate]);

  // Form Fields State
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [city, setCity] = useState(user?.city || '');
  const [state, setState] = useState(user?.state || '');
  const [pincode, setPincode] = useState(user?.pincode || '');

  // UI Status
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Fetch orders on mount
  useEffect(() => {
    if (!userToken) return;
    fetch(`${window.API_URL}/api/orders`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    })
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          setOrders(res.data);
        }
        setLoadingOrders(false);
      })
      .catch(err => {
        console.error('Error fetching customer orders:', err);
        setLoadingOrders(false);
      });
  }, [userToken]);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
      setCity(user.city || '');
      setState(user.state || '');
      setPincode(user.pincode || '');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');

    try {
      const response = await fetch(`${window.API_URL}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
          full_name: fullName,
          phone,
          address,
          city,
          state,
          pincode
        })
      });
      const data = await response.json();
      if (data.success) {
        setSuccess('Profile updated successfully!');
        onUpdateUserProfile({
          ...user,
          full_name: fullName,
          phone,
          address,
          city,
          state,
          pincode
        });
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to update profile.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection failure. Check if the server is active.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="container section-padding" style={{ animation: 'fadeIn 0.4s ease', minHeight: '70vh' }}>
      <div className="profile-wrapper">
        
        {/* Sidebar Info Card */}
        <div className="glass-panel" style={{ padding: '30px', height: 'fit-content', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--primary)',
            color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', fontWeight: 'bold', marginBottom: '20px'
          }}>
            {user.username.slice(0, 2).toUpperCase()}
          </div>
          
          <h3 style={{ fontSize: '1.25rem', fontFamily: "'Outfit', sans-serif", fontWeight: '750' }}>{user.full_name || user.username}</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '20px' }}>@{user.username}</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', textAlign: 'left', fontSize: '0.85rem', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
              <Mail size={14} />
              <span style={{ wordBreak: 'break-all' }}>{user.email}</span>
            </div>
            {user.phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                <Phone size={14} />
                <span>{user.phone}</span>
              </div>
            )}
          </div>

          <button 
            onClick={() => { onUserLogout(); navigate('/'); }} 
            className="btn btn-outline" 
            style={{ width: '100%', marginTop: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', borderColor: '#E11D48', color: '#E11D48' }}
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>

        {/* Update Form Card */}
        <div className="glass-panel" style={{ padding: '40px' }}>
          <h2 style={{ fontSize: '1.5rem', fontFamily: "'Outfit', sans-serif", fontWeight: '800', marginBottom: '25px', color: '#0F172A' }}>Update Profile & Address</h2>
          
          {success && (
            <div style={{ display: 'flex', gap: '8px', padding: '12px', backgroundColor: '#E2F3EB', color: '#2E7D32', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '20px', alignItems: 'center' }}>
              <CheckCircle size={16} />
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div style={{ display: 'flex', gap: '8px', padding: '12px', backgroundColor: '#FCE8E6', color: '#C84B31', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '20px', alignItems: 'center' }}>
              <ShieldCheck size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="prof-name">Full Name</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  id="prof-name" 
                  placeholder="Enter full name" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="form-control"
                  style={{ paddingLeft: '40px' }}
                />
                <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="prof-phone">Phone Number</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="tel" 
                  id="prof-phone" 
                  placeholder="Enter contact number" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="form-control"
                  style={{ paddingLeft: '40px' }}
                />
                <Phone size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="prof-address">Default Delivery Address</label>
              <div style={{ position: 'relative' }}>
                <textarea 
                  id="prof-address" 
                  rows="4" 
                  placeholder="House/Plot no., Street name" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="form-control"
                  style={{ paddingLeft: '40px' }}
                ></textarea>
                <MapPin size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="prof-city">City</label>
                <input 
                  type="text" 
                  id="prof-city" 
                  placeholder="Jaipur" 
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="form-control" 
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="prof-state">State</label>
                <input 
                  type="text" 
                  id="prof-state" 
                  placeholder="Rajasthan" 
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="form-control" 
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="prof-pincode">Pincode</label>
                <input 
                  type="text" 
                  id="prof-pincode" 
                  placeholder="302001" 
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="form-control" 
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', alignSelf: 'flex-start', padding: '10px 24px' }}>
              <Save size={18} /> {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </form>
        </div>

        {/* TAB 2 / CARD: ORDER HISTORY */}
        <div className="glass-panel profile-orders-section" style={{ padding: '30px' }}>
          <h2 style={{ fontSize: '1.5rem', fontFamily: "'Outfit', sans-serif", fontWeight: '800', marginBottom: '20px', color: '#0F172A' }}>My Order History</h2>
          
          {loadingOrders ? (
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Loading your orders...</p>
          ) : orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 10px', border: '1px dashed var(--border)', borderRadius: '8px' }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>You haven't placed any orders yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {orders.map(order => {
                let badgeClass = 'status-badge ';
                if (order.status === 'pending') badgeClass += 'status-pending';
                else if (order.status === 'dispatched') badgeClass += 'status-dispatched';
                else if (order.status === 'completed') badgeClass += 'status-completed';
                else if (order.status === 'cancelled') badgeClass += 'status-cancelled';

                return (
                  <div key={order.id} className="order-history-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '15px' }}>
                      <div>
                        <span style={{ fontWeight: '700', color: 'var(--primary)', fontSize: '0.95rem' }}>{order.order_number}</span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>Ordered on: {new Date(order.created_at).toLocaleDateString()}</span>
                      </div>
                      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                        <span className={badgeClass}>
                          {order.status === 'pending' ? 'Pending Dispatch' : order.status}
                        </span>
                        <span style={{ fontWeight: '700', color: 'var(--primary)', fontSize: '1.05rem', marginTop: '2px' }}>₹{parseFloat(order.total).toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {order.items.map((item, idx) => (
                        <div key={idx} className="order-item-row">
                          <span>{item.product_name} <strong style={{ color: 'var(--accent)', marginLeft: '6px' }}>x{item.quantity}</strong></span>
                          <span style={{ fontWeight: '600', color: 'var(--text)' }}>₹{(parseFloat(item.price) * item.quantity).toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>

                    <div style={{ marginTop: '15px', paddingTop: '12px', borderTop: '1px solid var(--border)', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div><strong>Recipient:</strong> {order.full_name} ({order.phone})</div>
                      <div><strong>Address:</strong> {order.address}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Styled tags */}
      <style>{`
        .profile-wrapper {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 30px;
          max-width: 900px;
          margin: 0 auto;
        }
        .profile-orders-section {
          grid-column: span 2;
          margin-top: 10px;
        }
        .order-history-card {
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 20px;
          background-color: var(--bg-card);
          box-shadow: var(--shadow);
          transition: var(--transition);
        }
        .order-history-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-hover);
          border-color: var(--accent);
        }
        .order-item-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px dashed var(--border);
          font-size: 0.88rem;
        }
        .order-item-row:last-child {
          border-bottom: none;
        }
        .status-badge {
          display: inline-flex;
          align-items: center;
          padding: 6px 14px;
          border-radius: 30px;
          font-size: 0.78rem;
          font-weight: 600;
          text-transform: capitalize;
          letter-spacing: 0.3px;
        }
        .status-pending { background-color: rgba(212, 155, 40, 0.08); color: #B5801D; border: 1px solid rgba(212, 155, 40, 0.15); }
        .status-dispatched { background-color: rgba(26, 115, 232, 0.08); color: #1A73E8; border: 1px solid rgba(26, 115, 232, 0.15); }
        .status-completed { background-color: rgba(46, 125, 50, 0.08); color: #2E7D32; border: 1px solid rgba(46, 125, 50, 0.15); }
        .status-cancelled { background-color: rgba(200, 75, 49, 0.08); color: #C84B31; border: 1px solid rgba(200, 75, 49, 0.15); }

        @media (max-width: 768px) {
          .profile-wrapper {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
          .profile-orders-section {
            grid-column: span 1 !important;
          }
          .profile-wrapper .glass-panel {
            padding: 24px !important;
          }
        }
      `}</style>

    </div>
  );
}
