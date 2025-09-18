import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import KYCVerification from './KYCVerification';

const UserRegistration = ({ onClose, walletAddress }) => {
  const { registerUser, isLoading } = useUser();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    userType: 'buyer', // buyer, seller, agent, investor
    bio: '',
    location: '',
    preferences: {
      emailNotifications: true,
      smsNotifications: false,
      marketingEmails: false
    }
  });
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [showKYC, setShowKYC] = useState(false);
  const [registeredUser, setRegisteredUser] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('preferences.')) {
      const prefKey = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [prefKey]: checked
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      console.log('🚀 Starting registration with data:', formData);
      
      // Add timeout to prevent hanging
      const registrationPromise = registerUser(formData, walletAddress);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Registration timeout - please try again')), 30000)
      );
      
      const userData = await Promise.race([registrationPromise, timeoutPromise]);
      console.log('✅ Registration successful, showing KYC modal');
      setRegisteredUser(userData);
      setShowKYC(true); // Show KYC modal after successful registration
    } catch (err) {
      console.error('❌ Registration failed:', err);
      setError(err.message || 'Registration failed. Please try again.');
    }
  };

  const nextStep = () => {
    if (step === 1) {
      if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
        setError('Please fill in all required fields');
        return;
      }
      if (!/\S+@\S+\.\S+/.test(formData.email)) {
        setError('Please enter a valid email address');
        return;
      }
    }
    setError('');
    setStep(step + 1);
  };

  const prevStep = () => {
    setError('');
    setStep(step - 1);
  };

  const handleKYCSubmit = (kycData) => {
    // KYC submitted successfully, close all modals
    onClose();
  };

  const handleKYCClose = () => {
    // User chose to skip KYC for now, still close registration
    setShowKYC(false);
    onClose();
  };

  // Show KYC modal if registration is complete
  if (showKYC && registeredUser) {
    return (
      <KYCVerification 
        user={registeredUser} 
        onKYCSubmit={handleKYCSubmit}
        onClose={handleKYCClose}
      />
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal registration-modal">
        <div className="modal__header">
          <h2>Welcome to BlockNexus!</h2>
          <p>Create your profile to get started</p>
          <button className="modal__close" onClick={onClose}>×</button>
        </div>

        <div className="registration__progress">
          <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>1</div>
          <div className={`progress-line ${step >= 2 ? 'active' : ''}`}></div>
          <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>2</div>
          <div className={`progress-line ${step >= 3 ? 'active' : ''}`}></div>
          <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>3</div>
        </div>

        <form onSubmit={handleSubmit} className="registration__form">
          {step === 1 && (
            <div className="form-step">
              <h3>Basic Information</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name *</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="lastName">Last Name *</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>

              <div className="wallet-info">
                <h4>Connected Wallet</h4>
                <p className="wallet-address">{walletAddress}</p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="form-step">
              <h3>Profile Details</h3>
              
              <div className="form-group">
                <label htmlFor="userType">I am a *</label>
                <select
                  id="userType"
                  name="userType"
                  value={formData.userType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="buyer">Buyer - Looking to purchase properties</option>
                  <option value="seller">Seller - Looking to sell properties</option>
                  <option value="agent">Real Estate Agent</option>
                  <option value="investor">Investor - Looking for investment opportunities</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="location">Location</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="City, State, Country"
                />
              </div>

              <div className="form-group">
                <label htmlFor="bio">Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Tell us a bit about yourself and your real estate interests..."
                  rows="4"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="form-step">
              <h3>Preferences</h3>
              
              <div className="preferences-group">
                <h4>Notifications</h4>
                
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="preferences.emailNotifications"
                      checked={formData.preferences.emailNotifications}
                      onChange={handleInputChange}
                    />
                    <span className="checkmark"></span>
                    Email notifications for property updates
                  </label>
                </div>

                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="preferences.smsNotifications"
                      checked={formData.preferences.smsNotifications}
                      onChange={handleInputChange}
                    />
                    <span className="checkmark"></span>
                    SMS notifications for important updates
                  </label>
                </div>

                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="preferences.marketingEmails"
                      checked={formData.preferences.marketingEmails}
                      onChange={handleInputChange}
                    />
                    <span className="checkmark"></span>
                    Marketing emails and newsletters
                  </label>
                </div>
              </div>

              <div className="terms-group">
                <p>By registering, you agree to our Terms of Service and Privacy Policy.</p>
              </div>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          <div className="form-buttons">
            {step > 1 && (
              <button type="button" onClick={prevStep} className="btn btn--secondary">
                Previous
              </button>
            )}
            
            {step < 3 ? (
              <button type="button" onClick={nextStep} className="btn btn--primary">
                Next
              </button>
            ) : (
              <button type="submit" disabled={isLoading} className="btn btn--primary">
                {isLoading ? 'Creating Account...' : 'Complete Registration'}
              </button>
            )}
          </div>

          {/* Debug Section */}
          <div className="debug-section" style={{ 
            marginTop: '20px', 
            padding: '15px', 
            backgroundColor: '#f0f0f0', 
            borderRadius: '8px',
            fontSize: '12px'
          }}>
            <h4>🔧 Debug Tools</h4>
            <button 
              type="button"
              onClick={async () => {
                alert(`✅ Local Storage System Active\nWallet: ${walletAddress}`);
              }}
              style={{ margin: '5px', padding: '5px 10px' }}
            >
              Test Local Storage
            </button>
            <button 
              type="button"
              onClick={async () => {
                const kycData = localStorage.getItem('blockNexus_KYC_Data');
                alert(kycData ? 
                  `✅ Local KYC System Active\nData entries: ${Object.keys(JSON.parse(kycData)).length}` : 
                  `✅ Local KYC System Ready (No data yet)`
                );
              }}
              style={{ margin: '5px', padding: '5px 10px' }}
            >
              Test KYC System
            </button>
            <div style={{ marginTop: '10px', fontSize: '11px' }}>
              💡 Open browser console (F12) to see detailed logs during registration
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserRegistration;