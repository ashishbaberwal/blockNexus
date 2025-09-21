# Folder Upload with IndexedDB Storage

This implementation adds folder upload functionality to the BlockNexus property management system using IndexedDB for client-side storage.

## Features

### 🗂️ File Upload Capabilities
- **Individual File Upload**: Upload single or multiple files
- **Folder Upload**: Upload entire folder structures with directory preservation
- **Drag & Drop Support**: Drag files or folders directly onto the upload area
- **File Type Detection**: Automatic file type detection with appropriate icons
- **Progress Tracking**: Real-time upload progress with visual indicators

### 💾 Storage Management
- **IndexedDB Storage**: Client-side storage using IndexedDB for offline capability
- **File References**: Property-linked file references for easy management
- **Storage Statistics**: Monitor storage usage and file type distribution
- **File Management**: Download, delete, and organize uploaded files

### 🎨 User Interface
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Dark Theme Support**: Full dark theme compatibility
- **Visual Feedback**: Loading states, success/error messages, and animations
- **File Previews**: File icons, names, sizes, and upload dates

## Implementation Details

### Files Added/Modified

#### New Files:
1. **`src/services/indexedDBStorage.js`** - IndexedDB storage service
2. **`src/components/FileUpload.js`** - File upload component
3. **`src/components/FileUpload.css`** - File upload styles
4. **`src/components/FileUploadDemo.js`** - Demo component
5. **`src/components/FileUploadDemo.css`** - Demo styles

#### Modified Files:
1. **`src/components/PropertyForm.js`** - Added file upload to step 6
2. **`src/components/PropertyForm.css`** - Added file upload integration styles
3. **`src/services/propertyStorage.js`** - Added file reference management

### Key Components

#### IndexedDBStorage Class
```javascript
// Initialize storage
await indexedDBStorage.init();

// Store files
const result = await indexedDBStorage.storeFile(file, propertyId);

// Store folder
const folderResult = await indexedDBStorage.storeFolder(files, propertyId, folderName);

// Get files by property
const files = await indexedDBStorage.getFilesByProperty(propertyId);
```

#### FileUpload Component
```jsx
<FileUpload
  propertyId={propertyId}
  onFilesUploaded={handleFilesUploaded}
  existingFiles={uploadedFiles}
  existingFolders={uploadedFolders}
/>
```

## Usage

### In Property Form
The file upload component is integrated into Step 6 (Legal Documents) of the property form:

1. Navigate to "Add Property" or "Edit Property"
2. Go to Step 6: "Legal Documents & Verification"
3. Scroll down to "Property Documents & Files" section
4. Use the upload interface to add files or folders

### Upload Methods

#### Method 1: Select Files
1. Click "Select Files" button
2. Choose individual files from your computer
3. Click "Upload as Individual Files" or "Upload as Folder"

#### Method 2: Select Folder
1. Click "Select Folder" button
2. Choose a folder from your computer
3. All files in the folder will be uploaded together

#### Method 3: Drag & Drop
1. Drag files or folders from your computer
2. Drop them onto the upload area
3. Choose upload method (individual files or folder)

### File Management

#### View Uploaded Files
- All uploaded files are displayed with icons, names, and metadata
- Files are organized by upload date
- File types are automatically detected and displayed

#### Download Files
- Click the download button (⬇️) next to any file
- Files are downloaded with their original names

#### Delete Files
- Click the delete button (🗑️) next to any file
- Confirm deletion in the popup dialog

#### Storage Statistics
- View total files, folders, and storage usage
- Monitor file type distribution
- Track storage growth over time

## Technical Specifications

### Browser Support
- Chrome 24+
- Firefox 16+
- Safari 10+
- Edge 12+

### Storage Limits
- IndexedDB storage is limited by available disk space
- Typical limits: 50MB-1GB depending on browser and device
- Storage quota can be checked using `navigator.storage.estimate()`

### File Type Support
- All file types are supported
- Automatic MIME type detection
- File size validation (configurable limits)

### Performance Considerations
- Files are stored as ArrayBuffer for efficient memory usage
- Large files are handled asynchronously to prevent UI blocking
- Progress tracking provides user feedback during uploads

## Configuration

### File Size Limits
Modify the `MAX_FILE_SIZE` constant in `indexedDBStorage.js`:

```javascript
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
```

### Allowed File Types
Add file type restrictions in `FileUpload.js`:

```javascript
const ALLOWED_TYPES = [
  'image/*',
  'application/pdf',
  'text/*',
  'application/msword'
];
```

### Storage Cleanup
Implement automatic cleanup for old files:

```javascript
// Clean files older than 30 days
const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
await indexedDBStorage.cleanupOldFiles(thirtyDaysAgo);
```

## Troubleshooting

### Common Issues

#### "IndexedDB not supported"
- Update your browser to a supported version
- Check if IndexedDB is enabled in browser settings

#### "Storage quota exceeded"
- Clear old files using the "Clear All Data" button
- Implement file cleanup policies
- Consider compressing large files

#### "File upload fails"
- Check file size limits
- Verify file permissions
- Ensure sufficient disk space

### Debug Mode
Enable debug logging by setting:

```javascript
localStorage.setItem('debug', 'indexedDB');
```

## Future Enhancements

### Planned Features
- [ ] File compression before storage
- [ ] Cloud storage integration (AWS S3, Google Drive)
- [ ] File versioning and history
- [ ] Advanced file search and filtering
- [ ] Batch file operations
- [ ] File sharing and collaboration
- [ ] Automatic file backup
- [ ] File encryption for sensitive documents

### Integration Opportunities
- [ ] Document OCR for text extraction
- [ ] Image metadata extraction
- [ ] PDF text search
- [ ] File preview without download
- [ ] Integration with property verification workflow

## Support

For issues or questions regarding the folder upload functionality:

1. Check the browser console for error messages
2. Verify IndexedDB support in your browser
3. Test with smaller files first
4. Clear browser cache and try again

## License

This implementation is part of the BlockNexus project and follows the same licensing terms.
