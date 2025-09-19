import React, { useState, useEffect } from 'react';
import { propertyStorage, propertyTypes } from '../services/propertyStorage';
import PropertyCard from './PropertyCard';
import PropertyForm from './PropertyForm';
import './PropertyList.css';

const PropertyList = () => {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('createdAt'); // 'createdAt', 'propertyNumber', 'type'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'

  // Load properties on component mount
  useEffect(() => {
    loadProperties();
  }, []);

  // Filter and search properties
  useEffect(() => {
    let filtered = properties;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = propertyStorage.searchProperties(searchQuery);
    }

    // Apply type filter
    if (filterType) {
      filtered = filtered.filter(property => property.type === filterType);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'propertyNumber':
          aValue = a.propertyNumber || '';
          bValue = b.propertyNumber || '';
          break;
        case 'type':
          aValue = a.type || '';
          bValue = b.type || '';
          break;
        case 'createdAt':
        default:
          aValue = new Date(a.createdAt || 0);
          bValue = new Date(b.createdAt || 0);
          break;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredProperties(filtered);
  }, [properties, searchQuery, filterType, sortBy, sortOrder]);

  const loadProperties = () => {
    const allProperties = propertyStorage.getAllProperties();
    setProperties(allProperties);
  };

  const handleAddProperty = () => {
    setEditingProperty(null);
    setShowForm(true);
  };

  const handleEditProperty = (property) => {
    setEditingProperty(property);
    setShowForm(true);
  };

  const handleDeleteProperty = (propertyId) => {
    if (window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      const success = propertyStorage.deleteProperty(propertyId);
      if (success) {
        loadProperties();
      } else {
        alert('Failed to delete property. Please try again.');
      }
    }
  };

  const handleSaveProperty = (propertyData) => {
    const success = propertyStorage.saveProperty(propertyData);
    if (success) {
      loadProperties();
      setShowForm(false);
      setEditingProperty(null);
    } else {
      alert('Failed to save property. Please try again.');
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProperty(null);
  };

  const getPropertyTypeLabel = (type) => {
    const typeObj = propertyTypes.find(t => t.value === type);
    return typeObj ? typeObj.label : type;
  };

  const stats = propertyStorage.getStorageStats();

  if (showForm) {
    return (
      <PropertyForm
        property={editingProperty}
        onSave={handleSaveProperty}
        onCancel={handleCloseForm}
      />
    );
  }

  return (
    <div className="property-list-container">
      <div className="property-list-header">
        <div className="header-content">
          <h1>My Properties</h1>
          <p>Manage your property portfolio and legal documents</p>
        </div>
        <button 
          className="btn btn--primary add-property-btn"
          onClick={handleAddProperty}
        >
          + Add New Property
        </button>
      </div>

      {/* Statistics */}
      <div className="property-stats">
        <div className="stat-card">
          <h3>{stats.totalProperties}</h3>
          <p>Total Properties</p>
        </div>
        {Object.entries(stats.byType).map(([type, count]) => (
          <div key={type} className="stat-card">
            <h3>{count}</h3>
            <p>{getPropertyTypeLabel(type)}</p>
          </div>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="property-filters">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search properties by number, location, or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>

        <div className="filter-controls">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="">All Types</option>
            {propertyTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="createdAt">Sort by Date</option>
            <option value="propertyNumber">Sort by Property Number</option>
            <option value="type">Sort by Type</option>
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="sort-btn"
            title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>

          <div className="view-toggle">
            <button
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              ⊞
            </button>
            <button
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      {/* Properties Grid/List */}
      {filteredProperties.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏠</div>
          <h3>No Properties Found</h3>
          <p>
            {searchQuery || filterType 
              ? 'No properties match your current filters. Try adjusting your search criteria.'
              : 'You haven\'t added any properties yet. Click "Add New Property" to get started.'
            }
          </p>
          {!searchQuery && !filterType && (
            <button 
              className="btn btn--primary"
              onClick={handleAddProperty}
            >
              Add Your First Property
            </button>
          )}
        </div>
      ) : (
        <div className={`properties-container ${viewMode}`}>
          {filteredProperties.map(property => (
            <PropertyCard
              key={property.id}
              property={property}
              viewMode={viewMode}
              onEdit={handleEditProperty}
              onDelete={handleDeleteProperty}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertyList;
