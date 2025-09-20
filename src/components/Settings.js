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
      console.log('KYC submitted with data:', kycData);
      
      // Create comprehensive KYC data
      const fullKYCData = {
        ...kycData,
        verificationStatus: 'approved',
        status: 'approved',
        submittedAt: new Date().toISOString(),
        approvedAt: new Date().toISOString(),
        walletAddress: account
      };
      
      // Save KYC data to localStorage with correct key
      localStorage.setItem('blockNexusKYC_' + account, JSON.stringify(fullKYCData));
      console.log('KYC data saved to localStorage with key: blockNexusKYC_' + account);
      
      // Update user with KYC data
      const updatedUser = {
        ...user,
        kycVerified: true,
        kycStatus: 'approved',
        kycCompletedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };
      
      // Save updated user to localStorage
      localStorage.setItem('blockNexusUser', JSON.stringify(updatedUser));
      console.log('User data updated with KYC verification');
      
      // Also update KYC status in the context
      if (window.updateKYCStatus) {
        window.updateKYCStatus('approved');
      }
      
      setShowKYC(false);
      window.alert('KYC verification completed successfully! You can now make purchases.');
      
      // Refresh the page to update the user context
      window.location.reload();
    } catch (error) {
      console.error('Error updating KYC data:', error);
      window.alert('Error updating KYC status. Please try again.');
    }
  };

  // Reset to appearance tab if user logs out or disconnects wallet while in settings
  useEffect(() => {
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
              <button 
                className={`tab-button ${activeTab === 'developer' ? 'active' : ''}`}
                onClick={() => setActiveTab('developer')}
              >
                🔧 Developer
              </button>
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

                  {/* System Status */}
                  <div className="setting-item">
                    <div className="setting-info">
                      <h4>System Status</h4>
                      <p>Local storage and system status</p>
                    </div>
                    <div className="setting-control">
                      <div className="status-indicator">
                        <span className="status-dot active"></span>
                        <span>localStorage Active</span>
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

              {activeTab === 'developer' && (
                <div className="settings-section">
                  <h3>Developer Tools</h3>
                  <p>Testing and debugging tools for developers</p>
                  
                  <div className="setting-item">
                    <div className="setting-info">
                      <h4>LocalStorage Data Test</h4>
                      <p>View and manage localStorage data including KYC documents</p>
                    </div>
                    <div className="setting-control">
                      <button 
                        className="btn btn--secondary"
                        onClick={() => {
                          const data = localStorage.getItem('blockNexus_kyc_data');
                          console.log('LocalStorage KYC Data:', data ? JSON.parse(data) : 'No data found');
                          alert('Check console for localStorage data');
                        }}
                      >
                        View localStorage Data
                      </button>
                    </div>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <h4>Console Logs</h4>
                      <p>Enable detailed console logging for debugging</p>
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
                      <h4>Environment Info</h4>
                      <p>Current environment and build information</p>
                    </div>
                    <div className="setting-control">
                      <div style={{ fontSize: '12px', fontFamily: 'monospace' }}>
                        <div>Environment: Development</div>
                        <div>React: {React.version}</div>
                        <div>User Agent: {navigator.userAgent.substring(0, 50)}...</div>
                      </div>
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