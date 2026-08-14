import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Namaste! SDC Furniture & Electronic Canteen welcomes you. We have been bringing quality home products since 1998. \n\nHow can I help you today? You can ask me to recommend recliners, compare products, check custom manufacturing services, or show our contact details!'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = async (textToSend) => {
    const userMessage = textToSend || input;
    if (!userMessage.trim()) return;

    if (!textToSend) setInput('');

    // Add user message to state
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch(`${window.API_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });
      const data = await response.json();
      
      if (data.success) {
        setMessages(prev => [...prev, {
          sender: 'ai',
          text: data.response,
          recommendations: data.recommendations || [],
          comparison: data.comparison || null
        }]);
      } else {
        setMessages(prev => [...prev, { sender: 'ai', text: 'Sorry, I am facing an issue connecting. Please try again!' }]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { sender: 'ai', text: 'Sorry, I am facing an issue connecting. Please verify the backend is running!' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion);
  };

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000, fontFamily: "'Inter', sans-serif" }} className="ai-assistant-container">
      
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          style={{
            backgroundColor: 'var(--primary)', color: '#FFFFFF', width: '56px', height: '56px',
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(10, 42, 27, 0.3)', border: '2px solid var(--accent)', transition: 'var(--transition)'
          }}
          className="ai-btn-bounce"
        >
          <MessageSquare size={24} />
          <Sparkles size={14} style={{ position: 'absolute', top: '10px', right: '10px', color: 'var(--accent)' }} />
        </button>
      )}

      {/* Chat Window Panel */}
      {isOpen && (
        <div style={{
          width: '360px', height: '500px', display: 'flex', flexDirection: 'column',
          backgroundColor: '#FFFFFF', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.15)', overflow: 'hidden', animation: 'fadeIn 0.3s ease'
        }} className="ai-assistant-window">
          
          {/* Header */}
          <div style={{
            backgroundColor: 'var(--primary)', color: '#FFFFFF', padding: '16px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--accent)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} style={{ color: 'var(--accent)' }} />
              <div>
                <h4 style={{ color: '#FFFFFF', fontSize: '0.95rem', margin: 0, fontWeight: '600' }}>SDC Shopping Assistant</h4>
                <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>Rule-based AI Helper</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ color: '#FFFFFF' }}>
              <X size={20} />
            </button>
          </div>

          {/* Messages Body */}
          <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px', backgroundColor: '#F9FAFA' }}>
            
            {messages.map((msg, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                
                {/* Bubble Text */}
                <div style={{
                  maxWidth: '85%', padding: '12px', borderRadius: '12px', fontSize: '0.85rem', lineHeight: '1.4',
                  whiteSpace: 'pre-line',
                  backgroundColor: msg.sender === 'user' ? 'var(--primary)' : '#FFFFFF',
                  color: msg.sender === 'user' ? '#FFFFFF' : 'var(--text)',
                  boxShadow: msg.sender === 'user' ? 'none' : '0 2px 8px rgba(0,0,0,0.02)',
                  border: msg.sender === 'user' ? 'none' : '1px solid var(--border)',
                  borderRadius: msg.sender === 'user' ? '12px 12px 0 12px' : '12px 12px 12px 0'
                }}>
                  {msg.text}
                </div>

                {/* Recommendations renderer (Interactive product cards inside Chat!) */}
                {msg.recommendations && msg.recommendations.length > 0 && (
                  <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                    {msg.recommendations.map(prod => (
                      <Link 
                        to={`/product/${prod.slug}`} 
                        key={prod.id} 
                        onClick={() => setIsOpen(false)}
                        style={{
                          display: 'flex', gap: '10px', padding: '8px', border: '1px solid var(--border)',
                          borderRadius: '8px', backgroundColor: '#FFFFFF', transition: 'var(--transition)'
                        }}
                        className="ai-product-card"
                      >
                        <img 
                          src={prod.primary_image ? `${window.API_URL}${prod.primary_image}` : 'https://placehold.co/80x80?text=Product'} 
                          alt={prod.name} 
                          style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} 
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--primary)', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {prod.name}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: '#C84B31', fontWeight: '700' }}>
                            ₹{parseFloat(prod.price).toLocaleString('en-IN')}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: 'var(--accent)', fontSize: '0.7rem' }}>
                            <Star size={10} fill="var(--accent)" />
                            <span>{prod.rating || '5.0'}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Comparison renderer */}
                {msg.comparison && (
                  <div style={{
                    marginTop: '10px', border: '1px solid var(--border)', borderRadius: '8px',
                    backgroundColor: '#FFFFFF', padding: '10px', width: '100%', fontSize: '0.75rem', overflowX: 'auto'
                  }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)', fontWeight: 'bold', color: 'var(--primary)' }}>
                          <th style={{ padding: '6px' }}>Feature</th>
                          <th style={{ padding: '6px' }}>{msg.comparison.product1.name.split(' ')[1] || 'Prod 1'}</th>
                          <th style={{ padding: '6px' }}>{msg.comparison.product2.name.split(' ')[1] || 'Prod 2'}</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ borderBottom: '1px solid #F0F2F1' }}>
                          <td style={{ padding: '6px', fontWeight: '500' }}>Price</td>
                          <td style={{ padding: '6px', color: '#C84B31', fontWeight: 'bold' }}>₹{parseFloat(msg.comparison.product1.sale_price || msg.comparison.product1.price).toLocaleString('en-IN')}</td>
                          <td style={{ padding: '6px', color: '#C84B31', fontWeight: 'bold' }}>₹{parseFloat(msg.comparison.product2.sale_price || msg.comparison.product2.price).toLocaleString('en-IN')}</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #F0F2F1' }}>
                          <td style={{ padding: '6px', fontWeight: '500' }}>Brand</td>
                          <td style={{ padding: '6px' }}>{msg.comparison.product1.brand_name || 'SDC'}</td>
                          <td style={{ padding: '6px' }}>{msg.comparison.product2.brand_name || 'SDC'}</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #F0F2F1' }}>
                          <td style={{ padding: '6px', fontWeight: '500' }}>Material</td>
                          <td style={{ padding: '6px' }}>{msg.comparison.product1.material_name || 'Standard'}</td>
                          <td style={{ padding: '6px' }}>{msg.comparison.product2.material_name || 'Standard'}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '6px', fontWeight: '500' }}>Warranty</td>
                          <td style={{ padding: '6px' }}>{msg.comparison.product1.warranty || '1 Year'}</td>
                          <td style={{ padding: '6px' }}>{msg.comparison.product2.warranty || '1 Year'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

              </div>
            ))}

            {/* Loading typing bubble */}
            {isLoading && (
              <div style={{ display: 'flex', gap: '4px', padding: '10px 15px', backgroundColor: '#FFF', borderRadius: '12px', border: '1px solid var(--border)', width: '60px', alignSelf: 'flex-start' }}>
                <span className="dot-blink" style={{ width: '6px', height: '6px', backgroundColor: 'var(--primary)', borderRadius: '50%' }}></span>
                <span className="dot-blink" style={{ width: '6px', height: '6px', backgroundColor: 'var(--primary)', borderRadius: '50%', animationDelay: '0.2s' }}></span>
                <span className="dot-blink" style={{ width: '6px', height: '6px', backgroundColor: 'var(--primary)', borderRadius: '50%', animationDelay: '0.4s' }}></span>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Quick replies suggestion chips */}
          <div style={{ padding: '10px 16px', display: 'flex', gap: '8px', overflowX: 'auto', borderTop: '1px solid var(--border)', backgroundColor: '#FFFFFF' }} className="suggestion-chips">
            <button onClick={() => handleSuggestionClick('Where is the showroom?')} style={chipStyle}>Location</button>
            <button onClick={() => handleSuggestionClick('Show me fabric recliners')} style={chipStyle}>Fabric Recliners</button>
            <button onClick={() => handleSuggestionClick('Compare recliners')} style={chipStyle}>Compare</button>
            <button onClick={() => handleSuggestionClick('What are your services?')} style={chipStyle}>Services</button>
          </div>

          {/* Footer Input form */}
          <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} style={{ padding: '12px', display: 'flex', gap: '8px', borderTop: '1px solid var(--border)', backgroundColor: '#FFFFFF' }}>
            <input 
              type="text" 
              placeholder="Ask anything..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{ flex: 1, padding: '8px 12px', borderRadius: '20px', border: '1px solid var(--border)', fontSize: '0.85rem' }} 
            />
            <button 
              type="submit" 
              style={{
                backgroundColor: 'var(--primary)', color: '#FFFFFF', padding: '8px',
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <Send size={16} />
            </button>
          </form>

        </div>
      )}

      {/* Styled definitions */}
      <style>{`
        .ai-product-card:hover {
          border-color: var(--accent) !important;
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
        }
        .ai-btn-bounce:hover {
          transform: scale(1.08) translateY(-2px);
          box-shadow: 0 6px 25px rgba(10, 42, 27, 0.4);
        }
        .suggestion-chips::-webkit-scrollbar {
          display: none;
        }
        .dot-blink {
          animation: dotBlink 1.4s infinite both;
        }
        @keyframes dotBlink {
          0% { opacity: .2; }
          20% { opacity: 1; }
          100% { opacity: .2; }
        }
        @media (max-width: 480px) {
          .ai-assistant-container {
            bottom: 12px !important;
            right: 12px !important;
          }
          .ai-assistant-window {
            width: calc(100vw - 24px) !important;
            height: 450px !important;
          }
        }
      `}</style>
    </div>
  );
}

const chipStyle = {
  flexShrink: 0,
  fontSize: '0.72rem',
  padding: '6px 12px',
  borderRadius: '16px',
  border: '1px solid var(--border)',
  color: 'var(--primary)',
  fontWeight: '500',
  backgroundColor: '#F9FAFA',
  whiteSpace: 'nowrap'
};
