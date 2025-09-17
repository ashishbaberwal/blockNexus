import React, { useState, useEffect } from 'react';

const Search = ({ onSearch, homes = [] }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Extract unique locations from homes for suggestions
    const getLocationSuggestions = (homes) => {
        const locations = new Set();
        homes.forEach(home => {
            if (home.address) locations.add(home.address);
            if (home.location) locations.add(home.location);
            if (home.neighborhood) locations.add(home.neighborhood);
            if (home.city) locations.add(home.city);
            if (home.zipCode) locations.add(home.zipCode);
        });
        return Array.from(locations);
    };

    // Filter suggestions based on search term
    useEffect(() => {
        if (searchTerm.length > 1) {
            const allLocations = getLocationSuggestions(homes);
            const filtered = allLocations.filter(location =>
                location && location.toLowerCase().includes(searchTerm.toLowerCase())
            ).slice(0, 5); // Limit to 5 suggestions
            setSuggestions(filtered);
            setShowSuggestions(filtered.length > 0);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, [searchTerm, homes]);

    const handleSearch = (term = searchTerm) => {
        if (onSearch) {
            onSearch(term);
        }
        setShowSuggestions(false);
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        
        // Auto-search as user types (debounced)
        if (value.length > 2) {
            setTimeout(() => {
                handleSearch(value);
            }, 300);
        } else if (value.length === 0) {
            handleSearch(''); // Clear search
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setSearchTerm(suggestion);
        handleSearch(suggestion);
    };

    const handleFocus = () => {
        if (suggestions.length > 0) {
            setShowSuggestions(true);
        }
    };

    const handleBlur = () => {
        // Delay hiding suggestions to allow clicks
        setTimeout(() => setShowSuggestions(false), 200);
    };

    return (
        <header className="search-header">
            <h2 className="header__title">Search it. Explore it. Buy it.</h2>
            <div className="search-container">
                <div className="search-input-wrapper">
                    <input
                        type="text"
                        className="header__search"
                        placeholder="Enter an address, neighborhood, city, or ZIP code"
                        value={searchTerm}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                    />
                    <button 
                        className="search-button"
                        onClick={() => handleSearch()}
                        aria-label="Search properties"
                    >
                        🔍
                    </button>
                </div>
                
                {showSuggestions && suggestions.length > 0 && (
                    <div className="search-suggestions">
                        {suggestions.map((suggestion, index) => (
                            <div
                                key={index}
                                className="suggestion-item"
                                onClick={() => handleSuggestionClick(suggestion)}
                            >
                                📍 {suggestion}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            {searchTerm && (
                <div className="search-status">
                    <span>Searching for: <strong>"{searchTerm}"</strong></span>
                    <button 
                        className="clear-search"
                        onClick={() => {
                            setSearchTerm('');
                            handleSearch('');
                        }}
                    >
                        ✕ Clear
                    </button>
                </div>
            )}
        </header>
    );
}

export default Search;