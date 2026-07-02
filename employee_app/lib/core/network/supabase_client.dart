import 'package:supabase_flutter/supabase_flutter.dart';

class SupabaseConfig {
  static const String url = String.fromEnvironment(
    'SUPABASE_URL',
    defaultValue: 'https://rnhnuounnxhcdnregeft.supabase.co',
  );
  static const String anonKey = String.fromEnvironment(
    'SUPABASE_ANON_KEY',
    defaultValue: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuaG51b3VubnhoY2RucmVnZWZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5NTgxOTgsImV4cCI6MjA5ODUzNDE5OH0.OU27DNT_iNXc-sM6wKC9-sIOiI04AQH0DiMyaf-0LTM',
  );

  static Future<void> initialize() async {
    await Supabase.initialize(
      url: url,
      publishableKey: anonKey,
    );
  }

  static SupabaseClient get client => Supabase.instance.client;
}
