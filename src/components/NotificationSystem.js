import React, { useState, useEffect } from 'react';
import { getUserNotifications, addNotification } from '../services/transactionService';
import { useUser } from '../contexts/UserContext';
import './NotificationSystem.css';

const NotificationSystem = () => {
  const { user } = useUser();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPanel, setShowPanel] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.walletAddress) {
      loadNotifications();
      // Set up real-time notifications polling
      const interval = setInterval(loadNotifications, 30000); // Check every 30 seconds
      return () => clearInterval(interval);
    }
  }, [user?.walletAddress]);

  const loadNotifications = async () => {
    if (!user?.walletAddress) return;
    
    setLoading(true);
    try {
      const result = await getUserNotifications(user.walletAddress);
      if (result.success) {
        setNotifications(result.notifications);
        const unread = result.notifications.filter(n => !n.read).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    // Update local state immediately
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));

    // TODO: Update in Firebase
    // await markNotificationAsRead(notificationId);
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'transaction_update': return '🏠';
      case 'lender_approval': return '💰';
      case 'inspection_required': return '🔍';
      case 'inspector_approval': return '✅';
      case 'seller_approval': return '📝';
      case 'transaction_complete': return '🎉';
      case 'kyc_required': return '📄';
      case 'document_upload': return '📤';
      default: return '📢';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'transaction_update': return '#0A64BC';
      case 'lender_approval': return '#38A169';
      case 'inspection_required': return '#D69E2E';
      case 'inspector_approval': return '#38A169';
      case 'seller_approval': return '#0A64BC';
      case 'transaction_complete': return '#38A169';
      case 'kyc_required': return '#E53E3E';
      case 'document_upload': return '#805AD5';
      default: return '#6C757D';
    }
  };

  return (
    <div className="notification-system">
      <button 
        className="notification-bell" 
        onClick={() => setShowPanel(!showPanel)}
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      >
        <span className="bell-icon">🔔</span>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {showPanel && (
        <div className="notification-panel">
          <div className="notification-header">
            <h3>Notifications</h3>
            <div className="notification-actions">
              {unreadCount > 0 && (
                <button 
                  className="mark-all-read" 
                  onClick={markAllAsRead}
                  title="Mark all as read"
                >
                  ✓ All
                </button>
              )}
              <button 
                className="close-panel" 
                onClick={() => setShowPanel(false)}
                title="Close"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="notification-content">
            {loading ? (
              <div className="notification-loading">
                <div className="loading-spinner"></div>
                <p>Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="no-notifications">
                <div className="no-notifications-icon">📭</div>
                <h4>No notifications yet</h4>
                <p>You'll see updates about your transactions here</p>
              </div>
            ) : (
              <div className="notification-list">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                    onClick={() => !notification.read && markAsRead(notification.id)}
                  >
                    <div 
                      className="notification-icon"
                      style={{ backgroundColor: getNotificationColor(notification.type) }}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="notification-content">
                      <h4>{notification.title}</h4>
                      <p>{notification.message}</p>
                      <div className="notification-meta">
                        <span className="notification-time">
                          {formatTimestamp(notification.timestamp)}
                        </span>
                        {notification.transactionId && (
                          <span className="transaction-link">
                            Transaction: {notification.transactionId.slice(0, 8)}...
                          </span>
                        )}
                      </div>
                    </div>

                    {!notification.read && (
                      <div className="unread-indicator"></div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="notification-footer">
              <button className="view-all-btn">
                View All Notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Notification helper functions for different transaction events
export const sendTransactionNotification = async (userAddress, type, data) => {
  try {
    const notifications = {
    lender_approval_required: {
      title: 'Loan Application Received',
      message: `New loan request for ${data.propertyName}. Review buyer's KYC documents.`,
      type: 'lender_approval'
    },
    lender_approved: {
      title: 'Loan Approved',
      message: `Lender approved your loan for ${data.propertyName}. Documents sent for inspection.`,
      type: 'lender_approval'
    },
    inspection_required: {
      title: 'Inspection Required',
      message: `Property documents for ${data.propertyName} require government inspection.`,
      type: 'inspection_required'
    },
    inspector_approved: {
      title: 'Documents Approved',
      message: `Government inspector approved all documents for ${data.propertyName}.`,
      type: 'inspector_approval'
    },
    seller_approval_required: {
      title: 'Seller Approval Required',
      message: `Buyer wants to purchase ${data.propertyName}. Review and sign documents.`,
      type: 'seller_approval'
    },
    transaction_complete: {
      title: 'Transaction Complete',
      message: `Property ${data.propertyName} has been successfully transferred!`,
      type: 'transaction_complete'
    },
    kyc_verification_required: {
      title: 'KYC Verification Required',
      message: 'Please complete your KYC verification to proceed with transactions.',
      type: 'kyc_required'
    }
  };

    const notificationData = notifications[type];
    if (notificationData) {
      await addNotification({
        userAddress: userAddress,
        ...notificationData,
        transactionId: data.transactionId,
        propertyId: data.propertyId,
        actionUrl: data.actionUrl
      });
    }
  } catch (error) {
    console.error('Error sending notification:', error);
    // Don't throw the error to prevent it from breaking the main transaction flow
  }
};

export default NotificationSystem;