import React, { useState } from 'react';
import axios from 'axios';
import { Send, CreditCard, MapPin, Lock, Check } from 'lucide-react';

export default function TicketForm() {
  // Detectar qué evento es desde la URL
  const urlParams = new URLSearchParams(window.location.search);
  const eventType = urlParams.get('event') || 'mangrove';
  
  const EVENT_INFO = {
    mangrove: {
      name: "The Mangrove",
      subtitle: "New Year's 2026",
      description: "Exclusive celebration at Mangrove Restaurant in Biras Marina"
    },
    ikigai: {
      name: "Ikigai",
      subtitle: "New Year's 2026",
      description: "Exclusive Japanese/Caribbean fusion celebration"
    }
  };

  const currentEvent = EVENT_INFO[eventType];

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    guests: 1,
    cardNumber: '',
    expDate: '',
    cvv: '',
    zipCode: '',
    address: ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const TICKET_PRICE = 500;
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

  const totalAmount = formData.guests * TICKET_PRICE;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Procesar pago
      const paymentResponse = await axios.post(`${API_URL}/api/payment/process`, {
        cardNumber: formData.cardNumber,
        expDate: formData.expDate,
        cvv: formData.cvv,
        amount: totalAmount.toFixed(2),
        zipCode: formData.zipCode,
        address: formData.address
      });

      if (!paymentResponse.data.success) {
        throw new Error('Payment was declined');
      }

      // 2. Crear ticket
      const ticketResponse = await axios.post(`${API_URL}/api/tickets/create`, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        guests: formData.guests,
        paymentNumber: paymentResponse.data.numeroAutorizacion,
        tokenAuth: paymentResponse.data.tokenAuth,
        complianceData: paymentResponse.data.complianceData,
        eventType: eventType
      });

      if (ticketResponse.status === 201) {
        setSuccess(true);
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          guests: 1,
          cardNumber: '',
          expDate: '',
          cvv: '',
          zipCode: '',
          address: ''
        });
      }

    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.error || err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0a1929 0%, #1a2332 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: "'Montserrat', -apple-system, sans-serif"
      }}>
        <div style={{
          maxWidth: '500px',
          width: '100%',
          background: 'rgba(255, 255, 255, 0.98)',
          borderRadius: '4px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          padding: '60px 40px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: '#c9a55a',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 32px'
          }}>
            <Check size={40} color="#fff" strokeWidth={3} />
          </div>
          <h2 style={{ 
            fontSize: '28px', 
            fontWeight: '300', 
            color: '#0a1929', 
            marginBottom: '16px',
            letterSpacing: '1px',
            fontFamily: "'Montserrat', sans-serif"
          }}>
            Payment Confirmed
          </h2>
          <p style={{ 
            color: '#5a6c7d', 
            marginBottom: '40px', 
            fontSize: '16px',
            lineHeight: '1.6',
            fontWeight: '300'
          }}>
            Your tickets for <strong>{currentEvent.name}</strong> have been confirmed. A confirmation email has been sent to your inbox.
          </p>
          <button
            onClick={() => setSuccess(false)}
            style={{
              background: '#c9a55a',
              color: 'white',
              padding: '14px 32px',
              borderRadius: '2px',
              fontWeight: '400',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              transition: 'all 0.3s ease',
              fontFamily: "'Montserrat', sans-serif"
            }}
            onMouseOver={(e) => e.target.style.background = '#b89550'}
            onMouseOut={(e) => e.target.style.background = '#c9a55a'}
          >
            Purchase More Tickets
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a1929 0%, #1a2332 100%)',
      padding: '60px 20px',
      fontFamily: "'Montserrat', -apple-system, sans-serif"
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* Logo y Header */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
            <img 
              src="https://i.imgur.com/hgetnWp.png" 
              alt="Logo" 
              style={{
                width: '140px',
                height: '140px',
                objectFit: 'contain'
              }}
            />
          </div>
          <h1 style={{
            fontSize: '48px',
            fontWeight: '300',
            color: '#ffffff',
            marginBottom: '16px',
            letterSpacing: '3px',
            fontFamily: "'Montserrat', sans-serif"
          }}>
            {currentEvent.name}
          </h1>
          <p style={{ 
            fontSize: '18px', 
            color: '#b0b8c1',
            fontWeight: '300',
            letterSpacing: '1px',
            marginBottom: '8px'
          }}>
            {currentEvent.subtitle}
          </p>
          <p style={{ 
            fontSize: '15px', 
            color: '#7a8a9a',
            fontWeight: '300',
            marginBottom: '24px'
          }}>
            {currentEvent.description}
          </p>
          <div style={{
            marginTop: '32px',
            display: 'inline-block',
            background: '#c9a55a',
            color: 'white',
            padding: '12px 32px',
            borderRadius: '2px',
            fontWeight: '400',
            fontSize: '16px',
            letterSpacing: '1px'
          }}>
            $500 USD per ticket
          </div>
        </div>

        {/* Formulario */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.98)',
          borderRadius: '4px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          padding: '50px'
        }}>
          {error && (
            <div style={{
              marginBottom: '32px',
              background: '#fee',
              border: '1px solid #fcc',
              color: '#c33',
              padding: '16px 20px',
              borderRadius: '2px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: '40px' }}>
            <h3 style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#0a1929',
              marginBottom: '24px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              borderBottom: '1px solid #e0e0e0',
              paddingBottom: '12px'
            }}>
              Personal Information
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '13px', 
                  fontWeight: '500', 
                  color: '#5a6c7d', 
                  marginBottom: '8px',
                  letterSpacing: '0.5px'
                }}>
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  placeholder="John"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #d0d7de',
                    borderRadius: '2px',
                    fontSize: '15px',
                    outline: 'none',
                    fontFamily: "'Montserrat', sans-serif",
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#c9a55a'}
                  onBlur={(e) => e.target.style.borderColor = '#d0d7de'}
                />
              </div>
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '13px', 
                  fontWeight: '500', 
                  color: '#5a6c7d', 
                  marginBottom: '8px',
                  letterSpacing: '0.5px'
                }}>
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  placeholder="Doe"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #d0d7de',
                    borderRadius: '2px',
                    fontSize: '15px',
                    outline: 'none',
                    fontFamily: "'Montserrat', sans-serif",
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#c9a55a'}
                  onBlur={(e) => e.target.style.borderColor = '#d0d7de'}
                />
              </div>
            </div>
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '13px', 
                fontWeight: '500', 
                color: '#5a6c7d', 
                marginBottom: '8px',
                letterSpacing: '0.5px'
              }}>
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="john@example.com"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #d0d7de',
                  borderRadius: '2px',
                  fontSize: '15px',
                  outline: 'none',
                  fontFamily: "'Montserrat', sans-serif",
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#c9a55a'}
                onBlur={(e) => e.target.style.borderColor = '#d0d7de'}
              />
            </div>
          </div>

          <div style={{ marginBottom: '40px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '13px', 
              fontWeight: '500', 
              color: '#5a6c7d', 
              marginBottom: '8px',
              letterSpacing: '0.5px'
            }}>
              Number of Guests
            </label>
            <input
              type="number"
              name="guests"
              value={formData.guests}
              onChange={handleChange}
              min="1"
              max="20"
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #d0d7de',
                borderRadius: '2px',
                fontSize: '15px',
                outline: 'none',
                fontFamily: "'Montserrat', sans-serif",
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#c9a55a'}
              onBlur={(e) => e.target.style.borderColor = '#d0d7de'}
            />
            <div style={{
              marginTop: '16px',
              background: '#f8f9fa',
              borderRadius: '2px',
              padding: '20px',
              border: '1px solid #e0e0e0'
            }}>
              <p style={{ 
                fontSize: '16px', 
                fontWeight: '400', 
                color: '#0a1929',
                margin: 0
              }}>
                Total Amount: <span style={{ 
                  color: '#c9a55a', 
                  fontWeight: '600',
                  fontSize: '20px'
                }}>${totalAmount.toFixed(2)} USD</span>
              </p>
            </div>
          </div>

          <div style={{ marginBottom: '40px' }}>
            <h3 style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#0a1929',
              marginBottom: '24px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              borderBottom: '1px solid #e0e0e0',
              paddingBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <CreditCard size={18} />
              Payment Information
            </h3>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '13px', 
                fontWeight: '500', 
                color: '#5a6c7d', 
                marginBottom: '8px',
                letterSpacing: '0.5px'
              }}>
                Card Number
              </label>
              <input
                type="text"
                name="cardNumber"
                value={formData.cardNumber}
                onChange={handleChange}
                required
                maxLength="16"
                placeholder="1234567890123456"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #d0d7de',
                  borderRadius: '2px',
                  fontSize: '15px',
                  outline: 'none',
                  fontFamily: "'Montserrat', sans-serif",
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#c9a55a'}
                onBlur={(e) => e.target.style.borderColor = '#d0d7de'}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '13px', 
                  fontWeight: '500', 
                  color: '#5a6c7d', 
                  marginBottom: '8px',
                  letterSpacing: '0.5px'
                }}>
                  Expiration (MMYY)
                </label>
                <input
                  type="text"
                  name="expDate"
                  value={formData.expDate}
                  onChange={handleChange}
                  required
                  maxLength="4"
                  placeholder="1225"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #d0d7de',
                    borderRadius: '2px',
                    fontSize: '15px',
                    outline: 'none',
                    fontFamily: "'Montserrat', sans-serif",
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#c9a55a'}
                  onBlur={(e) => e.target.style.borderColor = '#d0d7de'}
                />
              </div>
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '13px', 
                  fontWeight: '500', 
                  color: '#5a6c7d', 
                  marginBottom: '8px',
                  letterSpacing: '0.5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Lock size={14} />
                  CVV
                </label>
                <input
                  type="text"
                  name="cvv"
                  value={formData.cvv}
                  onChange={handleChange}
                  required
                  maxLength="4"
                  placeholder="123"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #d0d7de',
                    borderRadius: '2px',
                    fontSize: '15px',
                    outline: 'none',
                    fontFamily: "'Montserrat', sans-serif",
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#c9a55a'}
                  onBlur={(e) => e.target.style.borderColor = '#d0d7de'}
                />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '40px' }}>
            <h3 style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#0a1929',
              marginBottom: '24px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              borderBottom: '1px solid #e0e0e0',
              paddingBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <MapPin size={18} />
              Billing Address
            </h3>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '13px', 
                fontWeight: '500', 
                color: '#5a6c7d', 
                marginBottom: '8px',
                letterSpacing: '0.5px'
              }}>
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                placeholder="123 Main St"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #d0d7de',
                  borderRadius: '2px',
                  fontSize: '15px',
                  outline: 'none',
                  fontFamily: "'Montserrat', sans-serif",
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#c9a55a'}
                onBlur={(e) => e.target.style.borderColor = '#d0d7de'}
              />
            </div>
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '13px', 
                fontWeight: '500', 
                color: '#5a6c7d', 
                marginBottom: '8px',
                letterSpacing: '0.5px'
              }}>
                ZIP Code
              </label>
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                required
                placeholder="12345"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #d0d7de',
                  borderRadius: '2px',
                  fontSize: '15px',
                  outline: 'none',
                  fontFamily: "'Montserrat', sans-serif",
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#c9a55a'}
                onBlur={(e) => e.target.style.borderColor = '#d0d7de'}
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: '100%',
              background: loading ? '#999' : '#c9a55a',
              color: 'white',
              padding: '16px',
              borderRadius: '2px',
              fontWeight: '500',
              fontSize: '14px',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 16px rgba(201, 165, 90, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              fontFamily: "'Montserrat', sans-serif",
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              if (!loading) e.target.style.background = '#b89550';
            }}
            onMouseOut={(e) => {
              if (!loading) e.target.style.background = '#c9a55a';
            }}
          >
            {loading ? (
              <>
                <div style={{
                  border: '2px solid white',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  animation: 'spin 1s linear infinite'
                }}></div>
                Processing Payment...
              </>
            ) : (
              <>
                <Send size={18} />
                Complete Purchase — ${totalAmount.toFixed(2)} USD
              </>
            )}
          </button>

          <p style={{ 
            textAlign: 'center', 
            fontSize: '13px', 
            color: '#7a8a9a', 
            marginTop: '24px',
            fontWeight: '300',
            letterSpacing: '0.5px'
          }}>
            🔒 Your payment information is secure and encrypted
          </p>
        </div>
      </div>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600&display=swap');
          
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}