import logo from '../assets/logo.svg';

const Navigation = ({ account, setAccount }) => {
  const connectHandler = async () => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    setAccount(accounts[0]);
}

  return (
    <nav>
        <ul className='nav__links'>
            <li><button type="button" className="nav__link">Buy</button></li>
            <li><button type="button" className="nav__link">Rent</button></li>
            <li><button type="button" className="nav__link">Sell</button></li>
        </ul>

        <div className='nav__brand'>
            <img src={logo} alt="Logo" />
            <h1>BlockNexus</h1>
        </div>

        {account ? (
                <button
                    type="button"
                    className='nav__connect'
                >
                    {account.slice(0, 6) + '...' + account.slice(38, 42)}
                </button>
            ) : (
                <button
                    type="button"
                    className='nav__connect'
                    onClick={connectHandler}
                >
                    Connect
                </button>
      )}
    </nav>
);
}

export default Navigation;
