import Search from './Search';

const HomePage = ({ homes, togglePop, setCurrentPage }) => {

  // Get featured properties (first 3 properties)
  const featuredHomes = homes.slice(0, 3);

  return (
    <div className="homepage">
      {/* Hero Section */}
      <div className="hero">
        <div className="hero__content">
          <h1 className="hero__title">Find Your Dream Home on the Blockchain</h1>
          <p className="hero__subtitle">
            Discover, buy, and sell real estate properties as NFTs with complete transparency and security
          </p>
          <div className="hero__stats">
            <div className="stat">
              <h3>{homes.length}</h3>
              <p>Properties Available</p>
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
      <Search />

      {/* Featured Properties */}
      <section className="featured">
        <div className="featured__container">
          <h2>Featured Properties</h2>
          <p>Handpicked properties with the best value and location</p>
          
          <div className="featured__grid">
            {featuredHomes.map((home, index) => (
              <div className="featured__card" key={index} onClick={() => togglePop(home)}>
                <div className="featured__image">
                  <img src={home.image} alt={home.name} />
                  <div className="featured__badge">Featured</div>
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

          <button 
            className="featured__view-all"
            onClick={() => setCurrentPage('properties')}
          >
            View All Properties
          </button>
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