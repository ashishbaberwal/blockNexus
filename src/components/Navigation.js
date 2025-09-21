import { useState, useEffect } from 'react';
import logo from '../assets/logo.svg';
import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';
import UserRegistration from './UserRegistration';
import UserProfile from './UserProfile';
import Settings from './Settings';
import NotificationSystem from './NotificationSystem';

const Navigation = ({ account, setAccount, currentPage, setCurrentPage }) => {
  const { user, isAuthenticated, loginUser, checkUserExists, userRole } = useUser();
  const [showRegistration, setShowRegistration] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [authError, setAuthError] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuOpen && !event.target.closest('nav')) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileMenuOpen]);

  const connectHandler = async () => {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const walletAddress = accounts[0];
      setAccount(walletAddress);
      
      // Check if user exists and handle authentication
      if (checkUserExists(walletAddress)) {
        try {
          await loginUser(walletAddress);
          setAuthError('');
        } catch (error) {
          setAuthError('Authentication failed. Please try again.');
        }
      } else {
        // New user - show registration
        setShowRegistration(true);
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setAuthError('Failed to connect wallet');
    }
  }

  const handleNavigation = (page) => {
    setCurrentPage(page);
    setMobileMenuOpen(false); // Close mobile menu when navigating
  }

  const handleProfileClick = () => {
    setShowProfile(true);
  }

  const getUserDisplayName = () => {
    if (user && user.firstName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return account ? `${account.slice(0, 6)}...${account.slice(38, 42)}` : '';
  }

  return (
    <>
      <nav>
          <button 
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            ☰
          </button>

          <ul className={`nav__links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
              <li>
                <button 
                  type="button" 
                  className={`nav__link ${currentPage === 'home' ? 'nav__link--active' : ''}`}
                  onClick={() => handleNavigation('home')}
                >
                  Home
                </button>
              </li>
              <li>
                <button 
                  type="button" 
                  className={`nav__link ${currentPage === 'properties' ? 'nav__link--active' : ''}`}
                  onClick={() => handleNavigation('properties')}
                >
                  Buy
                </button>
              </li>
              <li><button type="button" className="nav__link">Rent</button></li>
              <li><button type="button" className="nav__link">Sell</button></li>
              <li>
                <button 
                  type="button" 
                  className={`nav__link ${currentPage === 'about' ? 'nav__link--active' : ''}`}
                  onClick={() => handleNavigation('about')}
                >
                  About
                </button>
              </li>
              {account && isAuthenticated && userRole === 'inspector' && (
                <>
                  <li>
                    <button 
                      type="button" 
                      className={`nav__link ${currentPage === 'inspector' ? 'nav__link--active' : ''}`}
                      onClick={() => handleNavigation('inspector')}
                    >
                      Inspector
                    </button>
                  </li>
                  <li>
                    <button 
                      type="button" 
                      className={`nav__link ${currentPage === 'approve' ? 'nav__link--active' : ''}`}
                      onClick={() => handleNavigation('approve')}
                    >
                      Approve
                    </button>
                  </li>
                </>
              )}
          </ul>

          <div className='nav__brand' onClick={() => handleNavigation('home')}>
              <img src={logo} alt="Logo" />
              <h1>BlockNexus</h1>
          </div>

          <div className="nav__user">
            <div className="nav__user-content">
              {account ? (
                <div className="user-menu">
                  {isAuthenticated && user && (
                    <div className="user-info">
                      <div className="user-avatar" onClick={handleProfileClick}>
                        {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                      </div>
                      <span className="user-name" onClick={handleProfileClick}>
                        {user.firstName}
                      </span>
                    </div>
                  )}
                  
                  <button
                      type="button"
                      className='nav__connect'
                      onClick={isAuthenticated ? handleProfileClick : connectHandler}
                  >
                      {getUserDisplayName()}
                  </button>
                </div>
              ) : (
                  <button
                      type="button"
                      className='nav__connect'
                      onClick={connectHandler}
                  >
                      Connect Wallet
                  </button>
              )}
            </div>
            
            {/* Notification and Settings */}
            <div className="nav__actions">
              {account && isAuthenticated && <NotificationSystem />}
              
              {/* My Properties emoji button - only when authenticated */}
              {account && isAuthenticated && (
                <button
                  type="button"
                  className="nav__quick-action"
                  onClick={() => handleNavigation('my-properties')}
                  title="My Properties"
                >
                  🏠
                </button>
              )}
              
              <button
                type="button"
                className="nav__settings"
                onClick={() => setShowSettings(true)}
                title="Settings"
              >
                ⚙️
              </button>
            </div>
            
            {authError && (
              <div className="auth-error">
                {authError}
              </div>
            )}
          </div>
      </nav>

      {/* Registration Modal */}
      {showRegistration && (
        <UserRegistration 
          onClose={() => setShowRegistration(false)}
          walletAddress={account}
        />
      )}

      {/* Profile Modal */}
      {showProfile && (
        <UserProfile 
          onClose={() => setShowProfile(false)}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <Settings 
          onClose={() => setShowSettings(false)}
          account={account}
        />
      )}
    </>
  );
}

export default Navigation;
