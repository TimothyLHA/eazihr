class EmployeeModel {
  final String id;
  final String profileId;
  final String organizationId;
  final String? employeeCode;
  final String? position;
  final String? department;
  final String? hireDate;
  final double? basicSalary;
  final String status;

  EmployeeModel({
    required this.id,
    required this.profileId,
    required this.organizationId,
    this.employeeCode,
    this.position,
    this.department,
    this.hireDate,
    this.basicSalary,
    this.status = 'active',
  });

  factory EmployeeModel.fromJson(Map<String, dynamic> json) {
    return EmployeeModel(
      id: json['id'] as String,
      profileId: json['profile_id'] as String,
      organizationId: json['organization_id'] as String,
      employeeCode: json['employee_code'] as String?,
      position: json['position'] as String?,
      department: json['department'] as String?,
      hireDate: json['hire_date'] as String?,
      basicSalary: (json['basic_salary'] as num?)?.toDouble(),
      status: json['status'] as String? ?? 'active',
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'profile_id': profileId,
    'organization_id': organizationId,
    'employee_code': employeeCode,
    'position': position,
    'department': department,
    'hire_date': hireDate,
    'basic_salary': basicSalary,
    'status': status,
  };
}
