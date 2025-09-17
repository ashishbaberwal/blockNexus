import React from 'react';
import './TransactionProgress.css';

const TransactionProgress = ({ transaction, userRole }) => {
  if (!transaction) return null;

  const steps = [
    {
      key: 'purchaseRequested',
      title: 'Purchase Request Sent',
      description: 'Buyer initiated purchase request',
      icon: '🏠'
    },
    {
      key: 'lenderApproved',
      title: 'Approved by Lender',
      description: 'Lender approved loan for purchase',
      icon: '💰'
    },
    {
      key: 'underInspection',
      title: 'Under Inspection',
      description: 'Government inspector reviewing documents',
      icon: '🔍'
    },
    {
      key: 'inspectorApproved',
      title: 'Approved by Inspector',
      description: 'All documents verified and approved',
      icon: '✅'
    },
    {
      key: 'sellerApproved',
      title: 'Seller Approval',
      description: 'Seller signed the transfer documents',
      icon: '📝'
    },
    {
      key: 'transactionCompleted',
      title: 'Transaction Complete',
      description: 'Property ownership transferred successfully',
      icon: '🎉'
    }
  ];

  const getStepStatus = (stepKey) => {
    const stepData = transaction.progress?.[stepKey];
    if (stepData?.completed) return 'completed';
    
    // Check if this is the current step
    const currentStepIndex = steps.findIndex(step => !transaction.progress?.[step.key]?.completed);
    const thisStepIndex = steps.findIndex(step => step.key === stepKey);
    
    if (thisStepIndex === currentStepIndex) return 'current';
    return 'pending';
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getRoleSpecificMessage = () => {
    const currentStatus = transaction.status;
    
    switch (userRole) {
      case 'buyer':
        switch (currentStatus) {
          case 'purchase_requested':
            return 'Your purchase request has been sent. Waiting for lender approval.';
          case 'lender_approved':
            return 'Loan approved! Documents are being prepared for inspection.';
          case 'under_inspection':
            return 'Your documents are under government inspection.';
          case 'inspector_approved':
            return 'Documents approved! Waiting for seller to sign.';
          case 'seller_approved':
            return 'Seller has signed! Transaction is being finalized.';
          case 'completed':
            return 'Congratulations! You are now the owner of this property.';
          default:
            return 'Transaction in progress...';
        }
      
      case 'lender':
        switch (currentStatus) {
          case 'purchase_requested':
            return 'New loan request received. Please review buyer\'s KYC documents.';
          case 'lender_approved':
            return 'Loan approved. Documents sent for inspection.';
          default:
            return 'Monitoring transaction progress...';
        }
      
      case 'inspector':
        switch (currentStatus) {
          case 'lender_approved':
            return 'New property documents received for inspection.';
          case 'under_inspection':
            return 'Please review all documents and KYC details.';
          case 'inspector_approved':
            return 'Inspection complete. Documents approved.';
          default:
            return 'Monitoring transaction...';
        }
      
      case 'seller':
        switch (currentStatus) {
          case 'inspector_approved':
            return 'Documents approved by inspector. Please review and sign.';
          case 'seller_approved':
            return 'Documents signed. Transaction being finalized.';
          case 'completed':
            return 'Property successfully transferred to new owner.';
          default:
            return 'Transaction in progress...';
        }
      
      default:
        return 'Transaction in progress...';
    }
  };

  return (
    <div className="transaction-progress">
      <div className="progress-header">
        <h3>Transaction Progress</h3>
        <div className="role-status">
          <span className="user-role">{userRole?.toUpperCase()}</span>
          <span className="transaction-id">ID: {transaction.id?.slice(0, 8)}...</span>
        </div>
      </div>

      <div className="progress-message">
        <p>{getRoleSpecificMessage()}</p>
      </div>

      <div className="progress-steps">
        {steps.map((step, index) => {
          const status = getStepStatus(step.key);
          const stepData = transaction.progress?.[step.key];
          
          return (
            <div key={step.key} className="progress-step-container">
              <div className={`progress-step ${status}`}>
                <div className="step-icon">
                  {status === 'completed' ? '✓' : step.icon}
                </div>
                <div className="step-content">
                  <h4>{step.title}</h4>
                  <p>{step.description}</p>
                  {stepData?.timestamp && (
                    <small className="step-timestamp">
                      {formatTimestamp(stepData.timestamp)}
                    </small>
                  )}
                </div>
              </div>
              
              {index < steps.length - 1 && (
                <div className={`progress-line ${status === 'completed' ? 'completed' : ''}`} />
              )}
            </div>
          );
        })}
      </div>

      <div className="progress-actions">
        {transaction.status === 'purchase_requested' && userRole === 'lender' && (
          <button className="btn btn--primary">
            Review & Approve Loan
          </button>
        )}
        
        {transaction.status === 'under_inspection' && userRole === 'inspector' && (
          <button className="btn btn--primary">
            Complete Inspection
          </button>
        )}
        
        {transaction.status === 'inspector_approved' && userRole === 'seller' && (
          <button className="btn btn--primary">
            Sign Documents
          </button>
        )}
      </div>
    </div>
  );
};

export default TransactionProgress;