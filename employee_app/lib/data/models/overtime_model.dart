class OvertimeModel {
  final String id;
  final String employeeId;
  final String organizationId;
  final String date;
  final double hours;
  final double rate;
  final double? totalAmount;
  final String? reason;
  final String status;

  OvertimeModel({
    required this.id,
    required this.employeeId,
    required this.organizationId,
    required this.date,
    required this.hours,
    this.rate = 1.5,
    this.totalAmount,
    this.reason,
    this.status = 'pending',
  });

  factory OvertimeModel.fromJson(Map<String, dynamic> json) {
    return OvertimeModel(
      id: json['id'] as String,
      employeeId: json['employee_id'] as String,
      organizationId: json['organization_id'] as String,
      date: json['date'] as String,
      hours: (json['hours'] as num).toDouble(),
      rate: (json['rate'] as num?)?.toDouble() ?? 1.5,
      totalAmount: (json['total_amount'] as num?)?.toDouble(),
      reason: json['reason'] as String?,
      status: json['status'] as String? ?? 'pending',
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'employee_id': employeeId,
    'organization_id': organizationId,
    'date': date,
    'hours': hours,
    'rate': rate,
    'total_amount': totalAmount,
    'reason': reason,
    'status': status,
  };
}
