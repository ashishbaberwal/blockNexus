import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import VerificationStatus from './VerificationStatus';

const UserProfile = ({ onClose, onNavigateHome }) => {
  const { user, updateUserProfile, logoutUser } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    userType: user?.userType || 'buyer',
    bio: user?.bio || '',
    location: user?.location || '',
    preferences: {
      emailNotifications: user?.preferences?.emailNotifications || true,
      smsNotifications: user?.preferences?.smsNotifications || false,
      marketingEmails: user?.preferences?.marketingEmails || false
    }
  });

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

  const handleSave = () => {
    updateUserProfile(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      userType: user?.userType || 'buyer',
      bio: user?.bio || '',
      location: user?.location || '',
      preferences: {
        emailNotifications: user?.preferences?.emailNotifications || true,
        smsNotifications: user?.preferences?.smsNotifications || false,
        marketingEmails: user?.preferences?.marketingEmails || false
      }
    });
    setIsEditing(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getUserTypeLabel = (type) => {
    const types = {
      buyer: 'Buyer',
      seller: 'Seller',
      agent: 'Real Estate Agent',
      investor: 'Investor'
    };
    return types[type] || type;
  };

  return (
    <div className="modal-overlay">
      <div className="modal profile-modal">
        <div className="modal__header">
          <h2>User Profile</h2>
          <button className="modal__close" onClick={onClose}>×</button>
        </div>

        <div className="profile__content">
          {/* Profile Header */}
          <div className="profile__header">
            <div className="profile__avatar">
              <div className="avatar">
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </div>
            </div>
            <div className="profile__basic">
              <h3>{user?.firstName} {user?.lastName}</h3>
              <p className="user-type">{getUserTypeLabel(user?.userType)}</p>
              <p className="wallet-address">
                <span className="label">Wallet:</span> 
                {user?.walletAddress}
              </p>
            </div>
            <div className="profile__actions">
              {!isEditing ? (
                <button onClick={() => setIsEditing(true)} className="btn btn--primary">
                  Edit Profile
                </button>
              ) : (
                <div className="edit-buttons">
                  <button onClick={handleSave} className="btn btn--primary">
                    Save Changes
                  </button>
                  <button onClick={handleCancel} className="btn btn--secondary">
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Verification Status */}
          <VerificationStatus walletAddress={user?.walletAddress} />

          {/* Profile Details */}
          <div className="profile__details">
            {!isEditing ? (
              /* View Mode */
              <div className="profile__view">
                <div className="detail-section">
                  <h4>Contact Information</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="label">Email:</span>
                      <span className="value">{user?.email}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Phone:</span>
                      <span className="value">{user?.phone || 'Not provided'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Location:</span>
                      <span className="value">{user?.location || 'Not provided'}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>About</h4>
                  <p className="bio">{user?.bio || 'No bio provided'}</p>
                </div>

                <div className="detail-section">
                  <h4>Notification Preferences</h4>
                  <div className="preferences-list">
                    <div className="preference-item">
                      <span className="preference-name">Email Notifications</span>
                      <span className={`preference-status ${user?.preferences?.emailNotifications ? 'enabled' : 'disabled'}`}>
                        {user?.preferences?.emailNotifications ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <div className="preference-item">
                      <span className="preference-name">SMS Notifications</span>
                      <span className={`preference-status ${user?.preferences?.smsNotifications ? 'enabled' : 'disabled'}`}>
                        {user?.preferences?.smsNotifications ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <div className="preference-item">
                      <span className="preference-name">Marketing Emails</span>
                      <span className={`preference-status ${user?.preferences?.marketingEmails ? 'enabled' : 'disabled'}`}>
                        {user?.preferences?.marketingEmails ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Account Information</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="label">Member Since:</span>
                      <span className="value">{formatDate(user?.registrationDate)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Last Login:</span>
                      <span className="value">{formatDate(user?.lastLogin)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Edit Mode */
              <div className="profile__edit">
                <form className="edit-form">
                  <div className="form-section">
                    <h4>Basic Information</h4>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="firstName">First Name</label>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="lastName">Last Name</label>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="email">Email Address</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
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

                    <div className="form-group">
                      <label htmlFor="userType">User Type</label>
                      <select
                        id="userType"
                        name="userType"
                        value={formData.userType}
                        onChange={handleInputChange}
                      >
                        <option value="buyer">Buyer</option>
                        <option value="seller">Seller</option>
                        <option value="agent">Real Estate Agent</option>
                        <option value="investor">Investor</option>
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
                        rows="4"
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                  </div>

                  <div className="form-section">
                    <h4>Notification Preferences</h4>
                    
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
                </form>
              </div>
            )}
          </div>

          {/* Profile Footer */}
          <div className="profile__footer">
            <button 
              onClick={() => {
                logoutUser(() => {
                  onClose(); // Close the profile modal
                  if (onNavigateHome) {
                    onNavigateHome(); // Navigate to home page
                  }
                });
              }} 
              className="btn btn--danger"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;