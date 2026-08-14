import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, ShieldAlert } from 'lucide-react';
import { auth } from '../config/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function AdminLoginPage({ adminToken, onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Redirect if already logged in
  React.useEffect(() => {
    if (adminToken) {
      navigate('/admin');
    }
  }, [adminToken, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) return;

    setLoading(true);
    setError('');

    try {
      let response;
      if (auth && username.includes('@')) {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, username, password);
          const token = await userCredential.user.getIdToken();
          response = await fetch(`${window.API_URL}/api/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ firebaseToken: token })
          });
        } catch (firebaseErr) {
          console.warn('Firebase admin login failed, falling back to database credentials:', firebaseErr.message);
        }
      }

      if (!response) {
        response = await fetch(`${window.API_URL}/api/admin/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
      }

      const data = await response.json();
      if (data.success) {
        onLoginSuccess(data.token, data.admin);
        navigate('/admin');
      } else {
        setError(data.message || 'Invalid username or password.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection failed. Please check if backend API server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container section-padding" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '40px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{
            display: 'inline-flex', padding: '12px', borderRadius: '50%',
            backgroundColor: 'var(--primary)', color: 'var(--accent)', marginBottom: '15px'
          }}>
            <Lock size={24} />
          </div>
          <h2 style={{ fontSize: '1.8rem', fontFamily: "'Playfair Display', serif" }}>Admin Secure Login</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Authorized personnel access only</p>
        </div>

        {error && (
          <div style={{
            display: 'flex', gap: '8px', padding: '12px', backgroundColor: '#FCE8E6',
            color: '#C84B31', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '20px',
            alignItems: 'center', border: '1px solid #F3C6C0'
          }}>
            <ShieldAlert size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="log-user">Username</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                id="log-user" 
                required 
                placeholder="Enter username (admin)" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-control"
                style={{ paddingLeft: '40px' }}
              />
              <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="log-pass">Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="password" 
                id="log-pass" 
                required 
                placeholder="Enter password (admin123)" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-control"
                style={{ paddingLeft: '40px' }}
              />
              <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '25px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <p>Demo Credentials:</p>
          <p style={{ fontWeight: '600' }}>Username: admin | Password: admin123</p>
        </div>

      </div>
    </div>
  );
}
