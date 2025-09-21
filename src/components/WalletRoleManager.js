import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { getAllRoles, getRoleDescription, saveWalletRole, getWalletRole } from '../config/roleAssignment';
import './WalletRoleManager.css';

const WalletRoleManager = () => {
  const { account, userRole, changeRoleForCurrentWallet } = useUser();
  const [selectedRole, setSelectedRole] = useState('buyer');
  const [walletRoles, setWalletRoles] = useState({});

  const availableRoles = getAllRoles().map(role => ({
    value: role,
    label: role.charAt(0).toUpperCase() + role.slice(1),
    description: getRoleDescription(role)
  }));

  useEffect(() => {
    if (userRole) {
      setSelectedRole(userRole);
    }
  }, [userRole]);

  useEffect(() => {
    loadWalletRoles();
  }, []);

  const loadWalletRoles = () => {
    try {
      const roles = JSON.parse(localStorage.getItem('blockNexus_wallet_roles') || '{}');
      setWalletRoles(roles);
    } catch (error) {
      console.error('Error loading wallet roles:', error);
    }
  };

  const getRoleInfo = (role) => {
    return availableRoles.find(r => r.value === role) || {
      value: role,
      label: role.charAt(0).toUpperCase() + role.slice(1),
      description: 'Custom role'
    };
  };

  const handleRoleChange = () => {
    if (!account) {
      alert('Please connect your wallet first');
      return;
    }

    const success = changeRoleForCurrentWallet(selectedRole);
    if (success) {
      loadWalletRoles();
      alert(`Role changed to ${selectedRole} for current wallet`);
    } else {
      alert('Failed to change role. Please try again.');
    }
  };

  const formatWalletAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(38, 42)}`;
  };

  return (
    <div className="wallet-role-manager">
      <h3>Wallet Role Management</h3>
      <p>Switch roles based on your wallet selection. Each wallet can have a different role.</p>

      {/* Current Wallet */}
      {account && (
        <div className="current-wallet-section">
          <h4>Current Wallet</h4>
          <div className="wallet-card current">
            <div className="wallet-info">
              <div className="wallet-address">{formatWalletAddress(account)}</div>
              <div className="wallet-role">
                <span className={`role-badge ${userRole}`}>
                  {getRoleInfo(userRole).label}
                </span>
              </div>
            </div>
            <div className="wallet-actions">
              <div className="role-selection">
                <label htmlFor="role-select">Select Role:</label>
                <select
                  id="role-select"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="role-select"
                >
                  {availableRoles.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleRoleChange}
                  className="btn btn--primary"
                  disabled={selectedRole === userRole}
                >
                  Change Role
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All Wallets */}
      <div className="all-wallets-section">
        <h4>All Configured Wallets</h4>
        <div className="wallet-list">
          {Object.entries(walletRoles).map(([walletAddress, role]) => {
            const roleInfo = getRoleInfo(role);
            const isCurrentWallet = walletAddress.toLowerCase() === account?.toLowerCase();
            
            return (
              <div key={walletAddress} className={`wallet-card ${isCurrentWallet ? 'current' : ''}`}>
                <div className="wallet-info">
                  <div className="wallet-address">
                    {formatWalletAddress(walletAddress)}
                    {isCurrentWallet && <span className="current-badge">Current</span>}
                  </div>
                  <div className="wallet-role">
                    <span className={`role-badge ${role}`}>
                      {roleInfo.label}
                    </span>
                    <div className="role-description">
                      {roleInfo.description}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {Object.keys(walletRoles).length === 0 && (
          <div className="empty-state">
            <p>No wallets configured yet. Connect a wallet to get started.</p>
          </div>
        )}
      </div>

      {/* Role Information */}
      <div className="role-info-section">
        <h4>Available Roles</h4>
        <div className="roles-list">
          {availableRoles.map(role => (
            <div key={role.value} className="role-item">
              <div className="role-header">
                <span className={`role-badge ${role.value}`}>
                  {role.label}
                </span>
                {role.value === userRole && (
                  <span className="current-role-indicator">Current</span>
                )}
              </div>
              <div className="role-description">
                {role.description}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="instructions">
        <h4>How Wallet Role Switching Works</h4>
        <ol>
          <li><strong>Connect Wallet:</strong> Connect any wallet in MetaMask</li>
          <li><strong>Select Role:</strong> Choose the role you want for this wallet</li>
          <li><strong>Change Role:</strong> Click "Change Role" to apply the selection</li>
          <li><strong>Switch Wallets:</strong> Each wallet can have a different role</li>
          <li><strong>Automatic Switch:</strong> Role switches automatically when you change wallets</li>
        </ol>
        
        <div className="note">
          <strong>Note:</strong> Roles are saved per wallet address. When you switch wallets, the role for that specific wallet will be applied automatically.
        </div>
      </div>
    </div>
  );
};

export default WalletRoleManager;