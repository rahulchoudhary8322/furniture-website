import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Outlet } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import AiAssistant from './components/AiAssistant';

// Pages
import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import WishlistPage from './pages/WishlistPage';
import UserLoginPage from './pages/UserLoginPage';
import UserProfilePage from './pages/UserProfilePage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';

// Mock SEO Details for static fallback
const fallbackSEO = {
  home: {
    title: 'SDC Furniture & Electronic Canteen - Premium Furniture & Electronics in Rajasthan',
    description: 'Trusted since 1998, SDC Furniture & Electronic Canteen provides premium quality home furniture, sofa sets, LED TVs, air conditioners, mobile phones, toys and home decor products in Salasar, Rajasthan.',
    keywords: 'SDC Canteen, SDC Furniture Salasar, SDC Electronics, Best furniture shop in Salasar, premium recliners, sofa sets Salasar'
  },
  about: {
    title: 'About Us - SDC Furniture & Electronic Canteen',
    description: 'Learn about our journey since 1998 in delivering high-quality products including custom manufactured furniture, premium electronics, and appliances across Rajasthan.',
    keywords: 'SDC Canteen history, furniture manufacturer Rajasthan, trusted electronic shop since 1998'
  },
  contact: {
    title: 'Contact Us - SDC Furniture & Electronic Canteen',
    description: 'Get in touch with SDC Furniture & Electronic Canteen. Located near Balaji Goshala, Salasar. Call +91 9982827751 for details and bulk order requests.',
    keywords: 'SDC contact number, Salasar furniture showroom address, SDC WhatsApp support'
  },
  services: {
    title: 'Our Services - SDC Furniture & Electronic Canteen',
    description: 'Explore our wide range of services including custom furniture manufacturing, electronics supply, installation and repair support, and fast delivery.',
    keywords: 'furniture customization Rajasthan, electronics installation support, SDC appliance repair'
  },
  cart: {
    title: 'My Shopping Cart - SDC Furniture & Electronic Canteen',
    description: 'Review your selected furniture and electronics items. Secure checkout, multiple payment options, and premium delivery across Rajasthan.',
    keywords: 'shopping cart, SDC checkout, buy furniture Salasar'
  },
  wishlist: {
    title: 'My Wishlist - SDC Furniture & Electronic Canteen',
    description: 'Your saved custom furniture and premium electronic items at SDC Canteen. Log in to sync and save your favorites across devices.',
    keywords: 'wishlist items, saved furniture, favorite electronics SDC'
  },
  login: {
    title: 'Customer Login & Registration - SDC Canteen',
    description: 'Sign in or register for a customer account at SDC Furniture & Electronic Canteen. Save wishlists, view orders, and manage shipping addresses.',
    keywords: 'customer login, register account, SDC sign in'
  },
  profile: {
    title: 'My Account Profile - SDC Furniture & Electronic Canteen',
    description: 'Manage your SDC Canteen customer profile, update contact details, set default shipping address, city, state, pincode, and view orders.',
    keywords: 'manage profile, SDC customer profile, user account details'
  }
};

// Internal component to handle page-specific dynamic SEO
function SeoManager() {
  const location = useLocation();

  useEffect(() => {
    let pageName = 'home';
    if (location.pathname === '/about') pageName = 'about';
    else if (location.pathname === '/contact') pageName = 'contact';
    else if (location.pathname === '/services') pageName = 'services';
    else if (location.pathname === '/cart') pageName = 'cart';
    else if (location.pathname === '/wishlist') pageName = 'wishlist';
    else if (location.pathname === '/login') pageName = 'login';
    else if (location.pathname === '/profile') pageName = 'profile';
    else if (location.pathname.startsWith('/product/')) pageName = 'product';
    else if (location.pathname.startsWith('/shop')) pageName = 'shop';

    // 1. Fetch current SEO tags from backend
    fetch(`${window.API_URL}/api/admin/seo`)
      .then(res => res.json())
      .then(res => {
        let meta = null;
        if (res.success && res.data) {
          meta = res.data.find(s => s.page_name === pageName);
        }

        // Use fallback if not defined in database
        if (!meta) {
          meta = fallbackSEO[pageName] || fallbackSEO['home'];
        }

        // Special handling for catalog and details pages
        if (pageName === 'product') {
          // Handled inside ProductPage component or with a general placeholder
          document.title = 'Product Details - SDC Furniture & Electronic Canteen';
          return;
        } else if (pageName === 'shop') {
          document.title = 'Shop Products Catalog - SDC Furniture & Electronic Canteen';
          return;
        }

        document.title = meta.title;

        // Set Meta Description
        let descMeta = document.querySelector('meta[name="description"]');
        if (!descMeta) {
          descMeta = document.createElement('meta');
          descMeta.name = 'description';
          document.head.appendChild(descMeta);
        }
        descMeta.content = meta.description;

        // Set Meta Keywords
        let keysMeta = document.querySelector('meta[name="keywords"]');
        if (!keysMeta) {
          keysMeta = document.createElement('meta');
          keysMeta.name = 'keywords';
          document.head.appendChild(keysMeta);
        }
        keysMeta.content = meta.keywords;
      })
      .catch(() => {
        // Safe fallback on connectivity fail
        const meta = fallbackSEO[pageName] || fallbackSEO['home'];
        document.title = meta.title;
      });
  }, [location]);

  return null;
}

export default function App() {
  // Sync State from LocalStorage
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('sdc_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('sdc_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  const [adminToken, setAdminToken] = useState(() => {
    return localStorage.getItem('sdc_admin_token') || null;
  });

  // Customer Token & User Profile State
  const [userToken, setUserToken] = useState(() => {
    return localStorage.getItem('sdc_user_token') || null;
  });

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('sdc_user_profile');
    return saved ? JSON.parse(saved) : null;
  });

  // Save changes to LocalStorage
  useEffect(() => {
    localStorage.setItem('sdc_cart', JSON.stringify(cart));
  }, [cart]);

  // Read Wishlist from DB if customer userToken exists, otherwise fallback to local
  useEffect(() => {
    if (userToken) {
      fetch(`${window.API_URL}/api/wishlist`, {
        headers: { 'Authorization': `Bearer ${userToken}` }
      })
        .then(res => res.json())
        .then(res => {
          if (res.success) {
            setWishlist(res.data);
            localStorage.setItem('sdc_wishlist', JSON.stringify(res.data));
          }
        })
        .catch(err => console.error('Error fetching database wishlist:', err));
    } else {
      const saved = localStorage.getItem('sdc_wishlist');
      setWishlist(saved ? JSON.parse(saved) : []);
    }
  }, [userToken]);

  // Cart operations
  const handleAddToCart = (productId, qty = 1) => {
    setCart(prev => {
      const match = prev.find(item => item.product_id === productId);
      if (match) {
        return prev.map(item => 
          item.product_id === productId 
            ? { ...item, quantity: item.quantity + qty } 
            : item
        );
      } else {
        return [...prev, { product_id: productId, quantity: qty }];
      }
    });
  };

  const handleUpdateQuantity = (productId, qty) => {
    if (qty <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCart(prev => 
      prev.map(item => 
        item.product_id === productId 
          ? { ...item, quantity: qty } 
          : item
      )
    );
  };

  const handleRemoveFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.product_id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Wishlist operations (Require Login Lock)
  const handleToggleWishlist = (productId) => {
    if (!userToken) {
      alert('Wishlist ke liye please login karein! (To save products in wishlist, please login first)');
      // Temporarily store in offline wishlist so we can sync after login
      const current = JSON.parse(localStorage.getItem('sdc_wishlist') || '[]');
      if (!current.includes(productId)) {
        const next = [...current, productId];
        localStorage.setItem('sdc_wishlist', JSON.stringify(next));
        setWishlist(next);
      }
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
      return;
    }

    // Toggle in DB
    fetch(`${window.API_URL}/api/wishlist/toggle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({ productId })
    })
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          if (res.isWishlisted) {
            setWishlist(prev => {
              const next = [...prev, productId];
              localStorage.setItem('sdc_wishlist', JSON.stringify(next));
              return next;
            });
          } else {
            setWishlist(prev => {
              const next = prev.filter(id => id !== productId);
              localStorage.setItem('sdc_wishlist', JSON.stringify(next));
              return next;
            });
          }
        }
      })
      .catch(err => console.error('Wishlist toggle error:', err));
  };

  // Customer Login Success & Wishlist DB Sync
  const handleUserLoginSuccess = (token, userProfile) => {
    setUserToken(token);
    setUser(userProfile);
    localStorage.setItem('sdc_user_token', token);
    localStorage.setItem('sdc_user_profile', JSON.stringify(userProfile));

    // Sync any existing offline wishlist items with database
    const localWishlist = JSON.parse(localStorage.getItem('sdc_wishlist') || '[]');
    fetch(`${window.API_URL}/api/wishlist/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ productIds: localWishlist })
    })
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          setWishlist(res.data);
          localStorage.setItem('sdc_wishlist', JSON.stringify(res.data));
        }
      })
      .catch(err => console.error('Sync error:', err));
  };

  // Customer Logout
  const handleUserLogout = () => {
    setUserToken(null);
    setUser(null);
    setWishlist([]);
    localStorage.removeItem('sdc_user_token');
    localStorage.removeItem('sdc_user_profile');
    localStorage.setItem('sdc_wishlist', JSON.stringify([]));
  };

  // Admin Login
  const handleLoginSuccess = (token, admin) => {
    setAdminToken(token);
    localStorage.setItem('sdc_admin_token', token);
    localStorage.setItem('sdc_admin_user', JSON.stringify(admin));
  };

  const handleLogout = () => {
    setAdminToken(null);
    localStorage.removeItem('sdc_admin_token');
    localStorage.removeItem('sdc_admin_user');
  };

  return (
    <BrowserRouter>
      <SeoManager />
      <Routes>
        {/* Customer Routes (Under CustomerLayout) */}
        <Route
          element={
            <CustomerLayout
              cart={cart}
              wishlist={wishlist}
              adminToken={adminToken}
              onLogout={handleLogout}
              userToken={userToken}
              user={user}
              onUserLogout={handleUserLogout}
            />
          }
        >
          <Route 
            path="/" 
            element={
              <Home 
                cart={cart} 
                wishlist={wishlist} 
                onAddToCart={handleAddToCart} 
                onToggleWishlist={handleToggleWishlist} 
              />
            } 
          />
          <Route 
            path="/shop" 
            element={
              <CategoryPage 
                cart={cart} 
                wishlist={wishlist} 
                onAddToCart={handleAddToCart} 
                onToggleWishlist={handleToggleWishlist} 
              />
            } 
          />
          <Route 
            path="/product/:slug" 
            element={
              <ProductPage 
                cart={cart} 
                wishlist={wishlist} 
                onAddToCart={handleAddToCart} 
                onToggleWishlist={handleToggleWishlist} 
              />
            } 
          />
          <Route 
            path="/cart" 
            element={
              <CartPage 
                cart={cart} 
                userToken={userToken}
                user={user}
                onUpdateQuantity={handleUpdateQuantity} 
                onRemoveFromCart={handleRemoveFromCart} 
                onClearCart={handleClearCart} 
              />
            } 
          />
          <Route 
            path="/wishlist" 
            element={
              <WishlistPage 
                wishlist={wishlist} 
                cart={cart} 
                onAddToCart={handleAddToCart} 
                onToggleWishlist={handleToggleWishlist} 
              />
            } 
          />
          <Route 
            path="/login" 
            element={
              <UserLoginPage 
                userToken={userToken} 
                onUserLoginSuccess={handleUserLoginSuccess} 
              />
            } 
          />
          <Route 
            path="/profile" 
            element={
              <UserProfilePage 
                userToken={userToken} 
                user={user} 
                onUserLogout={handleUserLogout}
                onUpdateUserProfile={setUser}
              />
            } 
          />
          {/* Fallbacks */}
          <Route 
            path="/about" 
            element={
              <Home 
                cart={cart} 
                wishlist={wishlist} 
                onAddToCart={handleAddToCart} 
                onToggleWishlist={handleToggleWishlist} 
              />
            } 
          />
          <Route 
            path="/services" 
            element={
              <Home 
                cart={cart} 
                wishlist={wishlist} 
                onAddToCart={handleAddToCart} 
                onToggleWishlist={handleToggleWishlist} 
              />
            } 
          />
          <Route 
            path="/contact" 
            element={
              <Home 
                cart={cart} 
                wishlist={wishlist} 
                onAddToCart={handleAddToCart} 
                onToggleWishlist={handleToggleWishlist} 
              />
            } 
          />
        </Route>

        {/* Admin Routes (Completely Isolated - No Customer Layout) */}
        <Route 
          path="/admin-login" 
          element={
            <AdminLoginPage 
              adminToken={adminToken} 
              onLoginSuccess={handleLoginSuccess} 
            />
          } 
        />
        <Route 
          path="/admin" 
          element={
            <AdminDashboard 
              adminToken={adminToken} 
              onLogout={handleLogout} 
            />
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

// Customer Layout shell component to group customer views
function CustomerLayout({ cart, wishlist, adminToken, onLogout, userToken, user, onUserLogout }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header 
        cart={cart} 
        wishlist={wishlist} 
        adminToken={adminToken} 
        onLogout={onLogout} 
        userToken={userToken}
        user={user}
        onUserLogout={onUserLogout}
      />
      <div style={{ flex: 1 }}>
        <Outlet />
      </div>
      <Footer />
      <AiAssistant />
    </div>
  );
}
