import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:employee_app/providers/organization_provider.dart';
import 'package:employee_app/features/auth/providers/auth_provider.dart';

class LiveTrackingScreen extends ConsumerStatefulWidget {
  const LiveTrackingScreen({super.key});

  @override
  ConsumerState<LiveTrackingScreen> createState() => _LiveTrackingScreenState();
}

class _LiveTrackingScreenState extends ConsumerState<LiveTrackingScreen> {
  GoogleMapController? _mapController;
  Position? _currentPosition;
  StreamSubscription<Position>? _positionStream;
  Timer? _tripTimer;
  Duration _tripDuration = Duration.zero;
  bool _isTracking = false;
  bool _isLoading = true;
  String? _error;
  LocationPermission? _permission;

  @override
  void initState() {
    super.initState();
    _checkFeatureEnabled();
  }

  @override
  void dispose() {
    _positionStream?.cancel();
    _tripTimer?.cancel();
    super.dispose();
  }

  Future<void> _checkFeatureEnabled() async {
    try {
      final orgAsync = ref.read(organizationProvider);
      final org = orgAsync.valueOrNull;
      
      if (org == null) {
        setState(() {
          _error = 'Organization not found';
          _isLoading = false;
        });
        return;
      }

      final featureConfig = org.featureConfig;
      final liveTrackingEnabled = featureConfig['live_tracking'] ?? false;

      if (!liveTrackingEnabled) {
        setState(() {
          _error = 'Live tracking is not enabled for your organization';
          _isLoading = false;
        });
        return;
      }

      await _checkPermissions();
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  Future<void> _checkPermissions() async {
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        setState(() {
          _error = 'Location services are disabled. Please enable them in settings.';
          _isLoading = false;
        });
        return;
      }

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          setState(() {
            _error = 'Location permission denied';
            _isLoading = false;
          });
          return;
        }
      }

      if (permission == LocationPermission.deniedForever) {
        setState(() {
          _error = 'Location permission permanently denied. Please enable in settings.';
          _isLoading = false;
        });
        return;
      }

      setState(() {
        _permission = permission;
        _isLoading = false;
      });

      await _getCurrentLocation();
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  Future<void> _getCurrentLocation() async {
    try {
      final position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );

      setState(() {
        _currentPosition = position;
      });

      _mapController?.animateCamera(
        CameraUpdate.newLatLngZoom(
          LatLng(position.latitude, position.longitude),
          16,
        ),
      );
    } catch (e) {
      setState(() => _error = 'Could not get current location: $e');
    }
  }

  void _startTracking() {
    setState(() => _isTracking = true);
    _tripDuration = Duration.zero;

    const LocationSettings locationSettings = LocationSettings(
      accuracy: LocationAccuracy.high,
      distanceFilter: 10,
    );

    _positionStream = Geolocator.getPositionStream(locationSettings: locationSettings)
        .listen((Position position) {
      setState(() => _currentPosition = position);
      
      _mapController?.animateCamera(
        CameraUpdate.newLatLng(
          LatLng(position.latitude, position.longitude),
        ),
      );
    });

    _tripTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      setState(() {
        _tripDuration = Duration(seconds: _tripDuration.inSeconds + 1);
      });
    });
  }

  void _stopTracking() {
    setState(() => _isTracking = false);
    _positionStream?.cancel();
    _tripTimer?.cancel();
  }

  Future<void> _openSettings() async {
    await Geolocator.openAppSettings();
    _checkPermissions();
  }

  String _formatDuration(Duration duration) {
    String twoDigits(int n) => n.toString().padLeft(2, '0');
    final hours = twoDigits(duration.inHours);
    final minutes = twoDigits(duration.inMinutes.remainder(60));
    final seconds = twoDigits(duration.inSeconds.remainder(60));
    return '$hours:$minutes:$seconds';
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Live Tracking'),
        actions: [
          if (_isTracking)
            Padding(
              padding: const EdgeInsets.all(16),
              child: Center(
                child: Text(
                  _formatDuration(_tripDuration),
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                    color: theme.colorScheme.primary,
                  ),
                ),
              ),
            ),
        ],
      ),
      body: _buildBody(theme),
      floatingActionButton: _isLoading || _error != null
          ? null
          : FloatingActionButton.extended(
              onPressed: _isTracking ? _stopTracking : _startTracking,
              icon: Icon(_isTracking ? Icons.stop : Icons.play_arrow),
              label: Text(_isTracking ? 'Stop Tracking' : 'Start Tracking'),
              backgroundColor: _isTracking ? theme.colorScheme.error : theme.colorScheme.primary,
            ),
    );
  }

  Widget _buildBody(ThemeData theme) {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator(strokeWidth: 2));
    }

    if (_error != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.location_off, size: 64, color: theme.colorScheme.error.withAlpha(150)),
              const SizedBox(height: 16),
              Text(
                _error!,
                style: theme.textTheme.bodyMedium,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: _openSettings,
                icon: const Icon(Icons.settings),
                label: const Text('Open Settings'),
              ),
            ],
          ),
        ),
      );
    }

    return Column(
      children: [
        // GPS Status Card
        Container(
          padding: const EdgeInsets.all(16),
          color: theme.colorScheme.surface,
          child: Row(
            children: [
              Icon(
                _currentPosition != null ? Icons.gps_fixed : Icons.gps_not_fixed,
                color: _currentPosition != null ? Colors.green : Colors.orange,
                size: 24,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      _currentPosition != null ? 'GPS Active' : 'GPS Inactive',
                      style: theme.textTheme.bodyMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                        color: _currentPosition != null ? Colors.green : Colors.orange,
                      ),
                    ),
                    if (_currentPosition != null)
                      Text(
                        'Lat: ${_currentPosition!.latitude.toStringAsFixed(6)}, Lng: ${_currentPosition!.longitude.toStringAsFixed(6)}',
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: theme.colorScheme.onSurface.withAlpha(150),
                        ),
                      ),
                  ],
                ),
              ),
              if (_isTracking)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: Colors.red.withAlpha(30),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    children: [
                      const SizedBox(
                        width: 8,
                        height: 8,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor: AlwaysStoppedAnimation<Color>(Colors.red),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        'LIVE',
                        style: theme.textTheme.labelSmall?.copyWith(
                          color: Colors.red,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
        ),
        const Divider(height: 1),

        // Map
        Expanded(
          child: GoogleMap(
            onMapCreated: (controller) {
              _mapController = controller;
              if (_currentPosition != null) {
                controller.animateCamera(
                  CameraUpdate.newLatLngZoom(
                    LatLng(_currentPosition!.latitude, _currentPosition!.longitude),
                    16,
                  ),
                );
              }
            },
            initialCameraPosition: CameraPosition(
              target: _currentPosition != null
                  ? LatLng(_currentPosition!.latitude, _currentPosition!.longitude)
                  : const LatLng(0, 0),
              zoom: 16,
            ),
            myLocationEnabled: true,
            myLocationButtonEnabled: true,
            zoomControlsEnabled: true,
            markers: _currentPosition != null
                ? {
                    Marker(
                      markerId: const MarkerId('currentLocation'),
                      position: LatLng(_currentPosition!.latitude, _currentPosition!.longitude),
                      icon: BitmapDescriptor.defaultMarkerWithHue(
                        _isTracking ? BitmapDescriptor.hueRed : BitmapDescriptor.hueBlue,
                      ),
                    ),
                  }
                : {},
          ),
        ),
      ],
    );
  }
}