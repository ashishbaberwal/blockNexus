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

    // Add additional Indian properties for UI display
    const additionalProperties = [
      {
        name: "Premium Apartment in Mumbai",
        address: "Bandra Kurla Complex, Mumbai, Maharashtra 400051",
        description: "Luxury 3BHK apartment in the heart of Mumbai's business district with modern amenities and city views",
        image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500&h=300&fit=crop",
        id: "4",
        attributes: [
          { trait_type: "Purchase Price", value: 8 },
          { trait_type: "Type of Residence", value: "Apartment" },
          { trait_type: "Bed Rooms", value: 3 },
          { trait_type: "Bathrooms", value: 3 },
          { trait_type: "Square Feet", value: 1800 },
          { trait_type: "Year Built", value: 2020 }
        ]
      },
      {
        name: "Villa in Bangalore",
        address: "Whitefield, Bangalore, Karnataka 560066",
        description: "Spacious 4BHK independent villa with garden and parking in Bangalore's IT hub",
        image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=500&h=300&fit=crop",
        id: "5",
        attributes: [
          { trait_type: "Purchase Price", value: 12 },
          { trait_type: "Type of Residence", value: "Villa" },
          { trait_type: "Bed Rooms", value: 4 },
          { trait_type: "Bathrooms", value: 4 },
          { trait_type: "Square Feet", value: 3200 },
          { trait_type: "Year Built", value: 2018 }
        ]
      },
      {
        name: "Commercial Land in Gurgaon",
        address: "Sector 62, Gurgaon, Haryana 122001",
        description: "Prime commercial land parcel in Gurgaon's business district, ideal for office complex or retail development",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=300&fit=crop",
        id: "6",
        attributes: [
          { trait_type: "Purchase Price", value: 25 },
          { trait_type: "Type of Residence", value: "Commercial Land" },
          { trait_type: "Bed Rooms", value: 0 },
          { trait_type: "Bathrooms", value: 0 },
          { trait_type: "Square Feet", value: 10890 },
          { trait_type: "Year Built", value: 0 }
        ]
      },
      {
        name: "Residential Plot in Pune",
        address: "Hinjewadi, Pune, Maharashtra 411057",
        description: "Well-located residential plot in Pune's IT corridor, perfect for building your dream home",
        image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=500&h=300&fit=crop",
        id: "7",
        attributes: [
          { trait_type: "Purchase Price", value: 6 },
          { trait_type: "Type of Residence", value: "Residential Land" },
          { trait_type: "Bed Rooms", value: 0 },
          { trait_type: "Bathrooms", value: 0 },
          { trait_type: "Square Feet", value: 4356 },
          { trait_type: "Year Built", value: 0 }
        ]
      },
      {
        name: "Farmhouse in Goa",
        address: "North Goa, Goa 403001",
        description: "Beautiful farmhouse with coconut groves and traditional Goan architecture, perfect for vacation home",
        image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=500&h=300&fit=crop",
        id: "8",
        attributes: [
          { trait_type: "Purchase Price", value: 15 },
          { trait_type: "Type of Residence", value: "Farmhouse" },
          { trait_type: "Bed Rooms", value: 5 },
          { trait_type: "Bathrooms", value: 4 },
          { trait_type: "Square Feet", value: 4500 },
          { trait_type: "Year Built", value: 2015 }
        ]
      },
      {
        name: "Penthouse in Delhi",
        address: "Connaught Place, New Delhi, Delhi 110001",
        description: "Luxury penthouse in the heart of Delhi with panoramic city views and premium amenities",
        image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500&h=300&fit=crop",
        id: "9",
        attributes: [
          { trait_type: "Purchase Price", value: 18 },
          { trait_type: "Type of Residence", value: "Penthouse" },
          { trait_type: "Bed Rooms", value: 4 },
          { trait_type: "Bathrooms", value: 4 },
          { trait_type: "Square Feet", value: 2800 },
          { trait_type: "Year Built", value: 2021 }
        ]
      },
      {
        name: "Agricultural Land in Punjab",
        address: "Ludhiana, Punjab 141001",
        description: "Fertile agricultural land in Punjab, ideal for farming or agricultural investment",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=300&fit=crop",
        id: "10",
        attributes: [
          { trait_type: "Purchase Price", value: 4 },
          { trait_type: "Type of Residence", value: "Agricultural Land" },
          { trait_type: "Bed Rooms", value: 0 },
          { trait_type: "Bathrooms", value: 0 },
          { trait_type: "Square Feet", value: 21780 },
          { trait_type: "Year Built", value: 0 }
        ]
      },
      {
        name: "Townhouse in Chennai",
        address: "OMR, Chennai, Tamil Nadu 600096",
        description: "Modern townhouse in Chennai's IT corridor with contemporary design and smart home features",
        image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=500&h=300&fit=crop",
        id: "11",
        attributes: [
          { trait_type: "Purchase Price", value: 9 },
          { trait_type: "Type of Residence", value: "Townhouse" },
          { trait_type: "Bed Rooms", value: 3 },
          { trait_type: "Bathrooms", value: 3 },
          { trait_type: "Square Feet", value: 2100 },
          { trait_type: "Year Built", value: 2019 }
        ]
      },
      {
        name: "Industrial Land in Ahmedabad",
        address: "Sanand, Ahmedabad, Gujarat 382110",
        description: "Large industrial land parcel in Gujarat's industrial hub, perfect for manufacturing or warehousing",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=300&fit=crop",
        id: "12",
        attributes: [
          { trait_type: "Purchase Price", value: 20 },
          { trait_type: "Type of Residence", value: "Industrial Land" },
          { trait_type: "Bed Rooms", value: 0 },
          { trait_type: "Bathrooms", value: 0 },
          { trait_type: "Square Feet", value: 43560 },
          { trait_type: "Year Built", value: 0 }
        ]
      }
    ];

    // Combine blockchain properties with additional UI properties
    const allProperties = [...homes, ...additionalProperties];
    setHomes(allProperties)

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
    if (home === null) {
      // Close the modal
      setToggle(false)
    } else {
      // Open the modal with the selected property
      setHome(home)
      setToggle(true)
    }
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
