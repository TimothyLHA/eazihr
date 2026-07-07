import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:employee_app/providers/supabase_provider.dart';
import 'package:employee_app/data/repositories/organization_repository.dart';
import 'package:employee_app/data/models/organization_model.dart';
import 'package:employee_app/features/auth/providers/auth_provider.dart';

final organizationRepositoryProvider = Provider<OrganizationRepository>((ref) {
  return OrganizationRepository(ref.read(supabaseClientProvider));
});

final organizationProvider = FutureProvider<OrganizationModel>((ref) {
  final orgId = ref.watch(authNotifierProvider.notifier).organizationId;
  if (orgId == null) throw Exception('Not authenticated');
  return ref.read(organizationRepositoryProvider).fetchOrganization(orgId);
});
