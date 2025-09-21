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
          <div className='properties-list'>
            {filteredHomes.map((home, index) => (
              <div className='property-item' key={index} onClick={() => togglePop(home)}>
                <div className='property-item__image'>
                  <img src={home.image} alt='Home' />
                </div>
                <div className='property-item__info'>
                  <div className='property-item__header'>
                    <h4 className='property-item__title'>{home.name}</h4>
                    <div className='property-item__price'>
                      <strong>{home.attributes[0].value} ETH</strong>
                    </div>
                  </div>
                  <div className='property-item__details'>
                    <p>
                      {home.attributes[2]?.value > 0 && (
                        <>
                          <strong>{home.attributes[2].value}</strong> bds |
                        </>
                      )}
                      {home.attributes[3]?.value > 0 && (
                        <>
                          <strong>{home.attributes[3].value}</strong> ba |
                        </>
                      )}
                      <strong>{home.attributes[4]?.value || 0}</strong> sqft
                      {home.attributes[1]?.value && (
                        <> | <strong>{home.attributes[1].value}</strong></>
                      )}
                    </p>
                    <p className='property-item__address'>{home.address}</p>
                  </div>
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