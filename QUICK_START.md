## Quick Start: Incident Image-to-Map Feature

### ⚡ 5-Minute Setup

#### 1. Install Flutter Dependencies
```bash
cd apps/mobile
flutter pub get
```

#### 2. Update Android Permissions (android/app/src/main/AndroidManifest.xml)
```xml
<!-- Add these permissions inside <manifest> -->
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

#### 3. Update iOS Permissions (ios/Runner/Info.plist)
```xml
<!-- Add these keys -->
<key>NSCameraUsageDescription</key>
<string>We need camera access to capture incident photos</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>We need photo library access to select incident images</string>
<key>NSLocationWhenInUseUsageDescription</key>
<string>We need location access to report incident coordinates</string>
```

#### 4. Backend Setup (Prisma Migration - if using PostgreSQL)
```bash
cd apps/backend
npx prisma migrate deploy
```

#### 5. Start Backend Server
```bash
npm run dev
# Server runs on http://localhost:3001
```

#### 6. Start Flutter App
```bash
cd apps/mobile
flutter run
```

---

### 📱 Testing the Feature

#### Scenario 1: Single User Upload
1. Launch app
2. Navigate to **Alerts** screen
3. Tap red **"Report Incident"** button in top right
4. Select image from gallery
5. Tap **"CAPTURE LOCATION"**
6. Allow location permission
7. Fill form:
   - Title: "Building Fire"
   - Description: "Large fire at commercial building"
   - Category: FIRE
   - Severity: HIGH
8. Tap **"SUBMIT REPORT"**
9. Switch to **Safe Zones** tab
10. See red incident marker with animated pulse
11. Tap marker → see image popup

#### Scenario 2: Multi-Device Realtime Sync
1. **Device A**: Report incident (steps above)
2. **Device B**: Already has app open on Alerts screen
3. Notice: Incident card appears at top automatically ✨
4. Tap **"VIEW MAP"** on Device B
5. Incident marker visible in real-time

---

### 🐛 Troubleshooting

#### Image Upload Fails
**Problem**: "Failed to upload image"
```
Solution:
1. Check backend is running: curl http://localhost:3001/health
2. Verify network connectivity
3. Check file size (max 50MB before compression)
4. Check /uploads directory exists and has write permissions
```

#### Location Not Captured
**Problem**: "Could not get location"
```
Solution:
1. Grant location permission on device
2. Enable device GPS/location services
3. Wait 5-10 seconds for GPS lock (first time)
4. Fallback will use last known location if available
```

#### Markers Not Appearing
**Problem**: "Map shows safe zones but no incident markers"
```
Solution:
1. Check WebSocket connection: Look for "✅ Connected to Socket.IO"
2. Verify incident was saved: Check /data-store/store.json
3. Restart app to reload incidents from API
4. Check browser console for errors
```

#### Form Won't Submit
**Problem**: "Submit button disabled"
```
Solution:
1. Fill all required fields (title, description)
2. Capture location (latitude/longitude required)
3. Image is optional (will submit without it)
4. Check internet connection
```

---

### 📊 API Endpoint Reference

#### Create Incident Report
```
POST /api/v1/incidents/report
Content-Type: application/json

{
  "title": "Building Fire",
  "description": "Large fire at commercial building",
  "imageUrl": "http://localhost:3001/uploads/image.jpg",
  "category": "FIRE",
  "severity": "HIGH",
  "latitude": 24.8607,
  "longitude": 67.0011,
  "district": "Karachi",
  "reporterId": "user-mobile"
}

Response (200):
{
  "success": true,
  "data": {
    "incidentId": "INC-1234567890",
    "title": "Building Fire",
    ...
  }
}
```

#### Get Incidents
```
GET /api/v1/emergency/incidents
Response:
{
  "success": true,
  "data": [
    {
      "id": "INC-1234567890",
      "title": "Building Fire",
      "imageUrl": "http://...",
      "latitude": 24.8607,
      "longitude": 67.0011,
      ...
    }
  ]
}
```

---

### 🔄 WebSocket Events

#### Listen for New Incidents
```javascript
socket.on('incident-created', (data) => {
  console.log('New incident:', data);
  // {
  //   id: 'INC-1234567890',
  //   title: 'Building Fire',
  //   imageUrl: 'http://...',
  //   latitude: 24.8607,
  //   longitude: 67.0011,
  //   severity: 'HIGH',
  //   timestamp: '2026-05-20T...'
  // }
});
```

---

### 📁 File Structure

```
apps/
├── mobile/lib/
│   ├── core/services/
│   │   ├── image_upload_service.dart     [NEW]
│   │   ├── location_service.dart          [NEW]
│   │   └── socket_service.dart            [UPDATED]
│   └── features/
│       ├── incidents/                     [NEW]
│       │   ├── models/incident_model.dart
│       │   ├── providers/incidents_provider.dart
│       │   └── screens/incident_upload_screen.dart
│       ├── alerts/screens/
│       │   └── alerts_screen.dart         [UPDATED]
│       └── map/screens/
│           └── safe_zones_screen.dart     [UPDATED]
│
└── backend/src/
    ├── routes/
    │   └── emergency.routes.ts            [UPDATED]
    └── realtime/
        └── socketManager.ts               [UPDATED]
```

---

### 🚀 Production Checklist

- [ ] Configure `.env` with production API URL
- [ ] Set up PostgreSQL database
- [ ] Run Prisma migrations
- [ ] Configure image storage (S3, GCP, etc.)
- [ ] Enable HTTPS for image uploads
- [ ] Set rate limits on `/incidents/report` endpoint
- [ ] Add image validation (file type, virus scan)
- [ ] Configure backup strategy for images
- [ ] Set up monitoring for WebSocket connections
- [ ] Add logging for incident creation
- [ ] Test on 100+ concurrent users
- [ ] Set up auto-cleanup for old incidents
- [ ] Add image CDN for faster delivery

---

### 💡 Tips & Tricks

**Faster Testing**
```bash
# Run flutter with hot reload
flutter run --hot

# Tail backend logs
tail -f apps/backend/logs/*
```

**Debug WebSocket**
```dart
// Add to main.dart for detailed logs
void main() {
  dev.log('🔌 Socket connecting...');
  socketService.connect();
  // ...
}
```

**View Stored Incidents**
```bash
# Check in-memory store
cat apps/backend/data-store/store.json | jq '.incidents'
```

**Test Image Upload**
```bash
curl -X POST http://localhost:3001/api/v1/emergency/upload \
  -H "Content-Type: application/json" \
  -d '{
    "file": "data:image/jpeg;base64,..."
  }'
```

---

### 📚 Documentation

- Full feature guide: `INCIDENT_IMAGE_FEATURE.md`
- Implementation details: `IMPLEMENTATION_SUMMARY.md`
- API docs: `API_REFERENCE.md` (if exists)

---

### ✅ Verification Steps

After setup, verify:

1. **Backend Health**
   ```bash
   curl http://localhost:3001/health
   # Should return 200 with status: operational
   ```

2. **WebSocket Connection**
   - Open app
   - Check logs for: "✅ Connected to Socket.IO server"

3. **Image Upload**
   - Upload incident with image
   - Check `/apps/backend/uploads/` directory
   - Image file should exist

4. **Database (if PostgreSQL)**
   ```sql
   SELECT * FROM incidents;
   -- Should show your test incident
   ```

5. **Realtime Sync**
   - Report incident on Device A
   - Device B should see it instantly
   - No manual refresh needed

---

### 🎉 You're Ready!

The incident image-to-map feature is now live in your app. 

**What users can do:**
✅ Upload photos of incidents  
✅ Auto-capture GPS location  
✅ See incidents on live map  
✅ View details in feed  
✅ All users sync in real-time  

**No UI changed, all features working!**

---

### 📞 Quick Support

| Issue | Solution |
|-------|----------|
| Port 3001 in use | `lsof -i :3001` + kill process |
| Flutter build fails | `flutter clean && flutter pub get` |
| Image not uploading | Check network + backend running |
| Location not working | Grant permission + enable GPS |
| Marker not showing | Restart app or check WebSocket |

---

**Questions?** Check `INCIDENT_IMAGE_FEATURE.md` for detailed documentation.
