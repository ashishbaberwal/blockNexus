import Search from './Search';

const PropertiesPage = ({ homes, togglePop }) => {
  return (
    <div className="properties-page">
      <Search />
      
      <div className='cards__section'>
        <h3>All Properties</h3>
        <p>Explore our complete collection of blockchain-secured real estate</p>
        
        <hr />

        <div className='cards'>
          {homes.map((home, index) => (
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
      </div>
    </div>
  );
};

export default PropertiesPage;