class AttendanceModel {
  final String id;
  final String employeeId;
  final String organizationId;
  final String date;
  final String? checkIn;
  final String? checkOut;
  final String status;
  final String? shiftType;
  final Map<String, dynamic> location;

  AttendanceModel({
    required this.id,
    required this.employeeId,
    required this.organizationId,
    required this.date,
    this.checkIn,
    this.checkOut,
    this.status = 'on_time',
    this.shiftType,
    this.location = const {},
  });

  factory AttendanceModel.fromJson(Map<String, dynamic> json) {
    return AttendanceModel(
      id: json['id'] as String,
      employeeId: json['employee_id'] as String,
      organizationId: json['organization_id'] as String,
      date: json['date'] as String,
      checkIn: json['check_in'] as String?,
      checkOut: json['check_out'] as String?,
      status: json['status'] as String? ?? 'on_time',
      shiftType: json['shift_type'] as String?,
      location: (json['location'] as Map<String, dynamic>?) ?? {},
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'employee_id': employeeId,
    'organization_id': organizationId,
    'date': date,
    'check_in': checkIn,
    'check_out': checkOut,
    'status': status,
    'shift_type': shiftType,
    'location': location,
  };

  bool get isCheckedIn => checkIn != null && checkOut == null;
  bool get isCheckedOut => checkIn != null && checkOut != null;
}
