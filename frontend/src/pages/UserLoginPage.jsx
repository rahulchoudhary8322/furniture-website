import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, User, Mail, Phone, MapPin, UserPlus, LogIn, AlertCircle } from 'lucide-react';

export default function UserLoginPage({ userToken, onUserLoginSuccess }) {
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Redirect to page specified in query param or profile if already logged in
  useEffect(() => {
    if (userToken) {
      const redirectTo = searchParams.get('redirect') || '/profile';
      navigate(redirectTo);
    }
  }, [userToken, navigate, searchParams]);

  // Form Fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  // Status & UI state
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:5000/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (data.success) {
        onUserLoginSuccess(data.token, data.user);
        const redirectTo = searchParams.get('redirect') || '/profile';
        navigate(redirectTo);
      } else {
        setError(data.message || 'Invalid username or password.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection failed. Please ensure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:5000/api/user/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          email,
          password,
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
        setSuccess('Registration successful! You can now log in using your credentials.');
        setIsLoginTab(true);
        // Reset password fields
        setPassword('');
      } else {
        setError(data.message || 'Registration failed.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection failed. Please ensure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container section-padding" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', animation: 'fadeIn 0.4s ease' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '480px', padding: '40px', borderRadius: 'var(--radius-lg)' }}>
        
        {/* Header Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '30px' }}>
          <button 
            onClick={() => { setIsLoginTab(true); setError(''); setSuccess(''); }}
            style={{
              flex: 1, padding: '12px', fontSize: '1.05rem', fontWeight: '600',
              color: isLoginTab ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: isLoginTab ? '2px solid var(--accent)' : 'none',
              background: 'none', transition: 'var(--transition)'
            }}
          >
            Sign In
          </button>
          <button 
            onClick={() => { setIsLoginTab(false); setError(''); setSuccess(''); }}
            style={{
              flex: 1, padding: '12px', fontSize: '1.05rem', fontWeight: '600',
              color: !isLoginTab ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: !isLoginTab ? '2px solid var(--accent)' : 'none',
              background: 'none', transition: 'var(--transition)'
            }}
          >
            Create Account
          </button>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <h2 style={{ fontSize: '1.6rem', fontFamily: "'Playfair Display', serif", color: 'var(--primary)' }}>
            {isLoginTab ? 'Welcome Back!' : 'Join SDC Canteen'}
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            {isLoginTab ? 'Sign in to access your wishlist and complete purchases' : 'Register to save your products, cart, and address details'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            display: 'flex', gap: '8px', padding: '12px', backgroundColor: '#FCE8E6',
            color: '#C84B31', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '20px',
            alignItems: 'center', border: '1px solid #F3C6C0'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div style={{
            display: 'flex', gap: '8px', padding: '12px', backgroundColor: '#E2F3EB',
            color: '#2E7D32', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '20px',
            alignItems: 'center', border: '1px solid #C3E6D2'
          }}>
            <span>{success}</span>
          </div>
        )}

        {/* Forms */}
        {isLoginTab ? (
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="user-login-username">Username or Email *</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  id="user-login-username" 
                  required 
                  placeholder="Enter your username or email" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="form-control"
                  style={{ paddingLeft: '40px' }}
                />
                <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="user-login-password">Password *</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="password" 
                  id="user-login-password" 
                  required 
                  placeholder="Enter password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-control"
                  style={{ paddingLeft: '40px' }}
                />
                <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <LogIn size={18} /> {loading ? 'Authenticating...' : 'Sign In'}
            </button>

          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="user-reg-username">Username *</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  id="user-reg-username" 
                  required 
                  placeholder="Choose username (e.g. sahil_98)" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="form-control"
                  style={{ paddingLeft: '40px' }}
                />
                <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="user-reg-email">Email Address *</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="email" 
                  id="user-reg-email" 
                  required 
                  placeholder="Enter email address" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-control"
                  style={{ paddingLeft: '40px' }}
                />
                <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="user-reg-password">Password *</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="password" 
                  id="user-reg-password" 
                  required 
                  placeholder="Choose strong password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-control"
                  style={{ paddingLeft: '40px' }}
                />
                <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '10px 0' }} />
            
            <p style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--primary)', marginBottom: '5px' }}>Optional Profile Details</p>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="user-reg-name">Full Name</label>
              <input 
                type="text" 
                id="user-reg-name" 
                placeholder="Enter your first and last name" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="form-control" 
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="user-reg-phone">Phone Number</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="tel" 
                  id="user-reg-phone" 
                  placeholder="e.g. +91 9982827751" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="form-control"
                  style={{ paddingLeft: '40px' }}
                />
                <Phone size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="user-reg-address">Shipping Address</label>
              <div style={{ position: 'relative' }}>
                <textarea 
                  id="user-reg-address" 
                  rows="2" 
                  placeholder="Flat no., Street address" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="form-control"
                  style={{ paddingLeft: '40px' }}
                ></textarea>
                <MapPin size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="reg-city">City</label>
                <input 
                  type="text" 
                  id="reg-city" 
                  placeholder="Jaipur" 
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="form-control" 
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="reg-state">State</label>
                <input 
                  type="text" 
                  id="reg-state" 
                  placeholder="Rajasthan" 
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="form-control" 
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="reg-pincode">Pincode</label>
                <input 
                  type="text" 
                  id="reg-pincode" 
                  placeholder="302001" 
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="form-control" 
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <UserPlus size={18} /> {loading ? 'Registering...' : 'Create Account'}
            </button>

          </form>
        )}

      </div>
    </div>
  );
}
