import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:resq_mobile/core/services/image_upload_service.dart';
import 'package:resq_mobile/core/services/location_service.dart';
import 'package:resq_mobile/features/incidents/models/incident_model.dart';
import 'package:resq_mobile/features/incidents/providers/incidents_provider.dart';
import 'dart:io';
import 'dart:developer' as dev;

class IncidentUploadScreen extends ConsumerStatefulWidget {
  const IncidentUploadScreen({super.key});

  @override
  ConsumerState<IncidentUploadScreen> createState() => _IncidentUploadScreenState();
}

class _IncidentUploadScreenState extends ConsumerState<IncidentUploadScreen> {
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  
  String? _selectedImage;
  String? _selectedCategory = 'FIRE';
  String? _selectedSeverity = 'HIGH';
  bool _isLoading = false;
  String? _locationStatus;
  double? _latitude;
  double? _longitude;

  final _categories = [
    'FIRE', 'FLOOD', 'EARTHQUAKE', 'ACCIDENT', 
    'MEDICAL_EMERGENCY', 'GAS_LEAK', 'INFRASTRUCTURE_FAILURE', 'OTHER'
  ];

  final _severities = ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'];

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  Future<void> _pickImage() async {
    try {
      dev.log('Opening image picker');
      final pickedFile = await ImagePicker().pickImage(
        source: ImageSource.gallery,
        maxWidth: 1920,
        maxHeight: 1920,
        imageQuality: 85,
      );

      if (pickedFile != null && mounted) {
        setState(() => _selectedImage = pickedFile.path);
        dev.log('✅ Image selected: ${pickedFile.path}');
      }
    } catch (e) {
      dev.log('❌ Error picking image: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    }
  }

  Future<void> _captureImage() async {
    try {
      dev.log('Opening camera');
      final pickedFile = await ImagePicker().pickImage(
        source: ImageSource.camera,
        maxWidth: 1920,
        maxHeight: 1920,
        imageQuality: 85,
      );

      if (pickedFile != null && mounted) {
        setState(() => _selectedImage = pickedFile.path);
        dev.log('✅ Image captured: ${pickedFile.path}');
      }
    } catch (e) {
      dev.log('❌ Error capturing image: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    }
  }

  Future<void> _captureLocation() async {
    try {
      setState(() => _locationStatus = 'Capturing location...');
      
      final location = await locationService.getLocationWithFallback();
      
      if (location != null && mounted) {
        setState(() {
          _latitude = location.latitude;
          _longitude = location.longitude;
          _locationStatus = '✅ Lat: ${location.latitude.toStringAsFixed(4)}, Lng: ${location.longitude.toStringAsFixed(4)}';
        });
        dev.log('✅ Location captured: ${location.latitude}, ${location.longitude}');
      } else if (mounted) {
        setState(() => _locationStatus = '❌ Could not get location');
      }
    } catch (e) {
      dev.log('❌ Error capturing location: $e');
      if (mounted) {
        setState(() => _locationStatus = '❌ Error: $e');
      }
    }
  }

  Future<void> _submitIncident() async {
    if (_titleController.text.isEmpty || _descriptionController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill in all fields')),
      );
      return;
    }

    if (_latitude == null || _longitude == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please capture location')),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      String? imageUrl;

      // Upload image if selected
      if (_selectedImage != null) {
        dev.log('Uploading image...');
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Uploading image...')),
        );

        final compressed = await imageUploadService.compressImage(_selectedImage!);
        if (compressed == null) throw Exception('Failed to compress image');

        imageUrl = await imageUploadService.uploadImage(compressed);
        if (imageUrl == null) throw Exception('Failed to upload image');

        dev.log('✅ Image uploaded: $imageUrl');
      }

      // Create incident
      final incident = Incident(
        id: 'INC-${DateTime.now().millisecondsSinceEpoch}',
        title: _titleController.text,
        description: _descriptionController.text,
        imageUrl: imageUrl,
        category: _selectedCategory ?? 'FIRE',
        severity: _selectedSeverity ?? 'HIGH',
        latitude: _latitude!,
        longitude: _longitude!,
        createdAt: DateTime.now(),
        reporterId: 'user-mobile', // In production, get from auth
        district: 'Karachi',
      );

      // Add to state (optimistic update)
      ref.read(incidentsProvider.notifier).addIncident(incident);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Incident reported successfully!')),
        );
        Navigator.pop(context);
      }

      dev.log('✅ Incident created: ${incident.id}');
    } catch (e) {
      dev.log('❌ Error submitting incident: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Color(0xFF0F172A),
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: DraggableScrollableSheet(
        expand: false,
        initialChildSize: 0.9,
        minChildSize: 0.5,
        maxChildSize: 0.95,
        builder: (context, scrollController) => SingleChildScrollView(
          controller: scrollController,
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Center(
                child: Column(
                  children: [
                    Container(
                      width: 40,
                      height: 4,
                      decoration: BoxDecoration(
                        color: const Color(0xFF334155),
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'REPORT INCIDENT',
                      style: GoogleFonts.orbitron(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.5,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Image Section
              Container(
                decoration: BoxDecoration(
                  color: const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: const Color(0xFF6366F1).withOpacity(0.3),
                  ),
                ),
                child: Column(
                  children: [
                    if (_selectedImage == null)
                      Padding(
                        padding: const EdgeInsets.all(24),
                        child: Column(
                          children: [
                            const Icon(
                              LucideIcons.image,
                              size: 48,
                              color: Color(0xFF6366F1),
                            ),
                            const SizedBox(height: 12),
                            Text(
                              'Add Incident Image',
                              style: GoogleFonts.inter(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 14,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'Capture or upload evidence image',
                              style: GoogleFonts.inter(
                                color: const Color(0xFF94A3B8),
                                fontSize: 12,
                              ),
                            ),
                            const SizedBox(height: 16),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                ElevatedButton.icon(
                                  onPressed: _captureImage,
                                  icon: const Icon(LucideIcons.camera),
                                  label: const Text('CAMERA'),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: const Color(0xFF6366F1).withOpacity(0.2),
                                    foregroundColor: const Color(0xFF6366F1),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 12),
                                ElevatedButton.icon(
                                  onPressed: _pickImage,
                                  icon: const Icon(LucideIcons.folderOpen),
                                  label: const Text('GALLERY'),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: const Color(0xFF6366F1).withOpacity(0.2),
                                    foregroundColor: const Color(0xFF6366F1),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      )
                    else
                      Column(
                        children: [
                          Image.file(
                            File(_selectedImage!),
                            height: 200,
                            width: double.infinity,
                            fit: BoxFit.cover,
                          ),
                          Padding(
                            padding: const EdgeInsets.all(16),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                TextButton.icon(
                                  onPressed: () => setState(() => _selectedImage = null),
                                  icon: const Icon(LucideIcons.x),
                                  label: const Text('REMOVE'),
                                  style: TextButton.styleFrom(
                                    foregroundColor: Colors.red,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Location Section
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: (_latitude != null ? const Color(0xFF10B981) : const Color(0xFF6366F1)).withOpacity(0.3),
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(
                          LucideIcons.mapPin,
                          size: 20,
                          color: _latitude != null ? const Color(0xFF10B981) : const Color(0xFF6366F1),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Location',
                                style: GoogleFonts.inter(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 14,
                                ),
                              ),
                              if (_locationStatus != null)
                                Text(
                                  _locationStatus!,
                                  style: GoogleFonts.inter(
                                    color: _latitude != null ? const Color(0xFF10B981) : Colors.orange,
                                    fontSize: 12,
                                  ),
                                ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: _captureLocation,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF6366F1).withOpacity(0.2),
                          foregroundColor: const Color(0xFF6366F1),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                        child: const Text('CAPTURE LOCATION'),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Title Input
              TextField(
                controller: _titleController,
                decoration: InputDecoration(
                  hintText: 'Incident Title',
                  hintStyle: GoogleFonts.inter(color: const Color(0xFF64748B)),
                  filled: true,
                  fillColor: const Color(0xFF1E293B),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(
                      color: const Color(0xFF6366F1).withOpacity(0.3),
                    ),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(
                      color: const Color(0xFF6366F1).withOpacity(0.3),
                    ),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: Color(0xFF6366F1)),
                  ),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                ),
                style: GoogleFonts.inter(color: Colors.white),
              ),
              const SizedBox(height: 12),

              // Description Input
              TextField(
                controller: _descriptionController,
                maxLines: 4,
                decoration: InputDecoration(
                  hintText: 'Describe the incident...',
                  hintStyle: GoogleFonts.inter(color: const Color(0xFF64748B)),
                  filled: true,
                  fillColor: const Color(0xFF1E293B),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(
                      color: const Color(0xFF6366F1).withOpacity(0.3),
                    ),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(
                      color: const Color(0xFF6366F1).withOpacity(0.3),
                    ),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: Color(0xFF6366F1)),
                  ),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                ),
                style: GoogleFonts.inter(color: Colors.white),
              ),
              const SizedBox(height: 16),

              // Category Selection
              Text(
                'Category',
                style: GoogleFonts.inter(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                ),
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                children: _categories.map((cat) {
                  final isSelected = _selectedCategory == cat;
                  return FilterChip(
                    label: Text(cat),
                    selected: isSelected,
                    onSelected: (_) => setState(() => _selectedCategory = cat),
                    backgroundColor: const Color(0xFF1E293B),
                    selectedColor: const Color(0xFF6366F1),
                    labelStyle: GoogleFonts.inter(
                      color: isSelected ? Colors.white : const Color(0xFF94A3B8),
                      fontSize: 12,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                    ),
                    side: BorderSide(
                      color: isSelected ? const Color(0xFF6366F1) : const Color(0xFF6366F1).withOpacity(0.3),
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 16),

              // Severity Selection
              Text(
                'Severity',
                style: GoogleFonts.inter(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                ),
              ),
              const SizedBox(height: 8),
              Row(
                children: _severities.map((sev) {
                  final isSelected = _selectedSeverity == sev;
                  final colors = {
                    'LOW': const Color(0xFF10B981),
                    'MODERATE': const Color(0xFFF59E0B),
                    'HIGH': const Color(0xFFEF4444),
                    'CRITICAL': const Color(0xFF7C3AED),
                  };
                  return Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => _selectedSeverity = sev),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? colors[sev]!.withOpacity(0.2)
                              : const Color(0xFF1E293B),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                            color: isSelected ? colors[sev]! : const Color(0xFF334155),
                          ),
                        ),
                        child: Text(
                          sev,
                          textAlign: TextAlign.center,
                          style: GoogleFonts.inter(
                            color: colors[sev],
                            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                            fontSize: 11,
                          ),
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 24),

              // Submit Button
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _submitIncident,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF6366F1),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    disabledBackgroundColor: const Color(0xFF6366F1).withOpacity(0.5),
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          width: 24,
                          height: 24,
                          child: CircularProgressIndicator(
                            valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                            strokeWidth: 2,
                          ),
                        )
                      : Text(
                          'SUBMIT REPORT',
                          style: GoogleFonts.orbitron(
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1.2,
                          ),
                        ),
                ),
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }
}
