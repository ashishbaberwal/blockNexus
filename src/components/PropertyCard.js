import React, { useState } from "react";
import { propertyTypes } from "../services/propertyStorage";
import "./PropertyCard.css";

const PropertyCard = ({ property, viewMode, onEdit, onDelete }) => {
    const [showDetails, setShowDetails] = useState(false);

    const getPropertyTypeLabel = (type) => {
        const typeObj = propertyTypes.find((t) => t.value === type);
        return typeObj ? typeObj.label : type;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const formatCurrency = (amount) => {
        if (!amount) return "Not specified";
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "complete":
                return "#38a169";
            case "pending":
                return "#ed8936";
            case "incomplete":
                return "#e53e3e";
            case "clear":
                return "#38a169";
            case "issues":
                return "#e53e3e";
            case "disputed":
                return "#e53e3e";
            default:
                return "#a0aec0";
        }
    };

    const getDocumentStatus = () => {
        const requiredDocs = [
            "ownershipTitle",
            "encumbranceCertificate",
            "governmentApprovals",
            "litigationStatus",
        ];
        const completedDocs = requiredDocs.filter(
            (doc) => property[doc] && property[doc].trim()
        );

        if (completedDocs.length === 0)
            return { status: "incomplete", text: "No Documents" };
        if (completedDocs.length === requiredDocs.length)
            return { status: "complete", text: "Complete" };
        return {
            status: "pending",
            text: `${completedDocs.length}/${requiredDocs.length} Documents`,
        };
    };

    const getPropertySubType = () => {
        if (!property.subType) return "";
        return property.subType
            .replace("-", " ")
            .replace(/\b\w/g, (l) => l.toUpperCase());
    };

    const docStatus = getDocumentStatus();

    if (viewMode === "list") {
        return (
            <div className="property-card list-view">
                <div className="card-header">
                    <div className="property-info">
                        <h3 className="property-title">
                            {property.propertyTitle || property.propertyNumber}
                        </h3>
                        <p className="property-subtitle">
                            {property.propertyNumber} •{" "}
                            {getPropertyTypeLabel(property.type)}
                            {property.subType && ` (${getPropertySubType()})`}
                        </p>
                        <p className="property-location">{property.location}</p>
                    </div>
                    <div className="property-meta">
                        <div className="meta-badges">
                            <span className="property-badge area">
                                {property.landArea}
                            </span>
                            {property.currentValue && (
                                <span className="property-badge price">
                                    {formatCurrency(property.currentValue)}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="card-content">
                    <div className="property-details">
                        <div className="detail-grid">
                            <div className="detail-item">
                                <span className="label">📍 Location:</span>
                                <span className="value">
                                    {property.city}, {property.district}
                                </span>
                            </div>
                            <div className="detail-item">
                                <span className="label">🏠 Built-up:</span>
                                <span className="value">
                                    {property.builtUpArea || "Not specified"}
                                </span>
                            </div>
                            <div className="detail-item">
                                <span className="label">🚗 Parking:</span>
                                <span className="value">
                                    {property.parkingSpaces
                                        ? `${property.parkingSpaces} space(s)`
                                        : "None"}
                                </span>
                            </div>
                            <div className="detail-item">
                                <span className="label">📄 Documents:</span>
                                <span
                                    className="value status"
                                    style={{
                                        color: getStatusColor(docStatus.status),
                                    }}
                                >
                                    {docStatus.text}
                                </span>
                            </div>
                            <div className="detail-item">
                                <span className="label">👤 Owner:</span>
                                <span className="value">
                                    {property.ownerName || "Not specified"}
                                </span>
                            </div>
                            <div className="detail-item">
                                <span className="label">🏗️ Year Built:</span>
                                <span className="value">
                                    {property.yearBuilt || "Not specified"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="card-actions">
                        <button
                            className="btn btn--outline"
                            onClick={() => setShowDetails(!showDetails)}
                        >
                            {showDetails ? "Hide Details" : "View Details"}
                        </button>
                        <button
                            className="btn btn--secondary"
                            onClick={() => onEdit(property)}
                        >
                            Edit
                        </button>
                        <button
                            className="btn btn--danger"
                            onClick={() => onDelete(property.id)}
                        >
                            Delete
                        </button>
                    </div>
                </div>

                {showDetails && (
                    <div className="card-details">
                        <div className="details-tabs">
                            <div className="tab-content">
                                <div className="details-grid">
                                    <div className="detail-section">
                                        <h4>🏢 Property Information</h4>
                                        <div className="detail-item">
                                            <span className="label">
                                                Property Number:
                                            </span>
                                            <span className="value">
                                                {property.propertyNumber}
                                            </span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="label">
                                                Property Title:
                                            </span>
                                            <span className="value">
                                                {property.propertyTitle ||
                                                    "Not provided"}
                                            </span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="label">Type:</span>
                                            <span className="value">
                                                {getPropertyTypeLabel(
                                                    property.type
                                                )}
                                            </span>
                                        </div>
                                        {property.subType && (
                                            <div className="detail-item">
                                                <span className="label">
                                                    Sub Type:
                                                </span>
                                                <span className="value">
                                                    {getPropertySubType()}
                                                </span>
                                            </div>
                                        )}
                                        <div className="detail-item">
                                            <span className="label">
                                                Land Area:
                                            </span>
                                            <span className="value">
                                                {property.landArea}
                                            </span>
                                        </div>
                                        {property.builtUpArea && (
                                            <div className="detail-item">
                                                <span className="label">
                                                    Built-up Area:
                                                </span>
                                                <span className="value">
                                                    {property.builtUpArea}
                                                </span>
                                            </div>
                                        )}
                                        {property.yearBuilt && (
                                            <div className="detail-item">
                                                <span className="label">
                                                    Year Built:
                                                </span>
                                                <span className="value">
                                                    {property.yearBuilt}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="detail-section">
                                        <h4>📍 Location Details</h4>
                                        <div className="detail-item">
                                            <span className="label">
                                                Full Address:
                                            </span>
                                            <span className="value">
                                                {property.location}
                                            </span>
                                        </div>
                                        {property.streetAddress && (
                                            <div className="detail-item">
                                                <span className="label">
                                                    Street Address:
                                                </span>
                                                <span className="value">
                                                    {property.streetAddress}
                                                </span>
                                            </div>
                                        )}
                                        {property.locality && (
                                            <div className="detail-item">
                                                <span className="label">
                                                    Locality:
                                                </span>
                                                <span className="value">
                                                    {property.locality}
                                                </span>
                                            </div>
                                        )}
                                        {property.landmark && (
                                            <div className="detail-item">
                                                <span className="label">
                                                    Landmark:
                                                </span>
                                                <span className="value">
                                                    {property.landmark}
                                                </span>
                                            </div>
                                        )}
                                        <div className="detail-item">
                                            <span className="label">
                                                City, District:
                                            </span>
                                            <span className="value">
                                                {property.city},{" "}
                                                {property.district}
                                            </span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="label">
                                                State, Pincode:
                                            </span>
                                            <span className="value">
                                                {property.state},{" "}
                                                {property.pincode}
                                            </span>
                                        </div>
                                        {property.geoCoordinates && (
                                            <div className="detail-item">
                                                <span className="label">
                                                    Coordinates:
                                                </span>
                                                <span className="value">
                                                    {property.geoCoordinates}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="detail-section">
                                        <h4>🏠 Property Features</h4>
                                        {property.parkingSpaces && (
                                            <div className="detail-item">
                                                <span className="label">
                                                    Parking:
                                                </span>
                                                <span className="value">
                                                    {property.parkingSpaces}{" "}
                                                    space(s)
                                                </span>
                                            </div>
                                        )}
                                        {property.furnishingStatus && (
                                            <div className="detail-item">
                                                <span className="label">
                                                    Furnishing:
                                                </span>
                                                <span className="value">
                                                    {property.furnishingStatus
                                                        .replace("-", " ")
                                                        .replace(/\b\w/g, (l) =>
                                                            l.toUpperCase()
                                                        )}
                                                </span>
                                            </div>
                                        )}
                                        {property.facingDirection && (
                                            <div className="detail-item">
                                                <span className="label">
                                                    Facing:
                                                </span>
                                                <span className="value">
                                                    {property.facingDirection
                                                        .replace("-", " ")
                                                        .replace(/\b\w/g, (l) =>
                                                            l.toUpperCase()
                                                        )}
                                                </span>
                                            </div>
                                        )}
                                        {property.floorNumber && (
                                            <div className="detail-item">
                                                <span className="label">
                                                    Floor:
                                                </span>
                                                <span className="value">
                                                    {property.floorNumber}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="detail-section">
                                        <h4>💰 Financial Information</h4>
                                        {property.currentValue && (
                                            <div className="detail-item">
                                                <span className="label">
                                                    Current Value:
                                                </span>
                                                <span className="value">
                                                    {formatCurrency(
                                                        property.currentValue
                                                    )}
                                                </span>
                                            </div>
                                        )}
                                        {property.purchasePrice && (
                                            <div className="detail-item">
                                                <span className="label">
                                                    Purchase Price:
                                                </span>
                                                <span className="value">
                                                    {formatCurrency(
                                                        property.purchasePrice
                                                    )}
                                                </span>
                                            </div>
                                        )}
                                        {property.registrationValue && (
                                            <div className="detail-item">
                                                <span className="label">
                                                    Registration Value:
                                                </span>
                                                <span className="value">
                                                    {formatCurrency(
                                                        property.registrationValue
                                                    )}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="detail-section">
                                        <h4>👤 Ownership Details</h4>
                                        <div className="detail-item">
                                            <span className="label">
                                                Owner Name:
                                            </span>
                                            <span className="value">
                                                {property.ownerName ||
                                                    "Not provided"}
                                            </span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="label">
                                                Contact:
                                            </span>
                                            <span className="value">
                                                {property.ownerContact ||
                                                    "Not provided"}
                                            </span>
                                        </div>
                                        {property.ownerEmail && (
                                            <div className="detail-item">
                                                <span className="label">
                                                    Email:
                                                </span>
                                                <span className="value">
                                                    {property.ownerEmail}
                                                </span>
                                            </div>
                                        )}
                                        {property.ownershipType && (
                                            <div className="detail-item">
                                                <span className="label">
                                                    Ownership Type:
                                                </span>
                                                <span className="value">
                                                    {property.ownershipType
                                                        .replace("-", " ")
                                                        .replace(/\b\w/g, (l) =>
                                                            l.toUpperCase()
                                                        )}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="detail-section">
                                        <h4>📄 Legal Status</h4>
                                        <div className="detail-item">
                                            <span className="label">
                                                Documents Status:
                                            </span>
                                            <span
                                                className="value status"
                                                style={{
                                                    color: getStatusColor(
                                                        docStatus.status
                                                    ),
                                                }}
                                            >
                                                {docStatus.text}
                                            </span>
                                        </div>
                                        {property.titleClearance && (
                                            <div className="detail-item">
                                                <span className="label">
                                                    Title Clearance:
                                                </span>
                                                <span
                                                    className="value status"
                                                    style={{
                                                        color: getStatusColor(
                                                            property.titleClearance
                                                        ),
                                                    }}
                                                >
                                                    {property.titleClearance
                                                        .replace("-", " ")
                                                        .replace(/\b\w/g, (l) =>
                                                            l.toUpperCase()
                                                        )}
                                                </span>
                                            </div>
                                        )}
                                        {property.surveyNumber && (
                                            <div className="detail-item">
                                                <span className="label">
                                                    Survey Number:
                                                </span>
                                                <span className="value">
                                                    {property.surveyNumber}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {property.amenities &&
                                    property.amenities.length > 0 && (
                                        <div className="amenities-section">
                                            <h4>🏖️ Amenities</h4>
                                            <div className="amenities-grid">
                                                {property.amenities.map(
                                                    (amenity, index) => (
                                                        <span
                                                            key={index}
                                                            className="amenity-tag"
                                                        >
                                                            {amenity}
                                                        </span>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    )}

                                {property.nearbyFacilities &&
                                    property.nearbyFacilities.length > 0 && (
                                        <div className="facilities-section">
                                            <h4>🏪 Nearby Facilities</h4>
                                            <div className="facilities-grid">
                                                {property.nearbyFacilities.map(
                                                    (facility, index) => (
                                                        <span
                                                            key={index}
                                                            className="facility-tag"
                                                        >
                                                            {facility}
                                                        </span>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    )}

                                {(property.propertyDescription ||
                                    property.specialFeatures ||
                                    property.additionalNotes) && (
                                    <div className="notes-section">
                                        {property.propertyDescription && (
                                            <div>
                                                <h4>📝 Property Description</h4>
                                                <p>
                                                    {
                                                        property.propertyDescription
                                                    }
                                                </p>
                                            </div>
                                        )}
                                        {property.specialFeatures && (
                                            <div>
                                                <h4>⭐ Special Features</h4>
                                                <p>
                                                    {property.specialFeatures}
                                                </p>
                                            </div>
                                        )}
                                        {property.additionalNotes && (
                                            <div>
                                                <h4>📋 Additional Notes</h4>
                                                <p>
                                                    {property.additionalNotes}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Grid view
    return (
        <div className="property-card grid-view">
            <div className="card-header">
                <div className="property-type-badge">
                    {getPropertyTypeLabel(property.type)}
                    {property.subType && (
                        <span className="sub-type">
                            ({getPropertySubType()})
                        </span>
                    )}
                </div>
                <div className="card-menu">
                    <button
                        className="menu-btn"
                        onClick={() => setShowDetails(!showDetails)}
                    >
                        ⋯
                    </button>
                </div>
            </div>

            <div className="card-content">
                <h3 className="property-title">
                    {property.propertyTitle || property.propertyNumber}
                </h3>
                <p className="property-subtitle">{property.propertyNumber}</p>
                <p className="property-location">{property.location}</p>

                <div className="property-meta">
                    <div className="meta-item">
                        <span className="icon">📍</span>
                        <span>
                            {property.city}, {property.district}
                        </span>
                    </div>
                    <div className="meta-item">
                        <span className="icon">📏</span>
                        <span>{property.landArea}</span>
                    </div>
                    {property.currentValue && (
                        <div className="meta-item price">
                            <span className="icon">💰</span>
                            <span>{formatCurrency(property.currentValue)}</span>
                        </div>
                    )}
                </div>

                <div className="property-badges">
                    {property.yearBuilt && (
                        <span className="badge year">{property.yearBuilt}</span>
                    )}
                    {property.parkingSpaces && (
                        <span className="badge parking">
                            🚗 {property.parkingSpaces}
                        </span>
                    )}
                    {property.furnishingStatus && (
                        <span className="badge furnishing">
                            {property.furnishingStatus === "fully-furnished"
                                ? "🛋️ Furnished"
                                : property.furnishingStatus === "semi-furnished"
                                ? "🏠 Semi-Furnished"
                                : "🔧 Unfurnished"}
                        </span>
                    )}
                </div>

                <div className="document-status">
                    <div
                        className="status-indicator"
                        style={{
                            backgroundColor: getStatusColor(docStatus.status),
                        }}
                    ></div>
                    <span className="status-text">{docStatus.text}</span>
                </div>
            </div>

            <div className="card-actions">
                <button
                    className="btn btn--outline"
                    onClick={() => setShowDetails(!showDetails)}
                >
                    {showDetails ? "Hide" : "Details"}
                </button>
                <button
                    className="btn btn--secondary"
                    onClick={() => onEdit(property)}
                >
                    Edit
                </button>
                <button
                    className="btn btn--danger"
                    onClick={() => onDelete(property.id)}
                >
                    Delete
                </button>
            </div>

            {showDetails && (
                <div className="card-details">
                    <div className="details-grid compact">
                        <div className="detail-section">
                            <h4>🏢 Basic Info</h4>
                            <div className="detail-item">
                                <span className="label">Property ID:</span>
                                <span className="value">
                                    {property.propertyNumber}
                                </span>
                            </div>
                            <div className="detail-item">
                                <span className="label">Type:</span>
                                <span className="value">
                                    {getPropertyTypeLabel(property.type)}
                                </span>
                            </div>
                            {property.yearBuilt && (
                                <div className="detail-item">
                                    <span className="label">Built:</span>
                                    <span className="value">
                                        {property.yearBuilt}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="detail-section">
                            <h4>📍 Location</h4>
                            <div className="detail-item">
                                <span className="label">Area:</span>
                                <span className="value">
                                    {property.locality || property.city}
                                </span>
                            </div>
                            <div className="detail-item">
                                <span className="label">Pincode:</span>
                                <span className="value">
                                    {property.pincode}
                                </span>
                            </div>
                        </div>

                        <div className="detail-section">
                            <h4>👤 Owner</h4>
                            <div className="detail-item">
                                <span className="label">Name:</span>
                                <span className="value">
                                    {property.ownerName || "Not provided"}
                                </span>
                            </div>
                            <div className="detail-item">
                                <span className="label">Contact:</span>
                                <span className="value">
                                    {property.ownerContact || "Not provided"}
                                </span>
                            </div>
                        </div>

                        <div className="detail-section">
                            <h4>💰 Financial</h4>
                            {property.currentValue && (
                                <div className="detail-item">
                                    <span className="label">Value:</span>
                                    <span className="value">
                                        {formatCurrency(property.currentValue)}
                                    </span>
                                </div>
                            )}
                            {property.purchasePrice && (
                                <div className="detail-item">
                                    <span className="label">Purchase:</span>
                                    <span className="value">
                                        {formatCurrency(property.purchasePrice)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {property.amenities && property.amenities.length > 0 && (
                        <div className="amenities-section compact">
                            <h4>🏖️ Amenities</h4>
                            <div className="amenities-grid compact">
                                {property.amenities
                                    .slice(0, 6)
                                    .map((amenity, index) => (
                                        <span
                                            key={index}
                                            className="amenity-tag small"
                                        >
                                            {amenity}
                                        </span>
                                    ))}
                                {property.amenities.length > 6 && (
                                    <span className="amenity-tag small more">
                                        +{property.amenities.length - 6} more
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="card-footer">
                <span className="created-date">
                    Added {formatDate(property.createdAt)}
                </span>
                {property.verificationStatus && (
                    <span
                        className={`verification-status ${property.verificationStatus}`}
                    >
                        {property.verificationStatus === "pending"
                            ? "⏳ Pending"
                            : property.verificationStatus === "verified"
                            ? "✅ Verified"
                            : "❌ Rejected"}
                    </span>
                )}
            </div>
        </div>
    );
};

export default PropertyCard;
