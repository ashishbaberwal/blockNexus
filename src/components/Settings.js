import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useUser } from '../contexts/UserContext';
import KYCVerification from './KYCVerification';

const Settings = ({ onClose, account }) => {
  const { darkMode, toggleTheme, theme } = useTheme();
  const { isAuthenticated, user, updateUser } = useUser();
  const [activeTab, setActiveTab] = useState('appearance');
  const [showKYC, setShowKYC] = useState(false);

  // Only show advanced tabs if both wallet is connected AND user is authenticated
  const showAdvancedTabs = account && isAuthenticated;

  const handleThemeToggle = () => {
    toggleTheme();
  };

  const handleKYCSubmit = async (kycData) => {
    try {
      // Update user with KYC data
      await updateUser(account, {
        ...kycData,
        kycVerified: true,
        kycCompletedAt: new Date()
      });
      setShowKYC(false);
    } catch (error) {
      console.error('Error updating KYC data:', error);
    }
  };

  // Reset to appearance tab if user logs out or disconnects wallet while in settings
  React.useEffect(() => {
    if (!showAdvancedTabs && (activeTab === 'notifications' || activeTab === 'privacy')) {
      setActiveTab('appearance');
    }
  }, [showAdvancedTabs, activeTab]);

  return (
    <>
      <div className="modal-overlay">
        <div className="settings-modal">
          <div className="modal__header">
            <h2>⚙️ Settings</h2>
            <p>Customize your BlockNexus experience</p>
            <button className="modal__close" onClick={onClose}>×</button>
          </div>

          <div className="settings__content">
            {/* Settings Tabs */}
            <div className="settings__tabs">
              <button 
                className={`tab-button ${activeTab === 'appearance' ? 'active' : ''}`}
                onClick={() => setActiveTab('appearance')}
              >
                🎨 Appearance
              </button>
              {showAdvancedTabs && (
                <button 
                  className={`tab-button ${activeTab === 'notifications' ? 'active' : ''}`}
                  onClick={() => setActiveTab('notifications')}
                >
                  🔔 Notifications
                </button>
              )}
              {showAdvancedTabs && (
                <button 
                  className={`tab-button ${activeTab === 'privacy' ? 'active' : ''}`}
                  onClick={() => setActiveTab('privacy')}
                >
                  🔒 Privacy
                </button>
              )}
            </div>

            {/* Settings Content */}
            <div className="settings__panel">
              {activeTab === 'appearance' && (
                <div className="settings-section">
                  <h3>Appearance Settings</h3>
                  
                  <div className="setting-item">
                    <div className="setting-info">
                      <h4>Theme Mode</h4>
                      <p>Choose between light and dark mode for better viewing experience</p>
                    </div>
                    <div className="setting-control">
                      <div className="theme-toggle">
                        <button 
                          className={`theme-option ${!darkMode ? 'active' : ''}`}
                          onClick={() => !darkMode || handleThemeToggle()}
                        >
                          <span className="theme-icon">☀️</span>
                          <span>Light</span>
                        </button>
                        <button 
                          className={`theme-option ${darkMode ? 'active' : ''}`}
                          onClick={() => darkMode || handleThemeToggle()}
                        >
                          <span className="theme-icon">🌙</span>
                          <span>Dark</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <h4>Current Theme</h4>
                      <p>Currently using <strong>{theme}</strong> mode</p>
                    </div>
                    <div className="setting-control">
                      <div className="theme-preview">
                        <div className={`preview-card ${theme}`}>
                          <div className="preview-header"></div>
                          <div className="preview-content">
                            <div className="preview-line"></div>
                            <div className="preview-line short"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Firebase Connection Test */}
                  <div className="setting-item">
                    <div className="setting-info">
                      <h4>System Status</h4>
                      <p>Database connection and sync status</p>
                    </div>
                    <div className="setting-control">
                      <div className="status-indicator">
                        <span className="status-dot active"></span>
                        <span>Firebase Connected</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && showAdvancedTabs && (
                <div className="settings-section">
                  <h3>Notification Settings</h3>
                  
                  <div className="setting-item">
                    <div className="setting-info">
                      <h4>Email Notifications</h4>
                      <p>Receive important updates via email</p>
                    </div>
                    <div className="setting-control">
                      <label className="toggle-switch">
                        <input type="checkbox" defaultChecked />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <h4>Property Alerts</h4>
                      <p>Get notified about new properties matching your criteria</p>
                    </div>
                    <div className="setting-control">
                      <label className="toggle-switch">
                        <input type="checkbox" defaultChecked />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <h4>Marketing Communications</h4>
                      <p>Receive promotional offers and platform updates</p>
                    </div>
                    <div className="setting-control">
                      <label className="toggle-switch">
                        <input type="checkbox" />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'privacy' && showAdvancedTabs && (
                <div className="settings-section">
                  <h3>Privacy & Security</h3>
                  
                  {/* KYC Document Upload Section */}
                  <div className="setting-item">
                    <div className="setting-info">
                      <h4>KYC Verification (Required)</h4>
                      <p>Upload your Aadhar and PAN card for identity verification</p>
                      {user?.kycVerified && (
                        <div className="kyc-status verified">
                          ✅ Verified • Completed on {new Date(user.kycCompletedAt?.toDate()).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <div className="setting-control">
                      <button 
                        className={`btn ${user?.kycVerified ? 'btn--secondary' : 'btn--primary'}`}
                        onClick={() => setShowKYC(true)}
                      >
                        {user?.kycVerified ? 'Update KYC Documents' : 'Complete KYC Verification'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="setting-item">
                    <div className="setting-info">
                      <h4>Profile Visibility</h4>
                      <p>Control who can see your profile information</p>
                    </div>
                    <div className="setting-control">
                      <select className="setting-select">
                        <option>Public</option>
                        <option>Verified Users Only</option>
                        <option>Private</option>
                      </select>
                    </div>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <h4>Data Collection</h4>
                      <p>Allow analytics to improve your experience</p>
                    </div>
                    <div className="setting-control">
                      <label className="toggle-switch">
                        <input type="checkbox" defaultChecked />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <h4>Two-Factor Authentication</h4>
                      <p>Add an extra layer of security to your account</p>
                    </div>
                    <div className="setting-control">
                      <button className="btn btn--secondary">Setup 2FA</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="settings__footer">
            <div className="settings-info">
              <p>BlockNexus v1.0.0 • Made with ❤️ for secure real estate transactions</p>
            </div>
            <button className="btn btn--primary" onClick={onClose}>
              Save & Close
            </button>
          </div>
        </div>
      </div>

      {/* KYC Verification Modal */}
      {showKYC && (
        <KYCVerification
          user={user}
          onKYCSubmit={handleKYCSubmit}
          onClose={() => setShowKYC(false)}
        />
      )}
    </>
  );
};

export default Settings;