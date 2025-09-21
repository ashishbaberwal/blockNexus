import React, { useState, useEffect } from "react";
import { propertyStorage } from "../services/propertyStorage";
import FileUpload from "./FileUpload";
import "./PropertyForm.css";

const EnhancedPropertyForm = ({ property, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        // Core Property Information
        title: "",
        fullAddress: "",
        latitude: "",
        longitude: "",
        type: "",
        subType: "",
        builtUpArea: "",
        superArea: "",
        floorNumber: "",
        totalFloors: "",
        currentStatus: "",
        description: "",

        // Owner/Seller Information
        ownerName: "",
        ownerEmail: "",
        ownerPhone: "",
        kycDocumentType: "",
        kycDocumentNumber: "",

        // Additional Details
        amenities: [],
        nearbyFacilities: [],

        // Images
        images: [],

        // File References
        fileReferences: [],
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 2;
    const [selectedAmenities, setSelectedAmenities] = useState([]);
    const [selectedNearbyFacilities, setSelectedNearbyFacilities] = useState(
        []
    );
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [uploadedFolders, setUploadedFolders] = useState([]);

    const amenityOptions = [
        "Lift",
        "Power Backup",
        "Security",
        "Parking",
        "Garden",
        "Swimming Pool",
        "Gym",
        "Club House",
        "Playground",
        "Water Supply",
        "24/7 Security",
        "Intercom",
        "Maintenance Staff",
        "Pet Friendly",
        "Balcony",
        "Terrace",
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
        { value: "commercial", label: "Commercial" },
        { value: "plot", label: "Plot" },
        { value: "house", label: "House" },
        { value: "penthouse", label: "Penthouse" },
        { value: "studio", label: "Studio" },
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
            <h3>1. Property Information</h3>

            <div className="form-group">
                <label htmlFor="title">Property Title *</label>
                <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Beautiful 3BHK Apartment"
                    className={errors.title ? "error" : ""}
                />
                {errors.title && (
                    <span className="error-message">{errors.title}</span>
                )}
            </div>

            <div className="form-group">
                <label htmlFor="fullAddress">Address *</label>
                <textarea
                    id="fullAddress"
                    name="fullAddress"
                    value={formData.fullAddress}
                    onChange={handleInputChange}
                    placeholder="Complete address with city, state, pincode"
                    rows="2"
                    className={errors.fullAddress ? "error" : ""}
                />
                {errors.fullAddress && (
                    <span className="error-message">{errors.fullAddress}</span>
                )}
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
                    <label htmlFor="builtUpArea">Area (sqft) *</label>
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
            </div>

            <div className="form-group">
                <label htmlFor="description">Description *</label>
                <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe your property..."
                    rows="3"
                    className={errors.description ? "error" : ""}
                />
                {errors.description && (
                    <span className="error-message">{errors.description}</span>
                )}
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="ownerName">Owner Name *</label>
                    <input
                        type="text"
                        id="ownerName"
                        name="ownerName"
                        value={formData.ownerName}
                        onChange={handleInputChange}
                        placeholder="Full name"
                        className={errors.ownerName ? "error" : ""}
                    />
                    {errors.ownerName && (
                        <span className="error-message">
                            {errors.ownerName}
                        </span>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="ownerPhone">Phone *</label>
                    <input
                        type="tel"
                        id="ownerPhone"
                        name="ownerPhone"
                        value={formData.ownerPhone}
                        onChange={handleInputChange}
                        placeholder="+91 9876543210"
                        className={errors.ownerPhone ? "error" : ""}
                    />
                    {errors.ownerPhone && (
                        <span className="error-message">
                            {errors.ownerPhone}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="form-step">
            <h3>2. Images & Contact</h3>

            <div className="form-group">
                <label htmlFor="ownerEmail">Email</label>
                <input
                    type="email"
                    id="ownerEmail"
                    name="ownerEmail"
                    value={formData.ownerEmail}
                    onChange={handleInputChange}
                    placeholder="owner@example.com"
                />
            </div>

            <div className="form-group">
                <label>Property Images</label>
                <div className="image-upload-section">
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="file-input"
                        id="imageUpload"
                    />
                    <label htmlFor="imageUpload" className="upload-button">
                        📷 Add Photos
                    </label>
                    <p className="upload-hint">
                        Add photos to showcase your property
                    </p>
                </div>

                {formData.images.length > 0 && (
                    <div className="image-preview-grid">
                        {formData.images.map((image, index) => (
                            <div key={index} className="image-preview-item">
                                <img
                                    src={image}
                                    alt={`Property ${index + 1}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="remove-image-btn"
                                    title="Remove image"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="form-group">
                <label>Additional Documents (Optional)</label>
                <FileUpload
                    onFilesUploaded={handleFilesUploaded}
                    uploadedFiles={uploadedFiles}
                    uploadedFolders={uploadedFolders}
                />
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
