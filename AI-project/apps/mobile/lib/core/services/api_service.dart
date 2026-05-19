import 'dart:convert';
import 'dart:developer' as dev;
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';

class ApiService {
  static final String baseUrl = '${dotenv.get('API_URL', fallback: 'http://192.168.1.39:3001')}/api/v1';

  Future<bool> checkHealth() async {
    try {
      final response = await http.get(Uri.parse('${dotenv.get('API_URL', fallback: 'http://192.168.1.39:3001')}/health'));
      if (response.statusCode == 200) {
        dev.log('Backend health check passed');
        return true;
      }
      return false;
    } catch (e) {
      dev.log('Health check failed: $e');
      return false;
    }
  }

  Future<Map<String, dynamic>> get(String path) async {
    try {
      final response = await http.get(Uri.parse('$baseUrl$path'));
      if (response.statusCode >= 200 && response.statusCode < 300) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Failed to load data: ${response.statusCode}');
      }
    } catch (e) {
      dev.log('API GET Error on $path: $e');
      throw Exception('Network error: $e');
    }
  }

  Future<Map<String, dynamic>> post(String path, Map<String, dynamic> body) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl$path'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(body),
      );
      if (response.statusCode >= 200 && response.statusCode < 300) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Failed to post data: ${response.statusCode}');
      }
    } catch (e) {
      dev.log('API POST Error on $path: $e');
      throw Exception('Network error: $e');
    }
  }
}

final apiService = ApiService();
