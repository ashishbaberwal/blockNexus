import { useState, useMemo } from 'react';
import Search from './Search';

const HomePage = ({ homes, togglePop, setCurrentPage }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter homes based on search term
  const filteredHomes = useMemo(() => {
    if (!searchTerm.trim()) return homes;
    
    const term = searchTerm.toLowerCase();
    return homes.filter(home => {
      return (
        home.name?.toLowerCase().includes(term) ||
        home.address?.toLowerCase().includes(term) ||
        home.description?.toLowerCase().includes(term) ||
        home.attributes?.some(attr => 
          attr.trait_type?.toLowerCase().includes(term) ||
          attr.value?.toString().toLowerCase().includes(term)
        )
      );
    });
  }, [homes, searchTerm]);

  // Get featured properties (first 3 properties from filtered results)
  const featuredHomes = filteredHomes.slice(0, 3);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  return (
    <div className="homepage">
      {/* Hero Section */}
      <div className="hero">
        <video 
          className="hero__video"
          autoPlay 
          loop 
          muted 
          playsInline
        >
          <source src="/hero-video.webm" type="video/webm" />
          {/* Fallback for browsers that don't support video */}
          Your browser does not support the video tag.
        </video>
        <div className="hero__overlay"></div>
        <div className="hero__content">
          <h1 className="hero__title">Find Your Dream Home on the Blockchain</h1>
          <p className="hero__subtitle">
            Discover, buy, and sell real estate properties as NFTs with complete transparency and security
          </p>
          <div className="hero__stats">
            <div className="stat">
              <h3>{filteredHomes.length}</h3>
              <p>Properties {searchTerm ? 'Found' : 'Available'}</p>
            </div>
            <div className="stat">
              <h3>100%</h3>
              <p>Blockchain Secured</p>
            </div>
            <div className="stat">
              <h3>24/7</h3>
              <p>Market Access</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <Search onSearch={handleSearch} homes={homes} />

      {/* Featured Properties / Search Results */}
      <section className="featured">
        <div className="featured__container">
          <h2>{searchTerm ? `Search Results for "${searchTerm}"` : 'Featured Properties'}</h2>
          <p>{searchTerm ? `Found ${filteredHomes.length} matching properties` : 'Handpicked properties with the best value and location'}</p>
          
          {filteredHomes.length > 0 ? (
            <div className="featured__grid">
              {featuredHomes.map((home, index) => (
                <div className="featured__card" key={index} onClick={() => togglePop(home)}>
                  <div className="featured__image">
                    <img src={home.image} alt={home.name} />
                    <div className="featured__badge">{searchTerm ? 'Match' : 'Featured'}</div>
                  </div>
                  <div className="featured__info">
                    <h3>{home.name}</h3>
                    <p className="featured__address">{home.address}</p>
                    <div className="featured__details">
                      <span>{home.attributes[2].value} bed</span>
                      <span>{home.attributes[3].value} bath</span>
                      <span>{home.attributes[4].value} sqft</span>
                    </div>
                    <div className="featured__price">{home.attributes[0].value} ETH</div>
                  </div>
                </div>
              ))}
            </div>
          ) : searchTerm ? (
            <div className="no-results">
              <div className="no-results__icon">🏠</div>
              <h3>No properties found</h3>
              <p>Try adjusting your search terms or browse all properties</p>
              <button 
                className="btn btn--primary"
                onClick={() => setSearchTerm('')}
              >
                Clear Search
              </button>
            </div>
          ) : null}

          {!searchTerm && (
            <button 
              className="featured__view-all"
              onClick={() => setCurrentPage('properties')}
            >
              View All Properties
            </button>
          )}

          {searchTerm && filteredHomes.length > 3 && (
            <button 
              className="featured__view-all"
              onClick={() => setCurrentPage('properties')}
            >
              View All {filteredHomes.length} Results
            </button>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="features__container">
          <h2>Why Choose BlockNexus?</h2>
          <div className="features__grid">
            <div className="feature">
              <div className="feature__icon">🔒</div>
              <h3>Blockchain Security</h3>
              <p>All transactions are secured by Ethereum blockchain technology</p>
            </div>
            <div className="feature">
              <div className="feature__icon">🏠</div>
              <h3>NFT Property Ownership</h3>
              <p>Own properties as unique NFTs with verifiable ownership</p>
            </div>
            <div className="feature">
              <div className="feature__icon">⚡</div>
              <h3>Smart Contracts</h3>
              <p>Automated escrow process with smart contract technology</p>
            </div>
            <div className="feature">
              <div className="feature__icon">🌍</div>
              <h3>Global Access</h3>
              <p>Buy and sell properties from anywhere in the world</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;