import 'package:flutter/material.dart';

class MonthPicker extends StatelessWidget {
  final int year;
  final int month;
  final ValueChanged<int> onYearChanged;
  final ValueChanged<int> onMonthChanged;

  const MonthPicker({
    super.key,
    required this.year,
    required this.month,
    required this.onYearChanged,
    required this.onMonthChanged,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    final years = List.generate(5, (i) => DateTime.now().year - 2 + i);

    return Row(
      children: [
        Expanded(
          child: DropdownButtonFormField<int>(
            value: month,
            decoration: InputDecoration(
              contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
            ),
            items: List.generate(12, (i) => DropdownMenuItem(value: i + 1, child: Text(months[i], style: theme.textTheme.bodySmall))),
            onChanged: (v) { if (v != null) onMonthChanged(v); },
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: DropdownButtonFormField<int>(
            value: year,
            decoration: InputDecoration(
              contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
            ),
            items: years.map((y) => DropdownMenuItem(value: y, child: Text(y.toString(), style: theme.textTheme.bodySmall))).toList(),
            onChanged: (v) { if (v != null) onYearChanged(v); },
          ),
        ),
      ],
    );
  }
}
