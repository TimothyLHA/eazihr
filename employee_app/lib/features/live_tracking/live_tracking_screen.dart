import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:employee_app/providers/organization_provider.dart';
import 'package:employee_app/features/auth/providers/auth_provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:employee_app/core/theme/app_theme.dart';

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
  bool _isLocationSharing = true;
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
      if (org == null) { setState(() { _error = 'Organization not found'; _isLoading = false; }); return; }
      final featureConfig = org.featureConfig;
      final liveTrackingEnabled = featureConfig['live_tracking'] ?? false;
      if (!liveTrackingEnabled) { setState(() { _error = 'Live tracking is not enabled for your organization'; _isLoading = false; }); return; }
      await _checkPermissions();
    } catch (e) { setState(() { _error = e.toString(); _isLoading = false; }); }
  }

  Future<void> _checkPermissions() async {
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) { setState(() { _error = 'Location services are disabled'; _isLoading = false; }); return; }
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) { setState(() { _error = 'Location permission denied'; _isLoading = false; }); return; }
      }
      if (permission == LocationPermission.deniedForever) { setState(() { _error = 'Location permission permanently denied'; _isLoading = false; }); return; }
      setState(() { _permission = permission; _isLoading = false; });
      await _getCurrentLocation();
    } catch (e) { setState(() { _error = e.toString(); _isLoading = false; }); }
  }

  Future<void> _getCurrentLocation() async {
    try {
      final position = await Geolocator.getCurrentPosition(desiredAccuracy: LocationAccuracy.high);
      setState(() => _currentPosition = position);
      _mapController?.animateCamera(CameraUpdate.newLatLngZoom(LatLng(position.latitude, position.longitude), 16));
    } catch (e) { setState(() => _error = 'Could not get current location'); }
  }

  void _startTracking() {
    setState(() => _isTracking = true);
    _tripDuration = Duration.zero;
    const LocationSettings locationSettings = LocationSettings(accuracy: LocationAccuracy.high, distanceFilter: 10);
    _positionStream = Geolocator.getPositionStream(locationSettings: locationSettings).listen((Position position) {
      setState(() => _currentPosition = position);
      _mapController?.animateCamera(CameraUpdate.newLatLng(LatLng(position.latitude, position.longitude)));
    });
    _tripTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      setState(() { _tripDuration = Duration(seconds: _tripDuration.inSeconds + 1); });
    });
  }

  void _stopTracking() {
    setState(() => _isTracking = false);
    _positionStream?.cancel();
    _tripTimer?.cancel();
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
    return Scaffold(
      body: SafeArea(
        child: _isLoading
            ? const Center(child: CircularProgressIndicator(strokeWidth: 2))
            : _error != null
                ? _buildError()
                : Column(
                    children: [
                      _buildTopBar(),
                      Expanded(
                        child: Stack(
                          children: [
                            GoogleMap(
                              onMapCreated: (controller) {
                                _mapController = controller;
                                if (_currentPosition != null) {
                                  controller.animateCamera(CameraUpdate.newLatLngZoom(
                                    LatLng(_currentPosition!.latitude, _currentPosition!.longitude), 16));
                                }
                              },
                              initialCameraPosition: CameraPosition(
                                target: _currentPosition != null
                                    ? LatLng(_currentPosition!.latitude, _currentPosition!.longitude)
                                    : const LatLng(0, 0),
                                zoom: 16,
                              ),
                              myLocationEnabled: true,
                              myLocationButtonEnabled: false,
                              zoomControlsEnabled: false,
                              markers: _currentPosition != null
                                  ? {Marker(
                                      markerId: const MarkerId('currentLocation'),
                                      position: LatLng(_currentPosition!.latitude, _currentPosition!.longitude),
                                      icon: BitmapDescriptor.defaultMarkerWithHue(
                                        _isTracking ? BitmapDescriptor.hueRed : BitmapDescriptor.hueBlue),
                                    )}
                                  : {},
                            ),
                            // Gradient overlay
                            Positioned(
                              top: 0, left: 0, right: 0, height: 60,
                              child: IgnorePointer(
                                child: Container(
                                  decoration: BoxDecoration(
                                    gradient: LinearGradient(
                                      colors: [AppColors.background.withAlpha(230), AppColors.background.withAlpha(0)],
                                      begin: Alignment.topCenter, end: Alignment.bottomCenter,
                                    ),
                                  ),
                                ),
                              ),
                            ),
                            // Map controls
                            Positioned(
                              top: 8, right: 12,
                              child: Column(
                                children: [
                                  _mapButton(Icons.my_location, () => _getCurrentLocation()),
                                  const SizedBox(height: 8),
                                  _mapButton(Icons.add, () {}),
                                ],
                              ),
                            ),
                            // Sync indicator
                            Positioned(
                              top: 8, left: 12,
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                decoration: BoxDecoration(
                                  color: AppColors.primary,
                                  borderRadius: BorderRadius.circular(100),
                                  boxShadow: [BoxShadow(color: AppColors.primary.withAlpha(60), blurRadius: 16)],
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Container(
                                      width: 8, height: 8,
                                      decoration: BoxDecoration(
                                        shape: BoxShape.circle,
                                        color: AppColors.secondaryFixed,
                                      ),
                                    ),
                                    const SizedBox(width: 6),
                                    Text('Direct Sync with Admin Portal',
                                      style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w600,
                                        color: Colors.white, letterSpacing: 0.5)),
                                  ],
                                ),
                              ),
                            ),
                            // Bottom panel
                            Positioned(
                              bottom: 0, left: 0, right: 0,
                              child: Container(
                                padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                                decoration: BoxDecoration(
                                  gradient: LinearGradient(
                                    colors: [AppColors.background.withAlpha(0), AppColors.background],
                                    begin: Alignment.topCenter, end: Alignment.bottomCenter,
                                  ),
                                ),
                                child: Column(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    _buildToggleCard(),
                                    const SizedBox(height: 12),
                                    _buildBentoGrid(),
                                    const SizedBox(height: 12),
                                    SizedBox(
                                      width: double.infinity,
                                      height: 56,
                                      child: ElevatedButton(
                                        onPressed: _isTracking ? _stopTracking : _startTracking,
                                        style: ElevatedButton.styleFrom(
                                          backgroundColor: AppColors.primary,
                                          foregroundColor: Colors.white,
                                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                                          elevation: 8,
                                          shadowColor: AppColors.primary.withAlpha(60),
                                        ),
                                        child: Text(
                                          _isTracking ? 'Complete Current Trip' : 'Start Trip',
                                          style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w600)),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
      ),
    );
  }

  Widget _buildTopBar() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: AppColors.surface,
        border: Border(bottom: BorderSide(color: AppColors.outlineVariant.withAlpha(60))),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Container(
                width: 36, height: 36,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: AppColors.outlineVariant),
                ),
                child: const Icon(Icons.person, size: 18, color: AppColors.primary),
              ),
              const SizedBox(width: 8),
              Text('Executive HR',
                style: GoogleFonts.inter(fontSize: 22, fontWeight: FontWeight.w700, color: AppColors.primary)),
            ],
          ),
          IconButton(
            icon: const Icon(Icons.notifications_outlined, color: AppColors.primary),
            onPressed: () {},
          ),
        ],
      ),
    );
  }

  Widget _mapButton(IconData icon, VoidCallback onTap) {
    return Container(
      width: 40, height: 40,
      decoration: BoxDecoration(
        color: AppColors.surface.withAlpha(230),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.outlineVariant),
      ),
      child: IconButton(
        icon: Icon(icon, size: 20, color: AppColors.primary),
        onPressed: onTap,
      ),
    );
  }

  Widget _buildToggleCard() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerLowest,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.outlineVariant.withAlpha(80)),
        boxShadow: [BoxShadow(color: AppColors.primary.withAlpha(8), blurRadius: 20)],
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Location Sharing',
                    style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w600, color: AppColors.primary)),
                  Text('Manage your real-time visibility',
                    style: GoogleFonts.inter(fontSize: 12, color: AppColors.onSurfaceVariant)),
                ],
              ),
              Switch(
                value: _isLocationSharing,
                activeColor: AppColors.primary,
                activeTrackColor: AppColors.primary.withAlpha(100),
                onChanged: (v) => setState(() => _isLocationSharing = v),
              ),
            ],
          ),
          if (_isLocationSharing) ...[
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.secondaryContainer.withAlpha(100),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  Container(
                    width: 40, height: 40,
                    decoration: BoxDecoration(
                      color: AppColors.primary,
                      borderRadius: BorderRadius.circular(100),
                    ),
                    child: const Icon(Icons.local_shipping, color: Colors.white, size: 22),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('ACTIVE TRIP MODE',
                          style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w700,
                            color: AppColors.onSecondaryContainer, letterSpacing: 0.5)),
                        const SizedBox(height: 2),
                        Text('Currently transmitting secure telemetry.',
                          style: GoogleFonts.inter(fontSize: 13, color: AppColors.onSecondaryContainer.withAlpha(200))),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildBentoGrid() {
    return Column(
      children: [
        Row(
          children: [
            Expanded(child: _buildStatusCard()),
            const SizedBox(width: 12),
            Expanded(child: _buildSinceCard()),
          ],
        ),
        const SizedBox(height: 12),
        _buildDestinationCard(),
      ],
    );
  }

  Widget _buildStatusCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerLowest,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.outlineVariant.withAlpha(80)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.insights, color: AppColors.secondary, size: 22),
          const SizedBox(height: 12),
          Text('Current Status',
            style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w600,
              color: AppColors.onSurfaceVariant, letterSpacing: 0.5)),
          const SizedBox(height: 4),
          Text(_isTracking ? 'En Route' : 'Idle',
            style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w600, color: AppColors.primary)),
        ],
      ),
    );
  }

  Widget _buildSinceCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerLowest,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.outlineVariant.withAlpha(80)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.schedule, color: AppColors.secondary, size: 22),
          const SizedBox(height: 12),
          Text('Active Since',
            style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w600,
              color: AppColors.onSurfaceVariant, letterSpacing: 0.5)),
          const SizedBox(height: 4),
          Text(_isTracking ? _formatDuration(_tripDuration) : '--:--',
            style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w600, color: AppColors.primary)),
        ],
      ),
    );
  }

  Widget _buildDestinationCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerLowest,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.outlineVariant.withAlpha(80)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: AppColors.secondaryContainer,
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.warehouse, color: AppColors.primary, size: 22),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Destination',
                  style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w600,
                    color: AppColors.onSurfaceVariant, letterSpacing: 0.5)),
                const SizedBox(height: 2),
                Text('North Warehouse',
                  style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.primary)),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(100),
              border: Border.all(color: AppColors.primary.withAlpha(50)),
            ),
            child: Text('EDIT',
              style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w700,
                color: AppColors.primary, letterSpacing: 0.8)),
          ),
        ],
      ),
    );
  }

  Widget _buildError() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.location_off, size: 64, color: AppColors.error),
            const SizedBox(height: 16),
            Text(_error!, textAlign: TextAlign.center,
              style: GoogleFonts.inter(fontSize: 14, color: AppColors.onSurfaceVariant)),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: () => Geolocator.openAppSettings(),
              icon: const Icon(Icons.settings),
              label: const Text('Open Settings'),
            ),
          ],
        ),
      ),
    );
  }
}
