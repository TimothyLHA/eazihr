class LeaveBalanceModel {
  final String id;
  final String employeeId;
  final String organizationId;
  final String leaveTypeId;
  final int allocatedDays;
  final int usedDays;
  final int remainingDays;
  final int year;

  LeaveBalanceModel({
    required this.id,
    required this.employeeId,
    required this.organizationId,
    required this.leaveTypeId,
    required this.allocatedDays,
    required this.usedDays,
    required this.remainingDays,
    required this.year,
  });

  factory LeaveBalanceModel.fromJson(Map<String, dynamic> json) {
    return LeaveBalanceModel(
      id: json['id'] as String,
      employeeId: json['employee_id'] as String,
      organizationId: json['organization_id'] as String,
      leaveTypeId: json['leave_type_id'] as String,
      allocatedDays: json['allocated_days'] as int,
      usedDays: json['used_days'] as int,
      remainingDays: json['remaining_days'] as int,
      year: json['year'] as int,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'employee_id': employeeId,
    'organization_id': organizationId,
    'leave_type_id': leaveTypeId,
    'allocated_days': allocatedDays,
    'used_days': usedDays,
    'remaining_days': remainingDays,
    'year': year,
  };
}
