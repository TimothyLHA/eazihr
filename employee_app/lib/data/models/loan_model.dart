class LoanModel {
  final String id;
  final String employeeId;
  final String organizationId;
  final double amount;
  final double interestRate;
  final int tenureMonths;
  final double? monthlyEmi;
  final double balance;
  final String? purpose;
  final String status;
  final String createdAt;

  LoanModel({
    required this.id,
    required this.employeeId,
    required this.organizationId,
    required this.amount,
    this.interestRate = 0,
    required this.tenureMonths,
    this.monthlyEmi,
    this.balance = 0,
    this.purpose,
    this.status = 'pending',
    required this.createdAt,
  });

  factory LoanModel.fromJson(Map<String, dynamic> json) {
    return LoanModel(
      id: json['id'] as String,
      employeeId: json['employee_id'] as String,
      organizationId: json['organization_id'] as String,
      amount: (json['amount'] as num).toDouble(),
      interestRate: (json['interest_rate'] as num?)?.toDouble() ?? 0,
      tenureMonths: json['tenure_months'] as int,
      monthlyEmi: (json['monthly_emi'] as num?)?.toDouble(),
      balance: (json['balance'] as num?)?.toDouble() ?? 0,
      purpose: json['purpose'] as String?,
      status: json['status'] as String? ?? 'pending',
      createdAt: json['created_at'] as String,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'employee_id': employeeId,
    'organization_id': organizationId,
    'amount': amount,
    'interest_rate': interestRate,
    'tenure_months': tenureMonths,
    'monthly_emi': monthlyEmi,
    'balance': balance,
    'purpose': purpose,
    'status': status,
    'created_at': createdAt,
  };
}

class LoanRepaymentModel {
  final String id;
  final String loanId;
  final double amount;
  final String? dueDate;
  final String? paidAt;
  final String status;

  LoanRepaymentModel({
    required this.id,
    required this.loanId,
    required this.amount,
    this.dueDate,
    this.paidAt,
    this.status = 'pending',
  });

  factory LoanRepaymentModel.fromJson(Map<String, dynamic> json) {
    return LoanRepaymentModel(
      id: json['id'] as String,
      loanId: json['loan_id'] as String,
      amount: (json['amount'] as num).toDouble(),
      dueDate: json['due_date'] as String?,
      paidAt: json['paid_at'] as String?,
      status: json['status'] as String? ?? 'pending',
    );
  }
}
