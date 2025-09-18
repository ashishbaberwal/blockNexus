# 🔥 Firebase Troubleshooting Guide

## Current Issue: 400 Bad Request Errors

You're seeing these errors because Firebase Firestore security rules are blocking write operations.

### ✅ **SOLUTION STEPS:**

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Select your `blocknexus` project

2. **Update Firestore Security Rules**
   - Navigate to `Firestore Database` → `Rules`
   - Replace the current rules with this (FOR TESTING ONLY):
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if true;
       }
     }
   }
   ```
   - Click **Publish**

3. **Update Storage Security Rules**
   - Navigate to `Storage` → `Rules`
   - Replace with:
   ```javascript
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /{allPaths=**} {
         allow read, write: if true;
       }
     }
   }
   ```
   - Click **Publish**

### 🧪 **Test the Fix:**
1. Go to your app: http://localhost:3000
2. Click "Test Connection" in the Firebase Test Panel
3. You should see ✅ success messages
4. Check Firebase Console to see the test data

### ⚠️ **Important Security Note:**
The rules above allow ALL read/write access for testing. In production, you'll want to restrict access properly:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Public read access for properties
    match /properties/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Test documents for development
    match /test/{document} {
      allow read, write: if true; // Remove in production
    }
  }
}
```

### 🎨 **Dark Mode Font Fix Applied:**
- Updated CSS variables for better text contrast in dark mode
- Added specific rules for headings, paragraphs, and form elements
- Fixed "No properties found" text visibility

### 🔄 **Auto-Clear Notifications:**
- Test results now auto-clear after 15 seconds
- Added manual clear button (×) on test results
- Better error messages with solutions

## Quick Commands:
```bash
# Restart your app if needed
npm start

# Check browser console for detailed logs
# Press F12 → Console tab
```

## Support Links:
- **Firebase Console:** https://console.firebase.google.com/project/blocknexus
- **Firestore Database:** https://console.firebase.google.com/project/blocknexus/firestore
- **Storage:** https://console.firebase.google.com/project/blocknexus/storage