import 'dart:convert';
import 'dart:developer' as dev;
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:image/image.dart' as img;
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';

class ImageUploadService {
  static final ImagePicker _picker = ImagePicker();
  static final String baseUrl = '${dotenv.get('API_URL', fallback: 'http://192.168.1.39:3001')}/api/v1';

  /// Pick image from gallery or camera
  Future<XFile?> pickImage({
    required ImageSource source,
  }) async {
    try {
      final pickedFile = await _picker.pickImage(
        source: source,
        maxWidth: 1920,
        maxHeight: 1920,
        imageQuality: 85,
      );
      
      if (pickedFile != null) {
        dev.log('✅ Image picked from ${source == ImageSource.camera ? 'camera' : 'gallery'}: ${pickedFile.path}');
      }
      
      return pickedFile;
    } catch (e) {
      dev.log('❌ Error picking image: $e');
      return null;
    }
  }

  /// Compress image to reduce file size
  /// Returns base64 string
  Future<String?> compressImage(String imagePath) async {
    try {
      final imageBytes = await _readImageFile(imagePath);
      if (imageBytes == null) return null;

      // Decode image
      final image = img.decodeImage(imageBytes);
      if (image == null) return null;

      // Resize if too large
      img.Image resized = image;
      if (image.width > 1920 || image.height > 1920) {
        resized = img.copyResize(
          image,
          width: image.width > image.height ? 1920 : null,
          height: image.height > image.width ? 1920 : null,
          interpolation: img.Interpolation.average,
        );
      }

      // Encode as JPEG with quality 80
      final compressed = img.encodeJpg(resized, quality: 80);
      final base64String = base64Encode(compressed);
      
      dev.log('✅ Image compressed. Original: ${imageBytes.length} bytes, Compressed: ${compressed.length} bytes');
      
      return base64String;
    } catch (e) {
      dev.log('❌ Error compressing image: $e');
      return null;
    }
  }

  /// Upload compressed image to backend
  /// Returns image URL from server
  Future<String?> uploadImage(String base64Image, {String? fileName}) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/emergency/upload'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'file': 'data:image/jpeg;base64,$base64Image',
          'ext': '.jpg',
          'name': fileName ?? 'incident-${DateTime.now().millisecondsSinceEpoch}.jpg',
        }),
      );

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final json = jsonDecode(response.body);
        final imageUrl = json['url'] ?? json['data']?['url'];
        
        if (imageUrl != null) {
          dev.log('✅ Image uploaded successfully: $imageUrl');
          return imageUrl;
        }
      } else {
        dev.log('❌ Upload failed: ${response.statusCode} - ${response.body}');
      }
      
      return null;
    } catch (e) {
      dev.log('❌ Error uploading image: $e');
      return null;
    }
  }

  /// Complete flow: pick -> compress -> upload
  Future<String?> pickCompressAndUpload({
    required ImageSource source,
    required BuildContext context,
  }) async {
    try {
      // Show loading
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Row(
              children: [
                SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(strokeWidth: 2, valueColor: AlwaysStoppedAnimation<Color>(Colors.white)),
                ),
                SizedBox(width: 12),
                Text('Processing image...'),
              ],
            ),
            duration: const Duration(seconds: 30),
          ),
        );
      }

      // Pick image
      final pickedFile = await pickImage(source: source);
      if (pickedFile == null) return null;

      // Compress
      final base64 = await compressImage(pickedFile.path);
      if (base64 == null) return null;

      // Upload
      final imageUrl = await uploadImage(base64, fileName: pickedFile.name);
      
      if (context.mounted) {
        ScaffoldMessenger.of(context).clearSnackBars();
        if (imageUrl != null) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Image uploaded successfully')),
          );
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Failed to upload image')),
          );
        }
      }

      return imageUrl;
    } catch (e) {
      dev.log('❌ Error in complete flow: $e');
      if (context.mounted) {
        ScaffoldMessenger.of(context).clearSnackBars();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
      return null;
    }
  }

  /// Helper to read image file as bytes
  Future<Uint8List?> _readImageFile(String imagePath) async {
    try {
      final pickedFile = XFile(imagePath);
      return await pickedFile.readAsBytes();
    } catch (e) {
      dev.log('❌ Error reading image file: $e');
      return null;
    }
  }
}

final imageUploadService = ImageUploadService();
