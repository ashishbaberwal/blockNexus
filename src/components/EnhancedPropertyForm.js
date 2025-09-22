import React, { useState, useEffect } from "react";
import { propertyStorage } from "../services/propertyStorage";
import FileUpload from "./FileUpload";
import "./PropertyForm.css";

const EnhancedPropertyForm = ({ property, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        // A. Property Basics
        title: "",
        fullAddress: "",
        houseNumber: "",
        street: "",
        locality: "",
        city: "",
        state: "",
        pinCode: "",
        type: "",
        subType: "",
        builtUpArea: "",
        superArea: "",
        plotDimensions: "",
        floorNumber: "",
        totalFloors: "",
        currentStatus: "",
        description: "",

        // B. Location Authenticity
        latitude: "",
        longitude: "",
        googleMapLink: "",
        nearbyLandmarks: "",
        transportation: "",
        accessibility: "",
        metroStation: "",
        schools: "",
        hospitals: "",
        mainRoads: "",

        // C. Legal Documents
        legalDocs: [],
        saleDeed: null,
        mutationCertificate: null,
        propertyTaxReceipt: null,
        encumbranceCertificate: null,
        constructionPlans: null,
        societyNOC: null,

        // D. Owner & Verification
        ownerName: "",
        ownerEmail: "",
        ownerPhone: "",
        ownerGovId: null,
        kycDocumentType: "",
        kycDocumentNumber: "",
        kycCompleted: false,

        // E. Media
        images: [],
        videoTour: null,
        floorPlan: null,
        propertyMap: null,

        // F. Financial Details
        askingPrice: "",
        currency: "INR",
        dealType: "sell", // sell, rent, lease
        deposit: "",
        advance: "",

        // G. Descriptive Details
        amenities: [],
        nearbyFacilities: [],
        maintenanceCharges: "",
        otherCharges: "",
        propertyCondition: "",
        propertyHistory: "",
        upgrades: "",
        view: "",

        // H. Verification & Badges
        inspectorVerification: "pending", // pending, verified, rejected
        inspectorReport: null,
        platformVerified: false,
        communityRating: 0,

        // File References (existing)
        fileReferences: [],
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 6; // Increased from 2 to 6 steps
    const [selectedAmenities, setSelectedAmenities] = useState([]);
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [selectedNearbyFacilities, setSelectedNearbyFacilities] = useState(
        []
    );
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [uploadedFolders, setUploadedFolders] = useState([]);

    const amenityOptions = [
        "Lift/Elevator",
        "Power Backup",
        "24/7 Security",
        "CCTV Surveillance",
        "Parking",
        "Covered Parking",
        "Garden/Landscaping",
        "Swimming Pool",
        "Gym/Fitness Center",
        "Club House",
        "Children's Playground",
        "Water Supply 24/7",
        "Intercom Facility",
        "Maintenance Staff",
        "Pet Friendly",
        "Balcony",
        "Terrace",
        "Wi-Fi Ready",
        "DTH Connection",
        "Fire Safety",
        "Waste Disposal",
        "Solar Power",
        "Rainwater Harvesting",
        "Senior Citizen Friendly",
        "Vastu Compliant",
        "Modular Kitchen",
        "Furnished",
        "Semi-Furnished",
        "Air Conditioning",
        "Central Air Conditioning",
        "Servant Room",
        "Puja Room",
        "Study Room",
        "Guest Room",
        "Home Theater",
        "Jacuzzi",
        "Steam Room",
        "Sauna",
        "Tennis Court",
        "Badminton Court",
        "Jogging Track",
        "Amphitheater",
        "Business Center",
        "Conference Room",
        "Library",
        "Cafeteria",
        "Medical Center",
        "Shopping Center",
        "ATM",
        "Bank",
        "Laundry Service",
        "Housekeeping",
        "Visitor Parking",
        "Guest House",
        "Party Hall",
        "Banquet Hall",
        "Multipurpose Hall",
    ];

    const nearbyFacilities = [
        "Metro Station",
        "Bus Stop",
        "Railway Station",
        "Airport",
        "Hospital",
        "School",
        "College",
        "Shopping Mall",
        "Market",
        "Bank",
        "ATM",
        "Restaurant",
        "Park",
        "Gym",
        "Pharmacy",
        "Petrol Pump",
    ];

    const propertyTypes = [
        { value: "apartment", label: "Apartment" },
        { value: "land", label: "Land" },
        { value: "villa", label: "Villa" },
        { value: "plot", label: "Plot" },
        { value: "commercial", label: "Commercial" },
        { value: "agricultural", label: "Agricultural" },
        { value: "house", label: "House" },
        { value: "penthouse", label: "Penthouse" },
        { value: "studio", label: "Studio" },
        { value: "townhouse", label: "Townhouse" },
        { value: "duplex", label: "Duplex" },
        { value: "warehouse", label: "Warehouse" },
        { value: "office", label: "Office Space" },
        { value: "shop", label: "Shop/Retail" },
    ];

    const currentStatusOptions = [
        { value: "vacant", label: "Vacant" },
        { value: "occupied", label: "Occupied" },
        { value: "under_construction", label: "Under Construction" },
        { value: "resale", label: "Resale" },
        { value: "new_booking", label: "New Booking" },
        { value: "ready_to_move", label: "Ready to Move" },
    ];

    const dealTypeOptions = [
        { value: "sell", label: "Sell" },
        { value: "rent", label: "Rent" },
        { value: "lease", label: "Lease" },
        { value: "pg", label: "PG/Hostel" },
    ];

    const propertyConditionOptions = [
        { value: "excellent", label: "Excellent" },
        { value: "good", label: "Good" },
        { value: "average", label: "Average" },
        { value: "needs_renovation", label: "Needs Renovation" },
        { value: "new_construction", label: "New Construction" },
    ];

    const kycDocumentTypes = [
        "Aadhaar Card",
        "Passport",
        "Driving License",
        "Voter ID",
        "PAN Card",
        "Other Government ID",
    ];

    useEffect(() => {
        if (property) {
            setFormData({ ...formData, ...property });
            setSelectedAmenities(property.amenities || []);
            setSelectedNearbyFacilities(property.nearbyFacilities || []);
            setUploadedFiles(property.fileReferences || []);
        }
    }, [property]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
    };

    const handleAmenityChange = (amenity) => {
        const newAmenities = selectedAmenities.includes(amenity)
            ? selectedAmenities.filter((a) => a !== amenity)
            : [...selectedAmenities, amenity];

        setSelectedAmenities(newAmenities);
        setFormData((prev) => ({
            ...prev,
            amenities: newAmenities,
        }));
    };

    const handleNearbyFacilityChange = (facility) => {
        const newFacilities = selectedNearbyFacilities.includes(facility)
            ? selectedNearbyFacilities.filter((f) => f !== facility)
            : [...selectedNearbyFacilities, facility];

        setSelectedNearbyFacilities(newFacilities);
        setFormData((prev) => ({
            ...prev,
            nearbyFacilities: newFacilities,
        }));
    };

    const handleFilesUploaded = (files) => {
        setUploadedFiles(files);
        setFormData((prev) => ({
            ...prev,
            fileReferences: files,
        }));
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        const imageUrls = files.map((file) => URL.createObjectURL(file));

        setFormData((prev) => ({
            ...prev,
            images: [...prev.images, ...imageUrls],
        }));
    };

    const removeImage = (index) => {
        setFormData((prev) => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
        }));
    };

    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by this browser.");
            return;
        }

        setIsGettingLocation(true);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setFormData((prev) => ({
                    ...prev,
                    latitude: latitude.toFixed(6),
                    longitude: longitude.toFixed(6),
                }));
                setIsGettingLocation(false);

                // Optionally get reverse geocoding to populate Google Maps link
                const googleMapsUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
                setFormData((prev) => ({
                    ...prev,
                    googleMapLink: googleMapsUrl,
                }));
            },
            (error) => {
                setIsGettingLocation(false);
                let errorMessage = "Unable to get your location. ";

                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage += "Location access denied by user.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage += "Location information is unavailable.";
                        break;
                    case error.TIMEOUT:
                        errorMessage += "Location request timed out.";
                        break;
                    default:
                        errorMessage += "An unknown error occurred.";
                        break;
                }

                alert(errorMessage);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000,
            }
        );
    };

    const validateStep = (step) => {
        const newErrors = {};

        if (step === 1) {
            if (!formData.title.trim())
                newErrors.title = "Property title is required";
            if (!formData.fullAddress.trim())
                newErrors.fullAddress = "Address is required";
            if (!formData.type) newErrors.type = "Property type is required";
            if (!formData.builtUpArea)
                newErrors.builtUpArea = "Area is required";
            if (!formData.description.trim())
                newErrors.description = "Description is required";
            if (!formData.ownerName.trim())
                newErrors.ownerName = "Owner name is required";
            if (!formData.ownerPhone.trim())
                newErrors.ownerPhone = "Phone number is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
        }
    };

    const handlePrevious = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 1));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateStep(currentStep)) {
            return;
        }

        setIsSubmitting(true);
        try {
            const propertyData = {
                ...formData,
                id: property?.id || Date.now().toString(),
                createdAt: property?.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                status: "pending",
            };

            await propertyStorage.saveProperty(propertyData);

            // Save file references
            if (uploadedFiles.length > 0) {
                for (const fileRef of uploadedFiles) {
                    await propertyStorage.addFileReference(
                        propertyData.id,
                        fileRef
                    );
                }
            }

            onSave(propertyData);
        } catch (error) {
            console.error("Error saving property:", error);
            alert("Error saving property. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStep1 = () => (
        <div className="form-step">
            <h3>1. Property Basics</h3>

            <div className="form-group">
                <label htmlFor="title">Property Title/Name *</label>
                <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., 2BHK Apartment in Noida Extension"
                    className={errors.title ? "error" : ""}
                />
                {errors.title && (
                    <span className="error-message">{errors.title}</span>
                )}
            </div>

            <div className="form-section">
                <h4>Full Address</h4>
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="houseNumber">House/Flat Number *</label>
                        <input
                            type="text"
                            id="houseNumber"
                            name="houseNumber"
                            value={formData.houseNumber}
                            onChange={handleInputChange}
                            placeholder="e.g., A-101, 2nd Floor"
                            className={errors.houseNumber ? "error" : ""}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="street">Street *</label>
                        <input
                            type="text"
                            id="street"
                            name="street"
                            value={formData.street}
                            onChange={handleInputChange}
                            placeholder="Street name"
                            className={errors.street ? "error" : ""}
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="locality">Locality *</label>
                        <input
                            type="text"
                            id="locality"
                            name="locality"
                            value={formData.locality}
                            onChange={handleInputChange}
                            placeholder="Area/Locality"
                            className={errors.locality ? "error" : ""}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="city">City *</label>
                        <input
                            type="text"
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            placeholder="City"
                            className={errors.city ? "error" : ""}
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="state">State *</label>
                        <input
                            type="text"
                            id="state"
                            name="state"
                            value={formData.state}
                            onChange={handleInputChange}
                            placeholder="State"
                            className={errors.state ? "error" : ""}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="pinCode">PIN Code *</label>
                        <input
                            type="text"
                            id="pinCode"
                            name="pinCode"
                            value={formData.pinCode}
                            onChange={handleInputChange}
                            placeholder="6-digit PIN code"
                            maxLength="6"
                            className={errors.pinCode ? "error" : ""}
                        />
                    </div>
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="type">Property Type *</label>
                    <select
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        className={errors.type ? "error" : ""}
                    >
                        <option value="">Select Type</option>
                        {propertyTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>
                    {errors.type && (
                        <span className="error-message">{errors.type}</span>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="currentStatus">Current Status *</label>
                    <select
                        id="currentStatus"
                        name="currentStatus"
                        value={formData.currentStatus}
                        onChange={handleInputChange}
                        className={errors.currentStatus ? "error" : ""}
                    >
                        <option value="">Select Status</option>
                        {currentStatusOptions.map((status) => (
                            <option key={status.value} value={status.value}>
                                {status.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="form-section">
                <h4>Area Information</h4>
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="builtUpArea">
                            Built-up Area (sq ft) *
                        </label>
                        <input
                            type="number"
                            id="builtUpArea"
                            name="builtUpArea"
                            value={formData.builtUpArea}
                            onChange={handleInputChange}
                            placeholder="e.g., 1200"
                            className={errors.builtUpArea ? "error" : ""}
                        />
                        {errors.builtUpArea && (
                            <span className="error-message">
                                {errors.builtUpArea}
                            </span>
                        )}
                    </div>
                    <div className="form-group">
                        <label htmlFor="superArea">Super Area (sq ft)</label>
                        <input
                            type="number"
                            id="superArea"
                            name="superArea"
                            value={formData.superArea}
                            onChange={handleInputChange}
                            placeholder="e.g., 1400"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="plotDimensions">
                        Plot Dimensions (if applicable)
                    </label>
                    <input
                        type="text"
                        id="plotDimensions"
                        name="plotDimensions"
                        value={formData.plotDimensions}
                        onChange={handleInputChange}
                        placeholder="e.g., 30x40 feet or 1200 sq ft"
                    />
                </div>
            </div>

            <div className="form-section">
                <h4>Floor Information</h4>
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="floorNumber">Floor Number</label>
                        <input
                            type="number"
                            id="floorNumber"
                            name="floorNumber"
                            value={formData.floorNumber}
                            onChange={handleInputChange}
                            placeholder="e.g., 3"
                            min="0"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="totalFloors">Total Floors</label>
                        <input
                            type="number"
                            id="totalFloors"
                            name="totalFloors"
                            value={formData.totalFloors}
                            onChange={handleInputChange}
                            placeholder="e.g., 15"
                            min="1"
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="form-step">
            <h3>2. Location Authenticity</h3>

            <div className="form-section">
                <h4>Google Location & Verification</h4>
                <div className="form-group">
                    <label htmlFor="googleMapLink">Google Maps Link *</label>
                    <input
                        type="url"
                        id="googleMapLink"
                        name="googleMapLink"
                        value={formData.googleMapLink}
                        onChange={handleInputChange}
                        placeholder="https://maps.google.com/..."
                        className={errors.googleMapLink ? "error" : ""}
                    />
                    <p className="help-text">
                        Copy the Google Maps link of the exact property location
                    </p>
                    {errors.googleMapLink && (
                        <span className="error-message">
                            {errors.googleMapLink}
                        </span>
                    )}
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="latitude">Latitude</label>
                        <input
                            type="number"
                            id="latitude"
                            name="latitude"
                            value={formData.latitude}
                            onChange={handleInputChange}
                            placeholder="e.g., 28.5355"
                            step="0.000001"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="longitude">Longitude</label>
                        <input
                            type="number"
                            id="longitude"
                            name="longitude"
                            value={formData.longitude}
                            onChange={handleInputChange}
                            placeholder="e.g., 77.3910"
                            step="0.000001"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <button
                        type="button"
                        onClick={getCurrentLocation}
                        disabled={isGettingLocation}
                        className="btn btn--secondary"
                        style={{ marginTop: "10px" }}
                    >
                        {isGettingLocation
                            ? "Getting Location..."
                            : "📍 Get My Current Location"}
                    </button>
                    <p className="help-text">
                        Click to automatically fill coordinates and Google Maps
                        link with your current location
                    </p>
                </div>
            </div>

            <div className="form-section">
                <h4>Nearby Landmarks</h4>
                <div className="form-group">
                    <label htmlFor="nearbyLandmarks">Major Landmarks</label>
                    <textarea
                        id="nearbyLandmarks"
                        name="nearbyLandmarks"
                        value={formData.nearbyLandmarks}
                        onChange={handleInputChange}
                        placeholder="e.g., 500m from Metro Station, 1km from City Mall, Near ABC Hospital"
                        rows="3"
                    />
                </div>
            </div>

            <div className="form-section">
                <h4>Connectivity</h4>
                <div className="form-group">
                    <label htmlFor="transportation">
                        Public Transportation
                    </label>
                    <textarea
                        id="transportation"
                        name="transportation"
                        value={formData.transportation}
                        onChange={handleInputChange}
                        placeholder="Metro, Bus, Auto availability and distance"
                        rows="2"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="accessibility">Road Connectivity</label>
                    <textarea
                        id="accessibility"
                        name="accessibility"
                        value={formData.accessibility}
                        onChange={handleInputChange}
                        placeholder="Main road access, internal roads condition"
                        rows="2"
                    />
                </div>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="form-step">
            <h3>3. Legal Documents</h3>
            <div className="form-section">
                <h4>Upload Legal Documents</h4>
                <div className="form-group">
                    <label htmlFor="legalDocs">
                        Property Legal Documents *
                    </label>
                    <FileUpload
                        onFilesSelected={(files) =>
                            setFormData((prev) => ({
                                ...prev,
                                legalDocs: files,
                            }))
                        }
                        maxFiles={10}
                        accept="application/pdf,image/*"
                        existingFiles={formData.legalDocs}
                        isMultiple={true}
                    />
                    <p className="help-text">
                        Upload sale deed, title deed, registry, mutation, NOC,
                        and other legal documents
                    </p>
                    {errors.legalDocs && (
                        <span className="error-message">
                            {errors.legalDocs}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
    return (
        <div className="property-form">
            <div className="form-header">
                <h2>{property ? "Edit Property" : "Add New Property"}</h2>
                <div className="step-indicator">
                    Step {currentStep} of {totalSteps}
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="form-content">
                    {currentStep === 1 && renderStep1()}
                    {currentStep === 2 && renderStep2()}
                    {currentStep === 3 && renderStep3()}

                    <div className="form-actions">
                        <div className="form-navigation">
                            {currentStep > 1 && (
                                <button
                                    type="button"
                                    onClick={handlePrevious}
                                    className="btn btn--outline"
                                >
                                    Previous
                                </button>
                            )}

                            {currentStep < totalSteps ? (
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    className="btn btn--primary"
                                >
                                    Next
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="btn btn--primary"
                                >
                                    {isSubmitting
                                        ? "Saving..."
                                        : property
                                        ? "Update Property"
                                        : "Add Property"}
                                </button>
                            )}
                        </div>

                        <div className="form-cancel">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="btn btn--outline"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default EnhancedPropertyForm;
