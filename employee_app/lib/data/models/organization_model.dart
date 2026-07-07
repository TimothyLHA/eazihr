class OrganizationModel {
  final String id;
  final String name;
  final String? logoUrl;
  final bool isActive;
  final Map<String, dynamic> settings;
  final Map<String, dynamic> payrollConfig;
  final Map<String, dynamic> leaveConfig;
  final Map<String, dynamic> loanConfig;
  final Map<String, dynamic> featureConfig;

  OrganizationModel({
    required this.id,
    required this.name,
    this.logoUrl,
    this.isActive = true,
    this.settings = const {},
    this.payrollConfig = const {},
    this.leaveConfig = const {},
    this.loanConfig = const {},
    this.featureConfig = const {},
  });

  factory OrganizationModel.fromJson(Map<String, dynamic> json) {
    return OrganizationModel(
      id: json['id'] as String,
      name: json['name'] as String,
      logoUrl: json['logo_url'] as String?,
      isActive: json['is_active'] as bool? ?? true,
      settings: (json['settings'] as Map<String, dynamic>?) ?? {},
      payrollConfig: (json['payroll_config'] as Map<String, dynamic>?) ?? {},
      leaveConfig: (json['leave_config'] as Map<String, dynamic>?) ?? {},
      loanConfig: (json['loan_config'] as Map<String, dynamic>?) ?? {},
      featureConfig: (json['feature_config'] as Map<String, dynamic>?) ?? {},
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'logo_url': logoUrl,
    'is_active': isActive,
    'settings': settings,
    'payroll_config': payrollConfig,
    'leave_config': leaveConfig,
    'loan_config': loanConfig,
    'feature_config': featureConfig,
  };
}
