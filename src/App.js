import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

// Components
import Navigation from './components/Navigation';
import HomePage from './components/HomePage';
import PropertiesPage from './components/PropertiesPage';
import AboutPage from './components/AboutPage';
import Home from './components/Home';
import PropertyList from './components/PropertyList';
import PropertyApprovalAdmin from './components/PropertyApprovalAdmin';

// Context
import { UserProvider } from './contexts/UserContext';
import { ThemeProvider } from './contexts/ThemeContext';

// ABIs
import RealEstate from './abis/RealEstate.json'
import Escrow from './abis/Escrow.json'

// Config
import config from './config.json';

// Services
import indexedDBService from './services/indexedDBService';
import { migrateNotificationsToIndexedDB, cleanupNotificationsStorage } from './services/transactionService';
import { cleanupLargeLocalStorageItems, emergencyLocalStorageCleanup } from './utils/storageCleanup';

function App() {

  const [provider, setProvider] = useState(null)
  const [escrow, setEscrow] = useState(null)

  const [account, setAccount] = useState(null)
  const [homes, setHomes] = useState([])
  const [home, setHome] = useState({})
  const [toggle, setToggle] = useState(false)
  const [currentPage, setCurrentPage] = useState('home')

  const loadBlockchainData = async () => {
    try {
      if (!window.ethereum) {
        console.error('MetaMask not detected');
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum)
      setProvider(provider)

      const network = await provider.getNetwork()
      console.log('Connected to network:', network.chainId.toString());

      // Check if network is supported
      if (!config[network.chainId]) {
        console.error('Unsupported network. Current network:', network.chainId.toString());
        alert(`Unsupported network. Please switch to a supported network.\nCurrent: ${network.chainId}\nSupported: ${Object.keys(config).join(', ')}`);
        return;
      }

      const realEstate = new ethers.Contract(config[network.chainId].realEstate.address, RealEstate, provider)
      const escrow = new ethers.Contract(config[network.chainId].escrow.address, Escrow, provider)
      
      // Test contract connectivity
      try {
        const totalSupply = await realEstate.totalSupply()
        console.log('Total supply of properties:', totalSupply.toString());
        
        const homes = []

        for (var i = 1; i <= totalSupply; i++) {
          const uri = await realEstate.tokenURI(i)
          const response = await fetch(uri)
          const metadata = await response.json()
          // Ensure the property has the correct ID for blockchain interaction
          metadata.id = i
          homes.push(metadata)
        }

        setHomes(homes)
        console.log('Loaded properties:', homes.length);
      } catch (contractError) {
        console.error('Error interacting with contracts:', contractError);
        alert('Error connecting to smart contracts. Please ensure:\n1. You are on the correct network\n2. Smart contracts are deployed\n3. Contract addresses are correct');
        return;
      }

      setEscrow(escrow)

      window.ethereum.on('accountsChanged', async () => {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = ethers.getAddress(accounts[0])
        setAccount(account)
      })

    } catch (error) {
      console.error('Error loading blockchain data:', error);
      alert('Failed to connect to blockchain. Please check your MetaMask connection and network settings.');
    }
  }

  useEffect(() => {
    // Add global error handler for localStorage quota errors
    const handleStorageError = (event) => {
      if (event.error && (
        event.error.name === 'QuotaExceededError' || 
        event.error.code === 22 ||
        (event.error.message && event.error.message.includes('quota'))
      )) {
        console.warn('Storage quota exceeded, performing cleanup...');
        emergencyLocalStorageCleanup();
        event.preventDefault(); // Prevent the error from showing to user
      }
    };

    window.addEventListener('error', handleStorageError);
    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason && (
        event.reason.name === 'QuotaExceededError' ||
        (event.reason.message && event.reason.message.includes('quota'))
      )) {
        console.warn('Storage quota exceeded in promise, performing cleanup...');
        emergencyLocalStorageCleanup();
        event.preventDefault();
      }
    });

    // Initialize IndexedDB first, then load blockchain data
    const initializeApp = async () => {
      try {
        // Clean up large localStorage items first to prevent quota errors
        cleanupLargeLocalStorageItems();
        
        await indexedDBService.init();
        console.log('IndexedDB initialized successfully');
        
        // Migrate notifications from localStorage to IndexedDB
        await migrateNotificationsToIndexedDB();
        
        // Clean up localStorage to prevent quota errors
        cleanupNotificationsStorage();
      } catch (error) {
        console.error('Failed to initialize IndexedDB:', error);
        
        // If initialization fails due to storage issues, try emergency cleanup
        if (error.message && error.message.includes('quota')) {
          console.warn('Storage quota exceeded, performing emergency cleanup...');
          emergencyLocalStorageCleanup();
        }
        
        // Try to clean up localStorage anyway to prevent quota errors
        cleanupNotificationsStorage();
      }
      
      // Load blockchain data regardless of IndexedDB status
      loadBlockchainData();
    };
    
    initializeApp();

    // Cleanup event listeners
    return () => {
      window.removeEventListener('error', handleStorageError);
    };
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
      case 'property-approval':
        return <PropertyApprovalAdmin />;
      case 'about':
        return <AboutPage />;
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
