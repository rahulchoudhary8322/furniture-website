import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, User, Mail, Phone, MapPin, UserPlus, LogIn, AlertCircle } from 'lucide-react';
import { auth } from '../config/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

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
      let response;
      if (auth && username.includes('@')) {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, username, password);
          
          if (!userCredential.user.emailVerified) {
            await sendEmailVerification(userCredential.user);
            setError('Please verify your email address. A verification link has been sent to your email inbox.');
            setLoading(false);
            return;
          }

          const token = await userCredential.user.getIdToken();
          response = await fetch(`${window.API_URL}/api/user/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ firebaseToken: token })
          });
        } catch (firebaseErr) {
          console.warn('Firebase login failed:', firebaseErr.message);
          setError(firebaseErr.message || 'Invalid email or password.');
          setLoading(false);
          return;
        }
      }

      if (!response) {
        response = await fetch(`${window.API_URL}/api/user/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
      }

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
    if (!email || !password) return;

    setLoading(true);
    setError('');
    setSuccess('');

    // Generate a unique fallback username on frontend based on email prefix + random suffix
    const signupUsername = username || email.split('@')[0] + '_' + Math.floor(1000 + Math.random() * 9000);

    try {
      let response;
      if (auth) {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          await sendEmailVerification(userCredential.user);
          
          const token = await userCredential.user.getIdToken();
          response = await fetch(`${window.API_URL}/api/user/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username: signupUsername,
              email,
              full_name: fullName,
              phone,
              address,
              city,
              state,
              pincode,
              firebaseToken: token
            })
          });
          
          const data = await response.json();
          if (data.success) {
            setSuccess('Registration successful! A verification link has been sent to your email. Please verify it before logging in.');
            setIsLoginTab(true);
            setPassword('');
            setLoading(false);
            return;
          } else {
            setError(data.message || 'Registration failed.');
            setLoading(false);
            return;
          }
        } catch (firebaseErr) {
          console.warn('Firebase registration failed:', firebaseErr.message);
          setError(firebaseErr.message || 'Firebase user registration failed.');
          setLoading(false);
          return;
        }
      }

      if (!response) {
        response = await fetch(`${window.API_URL}/api/user/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: signupUsername,
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
      }

      const data = await response.json();
      if (data.success) {
        setSuccess('Registration successful! You can now log in using your credentials.');
        setIsLoginTab(true);
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

  const handleGoogleLogin = async () => {
    if (!auth) {
      setError('Firebase configuration is not active.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();

      const response = await fetch(`${window.API_URL}/api/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firebaseToken: token })
      });
      const data = await response.json();

      if (data.success) {
        onUserLoginSuccess(data.token, data.user);
        const redirectTo = searchParams.get('redirect') || '/profile';
        navigate(redirectTo);
      } else {
        setError(data.message || 'Google authentication sync failed.');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Google Sign-In failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container section-padding" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', animation: 'fadeIn 0.4s ease' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '40px', borderRadius: 'var(--radius-lg)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '1.6rem', fontFamily: "'Outfit', sans-serif", fontWeight: '800', color: '#0F172A', marginBottom: '8px' }}>
            {isLoginTab ? 'Welcome Back!' : 'Join Anjana'}
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: '1.4' }}>
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

        {/* Google Authentication (At the Top) */}
        {auth && (
          <div style={{ marginBottom: '24px' }}>
            <button 
              onClick={handleGoogleLogin} 
              disabled={loading}
              type="button"
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                backgroundColor: '#FFFFFF', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                padding: '12px 16px', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text)',
                cursor: 'pointer', transition: 'var(--transition)', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}
              className="google-signin-btn"
            >
              <svg style={{ width: '18px', height: '18px' }} viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C4 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 4 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {loading ? 'Connecting...' : 'Continue with Google'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }}></div>
              <span style={{ padding: '0 10px', textTransform: 'lowercase', fontWeight: '500', letterSpacing: '0.5px' }}>or</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }}></div>
            </div>
          </div>
        )}

        {/* Forms */}
        {isLoginTab ? (
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="user-login-username">Email or Username *</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  id="user-login-username" 
                  required 
                  placeholder="Enter your email or username" 
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
          <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
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

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <UserPlus size={18} /> {loading ? 'Registering...' : 'Create Account'}
            </button>

          </form>
        )}

        {/* Bottom Toggle switch */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px', fontSize: '0.85rem', color: '#64748B' }}>
          {isLoginTab ? (
            <span>
              Don't have an account?{' '}
              <button 
                type="button"
                onClick={() => { setIsLoginTab(false); setError(''); setSuccess(''); }}
                style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: '600', cursor: 'pointer', padding: 0 }}
              >
                Sign Up
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button 
                type="button"
                onClick={() => { setIsLoginTab(true); setError(''); setSuccess(''); }}
                style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: '600', cursor: 'pointer', padding: 0 }}
              >
                Sign In
              </button>
            </span>
          )}
        </div>

      </div>
    </div>
  );
}
