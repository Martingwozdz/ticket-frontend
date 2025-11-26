import React, { useState } from 'react';
import axios from 'axios';
import { Send, CreditCard, MapPin, Lock, Check, Calendar, AlertCircle, Phone } from 'lucide-react';

export default function OmakaseForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    guests: 1,
    reservationDate: '',
    reservationTime: '',
    allergies: '',
    specialRequests: '',
    cardNumber: '',
    expDate: '',
    cvv: '',
    zipCode: '',
    address: ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [availability, setAvailability] = useState(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  const PRICE_PER_PERSON = 330;
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

  // Horarios disponibles (19:30 - 21:30, intervalos de 30 minutos)
  const AVAILABLE_TIMES = [
    '19:30',
    '20:00',
    '20:30',
    '21:00',
    '21:30'
  ];

  const totalAmount = formData.guests * PRICE_PER_PERSON;

  // Función para verificar si una fecha es jueves (mejorada)
  const isThursday = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString + 'T00:00:00'); // Agregar hora para evitar problemas de timezone
    return date.getDay() === 4; // 4 = jueves
  };

  // Obtener la fecha mínima (mañana)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Si cambia la fecha, horario o cantidad de invitados, resetear availability
    if (name === 'reservationDate' || name === 'reservationTime' || name === 'guests') {
      setAvailability(null);
    }
  };

  // Verificar disponibilidad
  const checkAvailability = async () => {
    if (!formData.reservationDate || !formData.reservationTime || !formData.guests) {
      setError('Please select a date, time, and number of guests');
      return;
    }

    setCheckingAvailability(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/api/omakase/availability`, {
        reservationDate: formData.reservationDate,
        reservationTime: formData.reservationTime,
        guests: parseInt(formData.guests)
      });

      setAvailability(response.data);
      
      if (!response.data.available) {
        setError(response.data.reason || 'Not available for this date and time');
      }
    } catch (err) {
      setError('Error checking availability');
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!availability || !availability.available) {
      setError('Please check availability first');
      return;
    }

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

      // 2. Crear reserva
      const reservationResponse = await axios.post(`${API_URL}/api/omakase/create`, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        guests: parseInt(formData.guests),
        reservationDate: formData.reservationDate,
        reservationTime: formData.reservationTime,
        allergies: formData.allergies,
        specialRequests: formData.specialRequests,
        paymentNumber: paymentResponse.data.numeroAutorizacion,
        tokenAuth: paymentResponse.data.tokenAuth,
        complianceData: paymentResponse.data.complianceData
      });

      if (reservationResponse.status === 201) {
        setSuccess(true);
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          guests: 1,
          reservationDate: '',
          reservationTime: '',
          allergies: '',
          specialRequests: '',
          cardNumber: '',
          expDate: '',
          cvv: '',
          zipCode: '',
          address: ''
        });
        setAvailability(null);
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
        background: 'linear-gradient(135deg, #f5f3ef 0%, #e8e5df 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        fontFamily: "'Inter', -apple-system, sans-serif"
      }}>
        <div style={{
          maxWidth: '500px',
          width: '100%',
          background: 'linear-gradient(145deg, #ffffff 0%, #fafaf8 100%)',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(184, 149, 106, 0.1)',
          padding: '50px 40px',
          textAlign: 'center',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-50%',
            right: '-50%',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(184, 149, 106, 0.08) 0%, transparent 70%)',
            pointerEvents: 'none'
          }}></div>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #b8956a 0%, #9d7f57 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 25px',
            boxShadow: '0 8px 24px rgba(184, 149, 106, 0.35)',
            position: 'relative',
            zIndex: 1
          }}>
            <Check size={40} color="#fff" strokeWidth={2.5} />
          </div>
          <h2 style={{ 
            fontSize: '38px', 
            fontWeight: '500', 
            color: '#2c2c2c', 
            marginBottom: '16px',
            letterSpacing: '0px',
            fontFamily: "'Cormorant Garamond', serif",
            position: 'relative',
            zIndex: 1
          }}>
            Reservation Confirmed
          </h2>
          <p style={{ 
            color: '#6b6b6b', 
            marginBottom: '35px', 
            fontSize: '15px',
            lineHeight: '1.6',
            fontWeight: '400',
            position: 'relative',
            zIndex: 1
          }}>
            Your Omakase experience at <strong style={{ color: '#b8956a' }}>Ikigai</strong> has been confirmed. A confirmation email has been sent to your inbox.
          </p>
          <button
            onClick={() => setSuccess(false)}
            style={{
              background: 'linear-gradient(135deg, #2c2c2c 0%, #1a1a1a 100%)',
              color: 'white',
              padding: '14px 35px',
              borderRadius: '8px',
              fontWeight: '500',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              letterSpacing: '0.3px',
              transition: 'all 0.3s ease',
              fontFamily: "'Inter', sans-serif",
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
              position: 'relative',
              zIndex: 1
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.25)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.2)';
            }}
          >
            Make Another Reservation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f3ef 0%, #e8e5df 100%)',
      padding: '60px 20px',
      fontFamily: "'Inter', -apple-system, sans-serif"
    }}>
      <div style={{ maxWidth: '850px', margin: '0 auto' }}>
        
        {/* CAJA UNIFICADA */}
        <div style={{
          background: 'linear-gradient(145deg, #ffffff 0%, #fafaf8 100%)',
          borderRadius: '20px',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(184, 149, 106, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          position: 'relative'
        }}>
          
          {/* Efecto de luz superior */}
          <div style={{
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            height: '300px',
            background: 'radial-gradient(ellipse at top, rgba(184, 149, 106, 0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
            zIndex: 0
          }}></div>

          {/* LOGO Y HEADER */}
          <div style={{ 
            textAlign: 'center', 
            padding: '50px 50px 40px',
            position: 'relative',
            zIndex: 1
          }}>
            {/* Logo de Biras */}
            <div style={{ 
              display: 'inline-block',
              background: '#ffffff',
              padding: '25px 35px',
              borderRadius: '12px',
              marginBottom: '30px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(184, 149, 106, 0.1)',
              border: '1px solid rgba(232, 229, 223, 0.5)'
            }}>
              <img 
                src={`${API_URL}/logo.png`}
                alt="Biras Creek Resort"
                style={{
                  maxWidth: '180px',
                  width: '100%',
                  height: 'auto',
                  objectFit: 'contain',
                  display: 'block'
                }}
              />
            </div>

            <p style={{ 
              fontSize: '11px', 
              color: '#b8956a',
              fontWeight: '600',
              letterSpacing: '2.5px',
              marginBottom: '12px',
              textTransform: 'uppercase'
            }}>
              Omakase Experience
            </p>
            
            <h1 style={{
              fontSize: '56px',
              fontWeight: '500',
              color: '#2c2c2c',
              marginBottom: '8px',
              letterSpacing: '0px',
              fontFamily: "'Cormorant Garamond', serif"
            }}>
              Ikigai Omakase
            </h1>

            <p style={{ 
              fontSize: '24px', 
              color: '#b8956a',
              fontWeight: '300',
              letterSpacing: '3px',
              marginBottom: '20px',
              fontFamily: "'Cormorant Garamond', serif"
            }}>
              生き甲斐
            </p>
            
            <p style={{ 
              fontSize: '15px', 
              color: '#6b6b6b',
              fontWeight: '400',
              lineHeight: '1.5',
              marginBottom: '25px',
              maxWidth: '600px',
              margin: '0 auto 25px'
            }}>
              An intimate 12-seat omakase bar featuring the finest Japanese-Caribbean fusion cuisine at Biras Creek Resort
            </p>
            
            <div style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #2c2c2c 0%, #1a1a1a 100%)',
              color: '#ffffff',
              padding: '12px 32px',
              borderRadius: '8px',
              fontWeight: '500',
              fontSize: '15px',
              letterSpacing: '0.3px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
              marginBottom: '20px'
            }}>
              $330 USD per person
            </div>

            <div style={{ 
              fontSize: '13px', 
              color: '#6b6b6b',
              fontWeight: '400',
              letterSpacing: '0.3px',
              lineHeight: '1.8',
              marginTop: '15px'
            }}>
              <p style={{ margin: '5px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span style={{ color: '#b8956a' }}>⏰</span> Omakase: 7:30 PM — 10:00 PM
              </p>
              <p style={{ margin: '5px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span style={{ color: '#b8956a' }}>👔</span> Dress Code: Elegant
              </p>
              <p style={{ margin: '5px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#999' }}>
                <span style={{ color: '#c53030' }}>🚫</span> Closed Thursdays & Holidays
              </p>
            </div>
          </div>

          {/* SEPARADOR SUTIL */}
          <div style={{
            height: '1px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(184, 149, 106, 0.2) 50%, transparent 100%)',
            margin: '0 50px'
          }}></div>

          {/* FORMULARIO */}
          <div style={{ padding: '40px 50px 50px' }}>
            
            {error && (
              <div style={{
                marginBottom: '30px',
                background: 'linear-gradient(135deg, #fff5f5 0%, #fee 100%)',
                border: '1px solid rgba(197, 48, 48, 0.3)',
                color: '#c53030',
                padding: '16px 20px',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '400',
                boxShadow: '0 4px 12px rgba(197, 48, 48, 0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <AlertCircle size={20} />
                {error}
              </div>
            )}

            {/* Sección de Fecha y Disponibilidad */}
            <div style={{ marginBottom: '35px' }}>
              <h3 style={{
                fontSize: '11px',
                fontWeight: '600',
                color: '#b8956a',
                marginBottom: '20px',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Calendar size={16} />
                Date, Time & Guests
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    color: '#6b6b6b', 
                    marginBottom: '10px',
                    letterSpacing: '0.3px'
                  }}>
                    Select Date
                  </label>
                  <input
                    type="date"
                    name="reservationDate"
                    value={formData.reservationDate}
                    onChange={handleChange}
                    min={getMinDate()}
                    required
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      border: '1px solid rgba(213, 208, 199, 0.5)',
                      borderRadius: '8px',
                      fontSize: '17px',
                      outline: 'none',
                      fontFamily: "'Inter', sans-serif",
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box',
                      background: 'rgba(250, 250, 248, 0.5)',
                      boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#b8956a';
                      e.target.style.background = '#ffffff';
                      e.target.style.boxShadow = '0 0 0 3px rgba(184, 149, 106, 0.1), inset 0 1px 3px rgba(0, 0, 0, 0.05)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(213, 208, 199, 0.5)';
                      e.target.style.background = 'rgba(250, 250, 248, 0.5)';
                      e.target.style.boxShadow = 'inset 0 1px 3px rgba(0, 0, 0, 0.05)';
                    }}
                  />
                  {/* ⭐ MENSAJE SOLO SI ES JUEVES */}
                  {formData.reservationDate && isThursday(formData.reservationDate) && (
                    <p style={{ 
                      color: '#c53030', 
                      fontSize: '13px', 
                      marginTop: '8px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '5px' 
                    }}>
                      <AlertCircle size={14} /> Closed on Thursdays
                    </p>
                  )}
                </div>
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    color: '#6b6b6b', 
                    marginBottom: '10px',
                    letterSpacing: '0.3px'
                  }}>
                    Select Time
                  </label>
                  <select
                    name="reservationTime"
                    value={formData.reservationTime}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      border: '1px solid rgba(213, 208, 199, 0.5)',
                      borderRadius: '8px',
                      fontSize: '17px',
                      outline: 'none',
                      fontFamily: "'Inter', sans-serif",
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box',
                      background: 'rgba(250, 250, 248, 0.5)',
                      boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)',
                      cursor: 'pointer'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#b8956a';
                      e.target.style.background = '#ffffff';
                      e.target.style.boxShadow = '0 0 0 3px rgba(184, 149, 106, 0.1), inset 0 1px 3px rgba(0, 0, 0, 0.05)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(213, 208, 199, 0.5)';
                      e.target.style.background = 'rgba(250, 250, 248, 0.5)';
                      e.target.style.boxShadow = 'inset 0 1px 3px rgba(0, 0, 0, 0.05)';
                    }}
                  >
                    <option value="">Choose a time</option>
                    {AVAILABLE_TIMES.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    color: '#6b6b6b', 
                    marginBottom: '10px',
                    letterSpacing: '0.3px'
                  }}>
                    Number of Guests
                  </label>
                  <input
                    type="number"
                    name="guests"
                    value={formData.guests}
                    onChange={handleChange}
                    min="1"
                    max="12"
                    required
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      border: '1px solid rgba(213, 208, 199, 0.5)',
                      borderRadius: '8px',
                      fontSize: '17px',
                      outline: 'none',
                      fontFamily: "'Inter', sans-serif",
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box',
                      background: 'rgba(250, 250, 248, 0.5)',
                      boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#b8956a';
                      e.target.style.background = '#ffffff';
                      e.target.style.boxShadow = '0 0 0 3px rgba(184, 149, 106, 0.1), inset 0 1px 3px rgba(0, 0, 0, 0.05)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(213, 208, 199, 0.5)';
                      e.target.style.background = 'rgba(250, 250, 248, 0.5)';
                      e.target.style.boxShadow = 'inset 0 1px 3px rgba(0, 0, 0, 0.05)';
                    }}
                  />
                </div>
              </div>

              <button
                onClick={checkAvailability}
                disabled={!formData.reservationDate || !formData.reservationTime || !formData.guests || checkingAvailability}
                style={{
                  background: checkingAvailability ? 'linear-gradient(135deg, #999 0%, #777 100%)' : 'linear-gradient(135deg, #b8956a 0%, #9d7f57 100%)',
                  color: 'white',
                  padding: '14px 28px',
                  borderRadius: '8px',
                  fontWeight: '500',
                  fontSize: '14px',
                  border: 'none',
                  cursor: checkingAvailability ? 'not-allowed' : 'pointer',
                  letterSpacing: '0.3px',
                  fontFamily: "'Inter', sans-serif",
                  transition: 'all 0.3s ease',
                  marginBottom: '20px',
                  boxShadow: '0 4px 12px rgba(184, 149, 106, 0.3)'
                }}
                onMouseOver={(e) => {
                  if (!checkingAvailability && formData.reservationDate && formData.reservationTime && formData.guests) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 16px rgba(184, 149, 106, 0.4)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!checkingAvailability) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 12px rgba(184, 149, 106, 0.3)';
                  }
                }}
              >
                {checkingAvailability ? 'Checking...' : 'Check Availability'}
              </button>

              {availability && (
                <div style={{
                  padding: '20px',
                  background: availability.available 
                    ? 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)' 
                    : 'linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%)',
                  border: `1px solid ${availability.available ? 'rgba(40, 167, 69, 0.3)' : 'rgba(220, 53, 69, 0.3)'}`,
                  borderRadius: '10px',
                  color: availability.available ? '#155724' : '#721c24',
                  marginBottom: '20px',
                  boxShadow: availability.available 
                    ? '0 4px 12px rgba(40, 167, 69, 0.1)' 
                    : '0 4px 12px rgba(220, 53, 69, 0.1)'
                }}>
                  {availability.available ? (
                    <>
                      <p style={{ margin: 0, fontWeight: '600', fontSize: '15px' }}>✅ Available!</p>
                      <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
                        {availability.seatsLeft} seats remaining for this date
                      </p>
                    </>
                  ) : (
                    <>
                      <p style={{ margin: 0, fontWeight: '600', fontSize: '15px' }}>❌ Not Available</p>
                      <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
                        {availability.reason}
                      </p>
                    </>
                  )}
                </div>
              )}

              <div style={{
                background: 'linear-gradient(135deg, rgba(184, 149, 106, 0.08) 0%, rgba(184, 149, 106, 0.04) 100%)',
                borderRadius: '10px',
                padding: '24px',
                border: '1px solid rgba(184, 149, 106, 0.15)',
                boxShadow: 'inset 0 1px 2px rgba(184, 149, 106, 0.1)'
              }}>
                <p style={{ 
                  fontSize: '17px', 
                  fontWeight: '400', 
                  color: '#6b6b6b',
                  margin: 0
                }}>
                  Total Amount: <span style={{ 
                    color: '#b8956a', 
                    fontWeight: '600',
                    fontSize: '34px',
                    fontFamily: "'Inter', sans-serif",
                    marginLeft: '8px'
                  }}>${totalAmount.toFixed(2)}</span> <span style={{ fontSize: '14px', color: '#999' }}>USD</span>
                </p>
                <p style={{ fontSize: '14px', color: '#999', margin: '8px 0 0 0' }}>
                  {formData.guests} guest{formData.guests !== 1 ? 's' : ''} × $330 USD
                </p>
              </div>
            </div>

            {/* Resto del formulario - información personal, alergias, pago, etc. */}
            {/* (El resto del código continúa igual...) */}
            
            {/* Información Personal */}
            <div style={{ marginBottom: '35px' }}>
              <h3 style={{
                fontSize: '11px',
                fontWeight: '600',
                color: '#b8956a',
                marginBottom: '20px',
                letterSpacing: '2px',
                textTransform: 'uppercase'
              }}>
                Guest Information
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    color: '#6b6b6b', 
                    marginBottom: '10px',
                    letterSpacing: '0.3px'
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
                      padding: '16px 20px',
                      border: '1px solid rgba(213, 208, 199, 0.5)',
                      borderRadius: '8px',
                      fontSize: '17px',
                      outline: 'none',
                      fontFamily: "'Inter', sans-serif",
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box',
                      background: 'rgba(250, 250, 248, 0.5)',
                      boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#b8956a';
                      e.target.style.background = '#ffffff';
                      e.target.style.boxShadow = '0 0 0 3px rgba(184, 149, 106, 0.1), inset 0 1px 3px rgba(0, 0, 0, 0.05)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(213, 208, 199, 0.5)';
                      e.target.style.background = 'rgba(250, 250, 248, 0.5)';
                      e.target.style.boxShadow = 'inset 0 1px 3px rgba(0, 0, 0, 0.05)';
                    }}
                  />
                </div>
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    color: '#6b6b6b', 
                    marginBottom: '10px',
                    letterSpacing: '0.3px'
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
                      padding: '16px 20px',
                      border: '1px solid rgba(213, 208, 199, 0.5)',
                      borderRadius: '8px',
                      fontSize: '17px',
                      outline: 'none',
                      fontFamily: "'Inter', sans-serif",
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box',
                      background: 'rgba(250, 250, 248, 0.5)',
                      boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#b8956a';
                      e.target.style.background = '#ffffff';
                      e.target.style.boxShadow = '0 0 0 3px rgba(184, 149, 106, 0.1), inset 0 1px 3px rgba(0, 0, 0, 0.05)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(213, 208, 199, 0.5)';
                      e.target.style.background = 'rgba(250, 250, 248, 0.5)';
                      e.target.style.boxShadow = 'inset 0 1px 3px rgba(0, 0, 0, 0.05)';
                    }}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    color: '#6b6b6b', 
                    marginBottom: '10px',
                    letterSpacing: '0.3px'
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
                      padding: '16px 20px',
                      border: '1px solid rgba(213, 208, 199, 0.5)',
                      borderRadius: '8px',
                      fontSize: '17px',
                      outline: 'none',
                      fontFamily: "'Inter', sans-serif",
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box',
                      background: 'rgba(250, 250, 248, 0.5)',
                      boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#b8956a';
                      e.target.style.background = '#ffffff';
                      e.target.style.boxShadow = '0 0 0 3px rgba(184, 149, 106, 0.1), inset 0 1px 3px rgba(0, 0, 0, 0.05)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(213, 208, 199, 0.5)';
                      e.target.style.background = 'rgba(250, 250, 248, 0.5)';
                      e.target.style.boxShadow = 'inset 0 1px 3px rgba(0, 0, 0, 0.05)';
                    }}
                  />
                </div>
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    color: '#6b6b6b', 
                    marginBottom: '10px',
                    letterSpacing: '0.3px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}>
                    <Phone size={14} />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="+1 (234) 567-8900"
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      border: '1px solid rgba(213, 208, 199, 0.5)',
                      borderRadius: '8px',
                      fontSize: '17px',
                      outline: 'none',
                      fontFamily: "'Inter', sans-serif",
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box',
                      background: 'rgba(250, 250, 248, 0.5)',
                      boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#b8956a';
                      e.target.style.background = '#ffffff';
                      e.target.style.boxShadow = '0 0 0 3px rgba(184, 149, 106, 0.1), inset 0 1px 3px rgba(0, 0, 0, 0.05)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(213, 208, 199, 0.5)';
                      e.target.style.background = 'rgba(250, 250, 248, 0.5)';
                      e.target.style.boxShadow = 'inset 0 1px 3px rgba(0, 0, 0, 0.05)';
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Alergias y Special Requests */}
            <div style={{ marginBottom: '35px' }}>
              <h3 style={{
                fontSize: '11px',
                fontWeight: '600',
                color: '#b8956a',
                marginBottom: '20px',
                letterSpacing: '2px',
                textTransform: 'uppercase'
              }}>
                Dietary Preferences
              </h3>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: '#6b6b6b', 
                  marginBottom: '10px',
                  letterSpacing: '0.3px'
                }}>
                  Allergies or Dietary Restrictions
                </label>
                <textarea
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleChange}
                  placeholder="Please list any allergies or dietary restrictions..."
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    border: '1px solid rgba(213, 208, 199, 0.5)',
                    borderRadius: '8px',
                    fontSize: '17px',
                    outline: 'none',
                    fontFamily: "'Inter', sans-serif",
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box',
                    background: 'rgba(250, 250, 248, 0.5)',
                    boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)',
                    resize: 'vertical'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#b8956a';
                    e.target.style.background = '#ffffff';
                    e.target.style.boxShadow = '0 0 0 3px rgba(184, 149, 106, 0.1), inset 0 1px 3px rgba(0, 0, 0, 0.05)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(213, 208, 199, 0.5)';
                    e.target.style.background = 'rgba(250, 250, 248, 0.5)';
                    e.target.style.boxShadow = 'inset 0 1px 3px rgba(0, 0, 0, 0.05)';
                  }}
                />
              </div>
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: '#6b6b6b', 
                  marginBottom: '10px',
                  letterSpacing: '0.3px'
                }}>
                  Special Requests (Optional)
                </label>
                <textarea
                  name="specialRequests"
                  value={formData.specialRequests}
                  onChange={handleChange}
                  placeholder="Any special occasions or preferences..."
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    border: '1px solid rgba(213, 208, 199, 0.5)',
                    borderRadius: '8px',
                    fontSize: '17px',
                    outline: 'none',
                    fontFamily: "'Inter', sans-serif",
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box',
                    background: 'rgba(250, 250, 248, 0.5)',
                    boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)',
                    resize: 'vertical'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#b8956a';
                    e.target.style.background = '#ffffff';
                    e.target.style.boxShadow = '0 0 0 3px rgba(184, 149, 106, 0.1), inset 0 1px 3px rgba(0, 0, 0, 0.05)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(213, 208, 199, 0.5)';
                    e.target.style.background = 'rgba(250, 250, 248, 0.5)';
                    e.target.style.boxShadow = 'inset 0 1px 3px rgba(0, 0, 0, 0.05)';
                  }}
                />
              </div>
            </div>

            {/* Información de Pago */}
            <div style={{ marginBottom: '35px' }}>
              <h3 style={{
                fontSize: '11px',
                fontWeight: '600',
                color: '#b8956a',
                marginBottom: '20px',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <CreditCard size={16} />
                Payment Information
              </h3>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: '#6b6b6b', 
                  marginBottom: '10px',
                  letterSpacing: '0.3px'
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
                    padding: '16px 20px',
                    border: '1px solid rgba(213, 208, 199, 0.5)',
                    borderRadius: '8px',
                    fontSize: '17px',
                    outline: 'none',
                    fontFamily: "'Inter', sans-serif",
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box',
                    background: 'rgba(250, 250, 248, 0.5)',
                    boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#b8956a';
                    e.target.style.background = '#ffffff';
                    e.target.style.boxShadow = '0 0 0 3px rgba(184, 149, 106, 0.1), inset 0 1px 3px rgba(0, 0, 0, 0.05)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(213, 208, 199, 0.5)';
                    e.target.style.background = 'rgba(250, 250, 248, 0.5)';
                    e.target.style.boxShadow = 'inset 0 1px 3px rgba(0, 0, 0, 0.05)';
                  }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    color: '#6b6b6b', 
                    marginBottom: '10px',
                    letterSpacing: '0.3px'
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
                      padding: '16px 20px',
                      border: '1px solid rgba(213, 208, 199, 0.5)',
                      borderRadius: '8px',
                      fontSize: '17px',
                      outline: 'none',
                      fontFamily: "'Inter', sans-serif",
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box',
                      background: 'rgba(250, 250, 248, 0.5)',
                      boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#b8956a';
                      e.target.style.background = '#ffffff';
                      e.target.style.boxShadow = '0 0 0 3px rgba(184, 149, 106, 0.1), inset 0 1px 3px rgba(0, 0, 0, 0.05)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(213, 208, 199, 0.5)';
                      e.target.style.background = 'rgba(250, 250, 248, 0.5)';
                      e.target.style.boxShadow = 'inset 0 1px 3px rgba(0, 0, 0, 0.05)';
                    }}
                  />
                </div>
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    color: '#6b6b6b', 
                    marginBottom: '10px',
                    letterSpacing: '0.3px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
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
                      padding: '16px 20px',
                      border: '1px solid rgba(213, 208, 199, 0.5)',
                      borderRadius: '8px',
                      fontSize: '17px',
                      outline: 'none',
                      fontFamily: "'Inter', sans-serif",
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box',
                      background: 'rgba(250, 250, 248, 0.5)',
                      boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#b8956a';
                      e.target.style.background = '#ffffff';
                      e.target.style.boxShadow = '0 0 0 3px rgba(184, 149, 106, 0.1), inset 0 1px 3px rgba(0, 0, 0, 0.05)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(213, 208, 199, 0.5)';
                      e.target.style.background = 'rgba(250, 250, 248, 0.5)';
                      e.target.style.boxShadow = 'inset 0 1px 3px rgba(0, 0, 0, 0.05)';
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Dirección de Facturación */}
            <div style={{ marginBottom: '35px' }}>
              <h3 style={{
                fontSize: '11px',
                fontWeight: '600',
                color: '#b8956a',
                marginBottom: '20px',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <MapPin size={16} />
                Billing Address
              </h3>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: '#6b6b6b', 
                  marginBottom: '10px',
                  letterSpacing: '0.3px'
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
                    padding: '16px 20px',
                    border: '1px solid rgba(213, 208, 199, 0.5)',
                    borderRadius: '8px',
                    fontSize: '17px',
                    outline: 'none',
                    fontFamily: "'Inter', sans-serif",
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box',
                    background: 'rgba(250, 250, 248, 0.5)',
                    boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#b8956a';
                    e.target.style.background = '#ffffff';
                    e.target.style.boxShadow = '0 0 0 3px rgba(184, 149, 106, 0.1), inset 0 1px 3px rgba(0, 0, 0, 0.05)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(213, 208, 199, 0.5)';
                    e.target.style.background = 'rgba(250, 250, 248, 0.5)';
                    e.target.style.boxShadow = 'inset 0 1px 3px rgba(0, 0, 0, 0.05)';
                  }}
                />
              </div>
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: '#6b6b6b', 
                  marginBottom: '10px',
                  letterSpacing: '0.3px'
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
                    padding: '16px 20px',
                    border: '1px solid rgba(213, 208, 199, 0.5)',
                    borderRadius: '8px',
                    fontSize: '17px',
                    outline: 'none',
                    fontFamily: "'Inter', sans-serif",
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box',
                    background: 'rgba(250, 250, 248, 0.5)',
                    boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#b8956a';
                    e.target.style.background = '#ffffff';
                    e.target.style.boxShadow = '0 0 0 3px rgba(184, 149, 106, 0.1), inset 0 1px 3px rgba(0, 0, 0, 0.05)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(213, 208, 199, 0.5)';
                    e.target.style.background = 'rgba(250, 250, 248, 0.5)';
                    e.target.style.boxShadow = 'inset 0 1px 3px rgba(0, 0, 0, 0.05)';
                  }}
                />
              </div>
            </div>

            {/* Botón de Envío */}
            <button
              onClick={handleSubmit}
              disabled={loading || !availability || !availability.available}
              style={{
                width: '100%',
                background: (loading || !availability || !availability.available) 
                  ? 'linear-gradient(135deg, #999 0%, #777 100%)' 
                  : 'linear-gradient(135deg, #2c2c2c 0%, #1a1a1a 100%)',
                color: 'white',
                padding: '18px',
                borderRadius: '10px',
                fontWeight: '500',
                fontSize: '16px',
                border: 'none',
                cursor: (loading || !availability || !availability.available) ? 'not-allowed' : 'pointer',
                boxShadow: (loading || !availability || !availability.available) 
                  ? 'none' 
                  : '0 8px 24px rgba(0, 0, 0, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                letterSpacing: '0.3px',
                fontFamily: "'Inter', sans-serif",
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                if (!loading && availability && availability.available) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.25)';
                }
              }}
              onMouseOut={(e) => {
                if (!loading && availability && availability.available) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.2)';
                }
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
                  Confirm Reservation — ${totalAmount.toFixed(2)} USD
                </>
              )}
            </button>

            <p style={{ 
              textAlign: 'center', 
              fontSize: '12px', 
              color: '#999', 
              marginTop: '20px',
              fontWeight: '400',
              letterSpacing: '0.3px'
            }}>
              🔒 Your payment information is secure and encrypted
            </p>
          </div>
        </div>
      </div>
      
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Cormorant+Garamond:wght@300;400;500;600;700&display=swap');
          
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}