# Face Recognition Attendance System

## Overview

This HRMS now includes a biometric face recognition attendance system that allows employees to mark their attendance using facial recognition technology. This feature works alongside the existing QR code-based attendance system.

## Features

### For Employees

1. **Face Registration**
   - Employees can register their face by capturing 3 images
   - Multiple captures ensure better accuracy
   - Face descriptors are securely stored in the database

2. **Face Recognition Attendance**
   - Real-time face detection with live camera feed
   - Automatic face verification against stored descriptor
   - Visual feedback when face is detected
   - Geolocation validation (optional)

3. **Multiple Attendance Methods**
   - QR Code-based attendance (existing)
   - Face recognition-based attendance (new)
   - Flexibility to choose preferred method

### For Administrators

- Face descriptors are stored as 128-dimensional vectors in the Employee model
- Face data is automatically managed through the attendance system
- No additional configuration required

## Technical Implementation

### Client-Side

**Libraries Used:**
- `face-api.js` - Face detection and recognition
- TensorFlow.js models for face detection and feature extraction

**Models Included:**
- Tiny Face Detector (lightweight, fast)
- SSD MobileNet v1 (accurate face detection)
- Face Landmark 68 (facial feature detection)
- Face Recognition Net (128-dimensional descriptors)

**Components:**
- `FaceRegistration.jsx` - Face registration UI component
- `FaceAttendance.jsx` - Face attendance marking UI component
- `faceRecognition.js` - Utility functions for face detection

### Server-Side

**Database Schema:**
```javascript
{
  faceDescriptor: {
    type: [Number],  // 128-dimensional array
    default: null
  }
}
```

**API Endpoints:**
- `POST /attendance/face/register` - Register face descriptor
- `GET /attendance/face/descriptor` - Get stored face descriptor
- `POST /attendance/mark/face` - Mark attendance using face

**Security:**
- Face descriptors are stored as numerical arrays (not images)
- Comparison uses Euclidean distance with threshold (default: 0.6)
- Geolocation validation for attendance marking
- JWT-based authentication for all endpoints

## Usage Guide

### For Employees

1. **First Time Setup (Face Registration)**
   - Navigate to Mark Attendance page
   - Click "Register Your Face"
   - Position your face in the camera frame
   - Click "Capture Face" 3 times
   - Face will be registered automatically

2. **Marking Attendance with Face**
   - Navigate to Mark Attendance page
   - Click "Mark with Face Recognition"
   - Position your face in the camera frame
   - Wait for face detection (green indicator)
   - Click "Verify & Mark Attendance"
   - Attendance will be marked upon successful verification

3. **Using QR Code (Alternative)**
   - Navigate to Mark Attendance page
   - Click "Mark with QR Code"
   - Generate QR code with location
   - Scan and mark attendance

### For Developers

#### Setting Up Models

The face recognition models are already included in `/client/public/models/`. They will be loaded automatically when the face recognition feature is used.

Model sizes:
- Tiny Face Detector: ~1.5 MB
- Face Recognition Net: ~6.2 MB
- Face Landmark 68: ~350 KB

#### Adding Face Recognition to New Features

```javascript
import { loadModels, detectFaceFromVideo, getFaceDescriptor, compareFaces } from "../utils/faceRecognition";

// Load models (once)
await loadModels();

// Detect face from video
const detection = await detectFaceFromVideo(videoElement);

// Get face descriptor
const descriptor = getFaceDescriptor(detection);

// Compare faces
const isMatch = compareFaces(descriptor1, descriptor2, threshold);
```

## Performance Considerations

1. **Model Loading**
   - Models are loaded once and cached
   - Total size: ~190 MB (all models)
   - Used models: ~8 MB
   - Initial load time: 2-5 seconds

2. **Face Detection**
   - Detection runs every 500ms
   - Uses Tiny Face Detector for speed
   - Average detection time: 50-100ms

3. **Face Recognition**
   - Descriptor extraction: ~200ms
   - Comparison: <1ms
   - Total verification time: <1 second

## Browser Compatibility

**Supported Browsers:**
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

**Requirements:**
- WebRTC support (camera access)
- JavaScript enabled
- HTTPS connection (for camera permissions)

## Privacy & Security

1. **Data Storage**
   - Only numerical face descriptors are stored (not images)
   - Descriptors are 128-dimensional vectors
   - Original images are never saved to the server

2. **Face Comparison**
   - Happens on the client side
   - Server only validates attendance marking
   - No face images transmitted over network

3. **Camera Access**
   - Requires explicit user permission
   - Camera is stopped after use
   - No background recording

## Troubleshooting

### Camera Not Working
- Check browser permissions for camera access
- Ensure HTTPS connection
- Try different browser
- Check if camera is being used by another application

### Face Not Detected
- Ensure good lighting conditions
- Position face directly in front of camera
- Remove glasses or masks if possible
- Move closer to camera

### Face Verification Failing
- Re-register face in better lighting
- Capture multiple angles during registration
- Ensure similar lighting conditions during verification

### Models Not Loading
- Check internet connection
- Clear browser cache
- Verify `/client/public/models/` directory exists
- Check browser console for specific errors

## Future Enhancements

Potential improvements for future versions:

1. **Advanced Features**
   - Multi-face detection for group attendance
   - Liveness detection (anti-spoofing)
   - Age and emotion detection
   - Attendance analytics

2. **Performance Optimizations**
   - Progressive model loading
   - WebAssembly optimization
   - Edge computing support

3. **User Experience**
   - Face registration wizard
   - Attendance history with face thumbnails
   - Face quality feedback during registration

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review browser console for error messages
3. Ensure all prerequisites are met
4. Contact system administrator

## Credits

- Face detection: [face-api.js](https://github.com/justadudewhohacks/face-api.js)
- Models: TensorFlow.js pre-trained models
- Built with React and Node.js
