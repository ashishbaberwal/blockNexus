import React from 'react';
import './AboutPage.css';

const AboutPage = () => {
  return (
    <div className="about-page">
      <div className="about-hero">
        <h1>About BlockNexus</h1>
        <p className="hero-subtitle">
          A decentralized real estate marketplace powered by blockchain technology
        </p>
      </div>
      

      

      <div className="about-content">
        {/* What is BlockNexus Section */}
        <section className="about-section">
          <div className="section-header">
            <h2>What is BlockNexus?</h2>
            <div className="section-icon"></div>
          </div>
          <div className="info-box">
            <p>
              BlockNexus is a revolutionary decentralized real estate marketplace that leverages 
              blockchain technology to create a transparent, secure, and efficient property 
              transaction system. Built on Ethereum, it eliminates intermediaries and provides 
              a trustless environment for real estate transactions.
            </p>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="about-section">
          <div className="section-header">
            <h2>Why Choose BlockNexus?</h2>
            <div className="section-icon"></div>
          </div>

          <div className="benefits-container">
            <div className="benefit-item">
              <div className="benefit-icon"></div>
              <div className="benefit-content">
                <h3>Reduced Costs</h3>
                <p>Eliminate middlemen and reduce transaction fees significantly</p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-icon"></div>
              <div className="benefit-content">
                <h3>Faster Transactions</h3>
                <p>Smart contracts automate sales, inspections, and loans, reducing delays and increasing trust.</p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-icon"></div>
              <div className="benefit-content">
                <h3>Enhanced Security</h3>
                <p>Blockchain ensures records cannot be altered, protecting property ownership from fraud.</p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-icon"></div>
              <div className="benefit-content">
                <h3>Global Access</h3>
                <p>Trade real estate assets from anywhere in the world</p>
              </div>
            </div>
          </div>
        </section>

        {/* How NFTs Work Section */}
        <section className="about-section">
          <div className="section-header">
            <h2>How NFTs Power Real Estate</h2>
            <div className="section-icon"></div>
          </div>
          
          <div className="explanation-grid">
            <div className="explanation-card">
              <div className="card-icon"></div>
              <h3>Property Tokenization</h3>
              <p>
                Each property is minted as a unique NFT (Non-Fungible Token) on the Ethereum blockchain. 
                This creates a digital certificate of ownership that is immutable and verifiable.
              </p>
            </div>

            <div className="explanation-card">
              <div className="card-icon"></div>
              <h3>Immutable Ownership</h3>
              <p>
                Once a property is tokenized, the ownership record is permanently stored on the blockchain. 
                This eliminates title disputes and provides a clear, unchangeable ownership history.
              </p>
            </div>

            <div className="explanation-card">
              <div className="card-icon"></div>
              <h3>Global Accessibility</h3>
              <p>
                NFTs enable fractional ownership and global trading of real estate assets, 
                making property investment accessible to a broader range of investors.
              </p>
            </div>
          </div>
        </section>

        {/* Transaction Process Section */}
        <section className="about-section">
          <div className="section-header">
            <h2>How Transactions Work</h2>
            <div className="section-icon"></div>
          </div>

          <div className="process-flow">
            <div className="process-step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Property Listing</h3>
                <p>
                  The seller mints their property as an NFT and lists it on the marketplace 
                  with a purchase price and escrow amount.
                </p>
              </div>
            </div>

            <div className="process-arrow"></div>

            <div className="process-step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Buyer Interest</h3>
                <p>
                  A buyer shows interest by depositing the required escrow amount 
                  and approving the sale terms.
                </p>
              </div>
            </div>

            <div className="process-arrow"></div>

            <div className="process-step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Inspection</h3>
                <p>
                  A certified inspector reviews the property and updates the inspection status 
                  on the blockchain.
                </p>
              </div>
            </div>

            <div className="process-arrow"></div>

            <div className="process-step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3>Lender Approval</h3>
                <p>
                  The lender approves the transaction and provides the remaining funds 
                  to complete the purchase.
                </p>
              </div>
            </div>

            <div className="process-arrow"></div>

            <div className="process-step">
              <div className="step-number">5</div>
              <div className="step-content">
                <h3>Finalization</h3>
                <p>
                  Once all parties approve, the smart contract automatically transfers 
                  the NFT to the buyer and funds to the seller.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Key Features Section */}
        <section className="about-section">
          <div className="section-header">
            <h2>Key Features</h2>
            <div className="section-icon"></div>
          </div>

          <div className="features-grid">
            <div className="feature-box">
              <div className="feature-icon"></div>
              <h3>Smart Contract Security</h3>
              <p>
                All transactions are governed by smart contracts that automatically execute 
                when conditions are met, eliminating the need for intermediaries.
              </p>
            </div>

            <div className="feature-box">
              <div className="feature-icon"></div>
              <h3>Multi-Party Approval</h3>
              <p>
                Transactions require approval from all relevant parties: buyer, seller, 
                inspector, and lender, ensuring transparency and consensus.
              </p>
            </div>

            <div className="feature-box">
              <div className="feature-icon"></div>
              <h3>Escrow Protection</h3>
              <p>
                Funds are held in escrow until all conditions are met, protecting both 
                buyers and sellers throughout the transaction process.
              </p>
            </div>

            <div className="feature-box">
              <div className="feature-icon"></div>
              <h3>Inspection Integration</h3>
              <p>
                Built-in inspection workflow ensures property quality and condition 
                are verified before transaction completion.
              </p>
            </div>

            <div className="feature-box">
              <div className="feature-icon"></div>
              <h3>Transparent History</h3>
              <p>
                All transaction history is recorded on the blockchain, providing 
                complete transparency and auditability.
              </p>
            </div>

            <div className="feature-box">
              <div className="feature-icon"></div>
              <h3>Fast Settlement</h3>
              <p>
                Automated smart contract execution enables faster settlement times 
                compared to traditional real estate transactions.
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default AboutPage;
