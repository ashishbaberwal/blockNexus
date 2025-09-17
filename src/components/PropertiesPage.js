import { useState, useMemo } from 'react';
import Search from './Search';

const PropertiesPage = ({ homes, togglePop }) => {
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

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  return (
    <div className="properties-page">
      <Search onSearch={handleSearch} homes={homes} />
      
      <div className='cards__section'>
        <h3>{searchTerm ? `Search Results (${filteredHomes.length})` : 'All Properties'}</h3>
        <p>{searchTerm ? `Showing results for "${searchTerm}"` : 'Explore our complete collection of blockchain-secured real estate'}</p>
        
        <hr />

        {filteredHomes.length > 0 ? (
          <div className='cards'>
            {filteredHomes.map((home, index) => (
              <div className='card' key={index} onClick={() => togglePop(home)}>
                <div className='card__image'>
                  <img src={home.image} alt='Home' />
                </div>
                <div className='card__info'>
                  <h4>{home.attributes[0].value} ETH</h4>
                  <p>
                    <strong>{home.attributes[2].value}</strong> bds |
                    <strong>{home.attributes[3].value}</strong> ba |
                    <strong>{home.attributes[4].value}</strong> sqft
                  </p>
                  <p>{home.address}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
};

export default PropertiesPage;