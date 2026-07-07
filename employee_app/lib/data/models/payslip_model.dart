class PayslipModel {
  final String id;
  final String employeeId;
  final String organizationId;
  final int month;
  final int year;
  final double grossPay;
  final double deductions;
  final double netPay;
  final Map<String, dynamic> earningsBreakdown;
  final Map<String, dynamic> deductionsBreakdown;
  final String? pdfUrl;
  final String status;

  PayslipModel({
    required this.id,
    required this.employeeId,
    required this.organizationId,
    required this.month,
    required this.year,
    required this.grossPay,
    required this.deductions,
    required this.netPay,
    this.earningsBreakdown = const {},
    this.deductionsBreakdown = const {},
    this.pdfUrl,
    this.status = 'generated',
  });

  factory PayslipModel.fromJson(Map<String, dynamic> json) {
    return PayslipModel(
      id: json['id'] as String,
      employeeId: json['employee_id'] as String,
      organizationId: json['organization_id'] as String,
      month: json['month'] as int,
      year: json['year'] as int,
      grossPay: (json['gross_pay'] as num).toDouble(),
      deductions: (json['deductions'] as num).toDouble(),
      netPay: (json['net_pay'] as num).toDouble(),
      earningsBreakdown: (json['earnings_breakdown'] as Map<String, dynamic>?) ?? {},
      deductionsBreakdown: (json['deductions_breakdown'] as Map<String, dynamic>?) ?? {},
      pdfUrl: json['pdf_url'] as String?,
      status: json['status'] as String? ?? 'generated',
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'employee_id': employeeId,
    'organization_id': organizationId,
    'month': month,
    'year': year,
    'gross_pay': grossPay,
    'net_pay': netPay,
    'deductions': deductions,
    'earnings_breakdown': earningsBreakdown,
    'deductions_breakdown': deductionsBreakdown,
    'pdf_url': pdfUrl,
    'status': status,
  };
}
