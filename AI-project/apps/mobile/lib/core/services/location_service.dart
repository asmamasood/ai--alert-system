import 'dart:developer' as dev;
import 'package:geolocator/geolocator.dart';
import 'package:permission_handler/permission_handler.dart';

class LocationData {
  final double latitude;
  final double longitude;
  final DateTime timestamp;
  final double? accuracy;
  final double? altitude;

  LocationData({
    required this.latitude,
    required this.longitude,
    required this.timestamp,
    this.accuracy,
    this.altitude,
  });

  Map<String, dynamic> toJson() => {
    'latitude': latitude,
    'longitude': longitude,
    'timestamp': timestamp.toIso8601String(),
    'accuracy': accuracy,
    'altitude': altitude,
  };
}

class LocationService {
  /// Request location permission
  Future<bool> requestLocationPermission() async {
    try {
      final status = await Permission.location.request();
      
      switch (status) {
        case PermissionStatus.granted:
          dev.log('✅ Location permission granted');
          return true;
        case PermissionStatus.denied:
          dev.log('⚠️ Location permission denied');
          return false;
        case PermissionStatus.restricted:
          dev.log('⚠️ Location permission restricted');
          return false;
        case PermissionStatus.provisional:
          dev.log('⚠️ Location permission provisional');
          return true;
        default:
          return false;
      }
    } catch (e) {
      dev.log('❌ Error requesting location permission: $e');
      return false;
    }
  }

  /// Check if location permission is granted
  Future<bool> checkLocationPermission() async {
    try {
      final status = await Permission.location.status;
      return status.isGranted || status.isProvisional;
    } catch (e) {
      dev.log('❌ Error checking location permission: $e');
      return false;
    }
  }

  /// Get current location
  Future<LocationData?> getCurrentLocation() async {
    try {
      // Check permission
      bool hasPermission = await checkLocationPermission();
      if (!hasPermission) {
        hasPermission = await requestLocationPermission();
        if (!hasPermission) {
          dev.log('❌ Location permission not granted');
          return null;
        }
      }

      // Check if location service is enabled
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        dev.log('⚠️ Location service is disabled');
        // In production, might want to prompt user to enable
        return null;
      }

      // Get current position
      final position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          timeLimit: Duration(seconds: 15),
        ),
      );

      final locationData = LocationData(
        latitude: position.latitude,
        longitude: position.longitude,
        timestamp: DateTime.now(),
        accuracy: position.accuracy,
        altitude: position.altitude,
      );

      dev.log('✅ Location obtained: ${locationData.latitude}, ${locationData.longitude}');
      
      return locationData;
    } catch (e) {
      dev.log('❌ Error getting current location: $e');
      return null;
    }
  }

  /// Get last known location (faster, less accurate)
  Future<LocationData?> getLastKnownLocation() async {
    try {
      final position = await Geolocator.getLastKnownPosition();
      
      if (position == null) {
        dev.log('⚠️ No last known location available');
        return null;
      }

      final locationData = LocationData(
        latitude: position.latitude,
        longitude: position.longitude,
        timestamp: DateTime.now(),
        accuracy: position.accuracy,
        altitude: position.altitude,
      );

      dev.log('✅ Last known location: ${locationData.latitude}, ${locationData.longitude}');
      
      return locationData;
    } catch (e) {
      dev.log('❌ Error getting last known location: $e');
      return null;
    }
  }

  /// Get location with fallback to last known
  /// Tries current location first, falls back to last known if that fails
  Future<LocationData?> getLocationWithFallback() async {
    try {
      // Try current location first (5 second timeout)
      final location = await getCurrentLocation();
      
      if (location != null) {
        return location;
      }

      // Fallback to last known location
      dev.log('⚠️ Current location failed, trying last known location');
      return await getLastKnownLocation();
    } catch (e) {
      dev.log('❌ Error in location fallback: $e');
      return null;
    }
  }
}

final locationService = LocationService();
