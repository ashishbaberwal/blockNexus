import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

// Components
import Navigation from './components/Navigation';
import HomePage from './components/HomePage';
import PropertiesPage from './components/PropertiesPage';
import AboutPage from './components/AboutPage';
import Home from './components/Home';
import PropertyList from './components/PropertyList';
import InspectorDashboard from './components/InspectorDashboard';

// Context
import { UserProvider } from './contexts/UserContext';
import { ThemeProvider } from './contexts/ThemeContext';

// ABIs
import RealEstate from './abis/RealEstate.json'
import Escrow from './abis/Escrow.json'

// Config
import config from './config.json';

function App() {

  const [provider, setProvider] = useState(null)
  const [escrow, setEscrow] = useState(null)

  const [account, setAccount] = useState(null)
  const [homes, setHomes] = useState([])
  const [home, setHome] = useState({})
  const [toggle, setToggle] = useState(false)
  const [currentPage, setCurrentPage] = useState('home')

  const loadBlockchainData = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum)
    setProvider(provider)

    const network = await provider.getNetwork()

    const realEstate = new ethers.Contract(config[network.chainId].realEstate.address, RealEstate, provider)
    const totalSupply = await realEstate.totalSupply()
    const homes = []

    for (var i = 1; i <= totalSupply; i++) {
      const uri = await realEstate.tokenURI(i)
      const response = await fetch(uri)
      const metadata = await response.json()
      homes.push(metadata)
    }
    setHomes(homes)

    const escrow = new ethers.Contract(config[network.chainId].escrow.address, Escrow, provider)
    setEscrow(escrow)

    window.ethereum.on('accountsChanged', async () => {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = ethers.getAddress(accounts[0])
      setAccount(account)
    })
  }

  useEffect(() => {
    loadBlockchainData()
  }, [])

  const togglePop = (home) => {
    setHome(home)
    toggle ? setToggle(false) : setToggle(true)
  }

  const renderPage = () => {
    switch(currentPage) {
      case 'home':
        return <HomePage homes={homes} togglePop={togglePop} setCurrentPage={setCurrentPage} />;
      case 'properties':
        return <PropertiesPage homes={homes} togglePop={togglePop} />;
      case 'my-properties':
        // Check if user is authenticated before showing My Properties
        if (!account) {
          // Redirect to home if not connected
          setCurrentPage('home');
          return <HomePage homes={homes} togglePop={togglePop} setCurrentPage={setCurrentPage} />;
        }
        return <PropertyList />;
      case 'about':
        return <AboutPage />;
      case 'inspector':
        // Check if user is authenticated and has inspector role
        if (!account) {
          setCurrentPage('home');
          return <HomePage homes={homes} togglePop={togglePop} setCurrentPage={setCurrentPage} />;
        }
        return <InspectorDashboard defaultTab="pending" title="Property Verification Dashboard" />;
      case 'approve':
        // Check if user is authenticated and has inspector role
        if (!account) {
          setCurrentPage('home');
          return <HomePage homes={homes} togglePop={togglePop} setCurrentPage={setCurrentPage} />;
        }
        return <InspectorDashboard defaultTab="pending" title="Approve Properties" />;
      default:
        return <HomePage homes={homes} togglePop={togglePop} setCurrentPage={setCurrentPage} />;
    }
  }

  return (
    <ThemeProvider>
      <UserProvider>
        <div>
          <Navigation 
            account={account} 
            setAccount={setAccount} 
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
          
          {renderPage()}

          {toggle && (
            <Home home={home} provider={provider} account={account} escrow={escrow} togglePop={togglePop} />
          )}
        </div>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
