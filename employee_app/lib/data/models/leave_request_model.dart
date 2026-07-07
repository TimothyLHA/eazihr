class LeaveRequestModel {
  final String id;
  final String employeeId;
  final String organizationId;
  final String leaveTypeId;
  final String startDate;
  final String endDate;
  final double days;
  final String? reason;
  final String status;
  final String? approvedBy;
  final String? approvedAt;

  LeaveRequestModel({
    required this.id,
    required this.employeeId,
    required this.organizationId,
    required this.leaveTypeId,
    required this.startDate,
    required this.endDate,
    required this.days,
    this.reason,
    this.status = 'pending',
    this.approvedBy,
    this.approvedAt,
  });

  factory LeaveRequestModel.fromJson(Map<String, dynamic> json) {
    return LeaveRequestModel(
      id: json['id'] as String,
      employeeId: json['employee_id'] as String,
      organizationId: json['organization_id'] as String,
      leaveTypeId: json['leave_type_id'] as String,
      startDate: json['start_date'] as String,
      endDate: json['end_date'] as String,
      days: (json['days'] as num).toDouble(),
      reason: json['reason'] as String?,
      status: json['status'] as String? ?? 'pending',
      approvedBy: json['approved_by'] as String?,
      approvedAt: json['approved_at'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'employee_id': employeeId,
    'organization_id': organizationId,
    'leave_type_id': leaveTypeId,
    'start_date': startDate,
    'end_date': endDate,
    'days': days,
    'reason': reason,
    'status': status,
  };
}
