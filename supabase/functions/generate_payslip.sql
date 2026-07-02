-- Function: Generate payslip for an employee
create or replace function generate_payslip(
  p_employee_id uuid,
  p_organization_id uuid,
  p_payroll_run_id uuid,
  p_month int,
  p_year int
)
returns uuid
language plpgsql
security definer
as $$
declare
  v_payslip_id uuid;
  v_gross_pay numeric(12,2);
  v_deductions numeric(12,2);
  v_net_pay numeric(12,2);
  v_earnings jsonb;
  v_deductions_breakdown jsonb;
begin
  select basic_salary, overtime_amount, incentives_amount, deductions
  into v_gross_pay, v_deductions, v_net_pay
  from payroll_items
  where payroll_run_id = p_payroll_run_id
    and employee_id = p_employee_id;

  v_earnings = jsonb_build_object(
    'basic_salary', v_gross_pay,
    'overtime', v_net_pay,
    'incentives', (select incentives_amount from payroll_items where payroll_run_id = p_payroll_run_id and employee_id = p_employee_id)
  );

  insert into payslips (employee_id, organization_id, payroll_run_id, month, year, gross_pay, deductions, net_pay, earnings_breakdown, deductions_breakdown)
  values (p_employee_id, p_organization_id, p_payroll_run_id, p_month, p_year, v_gross_pay, v_deductions, v_gross_pay - v_deductions, v_earnings, '{}'::jsonb)
  returning id into v_payslip_id;

  return v_payslip_id;
end;
$$;
